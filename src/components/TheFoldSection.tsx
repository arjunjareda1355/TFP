import React, { useState } from 'react';
import { Article } from '../types';
import { ArrowRight, ChevronLeft, ChevronRight, Bookmark, BookOpen, Volume2, Square } from 'lucide-react';
import { useMagazine } from '../context/MagazineContext';

interface TheFoldSectionProps {
  articles: Article[];
  onSelect: (slug: string) => void;
}

export const TheFoldSection: React.FC<TheFoldSectionProps> = ({ articles, onSelect }) => {
  const { isSaved, toggleSave, playAudio, stopAudio, isPlayingAudio, activeAudioArticle } = useMagazine();
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  if (!articles || articles.length === 0) return null;

  const currentStory = articles[activeStoryIndex] || articles[0];
  const saved = isSaved(currentStory.id);
  const isThisPlaying = isPlayingAudio && activeAudioArticle?.id === currentStory.id;

  return (
    <section className="py-14 sm:py-20 bg-[#FFFFFF] text-[#111110] overflow-hidden relative border-y border-[#E8E5DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-5 border-b border-[#E8E5DF] gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-1 font-mono-editorial">
              <BookOpen className="w-3.5 h-3.5" />
              <span>THE SIGNATURE FEATURE</span>
            </div>
            <h2 className="font-serif-editorial text-4xl sm:text-5xl font-medium tracking-tight text-[#111110]">
              THE FOLD
            </h2>
            <p className="font-serif-editorial italic text-lg text-[#55524B] mt-0.5">
              "A closer look at the things worth unfolding."
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-editorial text-[#6E6A62] hidden sm:inline">
              FEATURE {activeStoryIndex + 1} OF {articles.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                id="the-fold-prev-btn"
                onClick={() =>
                  setActiveStoryIndex((prev) => (prev > 0 ? prev - 1 : articles.length - 1))
                }
                className="w-10 h-10 border border-[#E8E5DF] hover:border-[#EA580C] hover:bg-[#F5F4F0] text-[#111110] flex items-center justify-center transition-colors rounded-xs"
                aria-label="Previous story in The Fold"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="the-fold-next-btn"
                onClick={() =>
                  setActiveStoryIndex((prev) => (prev < articles.length - 1 ? prev + 1 : 0))
                }
                className="w-10 h-10 border border-[#E8E5DF] hover:border-[#EA580C] hover:bg-[#F5F4F0] text-[#111110] flex items-center justify-center transition-colors rounded-xs"
                aria-label="Next story in The Fold"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Display Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Visual */}
          <div className="lg:col-span-7">
            <div
              onClick={() => onSelect(currentStory.slug)}
              className="group relative aspect-[16/10] w-full overflow-hidden bg-[#F9F8F6] border border-[#E8E5DF] cursor-pointer shadow-md rounded-xs"
            >
              <img
                src={currentStory.heroImage}
                alt={currentStory.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

              <div className="absolute top-4 left-4">
                <span className="bg-[#EA580C] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 shadow-xs">
                  SPECIAL INVESTIGATION
                </span>
              </div>

              <button
                id="fold-save-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSave(currentStory.id);
                }}
                className="absolute top-4 right-4 bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] border border-[#E8E5DF] p-2 text-[#111110] transition-colors rounded-xs shadow-xs"
                title={saved ? 'Remove bookmark' : 'Save story'}
                aria-label={saved ? 'Remove bookmark' : 'Save story'}
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-[#EA580C] text-[#EA580C]' : ''}`} />
              </button>

              {currentStory.heroImageCredit && (
                <div className="absolute bottom-3 left-3 bg-[#FFFFFF]/90 border border-[#E8E5DF] text-[#55524B] text-[10px] font-mono-editorial px-2.5 py-1 backdrop-blur-xs max-w-xs truncate hidden sm:block rounded-xs">
                  {currentStory.heroImageCredit}
                </div>
              )}
            </div>
          </div>

          {/* Editorial Content */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono-editorial text-[#6E6A62]">
                <span className="text-[#EA580C] font-semibold uppercase">{currentStory.category}</span>
                <span>•</span>
                <span>{currentStory.readTime} read</span>
                <span>•</span>
                <span>By {currentStory.author.name}</span>
              </div>

              <h3
                onClick={() => onSelect(currentStory.slug)}
                className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-[#111110] hover:text-[#EA580C] transition-colors cursor-pointer leading-[1.18]"
              >
                {currentStory.title}
              </h3>

              <p className="text-base text-[#55524B] font-normal leading-relaxed">
                {currentStory.deck}
              </p>

              <blockquote className="border-l-2 border-[#EA580C] pl-4 py-1 italic font-serif-editorial text-[#111110] text-base bg-[#F9F8F6] p-3 rounded-xs">
                "{currentStory.subtitle}"
              </blockquote>
            </div>

            <div className="pt-4 border-t border-[#E8E5DF] flex flex-wrap items-center gap-3">
              <button
                id="fold-read-btn"
                onClick={() => onSelect(currentStory.slug)}
                className="group inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white px-5 py-3 text-xs font-semibold uppercase tracking-widest transition-all rounded-xs shadow-xs"
              >
                <span>Read Feature</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="fold-listen-btn"
                onClick={() => {
                  if (isThisPlaying) {
                    stopAudio();
                  } else {
                    playAudio(currentStory);
                  }
                }}
                className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all rounded-xs border ${
                  isThisPlaying
                    ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E]'
                    : 'bg-[#F9F8F6] hover:bg-[#F0EDE8] text-[#111110] border-[#E8E5DF]'
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
                    <span>Listen ({currentStory.audioMinutes || Math.max(2, Math.ceil(currentStory.readTimeMinutes || 5))}m)</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Thumbnails Selector */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {articles.slice(0, 4).map((art, idx) => (
                <button
                  key={art.id}
                  onClick={() => setActiveStoryIndex(idx)}
                  className={`relative aspect-[16/10] overflow-hidden border transition-all rounded-xs ${
                    idx === activeStoryIndex
                      ? 'border-[#EA580C] ring-2 ring-[#EA580C]/20 opacity-100 scale-102'
                      : 'border-[#E8E5DF] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={art.heroImage}
                    alt={art.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
