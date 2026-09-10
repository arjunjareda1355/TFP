import React from 'react';
import { Article } from '../types';
import { ArrowRight, Bookmark, Clock, Volume2, Sparkles, Pause, Square } from 'lucide-react';
import { useMagazine } from '../context/MagazineContext';

interface HeroCoverStoryProps {
  article: Article;
  onSelect: (slug: string) => void;
}

export const HeroCoverStory: React.FC<HeroCoverStoryProps> = ({ article, onSelect }) => {
  const { isSaved, toggleSave, playAudio, isPlayingAudio, activeAudioArticle, stopAudio } = useMagazine();
  const saved = isSaved(article.id);
  const isThisPlaying = isPlayingAudio && activeAudioArticle?.id === article.id;

  return (
    <section className="relative w-full pt-4 pb-12 sm:pb-16 border-b border-[#E8E5DF] bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Editorial Kicker */}
        <div className="flex items-center justify-between py-2.5 border-b border-[#E8E5DF] mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <span className="bg-[#111110] text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2.5 py-1">
              COVER STORY
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {article.category} — {article.subcategory}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono-editorial text-[#6E6A62]">
            <span>{article.issueNumber || 'ISSUE 01'}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{article.publishedDate}</span>
          </div>
        </div>

        {/* Hero Composition Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Dominant Editorial Photography */}
          <div className="lg:col-span-7 xl:col-span-8 order-1 lg:order-2">
            <div
              onClick={() => onSelect(article.slug)}
              className="group relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden cursor-pointer bg-[#F9F8F6] border border-[#E8E5DF] shadow-lg rounded-xs"
            >
              <img
                src={article.heroImage}
                alt={article.title}
                loading="eager"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />
              
              {/* Quick actions overlay */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  id="hero-save-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(article.id);
                  }}
                  className="bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#111110] border border-[#E8E5DF] p-2.5 backdrop-blur-xs shadow-md transition-colors rounded-xs"
                  title={saved ? 'Remove bookmark' : 'Save Cover Story'}
                  aria-label={saved ? 'Remove bookmark' : 'Save Cover Story'}
                >
                  <Bookmark className={`w-4 h-4 ${saved ? 'fill-[#EA580C] text-[#EA580C]' : ''}`} />
                </button>
              </div>

              {/* Photo Caption Tag */}
              {article.heroImageCredit && (
                <div className="absolute bottom-3 left-3 bg-[#FFFFFF]/90 border border-[#E8E5DF] text-[#55524B] text-[10px] font-mono-editorial px-2.5 py-1 backdrop-blur-xs max-w-xs truncate hidden sm:block rounded-xs">
                  {article.heroImageCredit}
                </div>
              )}
            </div>
          </div>

          {/* Editorial Headline & Deck */}
          <div className="lg:col-span-5 xl:col-span-4 order-2 lg:order-1 flex flex-col justify-center">
            <div className="space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-mono-editorial text-[#6E6A62]">
                <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>{article.readTime}</span>
                <span>•</span>
                <span>By {article.author.name}</span>
              </div>

              <h1
                onClick={() => onSelect(article.slug)}
                className="font-serif-editorial text-3xl sm:text-4xl xl:text-5xl font-medium tracking-tight text-[#111110] hover:text-[#EA580C] transition-colors leading-[1.12] cursor-pointer"
              >
                {article.title}
              </h1>

              <p className="text-base sm:text-lg text-[#55524B] font-normal leading-relaxed">
                {article.deck}
              </p>

              {/* CTA and Audio button */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  id="hero-read-story-btn"
                  onClick={() => onSelect(article.slug)}
                  className="group inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white px-6 py-3.5 text-xs font-semibold uppercase tracking-widest transition-all duration-200 shadow-md rounded-xs"
                >
                  <span>Read story</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="hero-listen-btn"
                  onClick={() => {
                    if (isThisPlaying) {
                      stopAudio();
                    } else {
                      playAudio(article);
                    }
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider transition-all rounded-xs border ${
                    isThisPlaying
                      ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E]'
                      : 'bg-[#F9F8F6] hover:bg-[#F0EDE8] text-[#111110] border-[#E8E5DF]'
                  }`}
                  title={isThisPlaying ? 'Stop listening to story' : 'Listen to story audio narration'}
                >
                  {isThisPlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current text-[#EA580C]" />
                      <span>Stop Audio ({article.audioMinutes || Math.max(2, Math.ceil(article.readTimeMinutes || 6))}m)</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>Listen ({article.audioMinutes || Math.max(2, Math.ceil(article.readTimeMinutes || 6))}m)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
