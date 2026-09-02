import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initDB } from './db.js';

import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import serviceRoutes from './routes/services.js';
import chairRoutes from './routes/chairs.js';
import bookingRoutes from './routes/bookings.js';
import dashboardRoutes from './routes/dashboard.js';
import notificationRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Middleware to guarantee DB initialization before request handling
app.use(async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (err) {
    console.error('DB initialization error:', err);
    res.status(500).json({ message: 'Database initialization failed: ' + (err.message || 'Unknown error') });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/chairs', chairRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Hair Salon Appointment & Chair Management System Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    message: 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Standalone start for local development (only when executed directly)
const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith('server\\src\\index.js') || 
  process.argv[1].endsWith('server/src/index.js') || 
  process.argv[1].endsWith('src\\index.js') || 
  process.argv[1].endsWith('src/index.js')
);

if (isDirectRun && !process.env.VERCEL) {
  initDB().then(() => {
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`💈 Luxe Salon API Server running on port ${PORT}`);
      console.log(`🚀 API Base URL: http://localhost:${PORT}/api`);
      console.log(`======================================================\n`);
    });
  }).catch(err => {
    console.error('Failed to start server:', err);
  });
}

export default app;
