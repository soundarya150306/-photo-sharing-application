import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { hashPin } from '../utils/hash';
import { config } from '../config';

const publishGallerySchema = z.object({
  isPublished: z.boolean(),
  pin: z.string().min(4, 'PIN must be at least 4 digits').max(12, 'PIN max length is 12 characters').optional(),
  slug: z.string().min(3).optional(),
  customTitle: z.string().optional(),
  customWelcomeMsg: z.string().optional(),
  allowDownload: z.boolean().optional(),
});

export async function getGalleryConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eventId = String(req.params.eventId || req.params.id);

    let gallery = await prisma.gallery.findUnique({
      where: { eventId },
      include: {
        event: {
          select: { id: true, title: true, slug: true, coverPhotoUrl: true },
        },
      },
    });

    if (!gallery) {
      // Auto-create default gallery record for event if not present
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }
      const initialPin = '482917';
      const pinHash = await hashPin(initialPin);
      gallery = await prisma.gallery.create({
        data: {
          eventId,
          slug: event.slug,
          pinHash,
          isPublished: false,
          customTitle: event.title,
        },
        include: {
          event: {
            select: { id: true, title: true, slug: true, coverPhotoUrl: true },
          },
        },
      });
    }

    const selectedPhotoCount = await prisma.photo.count({
      where: { eventId, isSelected: true },
    });

    const totalPhotoCount = await prisma.photo.count({
      where: { eventId },
    });

    const galObj = gallery as any;

    res.json({
      success: true,
      data: {
        gallery: {
          id: gallery.id,
          eventId: gallery.eventId,
          slug: gallery.slug,
          isPublished: gallery.isPublished,
          publishedAt: gallery.publishedAt,
          expiresAt: gallery.expiresAt,
          allowDownload: gallery.allowDownload,
          customTitle: gallery.customTitle || galObj.event?.title || 'Event Gallery',
          customWelcomeMsg: gallery.customWelcomeMsg,
          viewCount: gallery.viewCount,
          shareableUrl: `${config.clientUrl}/gallery/${gallery.slug}`,
        },
        stats: {
          totalPhotos: totalPhotoCount,
          selectedPhotos: selectedPhotoCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAndPublishGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eventId = String(req.params.eventId || req.params.id);
    const data = publishGallerySchema.parse(req.body);

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    // Check if custom slug is already used by another gallery
    if (data.slug) {
      const existingSlug = await prisma.gallery.findFirst({
        where: {
          slug: data.slug,
          NOT: { eventId },
        },
      });
      if (existingSlug) {
        res.status(409).json({
          success: false,
          message: 'This gallery slug / URL is already in use by another event. Please pick a unique one.',
        });
        return;
      }
    }

    // Prepare update data
    const updateData: any = {
      isPublished: data.isPublished,
      publishedAt: data.isPublished ? new Date() : null,
    };

    if (data.pin) {
      updateData.pinHash = await hashPin(data.pin);
    }

    if (data.slug) {
      updateData.slug = data.slug;
    }

    if (data.customTitle !== undefined) {
      updateData.customTitle = data.customTitle;
    }

    if (data.customWelcomeMsg !== undefined) {
      updateData.customWelcomeMsg = data.customWelcomeMsg;
    }

    if (data.allowDownload !== undefined) {
      updateData.allowDownload = data.allowDownload;
    }

    const defaultPin = data.pin || '482917';
    const defaultPinHash = await hashPin(defaultPin);

    const gallery = await prisma.gallery.upsert({
      where: { eventId },
      update: updateData,
      create: {
        eventId,
        slug: data.slug || event.slug,
        pinHash: updateData.pinHash || defaultPinHash,
        isPublished: data.isPublished,
        publishedAt: data.isPublished ? new Date() : null,
        customTitle: data.customTitle || event.title,
        customWelcomeMsg: data.customWelcomeMsg,
        allowDownload: data.allowDownload !== undefined ? data.allowDownload : true,
      },
    });

    const selectedPhotoCount = await prisma.photo.count({
      where: { eventId, isSelected: true },
    });

    res.json({
      success: true,
      message: data.isPublished ? 'Gallery published successfully!' : 'Gallery saved in draft/unpublished mode.',
      data: {
        gallery: {
          id: gallery.id,
          eventId: gallery.eventId,
          slug: gallery.slug,
          isPublished: gallery.isPublished,
          publishedAt: gallery.publishedAt,
          allowDownload: gallery.allowDownload,
          customTitle: gallery.customTitle,
          customWelcomeMsg: gallery.customWelcomeMsg,
          viewCount: gallery.viewCount,
          shareableUrl: `${config.clientUrl}/gallery/${gallery.slug}`,
        },
        stats: {
          selectedPhotos: selectedPhotoCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
