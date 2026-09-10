import React from 'react';
import { Article } from '../types';
import { TrendingUp } from 'lucide-react';
import { SaveButton } from './SaveButton';

interface PopularListProps {
  articles: Article[];
  onSelectStory: (slug: string) => void;
  title?: string;
  className?: string;
}

export const PopularList: React.FC<PopularListProps> = ({
  articles,
  onSelectStory,
  title = 'Most Read This Month',
  className = '',
}) => {
  return (
    <div className={`bg-[#141312] border border-[#2C2A26] p-6 rounded-xs ${className}`}>
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#262420]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-[#EA580C]" />
          <h3 className="font-mono-editorial text-xs font-bold uppercase tracking-wider text-[#F5F3EF]">
            {title}
          </h3>
        </div>
        <span className="text-[10px] font-mono-editorial text-[#8C877E] uppercase">CIRCULATION</span>
      </div>

      <div className="space-y-4">
        {articles.slice(0, 5).map((article, idx) => (
          <article
            key={article.id}
            onClick={() => onSelectStory(article.slug)}
            className="p-3 bg-[#181715] hover:bg-[#1E1D1B] border border-[#262420] hover:border-[#EA580C] transition-all cursor-pointer rounded-xs flex gap-3 items-center group"
          >
            <span className="font-mono-editorial text-xs font-bold text-[#EA580C] bg-[#121110] px-2 py-1 border border-[#2C2A26] rounded-xs shrink-0">
              #{idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="font-serif-editorial text-sm font-medium text-[#F5F3EF] group-hover:text-[#EA580C] transition-colors truncate">
                {article.title}
              </h4>
              <span className="text-[10px] font-mono-editorial text-[#8C877E]">
                {article.category} • {article.readTime}
              </span>
            </div>
            <SaveButton article={article} />
          </article>
        ))}
      </div>
    </div>
  );
};
