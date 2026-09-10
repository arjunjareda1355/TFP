import React from 'react';
import { useMagazine } from '../context/MagazineContext';
import { HeroCoverStory } from '../components/HeroCoverStory';
import { TrendingGrid } from '../components/TrendingGrid';
import { TheFoldSection } from '../components/TheFoldSection';
import { PopularRankedList } from '../components/PopularRankedList';
import { UniqueShowcase } from '../components/UniqueShowcase';
import { SpecialCinematic } from '../components/SpecialCinematic';
import { EditorialSeriesStrip } from '../components/EditorialSeriesStrip';
import { IssuesTeaser } from '../components/IssuesTeaser';
import { NewsletterBox } from '../components/NewsletterBox';

interface HomePageProps {
  onSelectStory: (slug: string) => void;
  onNavigateCategory: (categorySlug: string) => void;
  onNavigateIssues: () => void;
  onSelectIssue: (issueId: string) => void;
  onSelectSeries: (seriesId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectStory,
  onNavigateCategory,
  onNavigateIssues,
  onSelectIssue,
  onSelectSeries,
}) => {
  const {
    coverStory,
    trendingStories,
    foldStories,
    popularStories,
    uniqueStories,
    specialStories,
  } = useMagazine();

  if (!coverStory) {
    return (
      <div className="w-full py-32 text-center text-[#6E6A62]">
        <p className="font-serif-editorial text-xl italic">Curating dispatches from around the world...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 1. HERO / COVER STORY */}
      <HeroCoverStory article={coverStory} onSelect={onSelectStory} />

      {/* 2. TRENDING NOW */}
      <TrendingGrid
        articles={trendingStories}
        onSelect={onSelectStory}
        onViewCategory={() => onNavigateCategory('trending')}
      />

      {/* 3. THE FOLD — Signature Section */}
      <TheFoldSection
        articles={foldStories}
        onSelect={onSelectStory}
      />

      {/* 4. POPULAR RIGHT NOW */}
      <PopularRankedList
        articles={popularStories}
        onSelect={onSelectStory}
        onViewCategory={() => onNavigateCategory('popular')}
      />

      {/* 5. UNIQUE */}
      <UniqueShowcase
        articles={uniqueStories}
        onSelect={onSelectStory}
        onViewCategory={() => onNavigateCategory('unique')}
      />

      {/* 6. SPECIAL */}
      <SpecialCinematic
        articles={specialStories}
        onSelect={onSelectStory}
        onViewCategory={() => onNavigateCategory('special')}
      />

      {/* 7. EDITORIAL SERIES */}
      <EditorialSeriesStrip onSelectSeries={onSelectSeries} />

      {/* 8. ISSUE SYSTEM TEASER (Editions) */}
      <IssuesTeaser
        onViewIssues={onNavigateIssues}
        onSelectIssue={onSelectIssue}
      />

      {/* 9. NEWSLETTER CTA (The Folded Letter) */}
      <NewsletterBox />
    </div>
  );
};
