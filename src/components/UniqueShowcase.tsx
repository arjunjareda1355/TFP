import React from 'react';
import { Article } from '../types';
import { Sparkles, ArrowRight, Eye, Bookmark, Volume2 } from 'lucide-react';
import { useMagazine } from '../context/MagazineContext';

interface UniqueShowcaseProps {
  articles: Article[];
  onSelect: (slug: string) => void;
  onViewCategory: () => void;
}

export const UniqueShowcase: React.FC<UniqueShowcaseProps> = ({
  articles,
  onSelect,
  onViewCategory,
}) => {
  const { toggleSave, isSaved } = useMagazine();
  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 border-b border-[#E8E5DF] bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-5 border-b border-[#E8E5DF] gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0D9488] mb-1 font-mono-editorial">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Section 05</span>
            </div>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#111110]">
              UNIQUE
            </h2>
            <p className="font-serif-editorial italic text-base sm:text-lg text-[#55524B] mt-0.5">
              "Things you probably haven't seen before."
            </p>
          </div>

          <button
            id="view-all-unique-btn"
            onClick={onViewCategory}
            className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#111110] hover:text-[#0D9488] transition-colors"
          >
            <span>Browse curious anomalies</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#0D9488]" />
          </button>
        </div>

        {/* 3-Column Playful/Curated Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.slice(0, 3).map((article, idx) => {
            const saved = isSaved(article.id);
            return (
              <div
                key={article.id}
                onClick={() => onSelect(article.slug)}
                className="group cursor-pointer bg-[#FFFFFF] border border-[#E8E5DF] hover:border-[#0D9488] hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden rounded-xs"
              >
                <div>
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F9F8F6] border-b border-[#E8E5DF]">
                    <img
                      src={article.heroImage}
                      alt={article.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-3 left-3 bg-[#FFFFFF]/90 backdrop-blur-xs border border-[#E8E5DF] text-[#0D9488] font-mono-editorial text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs">
                      SPECIMEN #{idx + 1}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(article.id);
                      }}
                      className="absolute top-3 right-3 bg-[#FFFFFF]/90 border border-[#E8E5DF] p-1.5 text-[#111110] hover:bg-[#FFFFFF] transition-colors rounded-xs shadow-xs"
                      title={saved ? 'Remove bookmark' : 'Save'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-[#EA580C] text-[#EA580C]' : ''}`} />
                    </button>
                  </div>

                  <div className="p-6">
                    <span className="text-[11px] font-mono-editorial text-[#8E8A81] block mb-2">
                      {article.subcategory || 'Anomalies & Wonder'} • {article.readTime}
                    </span>
                    <h3 className="font-serif-editorial text-xl sm:text-2xl font-medium text-[#111110] group-hover:text-[#0D9488] transition-colors leading-snug mb-3">
                      {article.title}
                    </h3>
                    <p className="text-sm text-[#55524B] font-normal leading-relaxed line-clamp-3">
                      {article.deck}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 bg-[#F9F8F6] border-t border-[#E8E5DF] flex items-center justify-between text-xs text-[#6E6A62]">
                  <span className="font-medium text-[#111110]">{article.author.name}</span>
                  <span className="group-hover:translate-x-1 transition-transform inline-flex items-center text-[#111110] font-medium">
                    Examine <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#0D9488]" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
