import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowUpRight, Clock, Sparkles } from 'lucide-react';
import { useMagazine } from '../context/MagazineContext';
import { BrandLogo } from './BrandLogo';

interface SearchModalProps {
  onSelectStory: (slug: string) => void;
  onSelectCategory: (categorySlug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onSelectStory, onSelectCategory }) => {
  const { isSearchOpen, setIsSearchOpen, articles, categories } = useMagazine();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('tfp_recent_searches');
      return stored ? JSON.parse(stored) : ['Bioluminescence', 'Kyoto craft', 'Sourdough', 'Monastery'];
    } catch {
      return ['Bioluminescence', 'Kyoto craft', 'Sourdough'];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSearchOpen]);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const handleSearchSubmit = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('tfp_recent_searches', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const publishedArticles = articles.filter((a) => a.status === 'PUBLISHED' || !a.status);

  const filteredArticles = publishedArticles.filter((article) => {
    const articleCategory = article.category || '';
    const matchesCategory =
      activeCategory === 'all' ||
      articleCategory.toLowerCase() === activeCategory.toLowerCase();

    if (!query.trim()) return matchesCategory;

    const q = query.toLowerCase().trim();
    const title = article.title || '';
    const subtitle = article.subtitle || '';
    const deck = article.deck || '';
    const authorName = typeof article.author === 'string' ? article.author : (article.author?.name || '');
    const tags = Array.isArray(article.tags) ? article.tags : [];
    const seriesName = article.seriesName || '';

    const matchesQuery =
      title.toLowerCase().includes(q) ||
      subtitle.toLowerCase().includes(q) ||
      deck.toLowerCase().includes(q) ||
      authorName.toLowerCase().includes(q) ||
      articleCategory.toLowerCase().includes(q) ||
      seriesName.toLowerCase().includes(q) ||
      tags.some((tag) => typeof tag === 'string' && tag.toLowerCase().includes(q)) ||
      article.blocks?.some((b) => (b.text && b.text.toLowerCase().includes(q)) || (b.title && b.title.toLowerCase().includes(q)));

    return matchesCategory && Boolean(matchesQuery);
  });

  const handleSelectArticle = (slug: string) => {
    if (query) handleSearchSubmit(query);
    setIsSearchOpen(false);
    onSelectStory(slug);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-start bg-black/60 backdrop-blur-sm sm:p-4 sm:pt-10 md:pt-14 transition-all"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full h-full sm:h-auto sm:max-h-[86vh] sm:max-w-3xl bg-[#FFFFFF] border-0 sm:border border-[#E8E5DF] sm:shadow-2xl overflow-hidden flex flex-col rounded-none sm:rounded-md transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top search header with Brand Logo & aligned search bar */}
        <div className="p-3.5 sm:p-5 border-b border-[#E8E5DF] bg-[#F9F8F6] flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <BrandLogo variant="emblem" size={24} theme="light" />
            <span className="hidden sm:inline font-serif-editorial text-base font-bold text-[#111110] tracking-tight shrink-0">
              The Folded Page
            </span>
          </div>

          <div className="flex-1 min-w-0 flex items-center gap-2 bg-[#FFFFFF] border border-[#E8E5DF] focus-within:border-[#EA580C] px-3 py-1.5 sm:py-2 rounded-xs transition-colors shadow-2xs">
            <Search className="w-4 h-4 text-[#8E8A81] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit(query);
              }}
              placeholder="Search stories, ideas, dispatches, places..."
              className="w-full text-sm sm:text-base bg-transparent border-none outline-none text-[#111110] placeholder:text-[#8E8A81] font-serif-editorial"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-[11px] font-mono-editorial text-[#6E6A62] hover:text-[#111110] px-1.5 py-0.5 bg-[#FAF9F6] rounded border border-[#E8E5DF] shrink-0"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-2 text-[#6E6A62] hover:text-[#111110] hover:bg-[#E8E5DF] transition-colors rounded-xs shrink-0"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category filter pills */}
        <div className="px-3.5 sm:px-6 py-2 bg-[#FFFFFF] border-b border-[#E8E5DF] flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap text-xs font-semibold uppercase tracking-wider shrink-0">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 shrink-0 rounded-xs transition-colors ${
              activeCategory === 'all'
                ? 'bg-[#EA580C] text-white'
                : 'text-[#55524B] hover:text-[#111110] bg-[#F9F8F6] border border-[#E8E5DF]'
            }`}
          >
            All Stories ({publishedArticles.length})
          </button>
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-3 py-1 shrink-0 rounded-xs transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-[#EA580C] text-white'
                  : 'text-[#55524B] hover:text-[#111110] bg-[#F9F8F6] border border-[#E8E5DF]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 divide-y divide-[#E8E5DF] bg-[#FFFFFF] overscroll-contain">
          {/* If no query, show recent searches and trending tags */}
          {!query && (
            <div className="pb-6 space-y-5">
              <div>
                <span className="text-[10px] font-bold font-mono-editorial uppercase tracking-widest text-[#8E8A81] block mb-2">
                  Recent Inquiries
                </span>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(term)}
                      className="inline-flex items-center gap-1.5 bg-[#F9F8F6] border border-[#E8E5DF] px-3 py-1.5 text-xs text-[#55524B] hover:border-[#EA580C] hover:text-[#111110] transition-colors rounded-xs"
                    >
                      <Clock className="w-3 h-3 text-[#EA580C]" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold font-mono-editorial uppercase tracking-widest text-[#8E8A81] block mb-2">
                  Curated Inquiry Topics
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Ancient Monasteries', cat: 'special' },
                    { label: 'Deep Ocean Bioluminescence', cat: 'unique' },
                    { label: 'Fermentation Science', cat: 'trending' },
                    { label: 'Artisan Typography', cat: 'culture' },
                    { label: 'Analog Craft Revival', cat: 'culture' },
                    { label: 'Urban Cartography', cat: 'discovery' },
                  ].map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(topic.label);
                        setActiveCategory(topic.cat);
                      }}
                      className="text-left p-2.5 bg-[#F9F8F6] border border-[#E8E5DF] hover:border-[#EA580C] transition-colors text-xs text-[#111110] font-medium flex items-center justify-between rounded-xs"
                    >
                      <span>{topic.label}</span>
                      <Sparkles className="w-3 h-3 text-[#EA580C]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results count indicator */}
          <div className="py-2.5 flex items-center justify-between text-xs text-[#8E8A81] font-mono-editorial">
            <span>
              {filteredArticles.length} {filteredArticles.length === 1 ? 'DISPATCH FOUND' : 'DISPATCHES FOUND'}
            </span>
            {query && (
              <span className="text-[#EA580C] font-semibold">
                QUERY: "{query}"
              </span>
            )}
          </div>

          {/* Results list */}
          <div className="pt-3 space-y-3">
            {filteredArticles.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Search className="w-8 h-8 text-[#8E8A81] mx-auto opacity-50" />
                <h4 className="font-serif-editorial text-lg font-medium text-[#111110]">
                  No matching dispatches found
                </h4>
                <p className="text-xs text-[#55524B] max-w-sm mx-auto">
                  Try searching for keywords like "kyoto", "ocean", "bread", or explore by category above.
                </p>
              </div>
            ) : (
              filteredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleSelectArticle(article.slug)}
                  className="group flex gap-3.5 sm:gap-4 p-3 bg-[#FFFFFF] hover:bg-[#FAF9F6] border border-[#E8E5DF] hover:border-[#EA580C]/40 cursor-pointer transition-all rounded-xs shadow-2xs"
                >
                  <img
                    src={article.heroImage}
                    alt={article.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover bg-[#F9F8F6] border border-[#E8E5DF] shrink-0 rounded-xs"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA580C]">
                          {article.category}
                        </span>
                        <span className="text-xs text-[#8E8A81]">•</span>
                        <span className="text-xs text-[#8E8A81]">{article.readTime}</span>
                      </div>
                      <h4 className="font-serif-editorial text-sm sm:text-base md:text-lg font-medium text-[#111110] group-hover:text-[#EA580C] transition-colors leading-snug line-clamp-2 sm:line-clamp-1">
                        {article.title}
                      </h4>
                      <p className="text-xs text-[#55524B] line-clamp-1 mt-0.5">
                        {article.subtitle}
                      </p>
                    </div>
                    <div className="text-[11px] text-[#8E8A81] flex items-center justify-between pt-1">
                      <span className="truncate mr-2">By {article.author.name}</span>
                      <span className="inline-flex items-center gap-0.5 text-[#111110] font-medium group-hover:text-[#EA580C] shrink-0">
                        Open <ArrowUpRight className="w-3 h-3 text-[#EA580C]" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer helper */}
        <div className="px-3.5 sm:px-6 py-2.5 bg-[#F9F8F6] border-t border-[#E8E5DF] flex items-center justify-between text-xs text-[#8E8A81] font-mono-editorial shrink-0">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">ESC to close</span>
            <span className="hidden sm:inline">ENTER to select</span>
            <span className="sm:hidden text-[#111110] font-semibold">{filteredArticles.length} found</span>
          </div>
          <span className="text-[#EA580C] text-[11px] font-bold tracking-wider">THE FOLDED PAGE ARCHIVE</span>
        </div>
      </div>
    </div>
  );
};
