import { Router } from 'express';
import { query, get } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Admin Dashboard Summary
router.get('/admin', authenticate, requireAdmin, (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // Chairs overview
    const chairs = query('SELECT * FROM chairs ORDER BY chair_number ASC');

    const chairCards = chairs.map(chair => {
      let activeBooking = get(`
        SELECT 
          b.id as booking_id, b.booking_date, b.start_time, b.end_time, b.status as booking_status, b.notes,
          u.name as customer_name, u.phone as customer_phone,
          s.name as service_name, s.duration_minutes
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
          freeInMinutes = 30;
        }
      } else if (activeBooking) {
        const startMins = timeToMinutes(activeBooking.start_time);
        const endMins = timeToMinutes(activeBooking.end_time);

        // 10-Minute Auto-Release rule for confirmed arrival
        if (activeBooking.booking_status === 'confirmed') {
          const elapsed = nowMinutes - startMins;

          if (nowMinutes >= startMins) {
            if (elapsed >= 10) {
              // Auto-release
              query(`UPDATE bookings SET status = 'no_show', no_show_resolution = 'released', updated_at = CURRENT_TIMESTAMP WHERE id = ${activeBooking.booking_id}`);
              query(`UPDATE chairs SET status = 'available', is_blocked = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ${chair.id}`);
              effectiveStatus = 'available';
              activeBooking = null;
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

        if (activeBooking) {
          if (activeBooking.booking_status === 'in_service' || activeBooking.booking_status === 'customer_arrived') {
            effectiveStatus = 'occupied';
            freeInMinutes = Math.max(1, endMins - nowMinutes);
          } else if (activeBooking.booking_status === 'confirmed') {
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
          query(`UPDATE chairs SET status = '${effectiveStatus}', updated_at = CURRENT_TIMESTAMP WHERE id = ${chair.id}`);
        } catch (e) {}
      }

      return {
        ...chair,
        status: effectiveStatus,
        free_in_minutes: freeInMinutes,
        timeout_minutes_left: timeoutMinutesLeft,
        current_booking: activeBooking || null
      };
    });

    const chairCounts = {
      total: 4,
      available: chairCards.filter(c => c.status === 'available').length,
      booked: chairCards.filter(c => c.status === 'booked').length,
      occupied: chairCards.filter(c => c.status === 'occupied').length,
      blocked: chairCards.filter(c => c.status === 'blocked').length,
      no_show: chairCards.filter(c => c.status === 'no_show').length,
    };

    // Today's appointments count
    const todayAppointmentsRes = get(`
      SELECT COUNT(*) as count, SUM(total_price) as revenue 
      FROM bookings 
      WHERE booking_date = ? AND status != 'cancelled'
    `, [today]);

    // Pending approvals count
    const pendingCustomersRes = get(`
      SELECT COUNT(*) as count FROM users WHERE role = 'customer' AND approval_status = 'pending'
    `);

    // No-shows count
    const noShowsRes = get(`
      SELECT COUNT(*) as count FROM bookings WHERE status = 'no_show'
    `);

    // Today's schedule list
    const todaySchedule = query(`
      SELECT 
        b.*, 
        u.name as customer_name, u.phone as customer_phone,
        s.name as service_name, s.duration_minutes,
        c.chair_number, c.name as chair_name
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN services s ON b.service_id = s.id
      JOIN chairs c ON b.chair_id = c.id
      WHERE b.booking_date = ?
      ORDER BY b.start_time ASC
    `, [today]);

    // Pending customers list
    const pendingCustomers = query(`
      SELECT id, name, email, phone, created_at 
      FROM users 
      WHERE role = 'customer' AND approval_status = 'pending'
      ORDER BY created_at ASC
      LIMIT 5
    `);

    // Recent notifications
    const recentNotifications = query(`
      SELECT * FROM notifications 
      WHERE user_id IS NULL OR user_id = ?
      ORDER BY created_at DESC 
      LIMIT 8
    `, [req.user.id]);

    return res.json({
      stats: {
        total_chairs: 4,
        available_chairs: chairCounts.available,
        booked_chairs: chairCounts.booked,
        occupied_chairs: chairCounts.occupied,
        blocked_chairs: chairCounts.blocked,
        today_appointments: todayAppointmentsRes?.count || 0,
        today_revenue: todayAppointmentsRes?.revenue || 0,
        pending_approvals: pendingCustomersRes?.count || 0,
        no_shows: noShowsRes?.count || 0,
      },
      chair_cards: chairCards,
      today_schedule: todaySchedule,
      pending_customers: pendingCustomers,
      recent_notifications: recentNotifications,
    });
  } catch (err) {
    console.error('Admin dashboard stats error:', err);
    return res.status(500).json({ message: 'Failed to retrieve dashboard stats.' });
  }
});

// Customer Dashboard Summary
router.get('/customer', authenticate, (req, res) => {
  try {
    const customerId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Fresh user approval status
    const customer = get('SELECT id, name, email, phone, approval_status, created_at FROM users WHERE id = ?', [customerId]);

    // Next upcoming booking
    const nextBooking = get(`
      SELECT 
        b.*, 
        s.name as service_name, s.duration_minutes, s.image_url as service_image,
        c.chair_number, c.name as chair_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN chairs c ON b.chair_id = c.id
      WHERE b.customer_id = ? AND b.booking_date >= ? AND b.status IN ('confirmed', 'customer_arrived', 'in_service')
      ORDER BY b.booking_date ASC, b.start_time ASC
      LIMIT 1
    `, [customerId, today]);

    // Summary counts
    const counts = get(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status IN ('confirmed', 'customer_arrived', 'in_service') AND booking_date >= ? THEN 1 ELSE 0 END) as upcoming_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM bookings
      WHERE customer_id = ?
    `, [today, customerId]);

    // Recent 3 bookings
    const recentBookings = query(`
      SELECT 
        b.*, 
        s.name as service_name, s.duration_minutes,
        c.chair_number, c.name as chair_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN chairs c ON b.chair_id = c.id
      WHERE b.customer_id = ?
      ORDER BY b.booking_date DESC, b.start_time DESC
      LIMIT 3
    `, [customerId]);

    // Unread notifications
    const notifications = query(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 5
    `, [customerId]);

    return res.json({
      customer,
      next_booking: nextBooking || null,
      stats: {
        total_bookings: counts?.total_bookings || 0,
        upcoming_bookings: counts?.upcoming_count || 0,
        completed_bookings: counts?.completed_count || 0
      },
      recent_bookings: recentBookings,
      notifications
    });
  } catch (err) {
    console.error('Customer dashboard stats error:', err);
    return res.status(500).json({ message: 'Failed to retrieve customer stats.' });
  }
});

export default router;
