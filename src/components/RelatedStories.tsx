import React from 'react';
import { Article } from '../types';
import { ArticleCard } from './ArticleCard';
import { Sparkles } from 'lucide-react';

interface RelatedStoriesProps {
  articles: Article[];
  onSelectStory: (slug: string) => void;
  className?: string;
}

export const RelatedStories: React.FC<RelatedStoriesProps> = ({
  articles,
  onSelectStory,
  className = '',
}) => {
  if (articles.length === 0) return null;

  return (
    <section className={`pt-12 border-t border-[#E8E5DF] ${className}`}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-2 font-mono-editorial">
        <Sparkles className="w-3.5 h-3.5" />
        <span>FURTHER CONTEMPLATION</span>
      </div>
      <h3 className="font-serif-editorial text-2xl sm:text-3xl font-medium text-[#111110] mb-8">
        Related Dispatches
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((article) => (
          <div key={article.id} className="bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs shadow-xs">
            <ArticleCard
              article={article}
              variant="medium"
              onSelect={onSelectStory}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
