import { Router } from 'express';
import { get, run } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public: Get current salon settings (hours, location, contact, description)
router.get('/', (req, res) => {
  try {
    let settings = get('SELECT * FROM salon_settings WHERE id = 1');
    if (!settings) {
      settings = {
        id: 1,
        salon_name: 'LUXE',
        tagline: 'Salon & Lounge',
        description: 'A premier 4-chair luxury salon offering personalized executive grooming, bespoke hair styling, balayage coloring, and restorative head spa treatments in an ambiance of refined sophistication.',
        address: '450 Prestige Avenue, Grand Boulevard, Suite 101',
        phone: '+91 98765 43210',
        email: 'concierge@luxesalon.com',
        hours_mon_fri: '09:00 AM - 08:00 PM',
        hours_sat: '09:00 AM - 08:00 PM',
        hours_sun: '10:00 AM - 06:00 PM',
        badge_text: 'Sanitized & Private 4-Station Layout',
        guarantee_text: 'Zero Wait Time Guarantee'
      };
    }
    return res.json({ settings });
  } catch (err) {
    console.error('Fetch settings error:', err);
    return res.status(500).json({ message: 'Failed to retrieve salon settings.' });
  }
});

// Admin: Update salon settings
router.put('/', authenticate, requireAdmin, (req, res) => {
  try {
    const {
      salon_name,
      tagline,
      description,
      address,
      phone,
      email,
      hours_mon_fri,
      hours_sat,
      hours_sun,
      badge_text,
      guarantee_text
    } = req.body;

    if (!salon_name || !salon_name.trim()) {
      return res.status(400).json({ message: 'Salon name is required.' });
    }

    run(`
      UPDATE salon_settings 
      SET 
        salon_name = ?,
        tagline = ?,
        description = ?,
        address = ?,
        phone = ?,
        email = ?,
        hours_mon_fri = ?,
        hours_sat = ?,
        hours_sun = ?,
        badge_text = ?,
        guarantee_text = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [
      salon_name.trim(),
      tagline?.trim() || '',
      description?.trim() || '',
      address?.trim() || '',
      phone?.trim() || '',
      email?.trim() || '',
      hours_mon_fri?.trim() || '09:00 AM - 08:00 PM',
      hours_sat?.trim() || '09:00 AM - 08:00 PM',
      hours_sun?.trim() || '10:00 AM - 06:00 PM',
      badge_text?.trim() || 'Sanitized & Private 4-Station Layout',
      guarantee_text?.trim() || 'Zero Wait Time Guarantee'
    ]);

    const updated = get('SELECT * FROM salon_settings WHERE id = 1');

    // Create admin notification
    run(`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (NULL, 'status_update', 'Salon Settings Updated', 'Salon operating hours and location details were updated by admin.', '/admin/settings')
    `);

    return res.json({ message: 'Salon settings and contact info updated successfully!', settings: updated });
  } catch (err) {
    console.error('Update settings error:', err);
    return res.status(500).json({ message: 'Failed to update salon settings.' });
  }
});

export default router;
