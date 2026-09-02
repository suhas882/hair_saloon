import { Router } from 'express';
import { query, get, run } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Protect all customer management routes for Admins
router.use(authenticate, requireAdmin);

// List customers with search, status filters, and booking stats
router.get('/', (req, res) => {
  try {
    const { status, search } = req.query;

    let sql = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.role, u.approval_status, u.created_at,
        COUNT(b.id) as total_bookings,
        SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
        SUM(CASE WHEN b.status = 'no_show' THEN 1 ELSE 0 END) as no_show_bookings
      FROM users u
      LEFT JOIN bookings b ON u.id = b.customer_id
      WHERE u.role = 'customer'
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ` AND u.approval_status = ?`;
      params.push(status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      sql += ` AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(u.phone) LIKE ?)`;
      params.push(term, term, term);
    }

    sql += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const customers = query(sql, params);
    return res.json({ customers });
  } catch (err) {
    console.error('Fetch customers error:', err);
    return res.status(500).json({ message: 'Failed to retrieve customers.' });
  }
});

// Update customer approval status (approved, rejected, suspended, pending)
router.put('/:id/status', (req, res) => {
  try {
    const customerId = parseInt(req.params.id, 10);
    const { approval_status, reason } = req.body;

    const validStatuses = ['approved', 'rejected', 'suspended', 'pending'];
    if (!validStatuses.includes(approval_status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const customer = get('SELECT id, name, email FROM users WHERE id = ? AND role = "customer"', [customerId]);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    run('UPDATE users SET approval_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [approval_status, customerId]);

    // Send customer direct notification
    let notificationTitle = 'Account Status Update';
    let notificationMessage = '';
    let notificationLink = '/customer/dashboard';

    if (approval_status === 'approved') {
      notificationTitle = 'Account Approved! 🎉';
      notificationMessage = 'Your account has been approved by salon management. You can now book appointments.';
      notificationLink = '/customer/book';
    } else if (approval_status === 'rejected') {
      notificationTitle = 'Registration Notice';
      notificationMessage = reason ? `Registration rejected: ${reason}` : 'Your account registration was not approved by salon management.';
    } else if (approval_status === 'suspended') {
      notificationTitle = 'Account Suspended';
      notificationMessage = reason ? `Account suspended: ${reason}` : 'Your salon booking privileges have been suspended. Please contact salon front desk.';
    } else if (approval_status === 'pending') {
      notificationTitle = 'Account Under Review';
      notificationMessage = 'Your account is under administrative review.';
    }

    run(`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (?, 'status_update', ?, ?, ?)
    `, [customerId, notificationTitle, notificationMessage, notificationLink]);

    const updated = get('SELECT id, name, email, phone, role, approval_status, created_at FROM users WHERE id = ?', [customerId]);
    return res.json({
      message: `Customer ${customer.name} status updated to ${approval_status.toUpperCase()}.`,
      customer: updated
    });
  } catch (err) {
    console.error('Update status error:', err);
    return res.status(500).json({ message: 'Failed to update customer status.' });
  }
});

// Get individual customer details with history
router.get('/:id', (req, res) => {
  try {
    const customerId = parseInt(req.params.id, 10);
    const customer = get('SELECT id, name, email, phone, role, approval_status, created_at FROM users WHERE id = ?', [customerId]);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const bookings = query(`
      SELECT b.*, s.name as service_name, s.duration_minutes, c.name as chair_name, c.chair_number
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN chairs c ON b.chair_id = c.id
      WHERE b.customer_id = ?
      ORDER BY b.booking_date DESC, b.start_time DESC
    `, [customerId]);

    return res.json({ customer, bookings });
  } catch (err) {
    console.error('Fetch customer detail error:', err);
    return res.status(500).json({ message: 'Failed to fetch customer profile.' });
  }
});

export default router;
