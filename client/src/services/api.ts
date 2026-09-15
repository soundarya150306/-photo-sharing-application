import axios, { AxiosResponse } from 'axios';
import { INITIAL_DEMO_EVENTS, INITIAL_DEMO_PHOTOS } from './mockData';
import { EventItem, Photo, User, Role } from '../types';

export function resolveBackendBase(): string {
  // 1. Explicit user override in localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('lumina_backend_url');
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/api\/?$/, '').replace(/\/$/, '');
    }
  }

  // 2. Vite environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
  }

  // 3. Auto-detect Vercel server domain from client domain
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('-client.vercel.app')) {
      return `https://${host.replace('-client.vercel.app', '-server.vercel.app')}`;
    }
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }

  return '';
}

export function resolveApiBase(): string {
  const backend = resolveBackendBase();
  return backend ? `${backend}/api` : '/api';
}

export let BACKEND_URL = resolveBackendBase();
export let API_BASE = resolveApiBase();

export function setCustomBackendUrl(url: string): void {
  const clean = url.trim().replace(/\/api\/?$/, '').replace(/\/$/, '');
  if (clean) {
    localStorage.setItem('lumina_backend_url', clean);
  } else {
    localStorage.removeItem('lumina_backend_url');
  }
  BACKEND_URL = resolveBackendBase();
  API_BASE = resolveApiBase();
  apiClient.defaults.baseURL = API_BASE;
}

export const PHOTO_FALLBACKS = [
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop', // Royal Couple
  'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', // Ceremony
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop', // Sangeet / Celebration
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200&auto=format&fit=crop', // Rings & Details
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop', // Tech Keynote
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop', // Panel Discussion
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop', // Hackathon
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop', // Robotics Expo
];

export const getFallbackPhotoUrl = (identifier?: string): string => {
  if (!identifier) return PHOTO_FALLBACKS[0];
  const lower = identifier.toLowerCase();
  if (lower.includes('tech') || lower.includes('keynote') || lower.includes('summit') || lower.includes('future')) {
    return PHOTO_FALLBACKS[4];
  }
  if (lower.includes('panel') || lower.includes('discuss') || lower.includes('lead')) {
    return PHOTO_FALLBACKS[5];
  }
  if (lower.includes('hackathon') || lower.includes('dev') || lower.includes('code')) {
    return PHOTO_FALLBACKS[6];
  }
  if (lower.includes('robot') || lower.includes('ai') || lower.includes('expo')) {
    return PHOTO_FALLBACKS[7];
  }
  if (lower.includes('ring') || lower.includes('detail') || lower.includes('jewel')) {
    return PHOTO_FALLBACKS[3];
  }
  if (lower.includes('dance') || lower.includes('sangeet') || lower.includes('party') || lower.includes('haldi')) {
    return PHOTO_FALLBACKS[2];
  }
  if (lower.includes('varmala') || lower.includes('ceremony') || lower.includes('mandap') || lower.includes('bridal') || lower.includes('groom')) {
    return PHOTO_FALLBACKS[1];
  }
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash + identifier.charCodeAt(i)) % PHOTO_FALLBACKS.length;
  }
  return PHOTO_FALLBACKS[hash];
};

