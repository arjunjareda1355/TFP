import React from 'react';
import { X, Sparkles, BookOpen, Compass, Bookmark, Mail, Info, Flame, TrendingUp, Layers } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { BrandLogo } from './BrandLogo';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  onNavigateToday: () => void;
  onNavigateExplore: () => void;
  onNavigateIssues: () => void;
  onNavigateAbout: () => void;
  onNavigateNewsletter: () => void;
  onOpenSaved: () => void;
  savedCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  activeCategory,
  onSelectCategory,
  onNavigateToday,
  onNavigateExplore,
  onNavigateIssues,
  onNavigateAbout,
  onNavigateNewsletter,
  onOpenSaved,
  savedCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-[#FFFFFF] border-r border-[#E8E5DF] h-full overflow-y-auto p-6 flex flex-col justify-between z-10 shadow-2xl">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E5DF] mb-6">
            <BrandLogo variant="header-brand" size={36} theme="light" />
            <button
              onClick={onClose}
              className="p-2 text-[#6E6A62] hover:text-[#111110] transition-colors rounded-xs hover:bg-[#F5F4F0]"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Key Feeds */}
          <div className="space-y-1 mb-6">
            <span className="text-[10px] font-mono-editorial uppercase text-[#8E8A81] tracking-wider block mb-2 px-3 font-bold">
              Primary Dispatches
            </span>
            <button
              onClick={() => {
                onSelectCategory(null);
                onClose();
              }}
              className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors flex items-center justify-between rounded-xs ${
                activeCategory === null
                  ? 'bg-[#EA580C] text-white font-semibold'
                  : 'text-[#111110] hover:bg-[#FAF9F6]'
              }`}
            >
              <span>Cover & Front Page</span>
            </button>

            <button
              onClick={() => {
                onNavigateToday();
                onClose();
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-[#111110] hover:bg-[#FAF9F6] transition-colors flex items-center justify-between rounded-xs"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#EA580C]" />
                <span>Today's Briefing</span>
              </div>
              <span className="text-[10px] font-mono-editorial text-[#EA580C] font-bold">LIVE</span>
            </button>

            <button
              onClick={() => {
                onNavigateExplore();
                onClose();
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-[#111110] hover:bg-[#FAF9F6] transition-colors flex items-center gap-2 rounded-xs"
            >
              <Compass className="w-4 h-4 text-[#EA580C]" />
              <span>Explore All Topics</span>
            </button>

            <button
              onClick={() => {
                onNavigateIssues();
                onClose();
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-[#111110] hover:bg-[#FAF9F6] transition-colors flex items-center gap-2 rounded-xs"
            >
              <BookOpen className="w-4 h-4 text-[#EA580C]" />
              <span>Digital Issues Archive</span>
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-1 mb-6 border-t border-[#E8E5DF] pt-5">
            <span className="text-[10px] font-mono-editorial uppercase text-[#8E8A81] tracking-wider block mb-2 px-3 font-bold">
              Editorial Sections
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.slug);
                  onClose();
                }}
                className={`w-full text-left px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-between rounded-xs ${
                  activeCategory === cat.slug
                    ? 'text-[#EA580C] bg-[#FFF7ED]'
                    : 'text-[#55524B] hover:text-[#111110] hover:bg-[#FAF9F6]'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 border-t border-[#E8E5DF] pt-5">
            <button
              onClick={() => {
                onOpenSaved();
                onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 bg-[#F9F8F6] border border-[#E8E5DF] text-xs font-semibold uppercase tracking-wider text-[#111110] hover:border-[#EA580C] rounded-xs"
            >
              <div className="flex items-center gap-2">
                <Bookmark className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Saved Reading List</span>
              </div>
              <span className="bg-[#EA580C] text-white px-2 py-0.5 text-[10px] rounded-full">
                {savedCount}
              </span>
            </button>

            <button
              onClick={() => {
                onNavigateNewsletter();
                onClose();
              }}
              className="w-full flex items-center gap-2 p-2.5 bg-[#EA580C] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#C2410C] rounded-xs shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Subscribe to Dispatches</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-[#E8E5DF] mt-6 flex items-center justify-between text-xs text-[#8E8A81] font-mono-editorial">
          <button
            onClick={() => {
              onNavigateAbout();
              onClose();
            }}
            className="hover:text-[#111110] flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5" />
            <span>About The Masthead</span>
          </button>
          <span>v2.4</span>
        </div>
      </div>
    </div>
  );
};
