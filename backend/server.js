import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';

// Configurations & DB
import { connectDB, getDBStatus } from './config/db.js';
import { setSocketIO } from './utils/sendNotification.js';

// Route handlers
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Error Middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables (works from both root and backend directories)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Connect to Database
connectDB();

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow dev environments
      }
    },
    credentials: true,
  })
);

// Rate Limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 200,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsers & cookie parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io Real-Time Engine Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

setSocketIO(io);

// Active online users map
const onlineUsers = new Map();

io.on('connection', (socket) => {
  // User connects and registers their userId room
  socket.on('join_user', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      onlineUsers.set(userId.toString(), socket.id);
      io.emit('online_users', Array.from(onlineUsers.keys()));
    }
  });

  // Join a specific active chat room
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
  });

  // Real-time private message transmission
  socket.on('send_chat_message', (data) => {
    const { conversationId, receiverId, message, senderId, senderName } = data;
    // Broadcast to conversation room
    io.to(conversationId).emit('receive_chat_message', data);
    // Also push to receiver's private channel
    if (receiverId) {
      io.to(receiverId.toString()).emit('new_message_notification', {
        conversationId,
        senderId,
        senderName,
        message,
      });
    }
  });

  // Typing indicator
  socket.on('typing', ({ conversationId, userId, userName }) => {
    socket.to(conversationId).emit('user_typing', { userId, userName });
  });

  socket.on('stop_typing', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('user_stop_typing', { userId });
  });

  // Disconnection handler
  socket.on('disconnect', () => {
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });
});

// Request logger for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Categories catalog endpoint
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'electrician', name: 'Electrician', tagline: 'Wiring, fixtures, repairs & installations', icon: 'Zap', count: 24 },
      { id: 'plumber', name: 'Plumber', tagline: 'Pipes, leakage, taps & bathroom fitting', icon: 'Wrench', count: 19 },
      { id: 'carpenter', name: 'Carpenter', tagline: 'Furniture repair, woodwork & assembly', icon: 'Hammer', count: 15 },
      { id: 'painter', name: 'Painter', tagline: 'Interior, exterior & waterproofing', icon: 'Paintbrush', count: 18 },
      { id: 'cleaner', name: 'Cleaner', tagline: 'Deep home cleaning, sofa & sanitization', icon: 'Sparkles', count: 32 },
      { id: 'driver', name: 'Driver', tagline: 'Personal, commercial & outstation chauffeurs', icon: 'Car', count: 14 },
      { id: 'mechanic', name: 'Mechanic', tagline: 'Two-wheeler, car & machinery repairs', icon: 'Cog', count: 16 },
      { id: 'helper', name: 'Helper', tagline: 'Moving, loading, garden & household aid', icon: 'Users', count: 27 },
      { id: 'construction', name: 'Construction Worker', tagline: 'Masonry, tiling, concrete & renovation', icon: 'HardHat', count: 21 },
      { id: 'more-services', name: 'More Services', tagline: 'AC Repair, Pest Control, Welding & more', icon: 'Grid', count: 45 },
    ],
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const db = getDBStatus();
  res.status(200).json({
    status: 'online',
    service: 'WorkOshop Enterprise Backend',
    version: '1.0.0',
    database: db.state,
    dbName: db.name,
    timestamp: new Date().toISOString(),
  });
});

// 404 & Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` WorkOshop Backend Server running on port ${PORT}`);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` Socket.IO real-time engine active`);
  console.log(`====================================================`);
});

export default app;

