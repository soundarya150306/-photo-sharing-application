import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRouter from './routes';
import { errorHandler } from './middleware/error.middleware';
import { config } from './config';

export const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins in dev or matching clientUrl
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static file serving for uploads (Object Storage Local Gateway)
app.use('/uploads', express.static(config.uploadDir, {
  maxAge: '1d',
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
  },
}));

// API Routes
app.use('/api', apiRouter);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
