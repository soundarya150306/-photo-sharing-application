import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EventItem } from '../types';
import { EventCard } from '../components/EventCard';
import { CreateEventModal } from '../components/CreateEventModal';
import { PublishGalleryModal } from '../components/PublishGalleryModal';
import { AssignMembersModal } from '../components/AssignMembersModal';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Shield,
  Image as ImageIcon,
  Globe,
  Eye,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activePublishEvent, setActivePublishEvent] = useState<EventItem | null>(null);
  const [activeMembersEvent, setActiveMembersEvent] = useState<EventItem | null>(null);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await api.getEvents();
      if (res.data.success) {
        setEvents(res.data.data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const totalPhotosUploaded = events.reduce((sum, e) => sum + (e.stats?.totalPhotos || 0), 0);
  const totalPhotosSelected = events.reduce((sum, e) => sum + (e.stats?.selectedPhotos || 0), 0);
  const publishedGalleriesCount = events.filter((e) => e.gallery?.isPublished).length;
  const totalCustomerViews = events.reduce((sum, e) => sum + (e.gallery?.viewCount || 0), 0);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'published') return event.gallery?.isPublished;
    if (statusFilter === 'draft') return !event.gallery?.isPublished;

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-brand-400" />
              <span>Studio Lead Console</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
            Event Photoshoot Overview
          </h1>
          <p className="text-xs text-slate-400">Manage all studio assignments, curate selections, and publish PIN-secured customer galleries.</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl btn-gold text-xs font-semibold flex items-center gap-2 shadow-lg shadow-brand-500/20 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Events</span>
            <ImageIcon className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-bold font-serif text-white">{events.length}</div>
          <div className="text-[10px] text-slate-500">Active photoshoot workspaces</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Uploaded Captures</span>
            <ImageIcon className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-serif text-white">{totalPhotosUploaded}</div>
          <div className="text-[10px] text-slate-500">
            <strong className="text-brand-300">{totalPhotosSelected}</strong> selected for galleries
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Published Galleries</span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-serif text-white">{publishedGalleriesCount}</div>
          <div className="text-[10px] text-emerald-400/80">Protected with access PINs</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Client PIN Views</span>
            <Eye className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-serif text-white">{totalCustomerViews}</div>
          <div className="text-[10px] text-slate-500">Verified customer visits</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-panel p-3.5 rounded-2xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, client, or venue..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            All ({events.length})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'published'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Live Published ({publishedGalleriesCount})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'draft'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Draft / Curation ({events.length - publishedGalleriesCount})
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading photoshoot workspaces...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 border border-white/5">
          <ImageIcon className="w-12 h-12 text-slate-600 opacity-50" />
          <h3 className="text-base font-bold text-slate-300 font-serif">No Events Found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {searchQuery ? 'Try adjusting your search query.' : 'Create your first event photoshoot workspace to get started!'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl btn-gold text-xs font-semibold"
            >
              Create First Event
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isAdmin={true}
              onOpenPublishModal={(e) => setActivePublishEvent(e)}
              onManageMembers={(e) => setActiveMembersEvent(e)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={fetchEvents}
      />

      {activePublishEvent && (
        <PublishGalleryModal
          isOpen={!!activePublishEvent}
          eventId={activePublishEvent.id}
          eventTitle={activePublishEvent.title}
          onClose={() => setActivePublishEvent(null)}
          onPublishedUpdated={fetchEvents}
        />
      )}

      {activeMembersEvent && (
        <AssignMembersModal
          isOpen={!!activeMembersEvent}
          event={activeMembersEvent}
          onClose={() => setActiveMembersEvent(null)}
          onUpdated={fetchEvents}
        />
      )}
    </div>
  );
};
