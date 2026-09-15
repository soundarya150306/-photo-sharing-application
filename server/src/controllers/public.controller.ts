import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { prisma } from '../utils/prisma';
import { comparePin } from '../utils/hash';
import { signGalleryGuestToken, verifyGalleryGuestToken } from '../utils/jwt';
import { StorageService } from '../services/storage.service';

const unlockSchema = z.object({
  pin: z.string().min(1, 'Access PIN is required'),
});

/**
 * Public Info endpoint for customer landing page
 */
export async function getPublicGalleryInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = String(req.params.slug);

    const gallery = await prisma.gallery.findUnique({
      where: { slug },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            clientName: true,
            eventDate: true,
            location: true,
            coverPhotoUrl: true,
          },
        },
      },
    });

    if (!gallery || !gallery.isPublished) {
      res.status(404).json({
        success: false,
        message: 'This photo gallery is either unpublished, private, or does not exist.',
      });
      return;
    }

    const curatedCount = await prisma.photo.count({
      where: {
        eventId: gallery.eventId,
        isSelected: true,
      },
    });

    const gal = gallery as any;

    res.json({
      success: true,
      data: {
        gallery: {
          slug: gallery.slug,
          customTitle: gallery.customTitle || gal.event?.title,
          customWelcomeMsg: gallery.customWelcomeMsg,
          allowDownload: gallery.allowDownload,
          eventDate: gal.event?.eventDate,
          location: gal.event?.location,
          clientName: gal.event?.clientName,
          coverPhotoUrl: gal.event?.coverPhotoUrl,
          totalSelectedPhotos: curatedCount,
          requiresPin: true,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Unlock gallery with customer PIN
 */
export async function unlockGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = String(req.params.slug);
    const data = unlockSchema.parse(req.body);

    const gallery = await prisma.gallery.findUnique({
      where: { slug },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            clientName: true,
            eventDate: true,
            coverPhotoUrl: true,
          },
        },
      },
    });

    if (!gallery || !gallery.isPublished) {
      res.status(404).json({
        success: false,
        message: 'This gallery is currently unavailable or unpublished.',
      });
      return;
    }

    // Verify PIN
    const isMatch = await comparePin(data.pin, gallery.pinHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Incorrect access PIN. Please check with your event host or photographer.',
      });
      return;
    }

    // Increment view count
    await prisma.gallery.update({
      where: { id: gallery.id },
      data: { viewCount: { increment: 1 } },
    });

    // Issue Guest Session Token
    const guestToken = signGalleryGuestToken(gallery.slug, gallery.eventId, '24h');
    const gal = gallery as any;

    res.json({
      success: true,
      message: 'PIN verified successfully. Welcome to the gallery!',
      data: {
        token: guestToken,
        gallery: {
          slug: gallery.slug,
          title: gallery.customTitle || gal.event?.title,
          welcomeMessage: gallery.customWelcomeMsg,
          eventDate: gal.event?.eventDate,
          allowDownload: gallery.allowDownload,
          coverPhotoUrl: gal.event?.coverPhotoUrl,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware helper for customer gallery token verification
 */
function extractGuestToken(req: Request, slug: string): string | null {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.split(' ')[1];
  }
  // Also check query param for direct browser download links
  if (req.query.token && typeof req.query.token === 'string') {
    return req.query.token;
  }
  return null;
}

/**
 * Get curated photos for customer gallery
 */
export async function getPublicGalleryPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = String(req.params.slug);
    const token = extractGuestToken(req, slug);

    if (!token) {
      res.status(401).json({ success: false, message: 'Access PIN verification required.' });
      return;
    }

    let payload;
    try {
      payload = verifyGalleryGuestToken(token);
    } catch {
      res.status(401).json({ success: false, message: 'Invalid or expired gallery session. Please re-enter PIN.' });
      return;
    }

    if (payload.gallerySlug !== slug) {
      res.status(403).json({ success: false, message: 'Session token does not match this gallery.' });
      return;
    }

    // Verify gallery is still published
    const gallery = await prisma.gallery.findUnique({
      where: { slug },
      include: {
        event: {
          select: { title: true, clientName: true, eventDate: true, location: true },
        },
      },
    });

    if (!gallery || !gallery.isPublished) {
      res.status(404).json({ success: false, message: 'Gallery is no longer published.' });
      return;
    }

    // Fetch ONLY selected photos
    const photos = await prisma.photo.findMany({
      where: {
        eventId: gallery.eventId,
        isSelected: true,
      },
      select: {
        id: true,
        filename: true,
        originalFilename: true,
        storageLocation: true,
        fileSize: true,
        mimeType: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const formattedPhotos = photos.map((photo: any) => ({
      id: photo.id,
      filename: photo.filename,
      originalFilename: photo.originalFilename,
      url: `/uploads/${photo.storageLocation}`,
      fileSize: photo.fileSize,
      mimeType: photo.mimeType,
      createdAt: photo.createdAt,
    }));

    const gal = gallery as any;

    res.json({
      success: true,
      data: {
        gallery: {
          slug: gallery.slug,
          title: gallery.customTitle || gal.event?.title,
          customWelcomeMsg: gallery.customWelcomeMsg,
          allowDownload: gallery.allowDownload,
          eventDate: gal.event?.eventDate,
          location: gal.event?.location,
          clientName: gal.event?.clientName,
        },
        photos: formattedPhotos,
        count: formattedPhotos.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Download single photo in full resolution
 */
export async function downloadSinglePhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = String(req.params.slug);
    const photoId = String(req.params.photoId);
    const token = extractGuestToken(req, slug);

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const payload = verifyGalleryGuestToken(token);
    if (payload.gallerySlug !== slug) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const gallery = await prisma.gallery.findUnique({
      where: { slug },
    });

    if (!gallery || !gallery.isPublished || !gallery.allowDownload) {
      res.status(403).json({ success: false, message: 'Downloads are disabled for this gallery.' });
      return;
    }

    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        eventId: gallery.eventId,
        isSelected: true,
      },
    });

    if (!photo) {
      res.status(404).json({ success: false, message: 'Photo not found or not published.' });
      return;
    }

    const absolutePath = StorageService.getAbsolutePath(photo.storageLocation);
    if (!fs.existsSync(absolutePath)) {
      res.status(404).json({ success: false, message: 'Photo file is missing from storage.' });
      return;
    }

    res.download(absolutePath, photo.originalFilename);
  } catch (error) {
    next(error);
  }
}

/**
 * Download all selected photos as a single .ZIP archive
 */
export async function downloadAllPhotosZip(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = String(req.params.slug);
    const token = extractGuestToken(req, slug);

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const payload = verifyGalleryGuestToken(token);
    if (payload.gallerySlug !== slug) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const gallery = await prisma.gallery.findUnique({
      where: { slug },
      include: { event: true },
    });

    if (!gallery || !gallery.isPublished || !gallery.allowDownload) {
      res.status(403).json({ success: false, message: 'Downloads are disabled for this gallery.' });
      return;
    }

    const photos = await prisma.photo.findMany({
      where: {
        eventId: gallery.eventId,
        isSelected: true,
      },
    });

    if (photos.length === 0) {
      res.status(400).json({ success: false, message: 'No selected photos available to download.' });
      return;
    }

    const zipFilename = `${gallery.slug}-photos.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

    const archive = archiver('zip', {
      zlib: { level: 6 },
    });

    archive.on('error', (err) => {
      console.error('Archive generation error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Failed to generate archive.' });
      }
    });

    archive.pipe(res);

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const filePath = StorageService.getAbsolutePath(photo.storageLocation);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(photo.originalFilename) || '.jpg';
        const entryName = `${String(i + 1).padStart(3, '0')}_${photo.originalFilename}`;
        archive.file(filePath, { name: entryName });
      }
    }

    await archive.finalize();
  } catch (error) {
    next(error);
  }
}
