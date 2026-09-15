import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Play, Pause, Maximize, Minimize } from 'lucide-react';
import { PublicPhoto } from '../types';
import { getAssetUrl, getFallbackPhotoUrl, API_BASE } from '../services/api';

interface CustomerLightboxProps {
  photos: PublicPhoto[];
  currentIndex: number;
  isOpen: boolean;
  allowDownload: boolean;
  gallerySlug: string;
  guestToken: string;
  onClose: () => void;
  onIndexChange: (newIndex: number) => void;
}

export const CustomerLightbox: React.FC<CustomerLightboxProps> = ({
  photos,
  currentIndex,
  isOpen,
  allowDownload,
  gallerySlug,
  guestToken,
  onClose,
  onIndexChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndexChange((currentIndex + 1) % photos.length);
      if (e.key === 'ArrowLeft') onIndexChange((currentIndex - 1 + photos.length) % photos.length);
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos.length, onClose, onIndexChange]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && isOpen) {
      interval = setInterval(() => {
        onIndexChange((currentIndex + 1) % photos.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isOpen, currentIndex, photos.length, onIndexChange]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];
  const downloadUrl = `${API_BASE}/public/gallery/${gallerySlug}/photos/${currentPhoto.id}/download?token=${guestToken}`;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between select-none animate-fade-in">
      {/* Lightbox Top Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="font-serif font-bold text-white text-base">
            {currentIndex + 1} / {photos.length}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-slate-400 truncate max-w-xs">{currentPhoto.originalFilename}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Slideshow button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl border transition-colors ${
              isPlaying ? 'bg-brand-500/20 text-brand-300 border-brand-500/30' : 'text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
            }`}
            title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Download button */}
          {allowDownload && (
            <a
              href={downloadUrl}
              download
              className="p-2 rounded-xl text-slate-300 hover:text-white border border-white/10 hover:bg-white/10 transition-colors"
              title="Download Photo in Original Quality"
            >
              <Download className="w-4 h-4" />
            </a>
          )}

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-slate-400 hover:text-white border border-white/10 hover:bg-white/10 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 transition-colors ml-2"
            title="Close viewer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Center */}
      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
        {/* Previous button */}
        <button
          onClick={() => onIndexChange((currentIndex - 1 + photos.length) % photos.length)}
          className="absolute left-4 p-3 rounded-full bg-dark-900/60 hover:bg-dark-900 border border-white/10 text-white backdrop-blur-md transition-all hover:scale-110 z-10 shadow-2xl"
          title="Previous Photo (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* The Photo */}
        <div className="max-w-full max-h-full flex items-center justify-center">
          <img
            key={currentPhoto.id}
            src={getAssetUrl(currentPhoto.url, currentPhoto.originalFilename)}
            alt={currentPhoto.originalFilename}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getFallbackPhotoUrl(currentPhoto.originalFilename || currentPhoto.id);
            }}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl transition-all duration-300 animate-scale-up"
          />
        </div>

        {/* Next button */}
        <button
          onClick={() => onIndexChange((currentIndex + 1) % photos.length)}
          className="absolute right-4 p-3 rounded-full bg-dark-900/60 hover:bg-dark-900 border border-white/10 text-white backdrop-blur-md transition-all hover:scale-110 z-10 shadow-2xl"
          title="Next Photo (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Thumbnail Bar Footer */}
      <div className="px-6 py-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent overflow-x-auto flex items-center justify-center gap-2">
        {photos.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => onIndexChange(idx)}
            className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all ${
              idx === currentIndex
                ? 'ring-2 ring-brand-400 scale-110 opacity-100'
                : 'opacity-40 hover:opacity-80 border border-white/10'
            }`}
          >
            <img
              src={getAssetUrl(p.url, p.originalFilename)}
              alt=""
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getFallbackPhotoUrl(p.originalFilename || p.id);
              }}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
