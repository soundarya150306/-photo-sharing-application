import React from 'react';
import { CheckSquare, Square, Globe, Sparkles, SlidersHorizontal, Lock } from 'lucide-react';

interface CurationToolbarProps {
  totalCount: number;
  selectedCount: number;
  isPublished: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onOpenPublishModal: () => void;
}

export const CurationToolbar: React.FC<CurationToolbarProps> = ({
  totalCount,
  selectedCount,
  isPublished,
  onSelectAll,
  onDeselectAll,
  onOpenPublishModal,
}) => {
  return (
    <div className="sticky bottom-6 z-30 max-w-4xl mx-auto px-4">
      <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-brand-500/30 bg-dark-950/90 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 animate-fade-in ring-1 ring-brand-500/20">
        {/* Left: Stats */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-serif">Admin Curation Mode</span>
              {isPublished ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  LIVE
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  DRAFT
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">
              <span className="font-bold text-brand-300">{selectedCount}</span> of{' '}
              <span className="font-semibold text-slate-200">{totalCount}</span> photos selected for customer gallery
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {selectedCount < totalCount ? (
            <button
              onClick={onSelectAll}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Select All</span>
            </button>
          ) : (
            <button
              onClick={onDeselectAll}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Deselect All</span>
            </button>
          )}

          <button
            onClick={onOpenPublishModal}
            className="px-4 py-2 rounded-xl btn-gold text-xs font-semibold flex items-center gap-2 shadow-lg shadow-brand-500/25"
          >
            <Globe className="w-4 h-4" />
            <span>Publish & Manage PIN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
