import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import dashboardRoutes from './routes/dashboard';
import wasteEntryRoutes from './routes/wasteEntries';
import userRoutes from './routes/users';
import { DatabaseService } from './services/DatabaseService';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://192.168.1.182:3000",
      process.env.CLIENT_URL
    ].filter((url): url is string => Boolean(url)),
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://192.168.1.182:3000",
    process.env.CLIENT_URL
  ].filter((url): url is string => Boolean(url)),
  credentials: true
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', limiter);

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/waste-entries', wasteEntryRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Graceful shutdown endpoint (for development/admin use)
app.post('/admin/shutdown', (req, res) => {
  logger.info('Shutdown request received via API');
  res.json({ 
    message: 'Server shutdown initiated. All data has been preserved.',
    timestamp: new Date().toISOString()
  });
  
  // Gracefully close server after sending response
  setTimeout(() => {
    gracefulShutdown('API shutdown request');
  }, 1000);
});

// Error handling
app.use(errorHandler);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  // Join dashboard room for real-time updates
  socket.on('join-dashboard', () => {
    socket.join('dashboard');
  });
});

// Graceful shutdown function
function gracefulShutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully`);
  logger.info('Preserving all data and closing connections...');
  
  // Close all socket connections
  io.close(() => {
    logger.info('Socket.IO connections closed');
  });
  
  // Close HTTP server
  server.close(() => {
    logger.info('HTTP server closed');
    logger.info('All data has been preserved');
    logger.info('Server shutdown complete');
    process.exit(0);
  });
  
  // Force close after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// Initialize database and start server
async function startServer() {
  try {
    await DatabaseService.initialize();
    logger.info('Database initialized successfully');

    server.listen(Number(PORT), '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Health check available at: http://localhost:${PORT}/health`);
      logger.info(`Network access available at: http://192.168.1.182:${PORT}/health`);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT (Ctrl+C)'));
    process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Export io for use in other modules
export { io };