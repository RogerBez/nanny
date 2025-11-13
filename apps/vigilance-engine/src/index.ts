/**
 * Vigilance Engine - Main Express Server
 * Backend API for NANNY parental monitoring system
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import { router as ingestRouter } from './routes/ingest';
import { router as scoreRouter } from './routes/score';
import { router as freezeRouter } from './routes/freeze';

const app: Express = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============ MIDDLEWARE ============

// Body parser middleware
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// CORS middleware (allow frontend origins)
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
});

// ============ ROUTES ============

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// API Routes
app.post('/ingest', ingestRouter);
app.post('/score', scoreRouter);
app.post('/freeze', freezeRouter);
app.get('/freeze/:childId', freezeRouter);
app.post('/unfreeze', freezeRouter);

// ============ ERROR HANDLING ============

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    error: 'Not Found',
    path: req.path,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`, err);

  res.status(500).json({
    status: 'error',
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============ SERVER ============

// Start server
if (NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Vigilance Engine running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${NODE_ENV}`);
    console.log(`📊 Available endpoints:`);
    console.log(`   - GET  /health`);
    console.log(`   - POST /ingest`);
    console.log(`   - POST /score`);
    console.log(`   - POST /freeze`);
    console.log(`   - GET  /freeze/:childId`);
    console.log(`   - POST /unfreeze`);
  });
}

export default app;
