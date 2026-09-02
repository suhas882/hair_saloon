import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { get, run, query } from '../db.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = Router();

// Register a new customer
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existing = get('SELECT id FROM users WHERE email = ?', [trimmedEmail]);
    if (existing) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = run(`
      INSERT INTO users (name, email, phone, password_hash, role, approval_status)
      VALUES (?, ?, ?, ?, 'customer', 'pending')
    `, [name.trim(), trimmedEmail, phone?.trim() || null, passwordHash]);

    const newUser = get('SELECT id, name, email, phone, role, approval_status, created_at FROM users WHERE id = ?', [result.lastInsertRowid]);

    // Send admin notification
    run(`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (NULL, 'customer_registered', 'New Customer Registration', ?, '/admin/customers')
    `, [`${newUser.name} (${newUser.email}) just registered and is awaiting approval.`]);

    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Registration successful! Your account is currently pending administrator approval.',
      user: newUser,
      token,
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Failed to complete registration.', error: err.message });
  }
});

// User login (both Customer and Admin)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const user = get('SELECT * FROM users WHERE email = ?', [trimmedEmail]);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      approval_status: user.approval_status,
      created_at: user.created_at,
    };

    return res.json({
      message: 'Login successful!',
      user: safeUser,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed.', error: err.message });
  }
});

// Get current user details
router.get('/me', authenticate, (req, res) => {
  return res.json({ user: req.user });
});

// Update profile details
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password.' });
      }

      const fullUser = get('SELECT password_hash FROM users WHERE id = ?', [userId]);
      const isMatch = await bcrypt.compare(currentPassword, fullUser.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      run('UPDATE users SET name = ?, phone = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
        name.trim(),
        phone?.trim() || null,
        newHash,
        userId
      ]);
    } else {
      run('UPDATE users SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
        name.trim(),
        phone?.trim() || null,
        userId
      ]);
    }

    const updatedUser = get('SELECT id, name, email, phone, role, approval_status, created_at FROM users WHERE id = ?', [userId]);
    return res.json({ message: 'Profile updated successfully!', user: updatedUser });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
});

export default router;
