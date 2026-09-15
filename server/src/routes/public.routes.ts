import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getPublicGalleryInfo,
  unlockGallery,
  getPublicGalleryPhotos,
  downloadSinglePhoto,
  downloadAllPhotosZip,
} from '../controllers/public.controller';

const router = Router();

// Rate limiter for PIN unlock attempts to prevent brute-force (15 attempts per 15 minutes per IP)
const pinUnlockLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'Too many incorrect PIN attempts. Please wait 15 minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public gallery info (shows metadata, cover, lock screen)
router.get('/gallery/:slug/info', getPublicGalleryInfo);

// Verify PIN and unlock
router.post('/gallery/:slug/unlock', pinUnlockLimiter, unlockGallery);

// Get curated photos (requires verified guest token)
router.get('/gallery/:slug/photos', getPublicGalleryPhotos);

// Download single photo
router.get('/gallery/:slug/photos/:photoId/download', downloadSinglePhoto);

// Download all photos as ZIP
router.get('/gallery/:slug/download-all', downloadAllPhotosZip);

export default router;
