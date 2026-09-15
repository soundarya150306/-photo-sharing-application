import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Image as ImageIcon, CheckCircle, Lock, Globe, Users, ArrowRight, Shield } from 'lucide-react';
import { EventItem } from '../types';
import { getAssetUrl, getFallbackPhotoUrl } from '../services/api';

interface EventCardProps {
  event: EventItem;
  isAdmin: boolean;
  onOpenPublishModal?: (event: EventItem) => void;
  onManageMembers?: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isAdmin,
  onOpenPublishModal,
  onManageMembers,
}) => {
  const isPublished = event.gallery?.isPublished;
  const totalPhotos = event.stats?.totalPhotos ?? event._count?.photos ?? 0;
  const selectedPhotos = event.stats?.selectedPhotos ?? 0;
  const memberCount = event.stats?.memberCount ?? event.members?.length ?? 0;
  const myUploadedPhotos = event.stats?.myUploadedPhotos;

  const formattedDate = new Date(event.eventDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group border border-white/5 hover:border-brand-500/30 transition-all duration-300">
      {/* Cover Image Header */}
      <div className="relative h-48 w-full overflow-hidden bg-dark-900">
        <img
          src={getAssetUrl(event.coverPhotoUrl, event.title)}
          alt={event.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getFallbackPhotoUrl(event.title || event.clientName);
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isPublished ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Gallery Published
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Draft / Curation
            </span>
          )}
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent"></div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-400 font-medium mb-1.5">
            <span>Client: {event.clientName}</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-brand-300 transition-colors line-clamp-1 font-serif">
            {event.title}
          </h3>

          {/* Details */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formattedDate}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-1 line-clamp-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate max-w-[150px]">{event.location}</span>
              </div>
            )}
          </div>

          {/* Metrics Pill Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-xl bg-dark-900/60 border border-white/5 text-center">
            <div>
              <div className="text-sm font-bold text-slate-200">{totalPhotos}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Uploaded</div>
            </div>
            <div className="border-x border-white/5">
              <div className="text-sm font-bold text-brand-400">{selectedPhotos}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Selected</div>
            </div>
            <div>
              <div className="text-sm font-bold text-cyan-400">{memberCount}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Team</div>
            </div>
          </div>

          {/* Team Member Specific Info */}
          {!isAdmin && myUploadedPhotos !== undefined && (
            <div className="mt-3 text-xs text-slate-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg flex items-center justify-between">
              <span>Your uploaded photos:</span>
              <span className="font-bold text-cyan-300">{myUploadedPhotos} photos</span>
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          {isAdmin ? (
            <>
              <div className="flex items-center gap-1.5">
                {onOpenPublishModal && (
                  <button
                    onClick={() => onOpenPublishModal(event)}
                    className="p-2 rounded-lg text-slate-300 hover:text-brand-300 hover:bg-brand-500/10 border border-white/5 hover:border-brand-500/30 text-xs font-semibold transition-all flex items-center gap-1"
                    title="Publish settings & Access PIN"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Publish & PIN</span>
                  </button>
                )}
                {onManageMembers && (
                  <button
                    onClick={() => onManageMembers(event)}
                    className="p-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 text-xs font-semibold transition-all flex items-center gap-1"
                    title="Assign photographers"
                  >
                    <Users className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <Link
                to={`/events/${event.id}`}
                className="px-3.5 py-1.5 rounded-lg btn-gold text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            <Link
              to={`/events/${event.id}`}
              className="w-full py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <span>Open Upload Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
