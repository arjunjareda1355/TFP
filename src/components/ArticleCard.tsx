import React from 'react';
import { Article } from '../types';
import { Bookmark, Clock, ArrowUpRight, Volume2, Square } from 'lucide-react';
import { useMagazine } from '../context/MagazineContext';
import { BrandedImage } from './BrandedImage';

interface ArticleCardProps {
  article: Article;
  variant?: 'featured' | 'large' | 'medium' | 'small' | 'horizontal' | 'compact' | 'ranked';
  rankNumber?: number | string;
  showImage?: boolean;
  onSelect: (slug: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'medium',
  rankNumber,
  showImage = true,
  onSelect,
}) => {
  const { isSaved, toggleSave, playAudio, stopAudio, isPlayingAudio, activeAudioArticle } = useMagazine();
  const saved = isSaved(article.id);
  const isThisPlaying = isPlayingAudio && activeAudioArticle?.id === article.id;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    onSelect(article.slug);
  };

  const handleAudioToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isThisPlaying) {
      stopAudio();
    } else {
      playAudio(article);
    }
  };

  if (variant === 'ranked') {
    return (
      <article
        id={`ranked-story-${article.id}`}
        onClick={handleCardClick}
        className="group relative flex items-start gap-4 sm:gap-6 py-5 border-b border-[#E8E5DF] cursor-pointer transition-colors duration-200 hover:bg-[#FAF9F6] px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-xs"
      >
        <span className="font-serif-editorial text-3xl sm:text-4xl font-normal text-[#8E8A81] group-hover:text-[#111110] transition-colors w-9 sm:w-12 shrink-0 select-none">
          {rankNumber || '01'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#EA580C]">
              {article.category}
            </span>
            <span className="text-[#D4CEBF] text-xs">•</span>
            <span className="text-xs text-[#6E6A62] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime}
            </span>
          </div>
          <h3 className="font-serif-editorial text-lg sm:text-xl font-medium text-[#111110] leading-snug group-hover:text-[#EA580C] transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#55524B] line-clamp-2 mt-1 font-normal leading-relaxed">
            {article.subtitle}
          </p>
        </div>
        {showImage && (
          <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 overflow-hidden bg-[#F7F5F0] border border-[#E8E5DF] rounded-xs">
            <BrandedImage
              src={article.heroImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
      </article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <article
        id={`horizontal-story-${article.id}`}
        onClick={handleCardClick}
        className="group relative grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 py-6 border-b border-[#E8E5DF] cursor-pointer hover:bg-[#FAF9F6] px-2 sm:px-4 -mx-2 sm:-mx-4 transition-all rounded-xs"
      >
        <div className="sm:col-span-5 h-48 sm:h-44 overflow-hidden bg-[#F7F5F0] border border-[#E8E5DF] relative rounded-xs">
          <BrandedImage
            src={article.heroImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {article.isEditorsPick && (
            <span className="absolute top-2 left-2 bg-[#111110] text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 shadow-xs">
              Editor's Pick
            </span>
          )}
        </div>
        <div className="sm:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#EA580C]">
                {article.category} {article.subcategory ? `— ${article.subcategory}` : ''}
              </span>
              <button
                id={`save-btn-${article.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSave(article.id);
                }}
                className="text-[#6E6A62] hover:text-[#111110] transition-colors p-1"
                title={saved ? 'Remove bookmark' : 'Save story'}
                aria-label={saved ? 'Remove bookmark' : 'Save story'}
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-[#EA580C] text-[#EA580C]' : ''}`} />
              </button>
            </div>
            <h3 className="font-serif-editorial text-xl sm:text-2xl font-medium text-[#111110] group-hover:text-[#EA580C] transition-colors leading-snug">
              {article.title}
            </h3>
            <p className="text-sm text-[#55524B] mt-2 line-clamp-2 leading-relaxed font-normal">
              {article.subtitle}
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#E8E5DF] text-xs text-[#6E6A62]">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#111110]">{article.author.name}</span>
              <span>•</span>
              <span>{article.readTime}</span>
            </div>
            <div className="flex items-center gap-3">
              {article.audioMinutes && (
                <button
                  id={`listen-btn-${article.id}`}
                  onClick={handleAudioToggle}
                  className={`flex items-center gap-1 transition-colors px-2 py-1 rounded text-xs ${
                    isThisPlaying
                      ? 'bg-[#FEF3C7] text-[#92400E] font-semibold'
                      : 'text-[#6E6A62] hover:text-[#111110]'
                  }`}
                  title={isThisPlaying ? 'Stop listening' : 'Listen to story'}
                >
                  {isThisPlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current text-[#EA580C]" />
                      <span>Stop Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span className="hidden sm:inline">Listen</span>
                    </>
                  )}
                </button>
              )}
              <span className="group-hover:translate-x-1 transition-transform inline-flex items-center text-[#111110] font-medium">
                Read <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 text-[#EA580C]" />
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'large') {
    return (
      <article
        id={`large-story-${article.id}`}
        onClick={handleCardClick}
        className="group relative flex flex-col h-full cursor-pointer bg-[#FFFFFF] border border-[#E8E5DF] hover:border-[#D4CEBF] hover:bg-[#FAF9F6] transition-all p-5 sm:p-6 shadow-xs rounded-xs"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[#F7F5F0] border border-[#E8E5DF] mb-5 rounded-xs">
          <BrandedImage
            src={article.heroImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-[#111110] text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1 shadow-xs">
              {article.category}
            </span>
          </div>
          <button
            id={`save-large-btn-${article.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(article.id);
            }}
            className="absolute top-3 right-3 bg-[#FFFFFF]/90 border border-[#E8E5DF] backdrop-blur-xs p-1.5 text-[#111110] hover:bg-[#FFFFFF] transition-colors rounded-xs shadow-xs"
            title={saved ? 'Remove bookmark' : 'Save story'}
            aria-label={saved ? 'Remove bookmark' : 'Save story'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-[#EA580C] text-[#EA580C]' : ''}`} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#6E6A62] mb-2 font-mono-editorial">
              <span>{article.publishedDate}</span>
              <span>/</span>
              <span>{article.readTime}</span>
            </div>
            <h3 className="font-serif-editorial text-2xl sm:text-3xl font-medium text-[#111110] group-hover:text-[#EA580C] transition-colors leading-tight mb-3">
              {article.title}
            </h3>
            <p className="text-sm sm:text-base text-[#55524B] font-normal leading-relaxed mb-4 line-clamp-3">
              {article.deck}
            </p>
          </div>

          <div className="pt-4 border-t border-[#E8E5DF] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-6 h-6 rounded-full object-cover border border-[#E8E5DF]"
              />
              <span className="text-xs font-medium text-[#111110]">{article.author.name}</span>
            </div>
            <div className="flex items-center gap-3">
              {article.audioMinutes && (
                <button
                  onClick={handleAudioToggle}
                  className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                    isThisPlaying ? 'bg-[#FEF3C7] text-[#92400E] font-semibold' : 'text-[#6E6A62] hover:text-[#111110]'
                  }`}
                  title={isThisPlaying ? 'Stop listening' : 'Listen'}
                >
                  {isThisPlaying ? <Square className="w-3 h-3 fill-current text-[#EA580C]" /> : <Volume2 className="w-3 h-3 text-[#EA580C]" />}
                  <span>{isThisPlaying ? 'Stop' : 'Listen'}</span>
                </button>
              )}
              <span className="text-xs font-semibold uppercase tracking-wider text-[#111110] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Unfold <ArrowUpRight className="w-3.5 h-3.5 text-[#EA580C]" />
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'small' || variant === 'compact') {
    return (
      <article
        id={`small-story-${article.id}`}
        onClick={handleCardClick}
        className="group relative cursor-pointer border-b border-[#E8E5DF] pb-4 mb-4 last:border-b-0 last:pb-0 hover:bg-[#FAF9F6] p-2 -m-2 transition-colors rounded-xs"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA580C]">
            {article.category}
          </span>
          <span className="text-xs text-[#6E6A62]">•</span>
          <span className="text-xs text-[#6E6A62]">{article.readTime}</span>
        </div>
        <h4 className="font-serif-editorial text-base sm:text-lg font-medium text-[#111110] group-hover:text-[#EA580C] transition-colors leading-snug line-clamp-2">
          {article.title}
        </h4>
      </article>
    );
  }

  // Default medium card
  return (
    <article
      id={`medium-story-${article.id}`}
      onClick={handleCardClick}
      className="group relative flex flex-col h-full cursor-pointer border-b border-[#E8E5DF] pb-6 hover:bg-[#FAF9F6] p-2 sm:p-3 -m-2 sm:-m-3 transition-colors rounded-xs"
    >
      {showImage && (
        <div className="relative aspect-[16/10] overflow-hidden bg-[#F7F5F0] border border-[#E8E5DF] mb-3 rounded-xs">
          <BrandedImage
            src={article.heroImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-600 ease-out"
          />
          <button
            id={`save-medium-btn-${article.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(article.id);
            }}
            className="absolute top-2 right-2 bg-[#FFFFFF]/90 border border-[#E8E5DF] backdrop-blur-xs p-1 text-[#111110] opacity-0 group-hover:opacity-100 transition-opacity rounded-xs shadow-xs"
            title={saved ? 'Remove bookmark' : 'Save story'}
            aria-label={saved ? 'Remove bookmark' : 'Save story'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-[#EA580C] text-[#EA580C]' : ''}`} />
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#EA580C]">
              {article.category}
            </span>
            <span className="text-xs text-[#6E6A62]">•</span>
            <span className="text-xs text-[#6E6A62]">{article.readTime}</span>
          </div>
          <h3 className="font-serif-editorial text-lg sm:text-xl font-medium text-[#111110] group-hover:text-[#EA580C] transition-colors leading-snug mb-2">
            {article.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#55524B] line-clamp-2 leading-relaxed font-normal">
            {article.subtitle}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E8E5DF] text-xs text-[#6E6A62]">
          <span className="text-[#111110] font-medium">{article.author.name}</span>
          <div className="flex items-center gap-3">
            {article.audioMinutes && (
              <button
                onClick={handleAudioToggle}
                className={`flex items-center gap-1 transition-colors ${
                  isThisPlaying ? 'text-[#EA580C] font-semibold' : 'text-[#6E6A62] hover:text-[#111110]'
                }`}
                title={isThisPlaying ? 'Stop audio' : 'Listen to story'}
              >
                {isThisPlaying ? <Square className="w-3 h-3 fill-current text-[#EA580C]" /> : <Volume2 className="w-3 h-3 text-[#EA580C]" />}
              </button>
            )}
            <span className="group-hover:translate-x-1 transition-transform inline-flex items-center text-[#111110] font-medium">
              Read <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 text-[#EA580C]" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

