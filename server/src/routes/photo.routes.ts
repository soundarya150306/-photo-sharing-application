import { Router } from 'express';
import {
  uploadPhotos,
  getEventPhotos,
  updatePhotoSelection,
  deletePhoto,
} from '../controllers/photo.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireEventAccess } from '../middleware/rbac.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

// Upload photos to event (Admin or assigned team member)
router.post(
  '/:eventId/photos',
  authenticate,
  requireEventAccess,
  uploadMiddleware.array('photos', 50),
  uploadPhotos
);

// List photos in event
router.get(
  '/:eventId/photos',
  authenticate,
  requireEventAccess,
  getEventPhotos
);

// Selection curation (Admin only)
router.patch(
  '/:eventId/photos/selection',
  authenticate,
  requireAdmin,
  updatePhotoSelection
);

// Delete photo (Admin or uploader)
router.delete(
  '/:eventId/photos/:photoId',
  authenticate,
  requireEventAccess,
  deletePhoto
);

export default router;
