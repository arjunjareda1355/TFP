import React from 'react';
import { EDITORIAL_SERIES } from '../data/series';
import { ArrowRight, Layers } from 'lucide-react';
import { ARTICLES } from '../data/articles';

interface EditorialSeriesStripProps {
  onSelectSeries?: (seriesId: string) => void;
}

export const EditorialSeriesStrip: React.FC<EditorialSeriesStripProps> = ({ onSelectSeries }) => {
  return (
    <section className="py-14 border-t border-[#E8E5DF] bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-[#E8E5DF] gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-1 font-mono-editorial">
              <Layers className="w-3.5 h-3.5" />
              <span>COLLECTED DISPATCHES</span>
            </div>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl font-medium text-[#111110]">
              Recurring Editorial Series
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#55524B] max-w-md font-normal">
            Continuous thematic explorations published on predictable, rhythmic cadences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EDITORIAL_SERIES.slice(0, 3).map((series) => {
            const count = ARTICLES.filter(
              (a) => a.seriesName?.toLowerCase() === series.name.toLowerCase()
            ).length;

            return (
              <div
                key={series.id}
                onClick={() => onSelectSeries && onSelectSeries(series.id)}
                className="group cursor-pointer bg-[#FFFFFF] border border-[#E8E5DF] hover:border-[#EA580C] p-6 transition-all duration-300 flex flex-col justify-between rounded-xs shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono-editorial text-[#6E6A62] mb-3">
                    <span className="text-[#EA580C] font-bold tracking-widest uppercase">
                      {series.frequency}
                    </span>
                    <span>Curated by {series.curator}</span>
                  </div>

                  <h3 className="font-serif-editorial text-2xl font-medium text-[#111110] group-hover:text-[#EA580C] transition-colors mb-2">
                    {series.name}
                  </h3>

                  <p className="text-xs font-serif-editorial italic text-[#55524B] mb-3">
                    "{series.tagline}"
                  </p>

                  <p className="text-xs sm:text-sm text-[#55524B] font-normal leading-relaxed mb-6">
                    {series.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E8E5DF] flex items-center justify-between text-xs">
                  <span className="text-[#8E8A81] font-mono-editorial">{count || 4} Dispatches</span>
                  <span className="font-semibold uppercase tracking-wider text-[#111110] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore Series <ArrowRight className="w-3 h-3 text-[#EA580C]" />
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
