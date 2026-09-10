import React, { useState } from 'react';
import { ARTICLES } from '../data/articles';
import { ArrowLeft, Sun, Sunset, Moon, Sparkles } from 'lucide-react';
import { ArticleCard } from '../components/ArticleCard';

interface TodayPageProps {
  onSelectStory: (slug: string) => void;
  onBack: () => void;
}

export const TodayPage: React.FC<TodayPageProps> = ({ onSelectStory, onBack }) => {
  const [activeEdition, setActiveEdition] = useState<'morning' | 'midday' | 'evening'>('morning');

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const morningStories = ARTICLES.slice(0, 3);
  const middayStories = ARTICLES.slice(3, 6);
  const eveningStories = ARTICLES.slice(6, 10);

  const quickBriefs = [
    {
      time: '08:42 GMT',
      topic: 'Linguistics',
      title: 'A newly unearthed 14th-century parchment in Ghent reveals an untranslated dialect of maritime Flemish.',
    },
    {
      time: '09:15 GMT',
      topic: 'Optics',
      title: 'Astronomers in the Atacama record unprecedented atmospheric clarity during rare cold-front vortex.',
    },
    {
      time: '11:05 GMT',
      topic: 'Culinary Craft',
      title: 'A three-century-old olive grove in Puglia yields ancient frost-resistant cultivar.',
    },
    {
      time: '13:30 GMT',
      topic: 'Design',
      title: 'Kyoto bamboo joinery masters unveil earthquake-resilient lightweight pavilion in Copenhagen.',
    },
    {
      time: '15:10 GMT',
      topic: 'Acoustics',
      title: 'Underwater hydrophone arrays in the Mariana Trench detect previously uncataloged deep-ocean resonance.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FFFFFF] text-[#111110]">
      {/* Top breadcrumb & live tag */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8E5DF]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6E6A62] hover:text-[#EA580C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono-editorial text-[#EA580C] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse" />
          <span>LIVE EDITORIAL DESK</span>
        </div>
      </div>

      {/* Header */}
      <header className="max-w-3xl mb-12">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-2 font-mono-editorial">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{todayDate}</span>
        </div>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl font-medium tracking-tight text-[#111110] mb-3">
          Today's Briefing
        </h1>
        <p className="font-serif-editorial italic text-xl text-[#55524B] mb-4">
          "The essential discoveries, dispatches, and curiosities curated for today."
        </p>
      </header>

      {/* Edition selector tabs */}
      <div className="flex items-center gap-2 pb-4 mb-8 border-b border-[#E8E5DF] overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveEdition('morning')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs ${
            activeEdition === 'morning'
              ? 'bg-[#EA580C] text-white'
              : 'bg-[#F9F8F6] text-[#55524B] hover:text-[#111110] border border-[#E8E5DF]'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Morning Edition (07:00)</span>
        </button>
        <button
          onClick={() => setActiveEdition('midday')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs ${
            activeEdition === 'midday'
              ? 'bg-[#EA580C] text-white'
              : 'bg-[#F9F8F6] text-[#55524B] hover:text-[#111110] border border-[#E8E5DF]'
          }`}
        >
          <Sunset className="w-3.5 h-3.5" />
          <span>Midday Dispatch (13:00)</span>
        </button>
        <button
          onClick={() => setActiveEdition('evening')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs ${
            activeEdition === 'evening'
              ? 'bg-[#EA580C] text-white'
              : 'bg-[#F9F8F6] text-[#55524B] hover:text-[#111110] border border-[#E8E5DF]'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Evening Unfold (19:00)</span>
        </button>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left main stories */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="font-mono-editorial text-xs uppercase tracking-widest text-[#8E8A81] font-bold">
            Curated Longform Dispatches
          </h2>

          {(activeEdition === 'morning'
            ? morningStories
            : activeEdition === 'midday'
            ? middayStories
            : eveningStories
          ).map((story) => (
            <div key={story.id} className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 rounded-xs shadow-xs">
              <ArticleCard
                article={story}
                variant="horizontal"
                onSelect={onSelectStory}
              />
            </div>
          ))}
        </div>

        {/* Right sidebar quick dispatches wire */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#F9F8F6] border border-[#E8E5DF] p-6 rounded-xs shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8E5DF]">
              <span className="font-mono-editorial text-xs uppercase font-bold text-[#111110]">
                Telegraph Wire
              </span>
              <span className="text-[#EA580C] text-xs font-mono-editorial font-bold">● CONTINUOUS</span>
            </div>

            <div className="space-y-4 divide-y divide-[#E8E5DF]">
              {quickBriefs.map((brief, i) => (
                <div key={i} className="pt-3 first:pt-0">
                  <div className="flex items-center justify-between text-[11px] font-mono-editorial text-[#8E8A81] mb-1">
                    <span className="text-[#EA580C] font-semibold uppercase">{brief.topic}</span>
                    <span>{brief.time}</span>
                  </div>
                  <p className="text-xs text-[#111110] leading-relaxed font-normal">
                    {brief.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
