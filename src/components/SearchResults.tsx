import React from 'react';
import { Article } from '../types';
import { ArrowRight, Clock, Bookmark } from 'lucide-react';
import { SaveButton } from './SaveButton';
import { BrandLogo } from './BrandLogo';

interface SearchResultsProps {
  query: string;
  results: Article[];
  onSelectStory: (slug: string) => void;
  className?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  onSelectStory,
  className = '',
}) => {
  if (!query.trim()) {
    return (
      <div className="py-12 text-center text-xs font-mono-editorial text-[#8C877E] flex flex-col items-center gap-2">
        <BrandLogo variant="emblem" size={32} theme="dark" className="opacity-30 mb-1" />
        <span>Type keywords above to search across essays, interviews, topics, and authors.</span>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-12 text-center space-y-2">
        <BrandLogo variant="emblem" size={40} theme="dark" className="mx-auto opacity-30" />
        <p className="font-serif-editorial text-xl text-[#F5F3EF]">
          No dispatches matched "{query}"
        </p>
        <p className="text-xs font-mono-editorial text-[#8C877E]">
          Try searching for keywords like "Tactile", "Architecture", "Science", or "Japan".
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-[#262420] text-xs font-mono-editorial text-[#8C877E]">
        <div className="flex items-center gap-2">
          <BrandLogo variant="emblem" size={14} theme="dark" />
          <span>{results.length} DISPATCHES FOUND</span>
        </div>
        <span>MATCHING "{query.toUpperCase()}"</span>
      </div>

      <div className="divide-y divide-[#262420] max-h-[60vh] overflow-y-auto pr-2">
        {results.map((article) => (
          <article
            key={article.id}
            onClick={() => onSelectStory(article.slug)}
            className="py-4 first:pt-0 group cursor-pointer flex gap-4 items-start hover:bg-[#181715] p-2 -mx-2 rounded transition-colors"
          >
            <div className="w-16 h-16 bg-[#181715] border border-[#2C2A26] overflow-hidden shrink-0 rounded-xs relative">
              <img
                src={article.heroImage}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute top-0.5 left-0.5 bg-[#121110]/80 p-0.5 rounded-xs">
                <BrandLogo variant="emblem" size={8} theme="dark" />
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-mono-editorial text-[#8C877E] uppercase">
                <span className="text-[#EA580C] font-semibold">{article.category}</span>
                <span>•</span>
                <span>{article.readTime}</span>
              </div>

              <h4 className="font-serif-editorial text-base font-medium text-[#F5F3EF] group-hover:text-[#EA580C] transition-colors leading-snug">
                {article.title}
              </h4>

              <p className="text-xs text-[#8C877E] font-light line-clamp-1">
                {article.deck}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 self-center">
              <SaveButton article={article} />
              <ArrowRight className="w-4 h-4 text-[#8C877E] group-hover:text-[#EA580C] group-hover:translate-x-0.5 transition-all" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
