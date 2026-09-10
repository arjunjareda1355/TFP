import React from 'react';
import { Article } from '../types';
import { Clock, ArrowRight } from 'lucide-react';
import { SaveButton } from './SaveButton';

interface StoryListProps {
  articles: Article[];
  onSelectStory: (slug: string) => void;
  showRank?: boolean;
  className?: string;
}

export const StoryList: React.FC<StoryListProps> = ({
  articles,
  onSelectStory,
  showRank = false,
  className = '',
}) => {
  return (
    <div className={`divide-y divide-[#262420] ${className}`}>
      {articles.map((article, idx) => (
        <article
          key={article.id}
          onClick={() => onSelectStory(article.slug)}
          className="py-5 first:pt-0 last:pb-0 group cursor-pointer flex gap-4 items-start"
        >
          {showRank && (
            <span className="font-mono-editorial text-2xl sm:text-3xl font-light text-[#EA580C] opacity-70 w-8 shrink-0">
              0{idx + 1}
            </span>
          )}

          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-mono-editorial text-[#8C877E] uppercase">
              <span className="text-[#EA580C] font-semibold">{article.category}</span>
              <span>•</span>
              <span>{article.readTime}</span>
            </div>

            <h4 className="font-serif-editorial text-base sm:text-lg font-medium text-[#F5F3EF] group-hover:text-[#EA580C] transition-colors leading-snug">
              {article.title}
            </h4>

            <p className="text-xs text-[#A8A49C] line-clamp-2 font-light">
              {article.deck}
            </p>

            <div className="flex items-center justify-between pt-1 text-[11px] font-mono-editorial text-[#8C877E]">
              <span>By {article.author.name}</span>
              <div className="flex items-center gap-3">
                <SaveButton article={article} />
                <ArrowRight className="w-3 h-3 text-[#8C877E] group-hover:text-[#EA580C] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
