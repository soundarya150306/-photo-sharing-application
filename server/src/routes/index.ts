import { Router } from 'express';
import authRoutes from './auth.routes';
import eventRoutes from './event.routes';
import photoRoutes from './photo.routes';
import galleryRoutes from './gallery.routes';
import publicRoutes from './public.routes';

const router = Router();

// Root API index & health check
router.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'LuminaPhoto API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      public: '/api/public',
      health: '/api/health',
    },
  });
});

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'LuminaPhoto API',
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/events', photoRoutes);
router.use('/events', galleryRoutes);
router.use('/public', publicRoutes);

export default router;
