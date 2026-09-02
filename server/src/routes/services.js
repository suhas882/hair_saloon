import { Router } from 'express';
import { query, get, run } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public / Customer: Get active services (or all if admin authenticated)
router.get('/', (req, res) => {
  try {
    const { all } = req.query;
    let sql = 'SELECT * FROM services';
    if (all !== 'true') {
      sql += ' WHERE is_active = 1';
    }
    sql += ' ORDER BY id ASC';

    const services = query(sql);
    return res.json({ services });
  } catch (err) {
    console.error('Fetch services error:', err);
    return res.status(500).json({ message: 'Failed to retrieve services.' });
  }
});

// Admin: Create service
router.post('/', authenticate, requireAdmin, (req, res) => {
  try {
    const { name, description, price, duration_minutes, category, image_url, is_active } = req.body;

    if (!name || price === undefined || !duration_minutes) {
      return res.status(400).json({ message: 'Service name, price, and duration are required.' });
    }

    const result = run(`
      INSERT INTO services (name, description, price, duration_minutes, category, image_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      name.trim(),
      description?.trim() || '',
      parseFloat(price),
      parseInt(duration_minutes, 10),
      category?.trim() || 'Styling',
      image_url?.trim() || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    ]);

    const newService = get('SELECT * FROM services WHERE id = ?', [result.lastInsertRowid]);
    return res.status(201).json({ message: 'Service created successfully!', service: newService });
  } catch (err) {
    console.error('Create service error:', err);
    return res.status(500).json({ message: 'Failed to create service.' });
  }
});

// Admin: Update service
router.put('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, price, duration_minutes, category, image_url, is_active } = req.body;

    const existing = get('SELECT id FROM services WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    run(`
      UPDATE services 
      SET name = ?, description = ?, price = ?, duration_minutes = ?, category = ?, image_url = ?, is_active = ?
      WHERE id = ?
    `, [
      name.trim(),
      description?.trim() || '',
      parseFloat(price),
      parseInt(duration_minutes, 10),
      category?.trim() || 'Styling',
      image_url?.trim() || '',
      is_active ? 1 : 0,
      id
    ]);

    const updated = get('SELECT * FROM services WHERE id = ?', [id]);
    return res.json({ message: 'Service updated successfully!', service: updated });
  } catch (err) {
    console.error('Update service error:', err);
    return res.status(500).json({ message: 'Failed to update service.' });
  }
});

// Admin: Toggle active status
router.put('/:id/toggle', authenticate, requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const service = get('SELECT id, is_active FROM services WHERE id = ?', [id]);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    const newStatus = service.is_active ? 0 : 1;
    run('UPDATE services SET is_active = ? WHERE id = ?', [newStatus, id]);

    return res.json({
      message: `Service is now ${newStatus ? 'active' : 'inactive'}.`,
      is_active: newStatus
    });
  } catch (err) {
    console.error('Toggle service error:', err);
    return res.status(500).json({ message: 'Failed to toggle service status.' });
  }
});

// Admin: Delete service
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = get('SELECT id FROM services WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    // Check if bookings exist for this service
    const bookingCount = get('SELECT COUNT(*) as count FROM bookings WHERE service_id = ?', [id]);
    if (bookingCount && bookingCount.count > 0) {
      // Soft-delete by setting inactive
      run('UPDATE services SET is_active = 0 WHERE id = ?', [id]);
      return res.json({ message: 'Service has existing bookings and was deactivated instead of deleted.' });
    }

    run('DELETE FROM services WHERE id = ?', [id]);
    return res.json({ message: 'Service deleted permanently.' });
  } catch (err) {
    console.error('Delete service error:', err);
    return res.status(500).json({ message: 'Failed to delete service.' });
  }
});

export default router;
