import React, { useState, useEffect } from 'react';
import { X, Globe, Key, Copy, Check, ExternalLink, ShieldAlert, Sparkles, Loader2, Download, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { Gallery, EventItem } from '../types';

interface PublishGalleryModalProps {
  isOpen: boolean;
  eventId: string;
  eventTitle: string;
  onClose: () => void;
  onPublishedUpdated: () => void;
}

export const PublishGalleryModal: React.FC<PublishGalleryModalProps> = ({
  isOpen,
  eventId,
  eventTitle,
  onClose,
  onPublishedUpdated,
}) => {
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [pin, setPin] = useState('482917');
  const [slug, setSlug] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customWelcomeMsg, setCustomWelcomeMsg] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [selectedPhotoCount, setSelectedPhotoCount] = useState(0);
  const [totalPhotoCount, setTotalPhotoCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && eventId) {
      setError(null);
      setSuccess(null);
      api.getGalleryConfig(eventId).then((res) => {
        if (res.data.success) {
          const g = res.data.data.gallery;
          setGallery(g);
          setIsPublished(g.isPublished);
          setSlug(g.slug);
          setCustomTitle(g.customTitle || eventTitle);
          setCustomWelcomeMsg(g.customWelcomeMsg || 'Welcome to our private event photo gallery. Please enjoy browsing and downloading your favorite memories.');
          setAllowDownload(g.allowDownload);
          setSelectedPhotoCount(res.data.data.stats.selectedPhotos);
          setTotalPhotoCount(res.data.data.stats.totalPhotos);
        }
      });
    }
  }, [isOpen, eventId, eventTitle]);

  if (!isOpen) return null;

  const shareableUrl = `${window.location.origin}/gallery/${slug || eventId}`;

  const copyShareableLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.publishGallery(eventId, {
        isPublished,
        pin: pin || undefined,
        slug: slug || undefined,
        customTitle,
        customWelcomeMsg,
        allowDownload,
      });

      if (res.data.success) {
        setSuccess(isPublished ? 'Gallery published live!' : 'Gallery saved in draft mode.');
        if (isPublished) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
        onPublishedUpdated();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update gallery settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-brand-500/30 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-dark-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif">Customer Gallery Publishing</h2>
              <p className="text-xs text-slate-400">{eventTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveAndPublish} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Publish Toggle Box */}
          <div className="p-4 rounded-xl bg-dark-900/80 border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Gallery Status:</span>
                {isPublished ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    PUBLISHED & ACCESSIBLE
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    UNPUBLISHED / DRAFT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedPhotoCount} curated photos will be visible to customer with PIN
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.value === 'on' ? !isPublished : e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-dark-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Shareable Link & PIN Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-dark-900 to-dark-850 border border-brand-500/25 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-brand-300 uppercase tracking-wider mb-1">
                Shareable Customer URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono text-slate-300 bg-dark-950/80"
                />
                <button
                  type="button"
                  onClick={copyShareableLink}
                  className="px-3.5 py-2 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/30 text-brand-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Access PIN Config */}
            <div className="pt-2 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-semibold text-brand-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-brand-400" />
                  <span>Set / Update Customer PIN</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 4-8 digit PIN"
                    maxLength={8}
                    className="w-32 px-3 py-1.5 rounded-lg glass-input text-sm font-mono tracking-widest text-center text-brand-200"
                  />
                  <button
                    type="button"
                    onClick={() => setPin(Math.floor(100000 + Math.random() * 900000).toString())}
                    className="text-[11px] text-brand-400 hover:text-brand-300 underline"
                  >
                    Random PIN
                  </button>
                </div>
              </div>

              {gallery && (
                <div className="text-right text-xs text-slate-400">
                  <div className="flex items-center justify-end gap-1 text-slate-300">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Customer Views: <strong>{gallery.viewCount}</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {gallery.publishedAt ? `Published ${new Date(gallery.publishedAt).toLocaleDateString()}` : 'Not yet published'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Custom Welcome Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Custom Gallery Header & Greeting
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Gallery Title"
              className="w-full px-3 py-2 rounded-xl glass-input text-xs mb-2"
            />
            <textarea
              rows={2}
              value={customWelcomeMsg}
              onChange={(e) => setCustomWelcomeMsg(e.target.value)}
              placeholder="Welcome note for guests/clients..."
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            ></textarea>
          </div>

          {/* Permissions Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900/50 border border-white/5">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">Allow Photo Downloads</div>
                <div className="text-[10px] text-slate-400">Enable high-resolution single & full album ZIP download for customer</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={allowDownload}
              onChange={(e) => setAllowDownload(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-brand-500 focus:ring-brand-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <a
              href={shareableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-slate-400 hover:text-brand-300 flex items-center gap-1.5 transition-colors"
            >
              <span>Test Customer View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl btn-gold text-xs font-semibold flex items-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save & Apply Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
