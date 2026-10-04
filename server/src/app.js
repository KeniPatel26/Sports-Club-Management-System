import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';

import cookieParser from 'cookie-parser';

// Route imports
import authRoutes from './routes/authRoutes.js';
import testRoutes from './routes/testRoutes.js';
import membershipRoutes from './routes/membershipRoutes.js';
import courtBookingRoutes from './routes/courtBookingRoutes.js';
import shopCanteenRoutes from './routes/shopCanteenRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import financeReportsRoutes from './routes/financeReportsRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import managerRoutes from './routes/managerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Middlewares
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

const app = express();

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// Serve static uploads
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// HTTP Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'The Champions Club Management API is healthy & running',
    system: 'Sports Club Management System',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
  });
});

// Sports Club Management System API Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api', courtBookingRoutes); // /api/courts, /api/bookings
app.use('/api', shopCanteenRoutes);  // /api/products, /api/orders
app.use('/api/staff', staffRoutes);
app.use('/api/finance', financeReportsRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);

// User & Utility API Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'The Champions Club Management System API',
    description: 'Digital backbone for tennis, padel, cricket, and badminton sports club',
    docs: '/api/health',
  });
});

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

export default app;
