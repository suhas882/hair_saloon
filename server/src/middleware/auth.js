import jwt from 'jsonwebtoken';
import { get } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'salon_secret_key_super_secure_jwt_2026';

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      approval_status: user.approval_status
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token missing or invalid.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch latest user state from database
    const user = get('SELECT id, name, email, phone, role, approval_status, created_at FROM users WHERE id = ?', [decoded.id]);
    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired or invalid token. Please log in again.' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Administrator privileges required.' });
  }
  next();
}

export function requireApprovedCustomer(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Please log in to continue.' });
  }

  if (req.user.role === 'admin') {
    return next(); // Admins can also book/manage on behalf of customers
  }

  if (req.user.approval_status === 'pending') {
    return res.status(403).json({
      message: 'Your account is waiting for administrator approval.',
      approval_status: 'pending'
    });
  }

  if (req.user.approval_status === 'rejected') {
    return res.status(403).json({
      message: 'Your account registration was not approved by salon management.',
      approval_status: 'rejected'
    });
  }

  if (req.user.approval_status === 'suspended') {
    return res.status(403).json({
      message: 'Your account is currently suspended. Please contact salon front desk.',
      approval_status: 'suspended'
    });
  }

  if (req.user.approval_status === 'approved') {
    return next();
  }

  return res.status(403).json({ message: 'Unauthorized customer status.' });
}
