export type Role = 'ADMIN' | 'TEAM_MEMBER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  createdAt?: string;
}

export interface EventMember {
  id: string;
  eventId: string;
  userId: string;
  role: string;
  assignedAt: string;
  user: User;
}

export interface Gallery {
  id: string;
  eventId: string;
  slug: string;
  isPublished: boolean;
  publishedAt?: string;
  expiresAt?: string;
  allowDownload: boolean;
  customTitle?: string;
  customWelcomeMsg?: string;
  viewCount: number;
  shareableUrl?: string;
}

export interface EventStats {
  totalPhotos: number;
  selectedPhotos: number;
  memberCount: number;
  myUploadedPhotos?: number;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  clientName: string;
  eventDate: string;
  location?: string;
  coverPhotoUrl?: string;
  createdByAdminId: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  members?: EventMember[];
  gallery?: Gallery;
  stats?: EventStats;
  _count?: {
    photos: number;
    members: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Photo {
  id: string;
  eventId: string;
  uploadedByUserId: string;
  filename: string;
  originalFilename: string;
  storageLocation: string;
  url?: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  isSelected: boolean;
  tags?: string;
  createdAt: string;
  uploadedBy?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface PublicGalleryInfo {
  slug: string;
  customTitle: string;
  customWelcomeMsg?: string;
  allowDownload: boolean;
  eventDate: string;
  location?: string;
  clientName: string;
  coverPhotoUrl?: string;
  totalSelectedPhotos: number;
  requiresPin: boolean;
}

export interface PublicPhoto {
  id: string;
  filename: string;
  originalFilename: string;
  url: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}
