import React from 'react';
import { Article } from '../types';
import { ArticleCard } from './ArticleCard';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface PopularRankedListProps {
  articles: Article[];
  onSelect: (slug: string) => void;
  onViewCategory: () => void;
}

export const PopularRankedList: React.FC<PopularRankedListProps> = ({
  articles,
  onSelect,
  onViewCategory,
}) => {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 border-b border-[#E8E5DF] bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Editorial Summary Column */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-1 font-mono-editorial">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Section 04</span>
              </div>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl font-medium tracking-tight text-[#111110] leading-tight">
                POPULAR RIGHT NOW
              </h2>
              <p className="font-serif-editorial italic text-base sm:text-lg text-[#55524B] mt-0.5 mb-6">
                "Stories capturing attention."
              </p>

              <div className="bg-[#F9F8F6] p-5 border border-[#E8E5DF] space-y-3 mb-6 rounded-xs">
                <h4 className="font-mono-editorial text-xs font-bold uppercase tracking-wider text-[#111110]">
                  The Reader Index
                </h4>
                <p className="text-xs text-[#55524B] leading-relaxed font-normal">
                  Ranked by reader retention, organic shares, and deep discussions across our global community over the past 48 hours.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-mono-editorial text-[#8E8A81] border-t border-[#E8E5DF]">
                  <span>REAL-TIME AUDIT</span>
                  <span>UPDATED DAILY</span>
                </div>
              </div>
            </div>

            <button
              id="view-all-popular-btn"
              onClick={onViewCategory}
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#111110] hover:text-[#EA580C] transition-colors py-2 border-b border-[#E8E5DF] hover:border-[#EA580C] w-fit"
            >
              <span>Explore full popular index</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#EA580C]" />
            </button>
          </div>

          {/* Right Ranked Stories List */}
          <div className="lg:col-span-8 flex flex-col divide-y divide-[#E8E5DF]">
            {articles.slice(0, 5).map((article, idx) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="ranked"
                rankNumber={`0${idx + 1}`}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
