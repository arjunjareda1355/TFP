import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { useMagazine } from '../context/MagazineContext';
import { SearchResults } from './SearchResults';
import { BrandLogo } from './BrandLogo';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStory: (slug: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  onSelectStory,
}) => {
  const { articles } = useMagazine();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const publishedArticles = articles.filter((a) => a.status === 'PUBLISHED' || !a.status);

  const results = publishedArticles.filter((article) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase().trim();
    const title = article.title || '';
    const subtitle = article.subtitle || '';
    const deck = article.deck || '';
    const category = article.category || '';
    const authorName = typeof article.author === 'string' ? article.author : (article.author?.name || '');
    const tags = Array.isArray(article.tags) ? article.tags : [];
    const seriesName = article.seriesName || '';

    return (
      title.toLowerCase().includes(q) ||
      subtitle.toLowerCase().includes(q) ||
      deck.toLowerCase().includes(q) ||
      category.toLowerCase().includes(q) ||
      seriesName.toLowerCase().includes(q) ||
      tags.some((t) => typeof t === 'string' && t.toLowerCase().includes(q)) ||
      authorName.toLowerCase().includes(q) ||
      article.blocks?.some((b) => (b.text && b.text.toLowerCase().includes(q)) || (b.title && b.title.toLowerCase().includes(q)))
    );
  });

  const popularQueries = [
    'Tactility',
    'Tiny Island',
    'Design',
    'Subterranean',
    'Acoustics',
    'Seed Vault',
    'Monastery',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#141312] border border-[#2C2A26] shadow-2xl p-6 rounded-xs paper-edge-fold z-10 space-y-6">
        {/* Top search bar with Brand Logo */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-[#262420]">
          <div className="flex items-center gap-2 shrink-0">
            <BrandLogo variant="emblem" size={24} theme="dark" />
            <span className="font-serif-editorial text-sm font-bold text-[#F5F3EF] tracking-tight">
              The Folded Page
            </span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories, topics, places, authors..."
            className="w-full bg-transparent text-lg sm:text-xl font-serif-editorial text-[#F5F3EF] placeholder:text-[#8C877E] outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#8C877E] hover:text-[#F5F3EF]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-mono-editorial text-[#8C877E] hover:text-[#F5F3EF] border border-[#3A3732] rounded-xs"
          >
            ESC
          </button>
        </div>

        {/* Quick query tags */}
        {!query && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono-editorial uppercase text-[#8C877E] tracking-wider block">
              Suggested Curiosities
            </span>
            <div className="flex flex-wrap gap-2">
              {popularQueries.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1 bg-[#181715] hover:bg-[#262420] border border-[#2C2A26] hover:border-[#EA580C] text-xs font-mono-editorial text-[#A8A49C] hover:text-[#F5F3EF] transition-colors rounded-xs"
                >
                  #{term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <SearchResults
          query={query}
          results={results}
          onSelectStory={(slug) => {
            onSelectStory(slug);
            onClose();
          }}
        />
      </div>
    </div>
  );
};
