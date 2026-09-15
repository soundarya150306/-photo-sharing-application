import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Source brain artifact directories where photorealistic images were generated
const brainDirs = [
  path.resolve('C:/Users/iswar/.gemini/antigravity-ide/brain/d5456363-271f-4c62-ae7e-8e3b273fba64'),
  path.resolve('C:/Users/iswar/.gemini/antigravity-ide/brain/7580dbfc-e90a-4d5f-b73b-a16241bd2a27'),
];

function findSourceImage(filename: string): string | null {
  for (const dir of brainDirs) {
    const fullPath = path.join(dir, filename);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

async function main() {
  console.log('Seeding LuminaPhoto Database with Photorealistic Demo People Captures...');

  const uploadsDir = path.resolve(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Clear existing records in reverse dependency order
  await prisma.photo.deleteMany({});
  await prisma.gallery.deleteMany({});
  await prisma.eventMember.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared previous database entries.');

  // Create Users with real portrait avatars
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const teamPasswordHash = await bcrypt.hash('Team@123456', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@lumina.photos',
      passwordHash: adminPasswordHash,
      name: 'Elena Vance',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: 'photographer1@lumina.photos',
      passwordHash: teamPasswordHash,
      name: 'Marcus Ray',
      role: 'TEAM_MEMBER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const member2 = await prisma.user.create({
    data: {
      email: 'photographer2@lumina.photos',
      passwordHash: teamPasswordHash,
      name: 'Sophia Chen',
      role: 'TEAM_MEMBER',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
  });

  const member3 = await prisma.user.create({
    data: {
      email: 'photographer3@lumina.photos',
      passwordHash: teamPasswordHash,
      name: 'David Kim',
      role: 'TEAM_MEMBER',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log('Created Users: Admin and 3 Photographers.');

  // EVENT 1: "Arjun & Priya Royal Wedding" (Published Customer Gallery)
  const weddingPinHash = await bcrypt.hash('482917', 10);
  const weddingEvent = await prisma.event.create({
    data: {
      title: 'Arjun & Priya Royal Wedding',
      slug: 'arjun-priya-wedding',
      clientName: 'Arjun & Priya Singhania',
      eventDate: new Date('2026-06-15T18:00:00Z'),
      location: 'The Oberoi Udaivilas, Udaipur',
      description: 'A breathtaking 3-day royal destination wedding celebrating love, tradition, and joyous festivities under the Udaipur starlight.',
      createdByAdminId: admin.id,
      gallery: {
        create: {
          slug: 'arjun-priya-wedding',
          pinHash: weddingPinHash,
          isPublished: true,
          publishedAt: new Date(),
          allowDownload: true,
          customTitle: 'The Royal Wedding of Arjun & Priya',
          customWelcomeMsg: 'Dear family & friends, welcome to our private wedding photo collection. Please enjoy these cherished memories and feel free to download your favorites!',
          viewCount: 48,
        },
      },
    },
  });

  // Assign Team Members to Wedding Event
  await prisma.eventMember.createMany({
    data: [
      { eventId: weddingEvent.id, userId: member1.id, role: 'Lead Candid Photographer' },
      { eventId: weddingEvent.id, userId: member2.id, role: 'Ceremony Specialist' },
      { eventId: weddingEvent.id, userId: member3.id, role: 'Drone & Reception Shooter' },
    ],
  });

  const event1Dir = path.join(uploadsDir, 'events', weddingEvent.id);
  if (!fs.existsSync(event1Dir)) {
    fs.mkdirSync(event1Dir, { recursive: true });
  }

  // Realistic Wedding Photography Collection
  const weddingPhotosList = [
    {
      sourceFile: 'wedding_couple_portrait_1789456948543.jpg',
      targetName: 'arjun_priya_royal_portrait.jpg',
      originalFilename: 'IMG_4891_Royal_Couple_Portrait.jpg',
      category: 'Couple Portrait',
      uploader: member1.id,
      isSelected: true,
    },
    {
      sourceFile: 'bridal_portrait_closeup_1789456971969.jpg',
      targetName: 'priya_bridal_close_up.jpg',
      originalFilename: 'IMG_4910_Priya_Bridal_Candid.jpg',
      category: 'Bridal Portrait',
      uploader: member2.id,
      isSelected: true,
    },
    {
      sourceFile: 'groom_royal_portrait_1789456999649.jpg',
      targetName: 'arjun_groom_portrait.jpg',
      originalFilename: 'IMG_4922_Arjun_Groom_Regal.jpg',
      category: 'Groom Portrait',
      uploader: member1.id,
      isSelected: true,
    },
    {
      sourceFile: 'varmala_ceremony_moment_1789457038373.jpg',
      targetName: 'varmala_flower_petals_moment.jpg',
      originalFilename: 'IMG_4955_Varmala_Petal_Shower.jpg',
      category: 'Ceremony / Varmala',
      uploader: member2.id,
      isSelected: true,
    },
    {
      sourceFile: 'sunset_lake_palace_1789457160025.jpg',
      targetName: 'sunset_lake_pichola_couple.jpg',
      originalFilename: 'IMG_4980_Lake_Pichola_Sunset.jpg',
      category: 'Golden Hour Sunset',
      uploader: member1.id,
      isSelected: true,
    },
    {
      sourceFile: 'sangeet_dance_celebration_1789457066172.jpg',
      targetName: 'sangeet_high_energy_dance.jpg',
      originalFilename: 'IMG_5015_Sangeet_Dance_Performance.jpg',
      category: 'Sangeet Night',
      uploader: member3.id,
      isSelected: true,
    },
    {
      sourceFile: 'haldi_ceremony_joy_1789457094155.jpg',
      targetName: 'haldi_laughter_splash_moment.jpg',
      originalFilename: 'IMG_5044_Haldi_Smiles_Splash.jpg',
      category: 'Haldi Celebration',
      uploader: member2.id,
      isSelected: true,
    },
    {
      sourceFile: 'reception_first_dance_1789457132464.jpg',
      targetName: 'reception_ballroom_first_dance.jpg',
      originalFilename: 'IMG_5080_Reception_First_Dance.jpg',
      category: 'Reception Gala',
      uploader: member1.id,
      isSelected: true,
    },
    {
      sourceFile: 'fireworks_grand_finale_1789457191890.jpg',
      targetName: 'lake_palace_fireworks_finale.jpg',
      originalFilename: 'IMG_5110_Fireworks_Lake_Palace.jpg',
      category: 'Grand Finale',
      uploader: member3.id,
      isSelected: true,
    },
    // Unselected / Draft captures for curation testing
    {
      sourceFile: 'wedding_family_guests_1789457225400.jpg',
      targetName: 'wedding_guests_candid_laughter.jpg',
      originalFilename: 'RAW_5142_Guests_Family_Candid.jpg',
      category: 'Guests & Family',
      uploader: member3.id,
      isSelected: false, // Unselected in draft
    },
  ];

  let firstCoverUrl = '';

  for (let i = 0; i < weddingPhotosList.length; i++) {
    const item = weddingPhotosList[i];
    const sourcePath = findSourceImage(item.sourceFile);
    const targetFilename = `${Date.now()}-${item.targetName}`;
    const destPath = path.join(event1Dir, targetFilename);

    let fileSize = 250000;

    if (sourcePath && fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      const stats = fs.statSync(destPath);
      fileSize = stats.size;
    } else {
      console.warn(`Source image ${item.sourceFile} not found in brain directories!`);
    }

    const storageLocation = `events/${weddingEvent.id}/${targetFilename}`;
    if (i === 0) firstCoverUrl = `/uploads/${storageLocation}`;

    await prisma.photo.create({
      data: {
        eventId: weddingEvent.id,
        uploadedByUserId: item.uploader,
        filename: targetFilename,
        originalFilename: item.originalFilename,
        storageLocation,
        fileSize,
        mimeType: 'image/jpeg',
        isSelected: item.isSelected,
        tags: item.category,
      },
    });
  }

  // Set Event Cover Photo
  await prisma.event.update({
    where: { id: weddingEvent.id },
    data: { coverPhotoUrl: firstCoverUrl },
  });

  console.log(`Created Event 1 with ${weddingPhotosList.length} photorealistic wedding pictures (9 curated, 1 draft).`);

  // EVENT 2: "Tech Innovators Global Summit 2026"
  const summitPinHash = await bcrypt.hash('654321', 10);
  const summitEvent = await prisma.event.create({
    data: {
      title: 'Tech Innovators Global Summit 2026',
      slug: 'tech-innovators-summit-2026',
      clientName: 'Nexus Global Tech',
      eventDate: new Date('2026-08-20T09:00:00Z'),
      location: 'Moscone Center, San Francisco',
      description: 'Annual technology keynote sessions, startup pitch battles, developer workshops, and VIP networking awards gala.',
      createdByAdminId: admin.id,
      gallery: {
        create: {
          slug: 'tech-innovators-summit-2026',
          pinHash: summitPinHash,
          isPublished: true,
          publishedAt: new Date(),
          allowDownload: true,
          customTitle: 'Tech Innovators Global Summit 2026 Highlights',
          customWelcomeMsg: 'Welcome attendees, keynote speakers, and founders! Explore the official photo captures from this year\'s summit.',
          viewCount: 19,
        },
      },
    },
  });

  // Assign Team Members to Summit Event
  await prisma.eventMember.createMany({
    data: [
      { eventId: summitEvent.id, userId: member1.id, role: 'Lead Stage Photographer' },
      { eventId: summitEvent.id, userId: member2.id, role: 'Workshop & Hackathon Shooter' },
    ],
  });

  const event2Dir = path.join(uploadsDir, 'events', summitEvent.id);
  if (!fs.existsSync(event2Dir)) {
    fs.mkdirSync(event2Dir, { recursive: true });
  }

  const summitPhotosList = [
    {
      sourceFile: 'tech_keynote_speaker_1789457261089.jpg',
      targetName: 'keynote_speaker_future_ai.jpg',
      originalFilename: 'DSC_0102_Keynote_Future_Vision.jpg',
      category: 'Keynote Session',
      uploader: member1.id,
      isSelected: true,
    },
    {
      sourceFile: 'tech_panel_discussion_1789465510238.jpg',
      targetName: 'executive_panel_discussion.jpg',
      originalFilename: 'DSC_0188_GlobalTech_Panel_Discussion.jpg',
      category: 'Executive Panel',
      uploader: member1.id,
      isSelected: true,
    },
    {
      sourceFile: 'tech_hackathon_team_1789465530489.jpg',
      targetName: 'hackathon_devs_collaboration.jpg',
      originalFilename: 'DSC_0245_Hackathon_Team_Innovation.jpg',
      category: 'Workshop & Hackathon',
      uploader: member2.id,
      isSelected: true,
    },
  ];

  let summitCoverUrl = '';

  for (let i = 0; i < summitPhotosList.length; i++) {
    const item = summitPhotosList[i];
    const sourcePath = findSourceImage(item.sourceFile);
    const targetFilename = `${Date.now()}-${item.targetName}`;
    const destPath = path.join(event2Dir, targetFilename);

    let fileSize = 350000;
    if (sourcePath && fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      fileSize = fs.statSync(destPath).size;
    } else {
      console.warn(`Source image ${item.sourceFile} not found!`);
    }

    const storageLocation = `events/${summitEvent.id}/${targetFilename}`;
    if (i === 0) summitCoverUrl = `/uploads/${storageLocation}`;

    await prisma.photo.create({
      data: {
        eventId: summitEvent.id,
        uploadedByUserId: item.uploader,
        filename: targetFilename,
        originalFilename: item.originalFilename,
        storageLocation,
        fileSize,
        mimeType: 'image/jpeg',
        isSelected: item.isSelected,
        tags: item.category,
      },
    });
  }

  await prisma.event.update({
    where: { id: summitEvent.id },
    data: { coverPhotoUrl: summitCoverUrl },
  });

  console.log(`Created Event 2 (Tech Summit with ${summitPhotosList.length} photorealistic photos).`);

  console.log('\n======================================================');
  console.log('✅ DATABASE SEEDING WITH REALISTIC PORTRAITS COMPLETED!');
  console.log('======================================================');
  console.log('Demo Credentials:');
  console.log('👉 ADMIN:          admin@lumina.photos         / Admin@123456');
  console.log('👉 TEAM MEMBER 1:  photographer1@lumina.photos / Team@123456');
  console.log('👉 TEAM MEMBER 2:  photographer2@lumina.photos / Team@123456');
  console.log('👉 TEAM MEMBER 3:  photographer3@lumina.photos / Team@123456');
  console.log('\nDemo Customer Published Galleries:');
  console.log('👉 Event 1 (Wedding):      http://localhost:5173/gallery/arjun-priya-wedding (PIN: 482917)');
  console.log('👉 Event 2 (Tech Summit):  http://localhost:5173/gallery/tech-innovators-summit-2026 (PIN: 654321)');
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
