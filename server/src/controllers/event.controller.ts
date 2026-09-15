import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { hashPin } from '../utils/hash';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

const createEventSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  clientName: z.string().min(2, 'Client name is required'),
  eventDate: z.string().or(z.date()),
  description: z.string().optional(),
  location: z.string().optional(),
  coverPhotoUrl: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
  defaultPin: z.string().min(4).max(8).optional().default('482917'),
});

const updateEventSchema = z.object({
  title: z.string().min(2).optional(),
  clientName: z.string().min(2).optional(),
  eventDate: z.string().or(z.date()).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  coverPhotoUrl: z.string().optional(),
});

export async function createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createEventSchema.parse(req.body);
    const adminId = req.user!.id;

    // Generate base slug
    let baseSlug = slugify(data.title);
    if (!baseSlug) baseSlug = `event-${Date.now()}`;

    // Ensure slug uniqueness
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.event.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const eventDate = new Date(data.eventDate);
    const initialPin = data.defaultPin || Math.floor(100000 + Math.random() * 900000).toString();
    const pinHash = await hashPin(initialPin);

    const event = await prisma.event.create({
      data: {
        title: data.title,
        slug,
        clientName: data.clientName,
        eventDate,
        description: data.description,
        location: data.location,
        coverPhotoUrl: data.coverPhotoUrl,
        createdByAdminId: adminId,
        gallery: {
          create: {
            slug,
            pinHash,
            isPublished: false,
            customTitle: data.title,
          },
        },
      },
      include: {
        gallery: {
          select: {
            id: true,
            slug: true,
            isPublished: true,
            allowDownload: true,
            viewCount: true,
          },
        },
      },
    });

    // If members provided, attach them
    if (data.memberIds && data.memberIds.length > 0) {
      await Promise.all(
        data.memberIds.map((userId) =>
          prisma.eventMember.create({
            data: {
              eventId: event.id,
              userId,
              role: 'Photographer',
            },
          }).catch(() => null)
        )
      );
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: {
        event,
        initialPin, // Returned once so admin sees default PIN
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const isAdmin = user.role === 'ADMIN';

    const whereClause = isAdmin
      ? {}
      : {
          members: {
            some: {
              userId: user.id,
            },
          },
        };

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true, role: true },
            },
          },
        },
        gallery: {
          select: {
            id: true,
            slug: true,
            isPublished: true,
            publishedAt: true,
            allowDownload: true,
            viewCount: true,
          },
        },
        _count: {
          select: {
            photos: true,
            members: true,
          },
        },
      },
      orderBy: { eventDate: 'desc' },
    });

    // Enrich with selected photos count
    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        const selectedCount = await prisma.photo.count({
          where: {
            eventId: event.id,
            isSelected: true,
          },
        });
        const myUploadedCount = !isAdmin
          ? await prisma.photo.count({
              where: {
                eventId: event.id,
                uploadedByUserId: user.id,
              },
            })
          : event._count.photos;

        return {
          ...event,
          stats: {
            totalPhotos: event._count.photos,
            selectedPhotos: selectedCount,
            memberCount: event._count.members,
            myUploadedPhotos: myUploadedCount,
          },
        };
      })
    );

    res.json({
      success: true,
      data: { events: enrichedEvents },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eventId = String(req.params.id);
    const user = req.user!;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true, role: true },
            },
          },
        },
        gallery: {
          select: {
            id: true,
            slug: true,
            isPublished: true,
            publishedAt: true,
            expiresAt: true,
            allowDownload: true,
            customTitle: true,
            customWelcomeMsg: true,
            viewCount: true,
          },
        },
        _count: {
          select: {
            photos: true,
            members: true,
          },
        },
      },
    });

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    const selectedCount = await prisma.photo.count({
      where: {
        eventId: event.id,
        isSelected: true,
      },
    });

    const myUploadedCount = await prisma.photo.count({
      where: {
        eventId: event.id,
        uploadedByUserId: user.id,
      },
    });

    const eventObj = event as any;

    res.json({
      success: true,
      data: {
        event: {
          ...event,
          stats: {
            totalPhotos: eventObj._count?.photos || 0,
            selectedPhotos: selectedCount,
            memberCount: eventObj._count?.members || 0,
            myUploadedPhotos: myUploadedCount,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eventId = String(req.params.id);
    const data = updateEventSchema.parse(req.body);

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: data.title,
        clientName: data.clientName,
        eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
        description: data.description,
        location: data.location,
        coverPhotoUrl: data.coverPhotoUrl,
      },
    });

    res.json({
      success: true,
      message: 'Event updated successfully.',
      data: { event: updatedEvent },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eventId = String(req.params.id);

    await prisma.event.delete({
      where: { id: eventId },
    });

    res.json({
      success: true,
      message: 'Event and all associated photos deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function addMemberToEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eventId = String(req.params.id);
    const { userId, role } = req.body;

    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID is required.' });
      return;
    }

    const membership = await prisma.eventMember.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId: String(userId),
        },
      },
      update: {
        role: role || 'Photographer',
      },
      create: {
        eventId,
        userId: String(userId),
        role: role || 'Photographer',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true, role: true },
        },
      },
    });

    res.json({
      success: true,
      message: 'Team member added to event.',
      data: { member: membership },
    });
  } catch (error) {
    next(error);
  }
}

export async function removeMemberFromEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const eventId = String(req.params.id);
    const userId = String(req.params.userId);

    await prisma.eventMember.deleteMany({
      where: {
        eventId,
        userId,
      },
    });

    res.json({
      success: true,
      message: 'Team member removed from event.',
    });
  } catch (error) {
    next(error);
  }
}
