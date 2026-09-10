import React, { useState, useEffect } from 'react';
import { useMagazine } from '../context/MagazineContext';
import { EDITORIAL_SERIES } from '../data/series';
import { ArticleCard } from '../components/ArticleCard';
import { ArrowLeft, Layers } from 'lucide-react';

interface SeriesPageProps {
  initialSeriesId?: string;
  onSelectStory: (slug: string) => void;
  onBack: () => void;
}

export const SeriesPage: React.FC<SeriesPageProps> = ({
  initialSeriesId,
  onSelectStory,
  onBack,
}) => {
  const { articles, series } = useMagazine();
  const allSeries = series && series.length > 0 ? series : EDITORIAL_SERIES;

  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(
    initialSeriesId || allSeries[0]?.id || 'the-fold'
  );

  useEffect(() => {
    if (initialSeriesId) {
      setSelectedSeriesId(initialSeriesId);
    }
  }, [initialSeriesId]);

  const currentSeries = allSeries.find((s) => s.id === selectedSeriesId) || allSeries[0] || EDITORIAL_SERIES[0];

  // Articles in this series
  const seriesArticles = (articles || []).filter(
    (a) =>
      (a.seriesName && a.seriesName.toLowerCase() === currentSeries.name.toLowerCase()) ||
      (a.seriesId && a.seriesId === currentSeries.id)
  );


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FFFFFF] text-[#111110]">
      {/* Back button */}
      <div className="mb-8 pb-4 border-b border-[#E8E5DF]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6E6A62] hover:text-[#EA580C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
      </div>

      {/* Header */}
      <header className="max-w-3xl mb-12">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-2 font-mono-editorial">
          <Layers className="w-3.5 h-3.5" />
          <span>RECURRING EDITORIAL FRANCHISES</span>
        </div>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl font-medium tracking-tight text-[#111110] mb-3">
          Editorial Series
        </h1>
        <p className="text-base sm:text-lg text-[#55524B] font-normal leading-relaxed">
          Structured recurring inquiries across contemporary culture, tactile craftsmanship, deep profiles, and unexpected natural phenomena.
        </p>
      </header>

      {/* Series Selection Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-12 border-b border-[#E8E5DF] pb-6">
        {allSeries.map((series) => (
          <button
            key={series.id}
            onClick={() => setSelectedSeriesId(series.id)}
            className={`p-3 text-left transition-all border rounded-xs ${
              series.id === selectedSeriesId
                ? 'border-[#EA580C] bg-[#FFF7ED]'
                : 'border-[#E8E5DF] bg-[#FFFFFF] hover:border-[#8E8A81]'
            }`}
          >
            <span className="text-[10px] font-mono-editorial uppercase text-[#EA580C] font-bold block mb-1">
              Part Series
            </span>
            <h4 className="font-serif-editorial text-sm font-medium text-[#111110] leading-snug">
              {series.name}
            </h4>
          </button>
        ))}
      </div>

      {/* Current Series Hero Banner */}
      <div className="bg-[#F9F8F6] border border-[#E8E5DF] p-6 sm:p-10 mb-12 rounded-xs shadow-xs">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-mono-editorial text-[#EA580C] font-bold uppercase tracking-widest">
            {currentSeries.frequency}
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-5xl font-medium text-[#111110]">
            {currentSeries.name}
          </h2>
          <p className="font-serif-editorial italic text-lg text-[#55524B]">
            "{currentSeries.tagline}"
          </p>
          <p className="text-sm text-[#55524B] leading-relaxed">
            {currentSeries.description}
          </p>
        </div>
      </div>

      {/* Articles in series */}
      <div>
        <h3 className="font-mono-editorial text-xs uppercase tracking-widest text-[#8E8A81] font-bold mb-6">
          DISPATCHES IN THIS SERIES ({seriesArticles.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {seriesArticles.map((story) => (
            <div key={story.id} className="bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs shadow-xs">
              <ArticleCard
                article={story}
                variant="medium"
                onSelect={onSelectStory}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
