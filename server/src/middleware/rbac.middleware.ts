import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

/**
 * Require ADMIN role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Forbidden: Admin privileges required to perform this action.',
    });
    return;
  }

  next();
}

/**
 * Require event membership for TEAM_MEMBER, ADMIN has universal access
 */
export async function requireEventAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  // Admins have universal event access
  if (req.user.role === 'ADMIN') {
    next();
    return;
  }

  const eventId = req.params.eventId || req.params.id || req.body.eventId;

  if (!eventId) {
    res.status(400).json({ success: false, message: 'Event ID is required to verify authorization.' });
    return;
  }

  // Verify membership in database
  const membership = await prisma.eventMember.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId: req.user.id,
      },
    },
  });

  if (!membership) {
    res.status(403).json({
      success: false,
      message: 'Forbidden: You are not assigned as a team member to this event.',
    });
    return;
  }

  next();
}
