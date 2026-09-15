import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, getAssetUrl } from '../services/api';
import { EventItem, Photo, User } from '../types';
import { PhotoUploader } from '../components/PhotoUploader';
import { PhotoGrid } from '../components/PhotoGrid';
import { CurationToolbar } from '../components/CurationToolbar';
import { PublishGalleryModal } from '../components/PublishGalleryModal';
import { AssignMembersModal } from '../components/AssignMembersModal';
import { CustomerLightbox } from '../components/CustomerLightbox';
import {
  Calendar,
  MapPin,
  Users,
  Image as ImageIcon,
  Globe,
  UploadCloud,
  CheckCircle,
  SlidersHorizontal,
  ArrowLeft,
  Key,
  Shield,
  Loader2,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'photos' | 'upload' | 'members' | 'gallery'>('photos');
  const [filter, setFilter] = useState<'all' | 'selected' | 'mine'>('all');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('');

  // Curation state
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // Lightbox
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Copy feedback
  const [copiedLink, setCopiedLink] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const fetchEventData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [eventRes, photosRes] = await Promise.all([
        api.getEvent(id),
        api.getEventPhotos(id, {
          filter: filter === 'mine' ? 'mine' : filter === 'selected' ? 'selected' : undefined,
          memberId: selectedMemberFilter || undefined,
        }),
      ]);

      if (eventRes.data.success) {
        setEvent(eventRes.data.data.event);
      }
      if (photosRes.data.success) {
        setPhotos(photosRes.data.data.photos);
        // Sync local selected photo IDs
        const selected = photosRes.data.data.photos.filter((p: Photo) => p.isSelected).map((p: Photo) => p.id);
        setSelectedPhotoIds(selected);
      }
    } catch (error: any) {
      console.error('Failed to load event details:', error);
      if (error.response?.status === 403) {
        alert('Access Denied: You are not assigned to this event.');
        navigate(isAdmin ? '/admin' : '/team');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, filter, selectedMemberFilter, isAdmin, navigate]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  const handleToggleSelect = async (photoId: string) => {
    if (!isAdmin || !id) return;

    const isCurrentlySelected = selectedPhotoIds.includes(photoId);
    const newSelected = isCurrentlySelected
      ? selectedPhotoIds.filter((pid) => pid !== photoId)
      : [...selectedPhotoIds, photoId];

    setSelectedPhotoIds(newSelected);

    try {
      await api.updateSelection(id, [photoId], !isCurrentlySelected);
      // Update in local photos list
      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, isSelected: !isCurrentlySelected } : p))
      );
    } catch (error) {
      console.error('Failed to toggle selection:', error);
      // Revert
      setSelectedPhotoIds(selectedPhotoIds);
    }
  };

  const handleSelectAll = async () => {
    if (!isAdmin || !id) return;
    const allIds = photos.map((p) => p.id);
    setSelectedPhotoIds(allIds);

    try {
      await api.updateSelection(id, allIds, true);
      setPhotos((prev) => prev.map((p) => ({ ...p, isSelected: true })));
    } catch (error) {
      console.error('Failed to select all:', error);
    }
  };

  const handleDeselectAll = async () => {
    if (!isAdmin || !id) return;
    const allIds = photos.map((p) => p.id);
    setSelectedPhotoIds([]);

    try {
      await api.updateSelection(id, allIds, false);
      setPhotos((prev) => prev.map((p) => ({ ...p, isSelected: false })));
    } catch (error) {
      console.error('Failed to deselect all:', error);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!id) return;
    try {
      const res = await api.deletePhoto(id, photoId);
      if (res.data.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        setSelectedPhotoIds((prev) => prev.filter((pid) => pid !== photoId));
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  const shareableGalleryUrl = event?.gallery?.slug
    ? `${window.location.origin}/gallery/${event.gallery.slug}`
    : '';

  const copyLink = () => {
    if (shareableGalleryUrl) {
      navigator.clipboard.writeText(shareableGalleryUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoading && !event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading photoshoot workspace...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white font-serif">Event Not Found</h2>
        <p className="text-xs text-slate-400">The requested event workspace could not be found or you do not have permission.</p>
        <Link to={isAdmin ? '/admin' : '/team'} className="px-4 py-2 rounded-xl btn-gold text-xs font-semibold inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(event.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Link */}
      <Link
        to={isAdmin ? '/admin' : '/team'}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to {isAdmin ? 'Admin Console' : 'My Assigned Shoots'}</span>
      </Link>

      {/* Hero Workspace Header Card */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
                Client: {event.clientName}
              </span>
              {event.gallery?.isPublished ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Published Gallery</span>
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Curation Mode (Draft)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-serif text-white tracking-tight">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-400" />
                <span>{formattedDate}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-400" />
                  <span>{event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>{event.members?.length || 0} Photographers Assigned</span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Upload Button visible to both Admin and Team */}
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
                activeTab === 'upload'
                  ? 'bg-cyan-500 text-dark-950 font-bold shadow-cyan-500/30'
                  : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Captures</span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setIsPublishModalOpen(true)}
                  className="px-4 py-2 rounded-xl btn-gold text-xs font-semibold flex items-center gap-2 shadow-lg shadow-brand-500/20"
                >
                  <Globe className="w-4 h-4" />
                  <span>Publish Gallery & PIN</span>
                </button>
                <button
                  onClick={() => setIsMembersModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-cyan-300 bg-dark-900/80 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 transition-all flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>Team ({event.members?.length || 0})</span>
                </button>
              </>
            )}

            {event.gallery?.isPublished && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={copyLink}
                  className="p-2 rounded-xl bg-dark-900/80 hover:bg-dark-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-brand-300 transition-all flex items-center gap-1"
                  title="Copy Customer Share Link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
                </button>
                <a
                  href={shareableGalleryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-dark-900/80 hover:bg-dark-900 border border-white/10 text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition-all flex items-center gap-1"
                  title="Open Customer Gallery"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-t border-white/10 bg-dark-900/40 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'photos'
                ? 'border-brand-400 text-brand-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photo Collection ({photos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Captures</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('members')}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'members'
                  ? 'border-purple-400 text-purple-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Assigned Team ({event.members?.length || 0})</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB CONTENT: UPLOAD */}
      {activeTab === 'upload' && (
        <div className="space-y-4 animate-fade-in">
          <PhotoUploader
            eventId={event.id}
            onUploadSuccess={() => {
              fetchEventData();
              setActiveTab('photos');
            }}
          />
        </div>
      )}

      {/* TAB CONTENT: MEMBERS */}
      {activeTab === 'members' && isAdmin && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-serif">Event Photography Team</h3>
              <p className="text-xs text-slate-400">Team members assigned to upload photos for this event</p>
            </div>
            <button
              onClick={() => setIsMembersModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Add / Manage Team</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {event.members?.map((member) => (
              <div key={member.id} className="p-4 rounded-xl bg-dark-900/60 border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm border border-cyan-500/30">
                  {member.user.name.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-200 truncate">{member.user.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{member.user.email}</div>
                  <div className="text-[10px] text-cyan-300 font-semibold mt-0.5">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PHOTOS & CURATION */}
      {activeTab === 'photos' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 glass-panel p-3.5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                All Captures ({photos.length})
              </button>
              <button
                onClick={() => setFilter('selected')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === 'selected'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                Selected for Gallery ({selectedPhotoIds.length})
              </button>
              <button
                onClick={() => setFilter('mine')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === 'mine'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                My Uploads
              </button>
            </div>

            {isAdmin && (
              <div className="text-xs text-brand-400 font-semibold flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Click checkboxes to curate client gallery</span>
              </div>
            )}
          </div>

          {/* Photos Grid */}
          <PhotoGrid
            photos={photos}
            isAdmin={isAdmin}
            currentUserId={user?.id || ''}
            selectedPhotoIds={selectedPhotoIds}
            onToggleSelect={handleToggleSelect}
            onPreviewPhoto={(photo) => {
              const idx = photos.findIndex((p) => p.id === photo.id);
              setLightboxIndex(idx >= 0 ? idx : 0);
              setPreviewPhoto(photo);
            }}
            onDeletePhoto={handleDeletePhoto}
            onSwitchToUpload={() => setActiveTab('upload')}
          />

          {/* Admin Floating Curation Bar */}
          {isAdmin && photos.length > 0 && (
            <CurationToolbar
              totalCount={photos.length}
              selectedCount={selectedPhotoIds.length}
              isPublished={!!event.gallery?.isPublished}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onOpenPublishModal={() => setIsPublishModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* Modals */}
      <PublishGalleryModal
        isOpen={isPublishModalOpen}
        eventId={event.id}
        eventTitle={event.title}
        onClose={() => setIsPublishModalOpen(false)}
        onPublishedUpdated={fetchEventData}
      />

      <AssignMembersModal
        isOpen={isMembersModalOpen}
        event={event}
        onClose={() => setIsMembersModalOpen(false)}
        onUpdated={fetchEventData}
      />

      {previewPhoto && (
        <CustomerLightbox
          photos={photos.map((p) => ({
            id: p.id,
            filename: p.filename,
            originalFilename: p.originalFilename,
            url: getAssetUrl(p.url || `/uploads/${p.storageLocation}`),
            fileSize: p.fileSize,
            mimeType: p.mimeType,
            createdAt: p.createdAt,
          }))}
          currentIndex={lightboxIndex}
          isOpen={!!previewPhoto}
          allowDownload={true}
          gallerySlug={event.gallery?.slug || event.slug}
          guestToken=""
          onClose={() => setPreviewPhoto(null)}
          onIndexChange={(idx) => {
            setLightboxIndex(idx);
            setPreviewPhoto(photos[idx]);
          }}
        />
      )}
    </div>
  );
};
