import React from 'react';
import { Article } from '../types';
import { Sparkles, Clock, Headphones, ArrowRight } from 'lucide-react';
import { SaveButton } from './SaveButton';
import { ShareMenu } from './ShareMenu';

interface HeroStoryProps {
  article: Article;
  onSelectStory: (slug: string) => void;
  onPlayAudio?: (article: Article) => void;
  className?: string;
}

export const HeroStory: React.FC<HeroStoryProps> = ({
  article,
  onSelectStory,
  onPlayAudio,
  className = '',
}) => {
  return (
    <article
      id={`hero-story-${article.id}`}
      onClick={() => onSelectStory(article.slug)}
      className={`relative bg-[#141312] border border-[#2C2A26] paper-edge-fold overflow-hidden cursor-pointer group rounded-xs ${className}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left / Top Editorial Content (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Top rubric & issue flag */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse" />
                <span className="font-mono-editorial text-xs font-bold uppercase tracking-widest text-[#EA580C]">
                  THE COVER STORY • {article.seriesName || 'THE FOLD'}
                </span>
              </div>
              <span className="font-mono-editorial text-xs text-[#8C877E] uppercase">
                {article.issueNumber || 'ISSUE 01'}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif-editorial text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#F5F3EF] leading-[1.08] group-hover:text-[#EA580C] transition-colors">
              {article.title}
            </h1>

            {/* Subtitle / Deck */}
            <p className="text-sm sm:text-base lg:text-lg text-[#D1CDC4] font-light leading-relaxed">
              {article.deck}
            </p>
          </div>

          {/* Pullquote peek */}
          {article.featuredQuote && (
            <blockquote className="border-l-2 border-[#EA580C] pl-4 py-1 italic font-serif-editorial text-base sm:text-lg text-[#A8A49C] leading-snug">
              "{article.featuredQuote}"
            </blockquote>
          )}

          {/* Metadata & Actions */}
          <div className="pt-4 border-t border-[#262420] flex flex-wrap items-center justify-between gap-4 text-xs font-mono-editorial text-[#8C877E]">
            <div className="flex items-center gap-3">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-8 h-8 rounded-full object-cover grayscale border border-[#3A3732]"
              />
              <div>
                <span className="text-[#F5F3EF] font-semibold block">{article.author.name}</span>
                <span className="text-[10px] uppercase text-[#8C877E]">{article.publishedDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>{article.readTime}</span>
              </span>

              {article.audioMinutes && onPlayAudio && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayAudio(article);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-[#181715] hover:bg-[#EA580C] text-[#F5F3EF] border border-[#3A3732] hover:border-[#EA580C] transition-colors rounded-xs"
                >
                  <Headphones className="w-3 h-3" />
                  <span>Listen ({article.audioMinutes}m)</span>
                </button>
              )}

              <SaveButton article={article} />
              <ShareMenu article={article} />
            </div>
          </div>
        </div>

        {/* Right / Bottom Hero Photography (5 cols) */}
        <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-[500px] overflow-hidden bg-[#181715] border-t lg:border-t-0 lg:border-l border-[#2C2A26]">
          <img
            src={article.heroImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          />
          {article.heroImageCaption && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#121110]/90 to-transparent p-4 text-[11px] font-mono-editorial text-[#A8A49C]">
              {article.heroImageCaption}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
