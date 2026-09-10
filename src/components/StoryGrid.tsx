import React from 'react';
import { Article } from '../types';
import { ArticleCard } from './ArticleCard';

interface StoryGridProps {
  articles: Article[];
  columns?: 2 | 3 | 4;
  variant?: 'large' | 'medium' | 'small' | 'horizontal';
  onSelectStory: (slug: string) => void;
  className?: string;
}

export const StoryGrid: React.FC<StoryGridProps> = ({
  articles,
  columns = 3,
  variant = 'medium',
  onSelectStory,
  className = '',
}) => {
  const gridColClass = {
    2: 'grid grid-cols-1 md:grid-cols-2 gap-8',
    3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6',
  }[columns];

  return (
    <div className={`${gridColClass} ${className}`}>
      {articles.map((article) => (
        <div key={article.id} className="bg-[#141312] border border-[#2C2A26] p-5 rounded-xs">
          <ArticleCard
            article={article}
            variant={variant}
            onSelect={onSelectStory}
          />
        </div>
      ))}
    </div>
  );
};
