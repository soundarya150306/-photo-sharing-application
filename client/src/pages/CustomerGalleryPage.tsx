import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api, getAssetUrl, getFallbackPhotoUrl, API_BASE } from '../services/api';
import { PublicGalleryInfo, PublicPhoto } from '../types';
import { CustomerLightbox } from '../components/CustomerLightbox';
import {
  Lock,
  Key,
  Download,
  Calendar,
  MapPin,
  Sparkles,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  Play,
  Share2,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const CustomerGalleryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [galleryInfo, setGalleryInfo] = useState<PublicGalleryInfo | null>(null);
  const [photos, setPhotos] = useState<PublicPhoto[]>([]);
  const [pin, setPin] = useState('');
  const [guestToken, setGuestToken] = useState<string | null>(
    slug ? sessionStorage.getItem(`lumina_guest_${slug}`) : null
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Load public info
  useEffect(() => {
    if (!slug) return;

    const fetchInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.getPublicInfo(slug);
        if (res.data.success) {
          setGalleryInfo(res.data.data.gallery);

          // If we already have a guest token in session storage, load photos immediately
          const existingToken = sessionStorage.getItem(`lumina_guest_${slug}`);
          if (existingToken) {
            try {
              const photoRes = await api.getPublicPhotos(slug, existingToken);
              if (photoRes.data.success) {
                setPhotos(photoRes.data.data.photos);
                setGuestToken(existingToken);
              }
            } catch {
              sessionStorage.removeItem(`lumina_guest_${slug}`);
              setGuestToken(null);
            }
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'This gallery is private, unpublished, or does not exist.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfo();
  }, [slug]);

  const handleUnlock = async (pinToTry?: string) => {
    if (!slug) return;
    const pinValue = pinToTry || pin;
    if (!pinValue) {
      setError('Please enter the 6-digit access PIN');
      return;
    }

    setIsUnlocking(true);
    setError(null);

    try {
      const res = await api.unlockGallery(slug, pinValue);
      if (res.data.success) {
        const token = res.data.data.token;
        sessionStorage.setItem(`lumina_guest_${slug}`, token);
        setGuestToken(token);

        // Fetch curated photos
        const photoRes = await api.getPublicPhotos(slug, token);
        if (photoRes.data.success) {
          setPhotos(photoRes.data.data.photos);
        }

        // Celebrate unlock
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 },
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Incorrect PIN. Please try again.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleDownloadAllZip = async () => {
    if (!slug || !guestToken) return;
    setIsDownloadingZip(true);
    try {
      // Direct browser download
      window.location.href = `${API_BASE}/public/gallery/${slug}/download-all?token=${guestToken}`;
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setIsDownloadingZip(false), 2000);
    }
  };

  const copyGalleryLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (isLoading && !galleryInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-dark-950">
        <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium tracking-wide">Loading private gallery...</p>
      </div>
    );
  }

  // Error / Unpublished State
  if (error && !galleryInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-dark-950 text-center">
        <div className="glass-panel p-8 rounded-3xl max-w-md border border-white/10 shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-serif text-white">Private Gallery Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
          <div className="pt-2">
            <Link to="/" className="px-4 py-2 rounded-xl btn-gold text-xs font-semibold inline-block">
              Return to Studio Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = galleryInfo?.eventDate
    ? new Date(galleryInfo.eventDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // STATE 1: PIN LOCK GATE SCREEN
  if (!guestToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-between p-4 relative overflow-hidden bg-dark-950">
        {/* Top Portal Switcher Bar */}
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between py-2 px-4 z-20">
          <Link to="/" className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
            <Camera className="w-4 h-4 text-brand-400" />
            <span className="font-serif">LuminaPhoto</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Customer Portal
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="px-3 py-1.5 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
            <Link
              to="/team"
              className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>Team Portal</span>
            </Link>
          </div>
        </div>

        {/* Ambient background lighting */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-500/10 filter blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-500/10 filter blur-3xl"></div>

        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-brand-500/30 shadow-2xl relative z-10 space-y-6 text-center animate-scale-up my-auto">
          {/* Header */}
          <div className="space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500/20 to-amber-300/20 border border-brand-500/40 p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-brand-500/10">
              <Key className="w-7 h-7 text-brand-300" />
            </div>

            <div className="text-xs font-semibold text-brand-400 uppercase tracking-widest pt-1">
              Private Client Showcase
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
              {galleryInfo?.customTitle}
            </h1>

            <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
              {formattedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formattedDate}</span>
                </div>
              )}
              {galleryInfo?.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate max-w-[160px]">{galleryInfo.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Demo Helper */}
          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/25 text-left flex items-center justify-between">
            <div className="text-[11px] text-brand-200">
              <span>Demo Access PIN: </span>
              <strong className="font-mono text-white text-xs">
                {slug === 'tech-innovators-summit-2026' ? '654321' : '482917'}
              </strong>
            </div>
            <button
              type="button"
              onClick={() => {
                const demoPin = slug === 'tech-innovators-summit-2026' ? '654321' : '482917';
                setPin(demoPin);
                handleUnlock(demoPin);
              }}
              className="px-2.5 py-1 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 text-[10px] font-bold uppercase transition-all"
            >
              1-Click Unlock
            </button>
          </div>

          {/* PIN Input & Keypad */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUnlock();
            }}
            className="space-y-4"
          >
            {error && (
              <div
                className={`p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-center gap-2 ${
                  isShaking ? 'animate-shake' : ''
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Enter Gallery Access PIN
              </label>
              <input
                type="password"
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                className={`w-full py-3 px-4 rounded-2xl glass-input text-center text-2xl font-mono tracking-[0.5em] text-amber-300 placeholder:text-slate-600 ${
                  isShaking ? 'border-rose-500 ring-2 ring-rose-500/30' : ''
                }`}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isUnlocking || !pin}
              className="w-full py-3 rounded-xl btn-gold text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25 disabled:opacity-40"
            >
              {isUnlocking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying PIN...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Collection</span>
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            This private gallery is password-protected. If you do not have the PIN, please reach out to your event host.
          </p>
        </div>
      </div>
    );
  }

  // STATE 2: UNLOCKED GALLERY VIEW
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Top Portal Switcher Bar */}
      <div className="w-full border-b border-white/5 bg-dark-950/80 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
          <Camera className="w-4 h-4 text-brand-400" />
          <span className="font-serif">LuminaPhoto</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Customer Gallery
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            className="px-3 py-1.5 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>
          <Link
            to="/team"
            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <span>Team Portal</span>
          </Link>
        </div>
      </div>

      {/* Luxury Cinematic Header Banner */}
      <div className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-white/10 overflow-hidden bg-gradient-to-b from-dark-900 to-dark-950">
        <div className="max-w-7xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>PIN Verified Access</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight max-w-3xl mx-auto">
            {galleryInfo?.customTitle}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-300">
            {formattedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-400" />
                <span>{formattedDate}</span>
              </div>
            )}
            {galleryInfo?.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>{galleryInfo.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-brand-400" />
              <span>{photos.length} Selected Photographs</span>
            </div>
          </div>

          {/* Custom Welcome Message */}
          {galleryInfo?.customWelcomeMsg && (
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto italic font-serif leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 mt-4">
              "{galleryInfo.customWelcomeMsg}"
            </p>
          )}

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {galleryInfo?.allowDownload && (
              <button
                onClick={handleDownloadAllZip}
                disabled={isDownloadingZip || photos.length === 0}
                className="px-5 py-2.5 rounded-xl btn-gold text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/25 disabled:opacity-50"
              >
                {isDownloadingZip ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing ZIP Package...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download All Photos (.ZIP)</span>
                  </>
                )}
              </button>
            )}

            {photos.length > 0 && (
              <button
                onClick={() => {
                  setLightboxIndex(0);
                  setLightboxOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 text-brand-400" />
                <span>Start Slideshow</span>
              </button>
            )}

            <button
              onClick={copyGalleryLink}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Share Gallery'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Masonry / Photo Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {photos.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-xs">
            No published photos are available in this gallery yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => {
                  setLightboxIndex(index);
                  setLightboxOpen(true);
                }}
                className="group relative rounded-2xl overflow-hidden glass-card cursor-pointer border border-white/5 hover:border-brand-400/40 transition-all duration-300 aspect-[4/3] bg-dark-900 shadow-lg hover:shadow-2xl"
              >
                <img
                  src={getAssetUrl(photo.url, photo.originalFilename)}
                  alt={photo.originalFilename}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getFallbackPhotoUrl(photo.originalFilename || photo.id);
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Gradient Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
                  <div className="flex justify-end">
                    <span className="p-2 rounded-full bg-dark-950/80 text-brand-300 backdrop-blur-md shadow-md">
                      <Eye className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-white truncate text-[11px]">{photo.originalFilename}</p>
                    <p className="text-[10px] text-slate-400">Click to enlarge</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 bg-dark-950 text-center text-xs text-slate-500">
        <p>Private Client Showcase • LuminaPhoto Platform</p>
      </footer>

      {/* Fullscreen Customer Lightbox */}
      {slug && guestToken && (
        <CustomerLightbox
          photos={photos}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          allowDownload={galleryInfo?.allowDownload ?? true}
          gallerySlug={slug}
          guestToken={guestToken}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}
    </div>
  );
};
