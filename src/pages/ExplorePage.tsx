import React, { useState } from 'react';
import { useMagazine } from '../context/MagazineContext';
import { ArticleCard } from '../components/ArticleCard';
import { ArrowLeft, Search, Compass, Volume2, Clock, BookOpen, Grid, List } from 'lucide-react';

interface ExplorePageProps {
  onSelectStory: (slug: string) => void;
  onNavigateCategory: (slug: string) => void;
  onBack: () => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onSelectStory,
  onNavigateCategory,
  onBack,
}) => {
  const { articles, categories } = useMagazine();
  const [tempoFilter, setTempoFilter] = useState<'all' | 'quick' | 'deep' | 'audio'>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutView, setLayoutView] = useState<'grid' | 'list'>('grid');

  const publishedArticles = articles.filter((a) => a.status === 'PUBLISHED' || !a.status);

  const filteredArticles = publishedArticles.filter((article) => {
    // Tempo
    if (tempoFilter === 'quick' && article.readTimeMinutes > 6) return false;
    if (tempoFilter === 'deep' && article.readTimeMinutes < 7) return false;
    if (tempoFilter === 'audio' && !article.audioMinutes) return false;

    // Topic
    if (topicFilter !== 'all' && !article.tags?.includes(topicFilter) && article.category !== topicFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        article.title.toLowerCase().includes(q) ||
        (article.deck && article.deck.toLowerCase().includes(q)) ||
        article.category.toLowerCase().includes(q) ||
        article.tags?.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FFFFFF] text-[#111110]">
      {/* Back button */}
      <div className="mb-8 pb-4 border-b border-[#E8E5DF]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6E6A62] hover:text-[#EA580C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
      </div>

      {/* Header */}
      <header className="max-w-3xl mb-12">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-2 font-mono-editorial">
          <Compass className="w-3.5 h-3.5" />
          <span>COMPENDIUM & DISPATCH INDEX</span>
        </div>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl font-medium tracking-tight text-[#111110] mb-3">
          Explore All Topics
        </h1>
        <p className="font-serif-editorial italic text-xl text-[#55524B] mb-4">
          "Navigate the full archive by reading tempo, thematic domain, or curiosity."
        </p>
      </header>

      {/* Filter and search bar */}
      <div className="space-y-4 mb-10 pb-8 border-b border-[#E8E5DF]">
        {/* Search input */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8A81]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, locations, craft terms..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F9F8F6] border border-[#E8E5DF] text-sm text-[#111110] placeholder:text-[#8E8A81] focus:outline-none focus:border-[#EA580C] rounded-xs"
          />
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {/* Tempo filter buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono-editorial text-[#6E6A62] uppercase font-bold mr-1">
              Tempo:
            </span>
            <button
              onClick={() => setTempoFilter('all')}
              className={`px-3 py-1 text-xs rounded-xs font-mono-editorial transition-colors ${
                tempoFilter === 'all'
                  ? 'bg-[#EA580C] text-white font-semibold'
                  : 'bg-[#F9F8F6] border border-[#E8E5DF] text-[#55524B] hover:text-[#111110]'
              }`}
            >
              All Tempos
            </button>
            <button
              onClick={() => setTempoFilter('quick')}
              className={`px-3 py-1 text-xs rounded-xs font-mono-editorial transition-colors flex items-center gap-1 ${
                tempoFilter === 'quick'
                  ? 'bg-[#EA580C] text-white font-semibold'
                  : 'bg-[#F9F8F6] border border-[#E8E5DF] text-[#55524B] hover:text-[#111110]'
              }`}
            >
              <Clock className="w-3 h-3" /> Quick (&lt;6m)
            </button>
            <button
              onClick={() => setTempoFilter('deep')}
              className={`px-3 py-1 text-xs rounded-xs font-mono-editorial transition-colors flex items-center gap-1 ${
                tempoFilter === 'deep'
                  ? 'bg-[#EA580C] text-white font-semibold'
                  : 'bg-[#F9F8F6] border border-[#E8E5DF] text-[#55524B] hover:text-[#111110]'
              }`}
            >
              <BookOpen className="w-3 h-3" /> Deep Read (7m+)
            </button>
            <button
              onClick={() => setTempoFilter('audio')}
              className={`px-3 py-1 text-xs rounded-xs font-mono-editorial transition-colors flex items-center gap-1 ${
                tempoFilter === 'audio'
                  ? 'bg-[#EA580C] text-white font-semibold'
                  : 'bg-[#F9F8F6] border border-[#E8E5DF] text-[#55524B] hover:text-[#111110]'
              }`}
            >
              <Volume2 className="w-3 h-3" /> Narrated Audio
            </button>
          </div>

          {/* Topic filter dropdown/pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
            <span className="text-xs font-mono-editorial text-[#6E6A62] uppercase font-bold mr-1">
              Topic:
            </span>
            <button
              onClick={() => setTopicFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-xs font-mono-editorial transition-colors shrink-0 ${
                topicFilter === 'all'
                  ? 'bg-[#111110] text-white font-semibold'
                  : 'bg-[#F9F8F6] border border-[#E8E5DF] text-[#55524B] hover:text-[#111110]'
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setTopicFilter(cat.name)}
                className={`px-2.5 py-1 text-xs rounded-xs font-mono-editorial transition-colors shrink-0 ${
                  topicFilter === cat.name
                    ? 'bg-[#111110] text-white font-semibold'
                    : 'bg-[#F9F8F6] border border-[#E8E5DF] text-[#55524B] hover:text-[#111110]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results header with Grid / List controls */}
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#E8E5DF]">
        <div className="text-xs font-mono-editorial text-[#6E6A62]">
          SHOWING {filteredArticles.length} DISPATCHES
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLayoutView('grid')}
            className={`p-1.5 border rounded-xs ${
              layoutView === 'grid'
                ? 'bg-[#EA580C] text-white border-[#EA580C]'
                : 'bg-[#FFFFFF] text-[#6E6A62] border-[#E8E5DF] hover:text-[#111110]'
            }`}
            title="Grid view"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setLayoutView('list')}
            className={`p-1.5 border rounded-xs ${
              layoutView === 'list'
                ? 'bg-[#EA580C] text-white border-[#EA580C]'
                : 'bg-[#FFFFFF] text-[#6E6A62] border-[#E8E5DF] hover:text-[#111110]'
            }`}
            title="List view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {layoutView === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <div key={article.id} className="bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs shadow-xs">
              <ArticleCard
                article={article}
                variant="medium"
                onSelect={onSelectStory}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => onSelectStory(article.slug)}
              className="group cursor-pointer bg-[#FFFFFF] border border-[#E8E5DF] hover:border-[#EA580C] p-4 sm:p-5 rounded-xs shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <img
                  src={article.heroImage}
                  alt={article.title}
                  className="w-20 h-20 sm:w-28 sm:h-20 object-cover rounded-xs border border-[#E8E5DF] shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-mono-editorial text-[#6E6A62] mb-1">
                    <span className="text-[#EA580C] font-semibold">{article.category}</span>
                    <span>•</span>
                    <span>{article.publishedDate}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="font-serif-editorial font-bold text-lg text-[#111110] group-hover:text-[#EA580C] transition-colors leading-snug line-clamp-1">
                    {article.title}
                  </h3>
                  <p className="text-xs text-[#55524B] line-clamp-2 mt-1 leading-relaxed hidden sm:block">
                    {article.deck || article.subtitle}
                  </p>
                  <div className="text-[11px] text-[#8E8A81] font-mono-editorial mt-1">
                    By {article.author.name}
                  </div>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#EA580C] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Read →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredArticles.length === 0 && (
        <div className="py-20 text-center space-y-3">
          <p className="font-serif-editorial text-2xl text-[#111110]">
            "No dispatches match your filter criteria."
          </p>
          <button
            onClick={() => {
              setTempoFilter('all');
              setTopicFilter('all');
              setSearchQuery('');
            }}
            className="text-xs text-[#EA580C] hover:underline font-mono-editorial font-bold"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
};
