import React from 'react';
import { Check, Trash2, Eye, User, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Photo, Role } from '../types';

interface PhotoGridProps {
  photos: Photo[];
  isAdmin: boolean;
  currentUserId: string;
  selectedPhotoIds: string[];
  onToggleSelect: (photoId: string) => void;
  onPreviewPhoto: (photo: Photo) => void;
  onDeletePhoto: (photoId: string) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  isAdmin,
  currentUserId,
  selectedPhotoIds,
  onToggleSelect,
  onPreviewPhoto,
  onDeletePhoto,
}) => {
  if (photos.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 border border-white/5">
        <div className="w-16 h-16 rounded-2xl bg-dark-900 flex items-center justify-center text-slate-600">
          <ImageIcon className="w-8 h-8 opacity-50" />
        </div>
        <h4 className="text-sm font-semibold text-slate-300">No photos match the current filter</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          Upload event photos using the uploader above or switch filters to view other collections.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => {
        const isSelected = photo.isSelected || selectedPhotoIds.includes(photo.id);
        const canDelete = isAdmin || photo.uploadedByUserId === currentUserId;
        const photoUrl = photo.url || `/uploads/${photo.storageLocation}`;

        return (
          <div
            key={photo.id}
            className={`group relative rounded-2xl overflow-hidden glass-card transition-all duration-300 ${
              isSelected ? 'ring-2 ring-brand-400/90 shadow-lg shadow-brand-500/10' : 'hover:border-white/20'
            }`}
          >
            {/* Photo Image */}
            <div
              onClick={() => onPreviewPhoto(photo)}
              className="relative aspect-[4/3] w-full overflow-hidden bg-dark-900 cursor-pointer"
            >
              <img
                src={photoUrl}
                alt={photo.originalFilename}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* View Fullscreen icon on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="p-2.5 rounded-full bg-dark-950/70 text-white backdrop-blur-md border border-white/20 shadow-xl">
                  <Eye className="w-5 h-5" />
                </span>
              </div>
            </div>

            {/* Admin Curation Checkbox */}
            {isAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(photo.id);
                }}
                className={`absolute top-2.5 left-2.5 w-7 h-7 rounded-xl flex items-center justify-center transition-all z-10 shadow-lg ${
                  isSelected
                    ? 'bg-brand-500 text-dark-950 ring-2 ring-amber-300'
                    : 'bg-dark-950/70 border border-white/30 text-transparent hover:border-brand-400 group-hover:opacity-100 opacity-80'
                }`}
                title={isSelected ? 'Selected for customer gallery (Click to deselect)' : 'Select for customer gallery'}
              >
                <Check className={`w-4 h-4 font-bold ${isSelected ? 'opacity-100 stroke-[3]' : 'opacity-0'}`} />
              </button>
            )}

            {/* Selection Status Badge */}
            {isSelected && (
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/90 text-dark-950 text-[10px] font-bold shadow-md tracking-wider uppercase">
                  <Sparkles className="w-3 h-3" />
                  <span>Selected</span>
                </span>
              </div>
            )}

            {/* Photo Metadata Footer */}
            <div className="p-3 bg-dark-950/90 border-t border-white/5 flex items-center justify-between text-xs">
              <div className="truncate pr-2">
                <p className="font-semibold text-slate-200 truncate text-[11px]">{photo.originalFilename}</p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                  <User className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{photo.uploadedBy?.name || 'Photographer'}</span>
                </p>
              </div>

              {/* Delete Button */}
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete "${photo.originalFilename}"?`)) {
                      onDeletePhoto(photo.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                  title="Delete photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
