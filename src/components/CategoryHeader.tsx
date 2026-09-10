import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';
import { Category } from '../types';

interface CategoryHeaderProps {
  category: Category;
  storyCount: number;
  onBack: () => void;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  category,
  storyCount,
  onBack,
}) => {
  return (
    <header className="mb-12 pb-8 border-b border-[#262420]">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8C877E] hover:text-[#EA580C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <div className="flex items-center gap-2 font-mono-editorial text-xs text-[#8C877E]">
          <Compass className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>DESK ARCHIVE</span>
        </div>
      </div>

      <div className="max-w-3xl">
        <span className="font-mono-editorial text-xs font-bold uppercase tracking-widest text-[#EA580C] block mb-2">
          EDITORIAL DESK
        </span>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl font-medium tracking-tight text-[#F5F3EF] mb-3">
          {category.name}
        </h1>
        <p className="text-base sm:text-lg text-[#8C877E] font-light leading-relaxed mb-4">
          {category.description}
        </p>
        <div className="flex items-center gap-4 text-xs font-mono-editorial text-[#8C877E]">
          <span className="text-[#F5F3EF] font-semibold">{storyCount} DISPATCHES PUBLISHED</span>
          <span>•</span>
          <span>CURATED BY SENIOR EDITORS</span>
        </div>
      </div>
    </header>
  );
};
