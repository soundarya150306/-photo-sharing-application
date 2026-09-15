import axios from 'axios';

export const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach user auth token if present in localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('lumina_auth_token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper for customer gallery requests
export function createCustomerGalleryClient(guestToken?: string) {
  const instance = axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (guestToken) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${guestToken}`;
  }

  return instance;
}

// API functions
export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  register: (data: { email: string; password: string; name: string; role?: string }) =>
    apiClient.post('/auth/register', data),
  getMe: () => apiClient.get('/auth/me'),
  getTeamMembers: () => apiClient.get('/auth/team-members'),

  // Events
  getEvents: () => apiClient.get('/events'),
  getEvent: (id: string) => apiClient.get(`/events/${id}`),
  createEvent: (data: any) => apiClient.post('/events', data),
  updateEvent: (id: string, data: any) => apiClient.put(`/events/${id}`, data),
  deleteEvent: (id: string) => apiClient.delete(`/events/${id}`),
  addMember: (eventId: string, data: { userId: string; role?: string }) =>
    apiClient.post(`/events/${eventId}/members`, data),
  removeMember: (eventId: string, userId: string) =>
    apiClient.delete(`/events/${eventId}/members/${userId}`),

  // Photos
  getEventPhotos: (eventId: string, params?: { filter?: string; memberId?: string }) =>
    apiClient.get(`/events/${eventId}/photos`, { params }),
  uploadPhotos: (eventId: string, formData: FormData, onUploadProgress?: (progressEvent: any) => void) =>
    apiClient.post(`/events/${eventId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  updateSelection: (eventId: string, photoIds: string[], isSelected: boolean) =>
    apiClient.patch(`/events/${eventId}/photos/selection`, { photoIds, isSelected }),
  deletePhoto: (eventId: string, photoId: string) =>
    apiClient.delete(`/events/${eventId}/photos/${photoId}`),

  // Gallery Management
  getGalleryConfig: (eventId: string) =>
    apiClient.get(`/events/${eventId}/gallery`),
  publishGallery: (eventId: string, data: any) =>
    apiClient.post(`/events/${eventId}/gallery/publish`, data),

  // Public Customer Gallery
  getPublicInfo: (slug: string) =>
    axios.get(`/api/public/gallery/${slug}/info`),
  unlockGallery: (slug: string, pin: string) =>
    axios.post(`/api/public/gallery/${slug}/unlock`, { pin }),
  getPublicPhotos: (slug: string, guestToken: string) =>
    axios.get(`/api/public/gallery/${slug}/photos`, {
      headers: { Authorization: `Bearer ${guestToken}` },
    }),
};
