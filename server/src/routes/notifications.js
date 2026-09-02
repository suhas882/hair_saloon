import { Router } from 'express';
import { query, run } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// List notifications
router.get('/', (req, res) => {
  try {
    let sql = '';
    let params = [];

    if (req.user.role === 'admin') {
      sql = 'SELECT * FROM notifications WHERE user_id IS NULL OR user_id = ? ORDER BY created_at DESC LIMIT 50';
      params = [req.user.id];
    } else {
      sql = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50';
      params = [req.user.id];
    }

    const notifications = query(sql, params);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    return res.json({ notifications, unread_count: unreadCount });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    return res.status(500).json({ message: 'Failed to retrieve notifications.' });
  }
});

// Mark single notification as read
router.put('/:id/read', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    run('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    return res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    console.error('Mark read error:', err);
    return res.status(500).json({ message: 'Failed to update notification.' });
  }
});

// Mark all as read
router.put('/read-all', (req, res) => {
  try {
    if (req.user.role === 'admin') {
      run('UPDATE notifications SET is_read = 1 WHERE user_id IS NULL OR user_id = ?', [req.user.id]);
    } else {
      run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    }
    return res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Mark all read error:', err);
    return res.status(500).json({ message: 'Failed to update notifications.' });
  }
});

export default router;
