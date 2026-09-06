import { Router } from 'express';
import { query, get, run } from '../db.js';
import { authenticate, requireApprovedCustomer, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Helper functions for time handling
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function addMinutes(timeStr, minsToAdd) {
  const total = timeToMinutes(timeStr) + minsToAdd;
  return minutesToTime(total);
}

function checkOverlap(s1, e1, s2, e2) {
  return timeToMinutes(s1) < timeToMinutes(e2) && timeToMinutes(e1) > timeToMinutes(s2);
}

// 1. Check Availability for a service on a given date across the 4 chairs (Clock synchronized)
router.get('/availability', authenticate, (req, res) => {
  try {
    const { date, serviceId } = req.query;

    if (!date || !serviceId) {
      return res.status(400).json({ message: 'Date (YYYY-MM-DD) and serviceId are required.' });
    }

    const service = get('SELECT id, name, duration_minutes, is_active FROM services WHERE id = ?', [serviceId]);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    if (!service.is_active) {
      return res.status(400).json({ message: 'Selected service is currently inactive.' });
    }

    const duration = service.duration_minutes;

    // Current local date & time for clock synchronization
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Get all 4 chairs
    const chairs = query('SELECT id, chair_number, name, is_blocked FROM chairs ORDER BY chair_number ASC');

    // Get all active bookings on this date
    const existingBookings = query(`
      SELECT id, chair_id, start_time, end_time, status 
      FROM bookings 
      WHERE booking_date = ? AND status IN ('confirmed', 'customer_arrived', 'in_service')
    `, [date]);

    // Salon operating hours: 09:00 to 20:00 in 30-minute intervals
    const openingMinutes = 9 * 60; // 09:00
    const closingMinutes = 20 * 60; // 20:00
    const slotStep = 30; // 30 mins

    const slots = [];

    for (let m = openingMinutes; m + duration <= closingMinutes; m += slotStep) {
      const slotStart = minutesToTime(m);
      const slotEnd = minutesToTime(m + duration);

      // Clock synchronization: Check if slot has expired for today
      const isPastSlot = (date === todayStr && m < currentMinutes);

      // Check which chairs are available for this entire time window
      const availableChairs = [];

      if (!isPastSlot) {
        for (const chair of chairs) {
          if (chair.is_blocked) {
            continue; // Blocked chair cannot be booked
          }

          // Check if chair has an overlapping booking
          const hasCollision = existingBookings.some(b => {
            if (b.chair_id !== chair.id) return false;
            return checkOverlap(slotStart, slotEnd, b.start_time, b.end_time);
          });

          if (!hasCollision) {
            availableChairs.push({
              id: chair.id,
              chair_number: chair.chair_number,
              name: chair.name
            });
          }
        }
      }

      slots.push({
        start_time: slotStart,
        end_time: slotEnd,
        available: !isPastSlot && availableChairs.length > 0,
        is_expired: isPastSlot,
        available_chairs: availableChairs,
        available_chairs_count: availableChairs.length
      });
    }

    return res.json({
      date,
      service,
      duration_minutes: duration,
      slots
    });
  } catch (err) {
    console.error('Availability check error:', err);
    return res.status(500).json({ message: 'Failed to calculate availability.' });
  }
});

// 2. Create a new booking / Quick Book (Supports direct booking without picking date/time)
router.post('/', authenticate, requireApprovedCustomer, (req, res) => {
  try {
    let { service_id, booking_date, start_time, chair_id, notes, customer_id: adminProvidedCustomerId, is_quick_book } = req.body;

    // Default to first active service if not supplied
    if (!service_id) {
      const defaultService = get('SELECT id FROM services WHERE is_active = 1 ORDER BY id ASC LIMIT 1');
      if (defaultService) {
        service_id = defaultService.id;
      } else {
        return res.status(400).json({ message: 'No active service available.' });
      }
    }

    const service = get('SELECT id, name, price, duration_minutes, is_active FROM services WHERE id = ?', [service_id]);
    if (!service || !service.is_active) {
      return res.status(400).json({ message: 'Selected service is not available.' });
    }

    // Determine target customer
    let customerId = req.user.id;
    if (req.user.role === 'admin' && adminProvidedCustomerId) {
      customerId = adminProvidedCustomerId;
    }

    const customer = get('SELECT id, name, email, approval_status FROM users WHERE id = ?', [customerId]);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    // Direct / Quick Booking calculation if date/time omitted or is_quick_book is requested
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (!booking_date || !start_time || is_quick_book) {
      booking_date = todayStr;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      // Round up to nearest 15/30 min or salon opening
      const baseMinutes = Math.max(9 * 60, Math.ceil(currentMinutes / 15) * 15);
      const chairs = query('SELECT * FROM chairs ORDER BY chair_number ASC');

      const existingToday = query(`
        SELECT id, chair_id, start_time, end_time, status 
        FROM bookings 
        WHERE booking_date = ? AND status IN ('confirmed', 'customer_arrived', 'in_service')
      `, [booking_date]);

      let foundSlot = null;

      // Find earliest available slot starting from baseMinutes
      for (let m = baseMinutes; m + service.duration_minutes <= 20 * 60; m += 15) {
        const candidateStart = minutesToTime(m);
        const candidateEnd = minutesToTime(m + service.duration_minutes);

        const targetChairs = chair_id ? chairs.filter(c => c.id === parseInt(chair_id, 10)) : chairs;

        for (const chair of targetChairs) {
          if (chair.is_blocked) continue;

          const hasCollision = existingToday.some(b => {
            if (b.chair_id !== chair.id) return false;
            return checkOverlap(candidateStart, candidateEnd, b.start_time, b.end_time);
          });

          if (!hasCollision) {
            foundSlot = {
              start_time: candidateStart,
              end_time: candidateEnd,
              chair: chair
            };
            break;
          }
        }
        if (foundSlot) break;
      }

      if (!foundSlot) {
        // Fallback: assign current time slot on target/first chair
        const fallbackChair = chair_id ? chairs.find(c => c.id === parseInt(chair_id, 10)) : chairs.find(c => !c.is_blocked) || chairs[0];
        foundSlot = {
          start_time: minutesToTime(baseMinutes),
          end_time: minutesToTime(baseMinutes + service.duration_minutes),
          chair: fallbackChair
        };
      }

      start_time = foundSlot.start_time;
      chair_id = foundSlot.chair.id;
    }

    const endTime = addMinutes(start_time, service.duration_minutes);

    // Get all 4 chairs
    const chairs = query('SELECT * FROM chairs ORDER BY chair_number ASC');
    let assignedChair = null;

    if (chair_id) {
      const candidate = chairs.find(c => c.id === parseInt(chair_id, 10));
      if (!candidate) {
        return res.status(400).json({ message: 'Selected chair does not exist.' });
      }
      assignedChair = candidate;
    } else {
      assignedChair = chairs.find(c => !c.is_blocked) || chairs[0];
    }

    // Insert booking
    const result = run(`
      INSERT INTO bookings (customer_id, service_id, chair_id, booking_date, start_time, end_time, status, total_price, notes)
      VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)
    `, [
      customerId,
      service.id,
      assignedChair.id,
      booking_date,
      start_time,
      endTime,
      service.price,
      notes?.trim() || null
    ]);

    const newBooking = get(`
      SELECT b.*, s.name as service_name, s.duration_minutes, c.name as chair_name, c.chair_number, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN chairs c ON b.chair_id = c.id
      JOIN users u ON b.customer_id = u.id
      WHERE b.id = ?
    `, [result.lastInsertRowid]);

    // Admin Notification
    run(`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (NULL, 'booking_created', 'New Direct Booking', ?, '/admin/bookings')
    `, [`${customer.name} booked "${service.name}" for ${booking_date} at ${start_time} (Chair ${assignedChair.chair_number}).`]);

    // Customer Notification
    run(`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (?, 'booking_created', 'Direct Booking Confirmed ✨', ?, '/customer/bookings')
    `, [customerId, `Your quick appointment for ${service.name} is booked for ${booking_date} at ${start_time} on Chair ${assignedChair.chair_number}.`]);

    return res.status(201).json({
      message: 'Appointment directly booked successfully!',
      booking: newBooking
    });
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ message: 'Failed to create booking.', error: err.message });
  }
});

