import React, { useState } from 'react';
import { useMagazine } from '../context/MagazineContext';
import { ArticleCard } from '../components/ArticleCard';
import { Bookmark, ArrowLeft, Trash2, ArrowRight, Grid, List } from 'lucide-react';
import { ARTICLES } from '../data/articles';

interface SavedPageProps {
  onSelectStory: (slug: string) => void;
  onBack: () => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({ onSelectStory, onBack }) => {
  const { savedArticles, clearSaved } = useMagazine();
  const [layoutView, setLayoutView] = useState<'grid' | 'list'>('grid');

  const totalReadingMinutes = savedArticles.reduce((acc, curr) => acc + curr.readTimeMinutes, 0);

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
      <header className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-6 border-b border-[#E8E5DF] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-2 font-mono-editorial">
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>PERSONAL DESK</span>
          </div>
          <h1 className="font-serif-editorial text-4xl sm:text-6xl font-medium tracking-tight text-[#111110]">
            Saved Stories
          </h1>
          <p className="text-base text-[#55524B] font-normal mt-1">
            {savedArticles.length} {savedArticles.length === 1 ? 'dispatch' : 'dispatches'} folded away for careful contemplation • ~{totalReadingMinutes} min total reading time
          </p>
        </div>

        {savedArticles.length > 0 && (
          <div className="flex items-center gap-4 self-start sm:self-auto">
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

            <button
              onClick={clearSaved}
              className="text-xs font-mono-editorial text-[#6E6A62] hover:text-[#DC2626] flex items-center gap-1.5 py-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Library</span>
            </button>
          </div>
        )}
      </header>

      {/* Stories list or empty state */}
      {savedArticles.length === 0 ? (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#F9F8F6] border border-[#E8E5DF] flex items-center justify-center text-[#EA580C] mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="font-serif-editorial text-2xl font-medium text-[#111110]">
            Your library is currently empty
          </h3>
          <p className="text-xs sm:text-sm text-[#55524B] font-normal leading-relaxed">
            While exploring dispatches across The Folded Page, click the bookmark icon on any article to save it here for leisurely reading.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-[#EA580C] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#C2410C] transition-colors rounded-xs shadow-xs"
          >
            <span>Explore Dispatches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : layoutView === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedArticles.map((article) => (
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
          {savedArticles.map((article) => (
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
    </div>
  );
};
