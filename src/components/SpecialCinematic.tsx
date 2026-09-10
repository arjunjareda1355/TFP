import React from 'react';
import { Article } from '../types';
import { ArrowRight, Bookmark, Volume2, Square } from 'lucide-react';
import { useMagazine } from '../context/MagazineContext';
import { ArticleCard } from './ArticleCard';

interface SpecialCinematicProps {
  articles: Article[];
  onSelect: (slug: string) => void;
  onViewCategory: () => void;
}

export const SpecialCinematic: React.FC<SpecialCinematicProps> = ({
  articles,
  onSelect,
  onViewCategory,
}) => {
  const { isSaved, toggleSave, playAudio, stopAudio, isPlayingAudio, activeAudioArticle } = useMagazine();
  if (!articles || articles.length === 0) return null;

  const leadSpecial = articles[0];
  const sideSpecial = articles.slice(1, 3);
  const saved = leadSpecial ? isSaved(leadSpecial.id) : false;
  const isThisPlaying = leadSpecial && isPlayingAudio && activeAudioArticle?.id === leadSpecial.id;

  return (
    <section className="py-14 sm:py-20 border-b border-[#E8E5DF] bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-5 border-b border-[#E8E5DF] gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#4F46E5] mb-1 font-mono-editorial">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Section 06</span>
            </div>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#111110]">
              SPECIAL
            </h2>
            <p className="font-serif-editorial italic text-base sm:text-lg text-[#55524B] mt-0.5">
              "People, places and ideas worth remembering."
            </p>
          </div>

          <button
            id="view-all-special-btn"
            onClick={onViewCategory}
            className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#111110] hover:text-[#4F46E5] transition-colors"
          >
            <span>Explore all special editions</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#4F46E5]" />
          </button>
        </div>

        {/* Cinematic Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Cinematic Feature (7 cols) */}
          {leadSpecial && (
            <div className="lg:col-span-7">
              <div
                onClick={() => onSelect(leadSpecial.slug)}
                className="group relative cursor-pointer bg-[#FFFFFF] border border-[#E8E5DF] hover:border-[#4F46E5] overflow-hidden transition-all shadow-md rounded-xs"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#F9F8F6]">
                  <img
                    src={leadSpecial.heroImage}
                    alt={leadSpecial.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  <div className="absolute top-4 left-4 bg-[#FFFFFF]/90 backdrop-blur-xs text-[#4F46E5] font-mono-editorial text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border border-[#E8E5DF] rounded-xs shadow-xs">
                    CINEMATIC FEATURE
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(leadSpecial.id);
                    }}
                    className="absolute top-4 right-4 bg-[#FFFFFF]/90 border border-[#E8E5DF] p-2 text-[#111110] hover:bg-[#FFFFFF] transition-colors rounded-xs shadow-xs"
                    title={saved ? 'Remove bookmark' : 'Save'}
                  >
                    <Bookmark className={`w-4 h-4 ${saved ? 'fill-[#EA580C] text-[#EA580C]' : ''}`} />
                  </button>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-xs font-mono-editorial text-[#6E6A62] mb-3">
                    <span className="text-[#4F46E5] font-semibold">{leadSpecial.subcategory || 'Portraits & Legacy'}</span>
                    <span>•</span>
                    <span>{leadSpecial.readTime}</span>
                    <span>•</span>
                    <span>By {leadSpecial.author.name}</span>
                  </div>

                  <h3 className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-[#111110] group-hover:text-[#4F46E5] transition-colors leading-[1.18] mb-4">
                    {leadSpecial.title}
                  </h3>

                  <p className="text-base text-[#55524B] font-normal leading-relaxed mb-6">
                    {leadSpecial.deck}
                  </p>

                  <div className="pt-4 border-t border-[#E8E5DF] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isThisPlaying) {
                            stopAudio();
                          } else {
                            playAudio(leadSpecial);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors border ${
                          isThisPlaying
                            ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E] font-semibold'
                            : 'bg-[#F9F8F6] border-[#E8E5DF] text-[#111110] hover:bg-[#F0EDE8]'
                        }`}
                      >
                        {isThisPlaying ? <Square className="w-3.5 h-3.5 fill-current text-[#EA580C]" /> : <Volume2 className="w-3.5 h-3.5 text-[#EA580C]" />}
                        <span>{isThisPlaying ? 'Stop Audio' : `Listen (${leadSpecial.audioMinutes || Math.max(2, Math.ceil(leadSpecial.readTimeMinutes || 5))}m)`}</span>
                      </button>
                    </div>

                    <span className="text-xs font-semibold uppercase tracking-wider text-[#111110] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Unfold Feature <ArrowRight className="w-3.5 h-3.5 text-[#4F46E5]" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Special Stories (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {sideSpecial.map((story) => (
              <ArticleCard
                key={story.id}
                article={story}
                variant="horizontal"
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