// 3. List Bookings (Customer sees own, Admin sees all)
router.get('/', authenticate, (req, res) => {
  try {
    const { date, status, chair_id, customer_id, search } = req.query;

    let sql = `
      SELECT 
        b.*,
        s.name as service_name, s.duration_minutes, s.image_url as service_image,
        c.name as chair_name, c.chair_number,
        u.name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN chairs c ON b.chair_id = c.id
      JOIN users u ON b.customer_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // If customer, restrict strictly to their own bookings
    if (req.user.role === 'customer') {
      sql += ' AND b.customer_id = ?';
      params.push(req.user.id);
    } else if (customer_id) {
      sql += ' AND b.customer_id = ?';
      params.push(customer_id);
    }

    if (date) {
      sql += ' AND b.booking_date = ?';
      params.push(date);
    }

    if (status && status !== 'all') {
      sql += ' AND b.status = ?';
      params.push(status);
    }

    if (chair_id && chair_id !== 'all') {
      sql += ' AND b.chair_id = ?';
      params.push(chair_id);
    }

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(s.name) LIKE ?)';
      params.push(term, term, term);
    }

    sql += ' ORDER BY b.booking_date DESC, b.start_time DESC';

    const bookings = query(sql, params);
    return res.json({ bookings });
  } catch (err) {
    console.error('List bookings error:', err);
    return res.status(500).json({ message: 'Failed to retrieve bookings.' });
  }
});

// 4. Update Booking Status (Admin)
router.put('/:id/status', authenticate, requireAdmin, (req, res) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const validStatuses = ['confirmed', 'customer_arrived', 'in_service', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const booking = get(`
      SELECT b.*, u.name as customer_name, s.name as service_name, c.chair_number
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN services s ON b.service_id = s.id
      JOIN chairs c ON b.chair_id = c.id
      WHERE b.id = ?
    `, [bookingId]);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    run('UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, bookingId]);

    // Handle Chair state according to booking status
    if (status === 'customer_arrived' || status === 'in_service') {
      run('UPDATE chairs SET status = "occupied", updated_at = CURRENT_TIMESTAMP WHERE id = ?', [booking.chair_id]);
    } else if (status === 'completed' || status === 'cancelled') {
      // Release chair if no other in-service session
      run('UPDATE chairs SET status = "available", updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_blocked = 0', [booking.chair_id]);
    }

    // Customer Notification
    let title = 'Booking Status Updated';
    let msg = `Your appointment for ${booking.service_name} status is now: ${status.replace('_', ' ').toUpperCase()}.`;

    if (status === 'customer_arrived') {
      title = 'Welcome to Luxe Salon!';
      msg = `You are checked in for ${booking.service_name} at Chair ${booking.chair_number}. Your stylist will be with you shortly.`;
    } else if (status === 'in_service') {
      title = 'In Service ✂️';
      msg = `Your session for ${booking.service_name} has begun at Chair ${booking.chair_number}. Enjoy!`;
    } else if (status === 'completed') {
      title = 'Service Completed! ✨';
      msg = `Thank you for visiting Luxe Salon! We hope you loved your ${booking.service_name}.`;
    } else if (status === 'no_show') {
      title = 'Appointment Marked No-Show';
      msg = `You were marked as no-show for your appointment on ${booking.booking_date} at ${booking.start_time}.`;
    }

    run(`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (?, 'status_update', ?, ?, '/customer/bookings')
    `, [booking.customer_id, title, msg]);

    const updated = get('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    return res.json({
      message: `Booking #${bookingId} updated to ${status}.`,
      booking: updated
    });
  } catch (err) {
    console.error('Update booking status error:', err);
    return res.status(500).json({ message: 'Failed to update booking status.' });
  }
});

