import { Router } from 'express';
import {
  getGalleryConfig,
  updateAndPublishGallery,
} from '../controllers/gallery.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/rbac.middleware';

const router = Router();

// Only Admin can configure or publish galleries
router.get('/:eventId/gallery', authenticate, requireAdmin, getGalleryConfig);
router.post('/:eventId/gallery/publish', authenticate, requireAdmin, updateAndPublishGallery);

export default router;
