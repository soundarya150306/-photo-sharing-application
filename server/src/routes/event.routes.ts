import { Router } from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  addMemberToEvent,
  removeMemberFromEvent,
} from '../controllers/event.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireEventAccess } from '../middleware/rbac.middleware';

const router = Router();

router.get('/', authenticate, getEvents);
router.post('/', authenticate, requireAdmin, createEvent);
router.get('/:id', authenticate, requireEventAccess, getEventById);
router.put('/:id', authenticate, requireAdmin, updateEvent);
router.delete('/:id', authenticate, requireAdmin, deleteEvent);

// Team membership assignment
router.post('/:id/members', authenticate, requireAdmin, addMemberToEvent);
router.delete('/:id/members/:userId', authenticate, requireAdmin, removeMemberFromEvent);

export default router;