// 5. No-Show Handling (Admin: Choose between "release" chair or "keep_blocked")
router.post('/:id/no-show-action', authenticate, requireAdmin, (req, res) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const { action } = req.body; // 'release' or 'keep_blocked'

    if (action !== 'release' && action !== 'keep_blocked') {
      return res.status(400).json({ message: 'Action must be "release" or "keep_blocked".' });
    }

    const booking = get(`
      SELECT b.*, u.name as customer_name, s.name as service_name, c.chair_number
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN services s ON b.service_id = s.id
      JOIN chairs c ON b.chair_id = c.id
      WHERE b.id = ?
    `, [bookingId]);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const resolution = action === 'release' ? 'released' : 'keep_blocked';

    // Update booking status to no_show and record resolution
    run(`
      UPDATE bookings 
      SET status = 'no_show', no_show_resolution = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [resolution, bookingId]);

    // Update chair status
    if (action === 'release') {
      run('UPDATE chairs SET status = "available", is_blocked = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [booking.chair_id]);
    } else {
      run('UPDATE chairs SET status = "blocked", is_blocked = 1, block_reason = "Blocked due to Customer No-Show", updated_at = CURRENT_TIMESTAMP WHERE id = ?', [booking.chair_id]);
    }

    // Admin notification
    run(`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (NULL, 'no_show', 'No-Show Handled', ?, '/admin/chairs')
    `, [`Booking #${bookingId} (${booking.customer_name}) marked as No-Show. Chair ${booking.chair_number} ${action === 'release' ? 'was released as Available' : 'is Kept Blocked'}.`]);

    const updatedBooking = get('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    return res.json({
      message: `No-Show recorded. Chair ${booking.chair_number} ${action === 'release' ? 'released to Available.' : 'kept Blocked.'}`,
      booking: updatedBooking
    });
  } catch (err) {
    console.error('No-show action error:', err);
    return res.status(500).json({ message: 'Failed to process no-show action.' });
  }
});

