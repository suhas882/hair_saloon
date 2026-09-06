import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { query, get, run } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Get all 4 chairs with current dynamic state, occupant, free_in_minutes, and 10min auto-release
router.get('/', (req, res) => {
  try {
    const chairs = query('SELECT * FROM chairs ORDER BY chair_number ASC');
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // Check optional admin token if present
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'salon_secret_key_super_secure_jwt_2026');
        if (decoded.role === 'admin') {
          isAdmin = true;
        }
      } catch (e) {
        // Not admin
      }
    }

    // Enhance each chair with today's active booking & calculate auto-release
    const enhancedChairs = chairs.map(chair => {
      // Find currently active or next booking today
      let currentBooking = get(`
        SELECT 
          b.id as booking_id, b.booking_date, b.start_time, b.end_time, b.status as booking_status, b.notes,
          u.id as customer_id, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
          s.id as service_id, s.name as service_name, s.duration_minutes, s.price
        FROM bookings b
        JOIN users u ON b.customer_id = u.id
        JOIN services s ON b.service_id = s.id
        WHERE b.chair_id = ? AND b.booking_date = ? AND b.status IN ('confirmed', 'customer_arrived', 'in_service')
        ORDER BY 
          CASE 
            WHEN b.status = 'in_service' THEN 1 
            WHEN b.status = 'customer_arrived' THEN 2 
            ELSE 3 
          END, 
          b.start_time ASC
        LIMIT 1
      `, [chair.id, today]);

      let effectiveStatus = chair.status;
      let freeInMinutes = 0;
      let timeoutMinutesLeft = null;

      if (chair.is_blocked) {
        effectiveStatus = 'blocked';
        const match = chair.block_reason?.match(/Blocked for (\d+) mins/i);
        if (match) {
          freeInMinutes = parseInt(match[1], 10);
        } else {
          freeInMinutes = 30; // standard maintenance block
        }
      } else if (currentBooking) {
        const startMins = timeToMinutes(currentBooking.start_time);
        const endMins = timeToMinutes(currentBooking.end_time);

        // 10-Minute Auto-Release rule: If customer took >10 mins past start_time and arrival unconfirmed
        if (currentBooking.booking_status === 'confirmed') {
          const elapsed = nowMinutes - startMins;

          if (nowMinutes >= startMins) {
            if (elapsed >= 10) {
              // Automatically release chair
              run(`UPDATE bookings SET status = 'no_show', no_show_resolution = 'released', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [currentBooking.booking_id]);
              run(`UPDATE chairs SET status = 'available', is_blocked = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [chair.id]);
              run(`
                INSERT INTO notifications (user_id, type, title, message, link)
                VALUES (NULL, 'timeout_auto_release', 'Station Auto-Released (10 Mins Timeout)', ?, '/admin/chairs')
              `, [`Chair ${chair.chair_number} automatically released: Customer did not arrive within 10 minutes of ${currentBooking.start_time}.`]);

              effectiveStatus = 'available';
              currentBooking = null;
              freeInMinutes = 0;
            } else {
              timeoutMinutesLeft = Math.max(0, 10 - elapsed);
              effectiveStatus = 'booked';
              freeInMinutes = Math.max(1, endMins - nowMinutes);
            }
          } else {
            effectiveStatus = 'booked';
            freeInMinutes = Math.max(1, endMins - nowMinutes);
          }
        }

        if (currentBooking) {
          if (currentBooking.booking_status === 'in_service' || currentBooking.booking_status === 'customer_arrived') {
            effectiveStatus = 'occupied';
            freeInMinutes = Math.max(1, endMins - nowMinutes);
          } else if (currentBooking.booking_status === 'confirmed') {
            effectiveStatus = 'booked';
            freeInMinutes = Math.max(1, endMins - nowMinutes);
          }
        }
      } else if (chair.status !== 'no_show' && chair.status !== 'blocked') {
        effectiveStatus = 'available';
        freeInMinutes = 0;
      }

      // Sync effectiveStatus with database if needed
      if (!chair.is_blocked && chair.status !== effectiveStatus) {
        try {
          run(`UPDATE chairs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [effectiveStatus, chair.id]);
        } catch (e) {}
      }

      // Count today's total bookings for this chair
      const todayStats = get(`
        SELECT COUNT(*) as count FROM bookings WHERE chair_id = ? AND booking_date = ? AND status != 'cancelled'
      `, [chair.id, today]);

      // If not admin, sanitize customer personal info
      let sanitizedBooking = null;
      if (currentBooking) {
        if (isAdmin) {
          sanitizedBooking = currentBooking;
        } else {
          sanitizedBooking = {
            booking_id: currentBooking.booking_id,
            booking_date: currentBooking.booking_date,
            start_time: currentBooking.start_time,
            end_time: currentBooking.end_time,
            booking_status: currentBooking.booking_status,
            service_name: currentBooking.service_name,
            duration_minutes: currentBooking.duration_minutes,
            customer_name: 'Reserved Client'
          };
        }
      }

      return {
        ...chair,
        status: effectiveStatus,
        free_in_minutes: freeInMinutes,
        timeout_minutes_left: timeoutMinutesLeft,
        current_booking: sanitizedBooking,
        today_bookings_count: todayStats?.count || 0
      };
    });

    return res.json({ chairs: enhancedChairs });
  } catch (err) {
    console.error('Fetch chairs error:', err);
    return res.status(500).json({ message: 'Failed to retrieve chairs status.' });
  }
});

// Admin: Block chair
router.post('/:id/block', authenticate, requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { reason, duration_minutes } = req.body;

    const chair = get('SELECT * FROM chairs WHERE id = ?', [id]);
    if (!chair) {
      return res.status(404).json({ message: 'Chair not found.' });
    }

    let blockText = reason?.trim() || 'Blocked by administrator for maintenance/sanitation.';
    if (duration_minutes && parseInt(duration_minutes, 10) > 0) {
      blockText = `Blocked for ${duration_minutes} mins: ${blockText}`;
    }

    run(`
      UPDATE chairs 
      SET is_blocked = 1, status = 'blocked', block_reason = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [blockText, id]);

    // Send admin notification
    run(`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (NULL, 'status_update', 'Chair Blocked', ?, '/admin/chairs')
    `, [`Chair ${chair.chair_number} has been blocked. ${blockText}`]);

    const updated = get('SELECT * FROM chairs WHERE id = ?', [id]);
    return res.json({ message: `Chair ${chair.chair_number} has been blocked.`, chair: updated });
  } catch (err) {
    console.error('Block chair error:', err);
    return res.status(500).json({ message: 'Failed to block chair.' });
  }
});

// Admin: Unblock chair
router.post('/:id/unblock', authenticate, requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const chair = get('SELECT * FROM chairs WHERE id = ?', [id]);
    if (!chair) {
      return res.status(404).json({ message: 'Chair not found.' });
    }

    run(`
      UPDATE chairs 
      SET is_blocked = 0, status = 'available', block_reason = NULL, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [id]);

    const updated = get('SELECT * FROM chairs WHERE id = ?', [id]);
    return res.json({ message: `Chair ${chair.chair_number} has been unblocked and is now available.`, chair: updated });
  } catch (err) {
    console.error('Unblock chair error:', err);
    return res.status(500).json({ message: 'Failed to unblock chair.' });
  }
});

// Admin: Direct Chair Status Override
router.put('/:id/status', authenticate, requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    const validStatuses = ['available', 'booked', 'occupied', 'blocked', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const isBlocked = status === 'blocked' ? 1 : 0;
    run(`
      UPDATE chairs 
      SET status = ?, is_blocked = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [status, isBlocked, id]);

    const updated = get('SELECT * FROM chairs WHERE id = ?', [id]);
    return res.json({ message: `Chair ${updated.chair_number} status updated to ${status}.`, chair: updated });
  } catch (err) {
    console.error('Update chair status error:', err);
    return res.status(500).json({ message: 'Failed to update chair status.' });
  }
});

export default router;
