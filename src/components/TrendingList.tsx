import React from 'react';
import { Article } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';
import { SaveButton } from './SaveButton';

interface TrendingListProps {
  articles: Article[];
  onSelectStory: (slug: string) => void;
  title?: string;
  className?: string;
}

export const TrendingList: React.FC<TrendingListProps> = ({
  articles,
  onSelectStory,
  title = 'Trending Curiosities',
  className = '',
}) => {
  return (
    <div className={`bg-[#141312] border border-[#2C2A26] p-6 rounded-xs paper-edge-fold ${className}`}>
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#262420]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
          <h3 className="font-mono-editorial text-xs font-bold uppercase tracking-wider text-[#F5F3EF]">
            {title}
          </h3>
        </div>
        <span className="text-[10px] font-mono-editorial text-[#8C877E] uppercase">24H VELOCITY</span>
      </div>

      <div className="divide-y divide-[#262420]">
        {articles.slice(0, 5).map((article, idx) => (
          <article
            key={article.id}
            onClick={() => onSelectStory(article.slug)}
            className="py-4 first:pt-0 last:pb-0 group cursor-pointer flex gap-3.5 items-start"
          >
            <span className="font-mono-editorial text-lg font-bold text-[#EA580C] opacity-80 w-6 shrink-0 pt-0.5">
              0{idx + 1}
            </span>

            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-mono-editorial uppercase text-[#8C877E] block">
                {article.subcategory || article.category} • {article.readTime}
              </span>
              <h4 className="font-serif-editorial text-sm sm:text-base font-medium text-[#F5F3EF] group-hover:text-[#EA580C] transition-colors leading-snug line-clamp-2">
                {article.title}
              </h4>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono-editorial text-[#8C877E]">
                  By {article.author.name.split(' ')[0]}
                </span>
                <SaveButton article={article} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
