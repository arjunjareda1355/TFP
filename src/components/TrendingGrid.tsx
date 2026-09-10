import React from 'react';
import { Article } from '../types';
import { ArticleCard } from './ArticleCard';
import { ArrowRight, Flame } from 'lucide-react';

interface TrendingGridProps {
  articles: Article[];
  onSelect: (slug: string) => void;
  onViewCategory: () => void;
}

export const TrendingGrid: React.FC<TrendingGridProps> = ({
  articles,
  onSelect,
  onViewCategory,
}) => {
  if (!articles || articles.length === 0) return null;

  const mainStory = articles[0];
  const secondaryStories = articles.slice(1, 3);
  const sideStories = articles.slice(3, 7);

  return (
    <section className="py-12 sm:py-16 border-b border-[#E8E5DF] bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#E8E5DF] gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-1 font-mono-editorial">
              <Flame className="w-3.5 h-3.5" />
              <span>Section 02</span>
            </div>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl font-medium tracking-tight text-[#111110]">
              TRENDING NOW
            </h2>
            <p className="font-serif-editorial italic text-base text-[#55524B] mt-0.5">
              "What everyone's talking about."
            </p>
          </div>

          <button
            id="view-all-trending-btn"
            onClick={onViewCategory}
            className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#111110] hover:text-[#EA580C] transition-colors"
          >
            <span>View all trending stories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#EA580C]" />
          </button>
        </div>

        {/* Asymmetric Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Large Story (5 cols) */}
          {mainStory && (
            <div className="lg:col-span-5">
              <ArticleCard
                article={mainStory}
                variant="large"
                onSelect={onSelect}
              />
            </div>
          )}

          {/* Secondary Stack (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {secondaryStories.map((story) => (
              <ArticleCard
                key={story.id}
                article={story}
                variant="medium"
                onSelect={onSelect}
              />
            ))}
          </div>

          {/* Compact Quick Read Sidebar (3 cols) */}
          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-[#E8E5DF] lg:pl-6 pt-6 lg:pt-0">
            <h3 className="font-mono-editorial text-xs uppercase tracking-wider text-[#8E8A81] mb-4 pb-2 border-b border-[#E8E5DF] flex items-center justify-between font-bold">
              <span>Quick Dispatches</span>
              <span className="text-[#EA580C]">● LIVE</span>
            </h3>
            <div className="space-y-4">
              {sideStories.map((story) => (
                <ArticleCard
                  key={story.id}
                  article={story}
                  variant="compact"
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
