import React, { useState } from 'react';
import { X, Bookmark, Trash2, Clock, ArrowRight, BookOpen, Share2, Check } from 'lucide-react';
import { useMagazine } from '../context/MagazineContext';

interface SavedStoriesDrawerProps {
  onSelectStory: (slug: string) => void;
}

export const SavedStoriesDrawer: React.FC<SavedStoriesDrawerProps> = ({ onSelectStory }) => {
  const { isSavedDrawerOpen, setIsSavedDrawerOpen, savedArticles, toggleSave, clearSaved } = useMagazine();
  const [authMode, setAuthMode] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isSynced, setIsSynced] = useState(false);

  if (!isSavedDrawerOpen) return null;

  const totalReadingMinutes = savedArticles.reduce((acc, curr) => acc + curr.readTimeMinutes, 0);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || !userEmail.includes('@')) return;
    setIsSynced(true);
    setTimeout(() => {
      setAuthMode(false);
    }, 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end transition-all"
      onClick={() => setIsSavedDrawerOpen(false)}
    >
      <div
        className="w-full max-w-md bg-[#FFFFFF] h-full shadow-2xl flex flex-col border-l border-[#E8E5DF] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E8E5DF] bg-[#FFFFFF] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#EA580C] text-white rounded-xs">
              <Bookmark className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="font-serif-editorial text-xl font-medium text-[#111110]">
                Saved Stories
              </h3>
              <span className="text-[11px] font-mono-editorial text-[#6E6A62] block">
                {savedArticles.length} {savedArticles.length === 1 ? 'article' : 'articles'} • ~{totalReadingMinutes} min total read
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsSavedDrawerOpen(false)}
            className="p-2 text-[#6E6A62] hover:text-[#111110] hover:bg-[#F5F4F0] transition-colors rounded-xs"
            aria-label="Close saved stories drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync / Account Banner */}
        <div className="bg-[#F9F8F6] p-4 border-b border-[#E8E5DF] text-xs">
          {isSynced ? (
            <div className="flex items-center gap-2 text-[#15803D] font-medium">
              <Check className="w-4 h-4" />
              <span>Library synced with {userEmail}</span>
            </div>
          ) : authMode ? (
            <form onSubmit={handleAuthSubmit} className="space-y-2">
              <span className="font-mono-editorial text-[10px] uppercase font-bold text-[#111110] block">
                Keep stories synced across devices
              </span>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter email to sync"
                  className="flex-1 px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E8E5DF] text-xs focus:outline-none focus:border-[#EA580C] rounded-xs"
                />
                <button
                  type="submit"
                  className="bg-[#EA580C] text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider shrink-0 rounded-xs"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between text-[#6E6A62]">
              <span>Stories are saved locally on this browser.</span>
              <button
                onClick={() => setAuthMode(true)}
                className="text-[#EA580C] font-semibold hover:underline"
              >
                Sync account
              </button>
            </div>
          )}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 divide-y divide-[#E8E5DF]">
          {savedArticles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F5F4F0] flex items-center justify-center text-[#8E8A81]">
                <Bookmark className="w-6 h-6" />
              </div>
              <h4 className="font-serif-editorial text-xl font-medium text-[#111110]">
                "Your saved stories will appear here."
              </h4>
              <p className="text-xs text-[#55524B] max-w-xs leading-relaxed">
                Click the bookmark icon on any article across The Folded Page to save it for offline reading and future contemplation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => {
                    setIsSavedDrawerOpen(false);
                    onSelectStory(article.slug);
                  }}
                  className="pt-4 first:pt-0 group cursor-pointer flex gap-4 items-start hover:bg-[#FAF9F6] p-2 -m-2 transition-colors rounded-xs"
                >
                  <div className="w-20 h-20 shrink-0 bg-[#F9F8F6] border border-[#E8E5DF] overflow-hidden rounded-xs">
                    <img
                      src={article.heroImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA580C]">
                        {article.category}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(article.id);
                        }}
                        className="text-[#8E8A81] hover:text-[#DC2626] p-1 transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="font-serif-editorial text-base font-medium text-[#111110] group-hover:text-[#EA580C] transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono-editorial text-[#8E8A81]">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {savedArticles.length > 0 && (
          <div className="p-4 bg-[#FFFFFF] border-t border-[#E8E5DF] flex items-center justify-between">
            <button
              onClick={clearSaved}
              className="text-xs text-[#6E6A62] hover:text-[#DC2626] transition-colors flex items-center gap-1 font-mono-editorial"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>

            <button
              onClick={() => {
                if (savedArticles[0]) {
                  setIsSavedDrawerOpen(false);
                  onSelectStory(savedArticles[0].slug);
                }
              }}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 flex items-center gap-1.5 transition-colors rounded-xs shadow-xs"
            >
              <span>Start Reading</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
