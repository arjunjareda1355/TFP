import React, { useState } from 'react';
import { useMagazine } from '../context/MagazineContext';
import { ArticleCard } from '../components/ArticleCard';
import { ArrowLeft, Sparkles, Filter, Grid, List } from 'lucide-react';
import { Article } from '../types';

interface CategoryPageProps {
  categorySlug: string;
  onSelectStory: (slug: string) => void;
  onNavigateCategory: (slug: string) => void;
  onBack: () => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categorySlug,
  onSelectStory,
  onNavigateCategory,
  onBack,
}) => {
  const { articles, categories } = useMagazine();
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [layoutView, setLayoutView] = useState<'grid' | 'list'>('grid');

  const publishedArticles = articles.filter((a) => a.status === 'PUBLISHED' || !a.status);

  const currentCategory = categories.find(
    (c) => c.slug.toLowerCase() === categorySlug.toLowerCase()
  ) || {
    id: categorySlug,
    name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
    slug: categorySlug,
    tagline: 'Curated stories and discoveries.',
    description: `Exploring all dispatches filed under ${categorySlug}.`,
    accentColor: '#EA580C',
    iconName: 'Compass',
  };

  // Filter articles for this category
  let categoryArticles: Article[] = [];
  if (categorySlug === 'trending') {
    categoryArticles = publishedArticles.filter((a) => a.isTrending);
  } else if (categorySlug === 'popular') {
    categoryArticles = [...publishedArticles].sort(
      (a, b) => (a.popularityRank || 99) - (b.popularityRank || 99)
    );
  } else if (categorySlug === 'unique') {
    categoryArticles = publishedArticles.filter((a) => a.isUnique || a.category === 'Unique');
  } else if (categorySlug === 'special') {
    categoryArticles = publishedArticles.filter((a) => a.isSpecial || a.category === 'Special');
  } else {
    categoryArticles = publishedArticles.filter(
      (a) =>
        a.category.toLowerCase() === categorySlug.toLowerCase() ||
        a.subcategory?.toLowerCase().includes(categorySlug.toLowerCase())
    );
  }

  // Fallback if small category
  if (categoryArticles.length === 0) {
    categoryArticles = publishedArticles.slice(0, 6);
  }

  // All unique tags in this category
  const allTags = Array.from(new Set(categoryArticles.flatMap((a) => a.tags || [])));

  const filteredArticles = selectedTag === 'all'
    ? categoryArticles
    : categoryArticles.filter((a) => a.tags?.includes(selectedTag));

  const leadStory = filteredArticles[0];
  const restStories = filteredArticles.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FFFFFF] text-[#111110]">
      {/* Breadcrumb navigation */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8E5DF]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6E6A62] hover:text-[#EA580C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        {/* Categories selector pills */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.slice(0, 8).map((c) => (
            <button
              key={c.id}
              onClick={() => onNavigateCategory(c.slug)}
              className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-xs transition-colors ${
                c.slug.toLowerCase() === categorySlug.toLowerCase()
                  ? 'bg-[#EA580C] text-white'
                  : 'text-[#6E6A62] hover:text-[#111110] hover:bg-[#F5F4F0]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Category Header */}
      <header className="max-w-3xl mb-12">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-2 font-mono-editorial">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EDITORIAL DESK</span>
        </div>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl font-medium tracking-tight text-[#111110] mb-3">
          {currentCategory.name}
        </h1>
        <p className="font-serif-editorial italic text-xl text-[#55524B] mb-4">
          "{currentCategory.tagline}"
        </p>
        <p className="text-sm sm:text-base text-[#55524B] font-normal leading-relaxed">
          {currentCategory.description}
        </p>
      </header>

      {/* Filter by Tag Bar & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 mb-8 border-y border-[#E8E5DF]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-mono-editorial text-[#6E6A62] uppercase flex items-center gap-1 shrink-0 font-bold">
            <Filter className="w-3 h-3 text-[#EA580C]" /> Filter:
          </span>
          <button
            onClick={() => setSelectedTag('all')}
            className={`text-xs px-3 py-1 font-mono-editorial transition-colors rounded-xs ${
              selectedTag === 'all'
                ? 'bg-[#EA580C] text-white font-semibold'
                : 'bg-[#F9F8F6] border border-[#E8E5DF] text-[#55524B] hover:text-[#111110] hover:border-[#EA580C]'
            }`}
          >
            All ({categoryArticles.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`text-xs px-3 py-1 font-mono-editorial transition-colors shrink-0 rounded-xs ${
                selectedTag === tag
                  ? 'bg-[#EA580C] text-white font-semibold'
                  : 'bg-[#F9F8F6] border border-[#E8E5DF] text-[#55524B] hover:text-[#111110] hover:border-[#EA580C]'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setLayoutView('grid')}
            className={`p-1.5 border rounded-xs ${layoutView === 'grid' ? 'bg-[#EA580C] text-white border-[#EA580C]' : 'bg-[#FFFFFF] text-[#6E6A62] border-[#E8E5DF] hover:text-[#111110]'}`}
            title="Grid view"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setLayoutView('list')}
            className={`p-1.5 border rounded-xs ${layoutView === 'list' ? 'bg-[#EA580C] text-white border-[#EA580C]' : 'bg-[#FFFFFF] text-[#6E6A62] border-[#E8E5DF] hover:text-[#111110]'}`}
            title="List view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Featured Lead Story */}
      {leadStory && selectedTag === 'all' && (
        <div className="mb-14 pb-12 border-b border-[#E8E5DF]">
          <span className="text-[10px] font-bold font-mono-editorial uppercase tracking-widest text-[#EA580C] block mb-3">
            DESK LEAD STORY
          </span>
          <div
            onClick={() => onSelectStory(leadStory.slug)}
            className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FFFFFF] border border-[#E8E5DF] p-6 sm:p-8 hover:border-[#EA580C] transition-all rounded-xs shadow-xs hover:shadow-md"
          >
            <div className="lg:col-span-7 aspect-[16/10] overflow-hidden bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs">
              <img
                src={leadStory.heroImage}
                alt={leadStory.title}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
              />
            </div>
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-mono-editorial text-[#6E6A62]">
                {leadStory.publishedDate} • {leadStory.readTime}
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-4xl font-medium text-[#111110] group-hover:text-[#EA580C] transition-colors leading-tight">
                {leadStory.title}
              </h2>
              <p className="text-sm sm:text-base text-[#55524B] font-normal leading-relaxed">
                {leadStory.deck || leadStory.subtitle}
              </p>
              <div className="pt-2 text-xs font-semibold uppercase tracking-wider text-[#EA580C] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Read Full Dispatch →
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stories Grid / List */}
      {layoutView === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(selectedTag === 'all' ? restStories : filteredArticles).map((story) => (
            <div key={story.id} className="bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs shadow-xs">
              <ArticleCard
                article={story}
                variant="medium"
                onSelect={onSelectStory}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {(selectedTag === 'all' ? restStories : filteredArticles).map((story) => (
            <div
              key={story.id}
              onClick={() => onSelectStory(story.slug)}
              className="group cursor-pointer bg-[#FFFFFF] border border-[#E8E5DF] hover:border-[#EA580C] p-4 sm:p-5 rounded-xs shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <img
                  src={story.heroImage}
                  alt={story.title}
                  className="w-20 h-20 sm:w-28 sm:h-20 object-cover rounded-xs border border-[#E8E5DF] shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-mono-editorial text-[#6E6A62] mb-1">
                    <span className="text-[#EA580C] font-semibold">{story.category}</span>
                    <span>•</span>
                    <span>{story.publishedDate}</span>
                    <span>•</span>
                    <span>{story.readTime}</span>
                  </div>
                  <h3 className="font-serif-editorial font-bold text-lg text-[#111110] group-hover:text-[#EA580C] transition-colors leading-snug line-clamp-1">
                    {story.title}
                  </h3>
                  <p className="text-xs text-[#55524B] line-clamp-2 mt-1 leading-relaxed hidden sm:block">
                    {story.deck || story.subtitle}
                  </p>
                  <div className="text-[11px] text-[#8E8A81] font-mono-editorial mt-1">
                    By {story.author.name}
                  </div>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#EA580C] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Read →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredArticles.length === 0 && (
        <div className="py-20 text-center space-y-3">
          <p className="font-serif-editorial text-2xl text-[#111110]">
            "Nothing here yet. Check back soon."
          </p>
          <p className="text-sm text-[#6E6A62] font-normal">
            Our editors are actively researching new dispatches for #{selectedTag}.
          </p>
        </div>
      )}
    </div>
  );
};
