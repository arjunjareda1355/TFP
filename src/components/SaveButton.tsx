import React from 'react';
import { Bookmark } from 'lucide-react';
import { useMagazine } from '../context/MagazineContext';
import { Article } from '../types';

interface SaveButtonProps {
  article: Article;
  className?: string;
  showLabel?: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  article,
  className = '',
  showLabel = false,
}) => {
  const { isArticleSaved, toggleSaveArticle } = useMagazine();
  const saved = isArticleSaved(article.id);

  return (
    <button
      id={`save-btn-${article.id}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleSaveArticle(article);
      }}
      title={saved ? 'Remove from Folded Stories' : 'Fold away / Save for later'}
      aria-label={saved ? 'Remove from saved' : 'Save article'}
      className={`inline-flex items-center gap-1.5 transition-all text-xs font-mono-editorial ${
        saved
          ? 'text-[#EA580C] hover:text-[#F97316]'
          : 'text-[#8C877E] hover:text-[#F5F3EF]'
      } ${className}`}
    >
      <Bookmark
        className={`w-4 h-4 transition-transform active:scale-90 ${
          saved ? 'fill-[#EA580C] text-[#EA580C]' : 'fill-none'
        }`}
      />
      {showLabel && (
        <span>{saved ? 'Folded' : 'Fold'}</span>
      )}
    </button>
  );
};
