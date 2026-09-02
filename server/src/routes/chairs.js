import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { query, get, run } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get all 4 chairs with current dynamic state, occupant, and today's schedule
router.get('/', (req, res) => {
  try {
    const chairs = query('SELECT * FROM chairs ORDER BY chair_number ASC');
    const today = new Date().toISOString().split('T')[0];

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

    // Enhance each chair with today's active booking
    const enhancedChairs = chairs.map(chair => {
      // Find currently active or next booking today
      const currentBooking = get(`
        SELECT 
          b.id as booking_id, b.booking_date, b.start_time, b.end_time, b.status as booking_status, b.notes,
          u.id as customer_id, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
          s.id as service_id, s.name as service_name, s.duration_minutes, s.price
        FROM bookings b
        JOIN users u ON b.customer_id = u.id
        JOIN services s ON b.service_id = s.id
        WHERE b.chair_id = ? AND b.booking_date = ? AND b.status IN ('confirmed', 'customer_arrived', 'in_service')
        ORDER BY b.start_time ASC
        LIMIT 1
      `, [chair.id, today]);

      // Count today's total bookings for this chair
      const todayStats = get(`
        SELECT COUNT(*) as count FROM bookings WHERE chair_id = ? AND booking_date = ? AND status != 'cancelled'
      `, [chair.id, today]);

      let effectiveStatus = chair.status;
      if (chair.is_blocked) {
        effectiveStatus = 'blocked';
      } else if (currentBooking) {
        if (currentBooking.booking_status === 'in_service' || currentBooking.booking_status === 'customer_arrived') {
          effectiveStatus = 'occupied';
        } else if (currentBooking.booking_status === 'confirmed') {
          effectiveStatus = 'booked';
        }
      } else if (chair.status !== 'no_show' && chair.status !== 'blocked') {
        effectiveStatus = 'available';
      }

      // If not admin, sanitize customer personal info for complete privacy
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
    const { reason } = req.body;

    const chair = get('SELECT * FROM chairs WHERE id = ?', [id]);
    if (!chair) {
      return res.status(404).json({ message: 'Chair not found.' });
    }

    run(`
      UPDATE chairs 
      SET is_blocked = 1, status = 'blocked', block_reason = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [reason?.trim() || 'Blocked by administrator for maintenance/sanitation.', id]);

    // Send admin notification
    run(`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (NULL, 'status_update', 'Chair Blocked', ?, '/admin/chairs')
    `, [`Chair ${chair.chair_number} has been blocked. Reason: ${reason || 'Maintenance'}`]);

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
