import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface UserTokenPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'TEAM_MEMBER';
  name: string;
}

export interface GalleryGuestPayload {
  gallerySlug: string;
  eventId: string;
  isGuest: true;
}

export function signUserToken(payload: UserTokenPayload, expiresIn: string = '7d'): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

export function verifyUserToken(token: string): UserTokenPayload {
  return jwt.verify(token, config.jwtSecret) as UserTokenPayload;
}

export function signGalleryGuestToken(gallerySlug: string, eventId: string, expiresIn: string = '24h'): string {
  const payload: GalleryGuestPayload = {
    gallerySlug,
    eventId,
    isGuest: true,
  };
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

export function verifyGalleryGuestToken(token: string): GalleryGuestPayload {
  const decoded = jwt.verify(token, config.jwtSecret) as any;
  if (!decoded.isGuest || !decoded.gallerySlug || !decoded.eventId) {
    throw new Error('Invalid gallery guest token');
  }
  return decoded as GalleryGuestPayload;
}