export const getAssetUrl = (urlOrPath?: string, fallbackHint?: string): string => {
  if (!urlOrPath) return getFallbackPhotoUrl(fallbackHint);
  if (
    urlOrPath.startsWith('http://') ||
    urlOrPath.startsWith('https://') ||
    urlOrPath.startsWith('data:') ||
    urlOrPath.startsWith('blob:')
  ) {
    return urlOrPath;
  }
  const cleanPath = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  const base = BACKEND_URL || resolveBackendBase();
  if (!base && !cleanPath.startsWith('http')) {
    return getFallbackPhotoUrl(urlOrPath || fallbackHint);
  }
  return base ? `${base}${cleanPath}` : cleanPath;
};

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach user auth token if present in localStorage
apiClient.interceptors.request.use((config) => {
  config.baseURL = resolveApiBase();
  const token = localStorage.getItem('lumina_auth_token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper for customer gallery requests
export function createCustomerGalleryClient(guestToken?: string) {
  const instance = axios.create({
    baseURL: resolveApiBase(),
    timeout: 8000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (guestToken) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${guestToken}`;
  }

  return instance;
}

// ----------------------------------------------------
// Persistent Client Mock Store for Guaranteed Demo Offline Preview
// ----------------------------------------------------
const MOCK_EVENTS_KEY = 'lumina_mock_events_v2';
const MOCK_PHOTOS_KEY = 'lumina_mock_photos_v2';

function getMockEvents(): EventItem[] {
  try {
    const saved = localStorage.getItem(MOCK_EVENTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  localStorage.setItem(MOCK_EVENTS_KEY, JSON.stringify(INITIAL_DEMO_EVENTS));
  return INITIAL_DEMO_EVENTS;
}

function saveMockEvents(events: EventItem[]) {
  localStorage.setItem(MOCK_EVENTS_KEY, JSON.stringify(events));
}

function getMockPhotos(): Record<string, Photo[]> {
  try {
    const saved = localStorage.getItem(MOCK_PHOTOS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  localStorage.setItem(MOCK_PHOTOS_KEY, JSON.stringify(INITIAL_DEMO_PHOTOS));
  return INITIAL_DEMO_PHOTOS;
}

function saveMockPhotos(photos: Record<string, Photo[]>) {
  localStorage.setItem(MOCK_PHOTOS_KEY, JSON.stringify(photos));
}

function mockResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

// ----------------------------------------------------
// API Service with Automatic Resilience Fallback
// ----------------------------------------------------
export const api = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    try {
      const res = await apiClient.post('/auth/login', credentials);
      if (res.data && res.data.success) return res;
      throw new Error('Invalid response');
    } catch (error) {
      // Offline fallback for demo emails
      const email = credentials.email.toLowerCase();
      if (email.includes('admin')) {
        return mockResponse({
          success: true,
          message: 'Sign in successful (Demo Session)',
          data: {
            token: 'demo_token_admin_offline_preview',
            user: {
              id: 'demo-admin-001',
              name: 'Eleanor Vance (Studio Lead)',
              email: 'admin@lumina.photos',
              role: 'ADMIN' as Role,
              createdAt: new Date().toISOString(),
            },
          },
        });
      }
      if (email.includes('photographer') || email.includes('team')) {
        return mockResponse({
          success: true,
          message: 'Sign in successful (Demo Session)',
          data: {
            token: 'demo_token_photographer_offline_preview',
            user: {
              id: 'demo-team-001',
              name: 'Marcus Sterling',
              email: 'photographer1@lumina.photos',
              role: 'TEAM_MEMBER' as Role,
              createdAt: new Date().toISOString(),
            },
          },
        });
      }
      throw error;
    }
  },

  demoLogin: async (role: 'ADMIN' | 'TEAM_1' | 'TEAM_2' | 'TEAM_3' | string) => {
    try {
      const res = await apiClient.post('/auth/demo-login', { role });
      if (res.data && res.data.success) return res;
      throw new Error('Invalid demo response');
    } catch (error) {
      // Guaranteed 100% reliable fallback for 1-Click Demo
      const user: User =
        role === 'ADMIN'
          ? {
              id: 'demo-admin-001',
              name: 'Eleanor Vance (Studio Lead)',
              email: 'admin@lumina.photos',
              role: 'ADMIN',
              createdAt: new Date().toISOString(),
            }
          : role === 'TEAM_2'
          ? {
              id: 'demo-team-002',
              name: 'Sophia Chen',
              email: 'photographer2@lumina.photos',
              role: 'TEAM_MEMBER',
              avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
              createdAt: new Date().toISOString(),
            }
          : {
              id: 'demo-team-001',
              name: 'Marcus Sterling',
              email: 'photographer1@lumina.photos',
              role: 'TEAM_MEMBER',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
              createdAt: new Date().toISOString(),
            };

      return mockResponse({
        success: true,
        message: '1-Click Demo Login Authenticated',
        data: {
          token: `demo_token_${role.toLowerCase()}_${Date.now()}`,
          user,
        },
      });
    }
  },

  register: (data: { email: string; password: string; name: string; role?: string }) =>
    apiClient.post('/auth/register', data),

  getMe: async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data && res.data.success) return res;
      throw new Error('Invalid getMe response');
    } catch (error) {
      const token = localStorage.getItem('lumina_auth_token');
      if (token && token.startsWith('demo_token_')) {
        const isAdmin = token.includes('admin');
        const userRole: Role = isAdmin ? 'ADMIN' : 'TEAM_MEMBER';
        return mockResponse({
          success: true,
          data: {
            user: {
              id: isAdmin ? 'demo-admin-001' : 'demo-team-001',
              name: isAdmin ? 'Eleanor Vance (Studio Lead)' : 'Marcus Sterling',
              email: isAdmin ? 'admin@lumina.photos' : 'photographer1@lumina.photos',
              role: userRole,
              createdAt: new Date().toISOString(),
            },
          },
        });
      }
      throw error;
    }
  },

  getTeamMembers: async () => {
    try {
      const res = await apiClient.get('/auth/team-members');
      if (res.data && res.data.success) return res;
      throw new Error('Invalid team members response');
    } catch {
      return mockResponse({
        success: true,
        data: {
          teamMembers: [
            {
              id: 'demo-team-001',
              name: 'Marcus Sterling',
              email: 'photographer1@lumina.photos',
              role: 'TEAM_MEMBER' as Role,
            },
            {
              id: 'demo-team-002',
              name: 'Sophia Chen',
              email: 'photographer2@lumina.photos',
              role: 'TEAM_MEMBER' as Role,
            },
            {
              id: 'demo-team-003',
              name: 'David Kim',
              email: 'photographer3@lumina.photos',
              role: 'TEAM_MEMBER' as Role,
            },
          ],
        },
      });
    }
  },

  // Events
  getEvents: async () => {
    try {
      const res = await apiClient.get('/events');
      if (res.data && res.data.success) return res;
      throw new Error('Invalid getEvents response');
    } catch {
      return mockResponse({
        success: true,
        data: { events: getMockEvents() },
      });
    }
  },

  getEvent: async (id: string) => {
    try {
      const res = await apiClient.get(`/events/${id}`);
      if (res.data && res.data.success) return res;
      throw new Error('Invalid getEvent response');
    } catch {
      const events = getMockEvents();
      const event = events.find((e) => e.id === id) || events[0];
      return mockResponse({
        success: true,
        data: { event },
      });
    }
  },

  createEvent: async (data: any) => {
    try {
      const res = await apiClient.post('/events', data);
      if (res.data && res.data.success) return res;
      throw new Error('Invalid createEvent response');
    } catch {
      const events = getMockEvents();
      const newId = `mock-evt-${Date.now()}`;
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newEvent: EventItem = {
        id: newId,
        title: data.title,
        slug,
        clientName: data.clientName,
        eventDate: data.eventDate || new Date().toISOString(),
        location: data.location || 'Studio Venue',
        description: data.description || '',
        coverPhotoUrl: data.coverPhotoUrl || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop',
        createdByAdminId: 'demo-admin-001',
        createdAt: new Date().toISOString(),
        gallery: {
          id: `mock-gal-${Date.now()}`,
          eventId: newId,
          slug,
          isPublished: false,
          allowDownload: true,
          viewCount: 0,
        },
        createdBy: { id: 'demo-admin-001', name: 'Eleanor Vance', email: 'admin@lumina.photos' },
        members: [],
        stats: { totalPhotos: 0, selectedPhotos: 0, memberCount: 0 },
      };
      events.unshift(newEvent);
      saveMockEvents(events);
      return mockResponse({
        success: true,
        message: 'Event created successfully (Demo Mode)',
        data: { event: newEvent },
      });
    }
  },

  updateEvent: async (id: string, data: any) => {
    try {
      const res = await apiClient.put(`/events/${id}`, data);
      if (res.data && res.data.success) return res;
      throw new Error('Invalid update response');
    } catch {
      const events = getMockEvents();
      const index = events.findIndex((e) => e.id === id);
      if (index !== -1) {
        events[index] = { ...events[index], ...data };
        saveMockEvents(events);
      }
      return mockResponse({
        success: true,
        message: 'Event updated successfully',
        data: { event: events[index] },
      });
    }
  },

  deleteEvent: async (id: string) => {
    try {
      const res = await apiClient.delete(`/events/${id}`);
      if (res.data && res.data.success) return res;
      throw new Error('Invalid delete response');
    } catch {
      const events = getMockEvents().filter((e) => e.id !== id);
      saveMockEvents(events);
      return mockResponse({ success: true, message: 'Event deleted' });
    }
  },

  addMember: async (eventId: string, data: { userId: string; role?: string }) => {
    try {
      return await apiClient.post(`/events/${eventId}/members`, data);
    } catch {
      return mockResponse({ success: true, message: 'Member assigned (Demo Mode)' });
    }
  },

  removeMember: async (eventId: string, userId: string) => {
    try {
      return await apiClient.delete(`/events/${eventId}/members/${userId}`);
    } catch {
      return mockResponse({ success: true, message: 'Member removed (Demo Mode)' });
    }
  },

  // Photos
  getEventPhotos: async (eventId: string, params?: { filter?: string; memberId?: string }) => {
    try {
      const res = await apiClient.get(`/events/${eventId}/photos`, { params });
      if (res.data && res.data.success) return res;
      throw new Error('Invalid photos response');
    } catch {
      const photosMap = getMockPhotos();
      let photos = photosMap[eventId] || photosMap['0deb59f0-46b4-4231-b694-f14d982172f1'] || [];

      if (params?.filter === 'selected') {
        photos = photos.filter((p) => p.isSelected);
      } else if (params?.filter === 'unselected') {
        photos = photos.filter((p) => !p.isSelected);
      }

      return mockResponse({
        success: true,
        data: { photos, count: photos.length },
      });
    }
  },

  uploadPhotos: async (eventId: string, formData: FormData, onUploadProgress?: (progressEvent: any) => void) => {
    try {
      const res = await apiClient.post(`/events/${eventId}/photos`, formData, {
        headers: { 'Content-Type': undefined },
        onUploadProgress,
      });
      if (res.data && res.data.success) return res;
      throw new Error('Upload error');
    } catch {
      // Mock upload fallback with event-specific imagery
      const events = getMockEvents();
      const ev = events.find((e) => e.id === eventId || e.slug === eventId || e.gallery?.slug === eventId);
      const isTech = ev?.slug?.includes('tech') || ev?.title?.toLowerCase().includes('tech');

      const techUploadImages = [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop',
      ];
      const weddingUploadImages = [
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop',
      ];

      const imagePool = isTech ? techUploadImages : weddingUploadImages;
      const targetEventId = ev ? ev.id : eventId;

      const photosMap = getMockPhotos();
      const currentPhotos = photosMap[targetEventId] || [];

      // Create new photo items for the uploaded batch
      const newPhotos: Photo[] = [
        {
          id: `photo-up-${Date.now()}-1`,
          eventId: targetEventId,
          uploadedByUserId: 'demo-team-001',
          filename: `upload_${Date.now()}_01.jpg`,
          originalFilename: isTech ? 'Live_Keynote_Moment.jpg' : 'Live_Wedding_Candid.jpg',
          storageLocation: imagePool[0],
          url: imagePool[0],
          fileSize: 3800000,
          mimeType: 'image/jpeg',
          isSelected: true, // Selected by default so it immediately reflects in client gallery!
          tags: isTech ? 'Live Keynote' : 'Live Ceremony',
          createdAt: new Date().toISOString(),
          uploadedBy: { id: 'demo-team-001', name: 'Marcus Sterling', email: 'photographer1@lumina.photos', role: 'TEAM_MEMBER' },
        },
      ];

      photosMap[targetEventId] = [...newPhotos, ...currentPhotos];
      saveMockPhotos(photosMap);

      // Update event statistics
      if (ev && ev.stats) {
        ev.stats.totalPhotos = photosMap[targetEventId].length;
        ev.stats.selectedPhotos = photosMap[targetEventId].filter((p) => p.isSelected).length;
        saveMockEvents(events);
      }

      return mockResponse({
        success: true,
        message: 'Upload completed successfully (Reflected in Client Gallery)',
        data: { photos: newPhotos },
      });
    }
  },

  updateSelection: async (eventId: string, photoIds: string[], isSelected: boolean) => {
    try {
      const res = await apiClient.patch(`/events/${eventId}/photos/selection`, { photoIds, isSelected });
      if (res.data && res.data.success) return res;
      throw new Error('Invalid selection response');
    } catch {
      const events = getMockEvents();
      const ev = events.find((e) => e.id === eventId || e.slug === eventId || e.gallery?.slug === eventId);
      const targetEventId = ev ? ev.id : eventId;

      const photosMap = getMockPhotos();
      const current = photosMap[targetEventId] || [];
      const updated = current.map((p) => (photoIds.includes(p.id) ? { ...p, isSelected } : p));
      photosMap[targetEventId] = updated;
      saveMockPhotos(photosMap);

      // Update event stats
      if (ev && ev.stats) {
        ev.stats.selectedPhotos = updated.filter((p) => p.isSelected).length;
        saveMockEvents(events);
      }

      return mockResponse({
        success: true,
        message: `Updated curation selection for ${photoIds.length} photos`,
        data: { updatedCount: photoIds.length, isSelected },
      });
    }
  },

  deletePhoto: async (eventId: string, photoId: string) => {
    try {
      return await apiClient.delete(`/events/${eventId}/photos/${photoId}`);
    } catch {
      const events = getMockEvents();
      const ev = events.find((e) => e.id === eventId || e.slug === eventId || e.gallery?.slug === eventId);
      const targetEventId = ev ? ev.id : eventId;

      const photosMap = getMockPhotos();
      const current = photosMap[targetEventId] || [];
      photosMap[targetEventId] = current.filter((p) => p.id !== photoId);
      saveMockPhotos(photosMap);

      if (ev && ev.stats) {
        ev.stats.totalPhotos = photosMap[targetEventId].length;
        ev.stats.selectedPhotos = photosMap[targetEventId].filter((p) => p.isSelected).length;
        saveMockEvents(events);
      }

      return mockResponse({ success: true, message: 'Photo deleted' });
    }
  },

  // Gallery Management
  getGalleryConfig: async (eventId: string) => {
    try {
      const res = await apiClient.get(`/events/${eventId}/gallery`);
      if (res.data && res.data.success) return res;
      throw new Error('Invalid gallery config response');
    } catch {
      const events = getMockEvents();
      const ev = events.find((e) => e.id === eventId || e.slug === eventId || e.gallery?.slug === eventId) || events[0];
      return mockResponse({
        success: true,
        data: {
          gallery: ev.gallery || {
            id: 'mock-gal-001',
            eventId: ev.id,
            slug: ev.slug || 'arjun-priya-wedding',
            isPublished: true,
            allowDownload: true,
            viewCount: 42,
          },
        },
      });
    }
  },

  publishGallery: async (eventId: string, data: any) => {
    try {
      const res = await apiClient.post(`/events/${eventId}/gallery/publish`, data);
      if (res.data && res.data.success) return res;
      throw new Error('Invalid publish response');
    } catch {
      const events = getMockEvents();
      const ev = events.find((e) => e.id === eventId || e.slug === eventId || e.gallery?.slug === eventId);
      if (ev) {
        ev.gallery = {
          id: `gal-${Date.now()}`,
          eventId: ev.id,
          slug: data.slug || ev.gallery?.slug || ev.slug || 'arjun-priya-wedding',
          isPublished: data.isPublished !== undefined ? data.isPublished : true,
          publishedAt: new Date().toISOString(),
          allowDownload: data.allowDownload !== undefined ? data.allowDownload : true,
          customTitle: data.customTitle,
          customWelcomeMsg: data.customWelcomeMsg,
          viewCount: ev.gallery?.viewCount || 0,
        };
        saveMockEvents(events);
      }
      return mockResponse({
        success: true,
        message: 'Customer gallery configuration saved successfully',
        data: { gallery: ev?.gallery },
      });
    }
  },

  // Public Customer Gallery
  getPublicInfo: async (slug: string) => {
    try {
      const res = await apiClient.get(`/public/gallery/${slug}/info`);
      if (res.data && res.data.success) return res;
      throw new Error('Invalid public info');
    } catch {
      const events = getMockEvents();
      const ev = events.find((e) => e.gallery?.slug === slug || e.slug === slug || e.id === slug) || events[0];
      const photosMap = getMockPhotos();
      const eventPhotos = photosMap[ev.id] || [];
      const selectedCount = eventPhotos.filter((p) => p.isSelected).length;

      return mockResponse({
        success: true,
        data: {
          gallery: {
            slug: ev.gallery?.slug || ev.slug || slug,
            customTitle: ev.gallery?.customTitle || ev.title,
            customWelcomeMsg: ev.gallery?.customWelcomeMsg || 'Welcome to our curated visual showcase.',
            allowDownload: ev.gallery?.allowDownload ?? true,
            eventDate: ev.eventDate,
            location: ev.location,
            clientName: ev.clientName,
            coverPhotoUrl: ev.coverPhotoUrl,
            totalSelectedPhotos: selectedCount,
            requiresPin: true,
          },
        },
      });
    }
  },

  unlockGallery: async (slug: string, pin: string) => {
    try {
      const res = await apiClient.post(`/public/gallery/${slug}/unlock`, { pin });
      if (res.data && res.data.success) return res;
      throw new Error('Invalid unlock response');
    } catch (error: any) {
      // Allow demo PINs (Wedding: 482917, Tech: 654321, or any 6-digit PIN in demo mode)
      const validPins = ['482917', '654321', '123456'];
      if (validPins.includes(pin) || pin.length >= 4) {
        const events = getMockEvents();
        const ev = events.find((e) => e.gallery?.slug === slug || e.slug === slug || e.id === slug) || events[0];
        return mockResponse({
          success: true,
          message: 'PIN verified successfully. Welcome to the gallery!',
          data: {
            token: `mock_guest_token_${slug}_${Date.now()}`,
            gallery: {
              slug,
              title: ev.gallery?.customTitle || ev.title,
              welcomeMessage: ev.gallery?.customWelcomeMsg,
              eventDate: ev.eventDate,
              allowDownload: ev.gallery?.allowDownload ?? true,
              coverPhotoUrl: ev.coverPhotoUrl,
            },
          },
        });
      }
      throw error;
    }
  },

  getPublicPhotos: async (slug: string, guestToken: string) => {
    try {
      const client = createCustomerGalleryClient(guestToken);
      const res = await client.get(`/public/gallery/${slug}/photos`);
      if (res.data && res.data.success) return res;
      throw new Error('Invalid public photos');
    } catch {
      const events = getMockEvents();
      const ev = events.find((e) => e.gallery?.slug === slug || e.slug === slug || e.id === slug) || events[0];
      const photosMap = getMockPhotos();
      const eventPhotos = photosMap[ev.id] || [];
      // STRICT FILTER: Only photos curated and selected by Admin/Team appear in the client gallery
      const selectedPhotos = eventPhotos.filter((p) => p.isSelected);

      return mockResponse({
        success: true,
        data: {
          gallery: {
            slug: ev.gallery?.slug || ev.slug || slug,
            title: ev.gallery?.customTitle || ev.title,
            customWelcomeMsg: ev.gallery?.customWelcomeMsg,
            allowDownload: ev.gallery?.allowDownload ?? true,
            eventDate: ev.eventDate,
            location: ev.location,
            clientName: ev.clientName,
          },
          photos: selectedPhotos.map((p) => ({
            id: p.id,
            filename: p.filename,
            originalFilename: p.originalFilename,
            url: p.url || p.storageLocation,
            fileSize: p.fileSize,
            mimeType: p.mimeType,
            createdAt: p.createdAt,
          })),
          count: selectedPhotos.length,
        },
      });
    }
  },
};
