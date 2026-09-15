import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { StorageService } from '../services/storage.service';

const batchSelectionSchema = z.object({
  photoIds: z.array(z.string()).min(1, 'At least one photo ID must be provided'),
  isSelected: z.boolean(),
});

export async function uploadPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eventId = String(req.params.eventId || req.params.id);
    const user = req.user!;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No photos were uploaded. Please select at least one image file.',
      });
      return;
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    const createdPhotos = [];

    for (const file of files) {
      const ext = path.extname(file.originalname) || '.jpg';
      const uniqueFilename = `${Date.now()}-${uuidv4().substring(0, 8)}${ext}`;

      // Save to object storage
      const storageResult = await StorageService.saveFile(
        eventId,
        uniqueFilename,
        file.buffer,
        file.mimetype
      );

      // Create photo metadata record
      const photo = await prisma.photo.create({
        data: {
          eventId,
          uploadedByUserId: user.id,
          filename: storageResult.filename,
          originalFilename: file.originalname,
          storageLocation: storageResult.storageLocation,
          fileSize: storageResult.fileSize,
          mimeType: storageResult.mimeType,
          isSelected: false,
        },
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      // If event doesn't have a cover photo yet, set the first uploaded photo as cover
      if (!event.coverPhotoUrl) {
        await prisma.event.update({
          where: { id: eventId },
          data: { coverPhotoUrl: `/uploads/${storageResult.storageLocation}` },
        });
        event.coverPhotoUrl = `/uploads/${storageResult.storageLocation}`;
      }

      createdPhotos.push(photo);
    }

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${createdPhotos.length} photo(s).`,
      data: {
        photos: createdPhotos,
        count: createdPhotos.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEventPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eventId = String(req.params.eventId || req.params.id);
    const user = req.user!;
    const { filter, memberId } = req.query;

    const where: any = { eventId };

    if (filter === 'selected') {
      where.isSelected = true;
    } else if (filter === 'mine') {
      where.uploadedByUserId = user.id;
    } else if (memberId && typeof memberId === 'string') {
      where.uploadedByUserId = memberId;
    }

    const photos = await prisma.photo.findMany({
      where,
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalCount = await prisma.photo.count({ where: { eventId } });
    const selectedCount = await prisma.photo.count({ where: { eventId, isSelected: true } });
    const myCount = await prisma.photo.count({ where: { eventId, uploadedByUserId: user.id } });

    res.json({
      success: true,
      data: {
        photos,
        stats: {
          total: totalCount,
          selected: selectedCount,
          mine: myCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePhotoSelection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eventId = String(req.params.eventId || req.params.id);
    const data = batchSelectionSchema.parse(req.body);

    const updateResult = await prisma.photo.updateMany({
      where: {
        eventId,
        id: { in: data.photoIds },
      },
      data: {
        isSelected: data.isSelected,
      },
    });

    const updatedSelectedCount = await prisma.photo.count({
      where: { eventId, isSelected: true },
    });

    res.json({
      success: true,
      message: `Updated selection for ${updateResult.count} photo(s).`,
      data: {
        modifiedCount: updateResult.count,
        totalSelected: updatedSelectedCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eventId = String(req.params.eventId);
    const photoId = String(req.params.photoId);
    const user = req.user!;

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo || photo.eventId !== eventId) {
      res.status(404).json({ success: false, message: 'Photo not found in this event.' });
      return;
    }

    // Permission check: Admin can delete any photo; Team Member can only delete their own
    if (user.role !== 'ADMIN' && photo.uploadedByUserId !== user.id) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete photos that you personally uploaded.',
      });
      return;
    }

    // Delete file from disk
    await StorageService.deleteFile(photo.storageLocation);

    // Delete record from DB
    await prisma.photo.delete({
      where: { id: photoId },
    });

    res.json({
      success: true,
      message: 'Photo deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}
