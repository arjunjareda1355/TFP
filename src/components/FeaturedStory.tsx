import React from 'react';
import { Article } from '../types';
import { Clock, ArrowRight } from 'lucide-react';
import { SaveButton } from './SaveButton';
import { ShareMenu } from './ShareMenu';

interface FeaturedStoryProps {
  article: Article;
  onSelectStory: (slug: string) => void;
  className?: string;
  badgeText?: string;
}

export const FeaturedStory: React.FC<FeaturedStoryProps> = ({
  article,
  onSelectStory,
  className = '',
  badgeText = 'FEATURED ESSAY',
}) => {
  return (
    <article
      id={`featured-story-${article.id}`}
      onClick={() => onSelectStory(article.slug)}
      className={`bg-[#141312] border border-[#2C2A26] p-6 sm:p-8 paper-edge-fold cursor-pointer group rounded-xs ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Art */}
        <div className="md:col-span-5 aspect-[4/3] overflow-hidden bg-[#181715] border border-[#2C2A26] relative rounded-xs">
          <img
            src={article.heroImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-[#121110]/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-mono-editorial text-[#EA580C] uppercase tracking-wider font-bold border border-[#3A3732] rounded-xs">
            {badgeText}
          </div>
        </div>

        {/* Right Info */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono-editorial text-[#8C877E] uppercase">
            <span className="text-[#EA580C] font-semibold">{article.category}</span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>

          <h3 className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl font-medium text-[#F5F3EF] group-hover:text-[#EA580C] transition-colors leading-tight">
            {article.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#A8A49C] font-light leading-relaxed line-clamp-3">
            {article.deck}
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-[#262420] text-xs font-mono-editorial text-[#8C877E]">
            <span>By {article.author.name}</span>
            <div className="flex items-center gap-3">
              <SaveButton article={article} />
              <ShareMenu article={article} />
              <div className="flex items-center gap-1 text-[#EA580C] font-semibold group-hover:translate-x-1 transition-transform">
                <span>Read Folio</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