// 6. Cancel Booking (Customer for self, or Admin)
router.post('/:id/cancel', authenticate, (req, res) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const { reason } = req.body;

    const booking = get(`
      SELECT b.*, u.name as customer_name, s.name as service_name, c.chair_number
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN services s ON b.service_id = s.id
      JOIN chairs c ON b.chair_id = c.id
      WHERE b.id = ?
    `, [bookingId]);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Customer can only cancel their own booking
    if (req.user.role === 'customer' && booking.customer_id !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to cancel this booking.' });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot cancel a booking that is already ${booking.status}.` });
    }

    run('UPDATE bookings SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ?', [bookingId]);

    // Release chair
    run('UPDATE chairs SET status = "available", updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_blocked = 0', [booking.chair_id]);

    // Notification for admin
    run(`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (NULL, 'booking_cancelled', 'Appointment Cancelled', ?, '/admin/bookings')
    `, [`Appointment for ${booking.customer_name} on ${booking.booking_date} at ${booking.start_time} was cancelled. ${reason ? `Reason: ${reason}` : ''}`]);

    // Notification for customer
    if (req.user.role === 'admin') {
      run(`
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (?, 'booking_cancelled', 'Appointment Cancelled by Salon', ?, '/customer/bookings')
      `, [booking.customer_id, `Your appointment for ${booking.service_name} on ${booking.booking_date} at ${booking.start_time} has been cancelled by salon staff.`]);
    }

    const updatedBooking = get('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    return res.json({ message: 'Booking cancelled successfully.', booking: updatedBooking });
  } catch (err) {
    console.error('Cancel booking error:', err);
    return res.status(500).json({ message: 'Failed to cancel booking.' });
  }
});

export default router;
