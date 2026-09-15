import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/utils/prisma';
import { hashPassword, hashPin } from '../src/utils/hash';

describe('LuminaPhoto API & RBAC Comprehensive Test Suite', () => {
  let adminToken: string;
  let member1Token: string;
  let member2Token: string;
  let member1Id: string;
  let member2Id: string;
  let adminId: string;
  let testEventId: string;
  let testEventSlug: string;
  let testPhotoId1: string;
  let testPhotoId2: string;
  const testPin = '839201';

  beforeAll(async () => {
    // Clean database before tests
    await prisma.photo.deleteMany({});
    await prisma.gallery.deleteMany({});
    await prisma.eventMember.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.user.deleteMany({});

    // Seed test users
    const pwdHash = await hashPassword('Password@123');

    const admin = await prisma.user.create({
      data: {
        email: 'testadmin@lumina.photos',
        passwordHash: pwdHash,
        name: 'Test Admin',
        role: 'ADMIN',
      },
    });
    adminId = admin.id;

    const m1 = await prisma.user.create({
      data: {
        email: 'photographer1@test.com',
        passwordHash: pwdHash,
        name: 'Photographer One',
        role: 'TEAM_MEMBER',
      },
    });
    member1Id = m1.id;

    const m2 = await prisma.user.create({
      data: {
        email: 'photographer2@test.com',
        passwordHash: pwdHash,
        name: 'Photographer Two',
        role: 'TEAM_MEMBER',
      },
    });
    member2Id = m2.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Authentication & Role-Based Token Issuance', () => {
    it('should reject login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testadmin@lumina.photos', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should authenticate Admin and return JWT with ADMIN role', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testadmin@lumina.photos', password: 'Password@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('ADMIN');
      expect(res.body.data.token).toBeDefined();
      adminToken = res.body.data.token;
    });

    it('should authenticate Team Member 1 and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'photographer1@test.com', password: 'Password@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('TEAM_MEMBER');
      member1Token = res.body.data.token;
    });

    it('should authenticate Team Member 2 and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'photographer2@test.com', password: 'Password@123' });

      expect(res.status).toBe(200);
      member2Token = res.body.data.token;
    });

    it('should block unauthenticated requests to protected endpoints', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(401);
    });
  });

  describe('2. Event Creation & Team Member Assignment Isolation', () => {
    it('should allow Admin to create a new event', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Royal Gala Celebration 2026',
          clientName: 'Lord & Lady Ashford',
          eventDate: '2026-10-15T18:00:00Z',
          description: 'Prestigious evening ball with red carpet arrivals.',
          memberIds: [member1Id], // Assign only member 1
          defaultPin: testPin,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event.id).toBeDefined();
      testEventId = res.body.data.event.id;
      testEventSlug = res.body.data.event.slug;
    });

    it('should forbid Team Member from creating an event', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${member1Token}`)
        .send({
          title: 'Unauthorized Event Creation',
          clientName: 'Test Client',
          eventDate: '2026-10-15T18:00:00Z',
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/admin/i);
    });

    it('should allow assigned Team Member 1 to access the event', async () => {
      const res = await request(app)
        .get(`/api/events/${testEventId}`)
        .set('Authorization', `Bearer ${member1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.event.id).toBe(testEventId);
    });

    it('should FORBID unassigned Team Member 2 from accessing the event (403 Event Isolation)', async () => {
      const res = await request(app)
        .get(`/api/events/${testEventId}`)
        .set('Authorization', `Bearer ${member2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/not assigned/i);
    });
  });

  describe('3. Photo Uploads & Event Access Controls', () => {
    it('should allow assigned Team Member 1 to upload photo metadata/files', async () => {
      const dummyBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><circle r="50"/></svg>');

      const res = await request(app)
        .post(`/api/events/${testEventId}/photos`)
        .set('Authorization', `Bearer ${member1Token}`)
        .attach('photos', dummyBuffer, 'ballroom_entrance.svg');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.photos).toHaveLength(1);
      expect(res.body.data.photos[0].uploadedBy.id).toBe(member1Id);
      testPhotoId1 = res.body.data.photos[0].id;
    });

    it('should allow Admin to also upload photos', async () => {
      const dummyBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/></svg>');

      const res = await request(app)
        .post(`/api/events/${testEventId}/photos`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('photos', dummyBuffer, 'champagne_tower.svg');

      expect(res.status).toBe(201);
      testPhotoId2 = res.body.data.photos[0].id;
    });

    it('should FORBID unassigned Team Member 2 from uploading photos (403)', async () => {
      const dummyBuffer = Buffer.from('<svg><text>test</text></svg>');

      const res = await request(app)
        .post(`/api/events/${testEventId}/photos`)
        .set('Authorization', `Bearer ${member2Token}`)
        .attach('photos', dummyBuffer, 'illegal_upload.svg');

      expect(res.status).toBe(403);
    });
  });

  describe('4. Curation & Gallery Publishing Controls', () => {
    it('should FORBID Team Member from publishing a gallery', async () => {
      const res = await request(app)
        .post(`/api/events/${testEventId}/gallery/publish`)
        .set('Authorization', `Bearer ${member1Token}`)
        .send({
          isPublished: true,
          pin: '123456',
        });

      expect(res.status).toBe(403);
    });

    it('should allow Admin to curate and select specific photos', async () => {
      // Select photo 1, leave photo 2 unselected
      const res = await request(app)
        .patch(`/api/events/${testEventId}/photos/selection`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          photoIds: [testPhotoId1],
          isSelected: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.totalSelected).toBe(1);
    });

    it('should allow Admin to publish gallery with a secure access PIN', async () => {
      const res = await request(app)
        .post(`/api/events/${testEventId}/gallery/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isPublished: true,
          pin: testPin,
          customTitle: 'The Gala Collection',
          allowDownload: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.gallery.isPublished).toBe(true);
      expect(res.body.data.gallery.slug).toBe(testEventSlug);
    });
  });

  describe('5. PIN-Protected Customer Gallery Security', () => {
    let customerGuestToken: string;

    it('should return public metadata without exposing photos or PIN', async () => {
      const res = await request(app).get(`/api/public/gallery/${testEventSlug}/info`);

      expect(res.status).toBe(200);
      expect(res.body.data.gallery.customTitle).toBe('The Gala Collection');
      expect(res.body.data.gallery.requiresPin).toBe(true);
      expect(res.body.data.gallery.pin).toBeUndefined();
      expect(res.body.data.gallery.pinHash).toBeUndefined();
    });

    it('should reject photo retrieval without PIN verification token (401)', async () => {
      const res = await request(app).get(`/api/public/gallery/${testEventSlug}/photos`);
      expect(res.status).toBe(401);
    });

    it('should reject invalid PIN (401 Unauthorized)', async () => {
      const res = await request(app)
        .post(`/api/public/gallery/${testEventSlug}/unlock`)
        .send({ pin: '000000' });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/incorrect.*pin/i);
    });

    it('should unlock gallery with correct PIN and issue guest session token', async () => {
      const res = await request(app)
        .post(`/api/public/gallery/${testEventSlug}/unlock`)
        .send({ pin: testPin });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      customerGuestToken = res.body.data.token;
    });

    it('should retrieve ONLY selected photos and never unselected draft photos', async () => {
      const res = await request(app)
        .get(`/api/public/gallery/${testEventSlug}/photos`)
        .set('Authorization', `Bearer ${customerGuestToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.photos).toHaveLength(1);
      expect(res.body.data.photos[0].id).toBe(testPhotoId1);
      // Photo 2 was not selected, must NOT be present
      const hasUnselected = res.body.data.photos.some((p: any) => p.id === testPhotoId2);
      expect(hasUnselected).toBe(false);
    });

    it('should allow customer to download individual selected photo', async () => {
      const res = await request(app)
        .get(`/api/public/gallery/${testEventSlug}/photos/${testPhotoId1}/download`)
        .set('Authorization', `Bearer ${customerGuestToken}`);

      expect(res.status).toBe(200);
    });
  });
});
