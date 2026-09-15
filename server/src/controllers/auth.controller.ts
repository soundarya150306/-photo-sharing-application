import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { signUserToken } from '../utils/jwt';

const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  role: z.enum(['ADMIN', 'TEAM_MEMBER']).optional().default('TEAM_MEMBER'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
      return;
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        role: data.role as 'ADMIN' | 'TEAM_MEMBER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const token = signUserToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'TEAM_MEMBER',
      name: user.name,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const isValidPassword = await comparePassword(data.password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const token = signUserToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'TEAM_MEMBER',
      name: user.name,
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTeamMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
}

export async function demoLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const roleType = String(req.body.role || 'ADMIN').toUpperCase();
    let email = 'admin@lumina.photos';
    let name = 'Elena Vance (Lead Admin)';
    let defaultRole: 'ADMIN' | 'TEAM_MEMBER' = 'ADMIN';

    if (roleType === 'TEAM_1') {
      email = 'photographer1@lumina.photos';
      name = 'Marcus Ray (Lead Photographer)';
      defaultRole = 'TEAM_MEMBER';
    } else if (roleType === 'TEAM_2') {
      email = 'photographer2@lumina.photos';
      name = 'Sophia Chen (Ceremony Specialist)';
      defaultRole = 'TEAM_MEMBER';
    } else if (roleType === 'TEAM_3') {
      email = 'photographer3@lumina.photos';
      name = 'David Kim (Drone & Candid)';
      defaultRole = 'TEAM_MEMBER';
    }

    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      const passwordHash = await hashPassword(defaultRole === 'ADMIN' ? 'Admin@123456' : 'Team@123456');
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name,
          role: defaultRole,
        },
      });
    }

    const token = signUserToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'TEAM_MEMBER',
      name: user.name,
    });

    res.json({
      success: true,
      message: 'Demo login successful.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

