import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Link,
  CheckCircle2,
  Tag,
  User,
  Layers,
  BookOpen,
  Calendar,
  Sparkles,
  Flame,
  Award,
  Clock,
  Volume2,
} from 'lucide-react';
import { ArticleStatus, CategoryInfo, Author, EditorialSeries, MagazineIssue } from '../../../types';
import { normalizeImageUrl } from '../../../utils/mediaUtils';

interface EditorMetadataTabProps {
  category: string;
  subcategory: string;
  tags: string[];
  authorId: string;
  seriesName: string;
  issueNumber: string;
  status: ArticleStatus;
  scheduledPublishDate: string;
  heroImage: string;
  heroImageAlt: string;
  heroImageCaption: string;
  heroImageCredit: string;
  heroImageSourceUrl: string;
  isCoverStory: boolean;
  isTrending: boolean;
  isEditorsPick: boolean;
  isUnique: boolean;
  isSpecial: boolean;
  popularityRank: number;
  audioMinutes?: number;
  customReadTime: string;
  categories: CategoryInfo[];
  authors: Author[];
  series: EditorialSeries[];
  issues: MagazineIssue[];
  onCategoryChange: (v: string) => void;
  onSubcategoryChange: (v: string) => void;
  onTagsChange: (tags: string[]) => void;
  onAuthorIdChange: (v: string) => void;
  onSeriesNameChange: (v: string) => void;
  onIssueNumberChange: (v: string) => void;
  onStatusChange: (v: ArticleStatus) => void;
  onScheduledDateChange: (v: string) => void;
  onHeroImageChange: (v: string) => void;
  onHeroImageAltChange: (v: string) => void;
  onHeroImageCaptionChange: (v: string) => void;
  onHeroImageCreditChange: (v: string) => void;
  onHeroImageSourceUrlChange: (v: string) => void;
  onIsCoverStoryChange: (v: boolean) => void;
  onIsTrendingChange: (v: boolean) => void;
  onIsEditorsPickChange: (v: boolean) => void;
  onIsUniqueChange: (v: boolean) => void;
  onIsSpecialChange: (v: boolean) => void;
  onPopularityRankChange: (v: number) => void;
  onAudioMinutesChange: (v?: number) => void;
  onCustomReadTimeChange: (v: string) => void;
}

export const EditorMetadataTab: React.FC<EditorMetadataTabProps> = ({
  category,
  subcategory,
  tags,
  authorId,
  seriesName,
  issueNumber,
  status,
  scheduledPublishDate,
  heroImage,
  heroImageAlt,
  heroImageCaption,
  heroImageCredit,
  heroImageSourceUrl,
  isCoverStory,
  isTrending,
  isEditorsPick,
  isUnique,
  isSpecial,
  popularityRank,
  audioMinutes,
  customReadTime,
  categories,
  authors,
  series,
  issues,
  onCategoryChange,
  onSubcategoryChange,
  onTagsChange,
  onAuthorIdChange,
  onSeriesNameChange,
  onIssueNumberChange,
  onStatusChange,
  onScheduledDateChange,
  onHeroImageChange,
  onHeroImageAltChange,
  onHeroImageCaptionChange,
  onHeroImageCreditChange,
  onHeroImageSourceUrlChange,
  onIsCoverStoryChange,
  onIsTrendingChange,
  onIsEditorsPickChange,
  onIsUniqueChange,
  onIsSpecialChange,
  onPopularityRankChange,
  onAudioMinutesChange,
  onCustomReadTimeChange,
}) => {
  const [tagInput, setTagInput] = useState('');
  const [heroInputMode, setHeroInputMode] = useState<'url' | 'upload'>('url');

  const selectedAuthor = authors.find((a) => a.id === authorId) || authors[0];

  const handleHeroFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onHeroImageChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(clean)) {
        onTagsChange([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tToRemove: string) => {
    onTagsChange(tags.filter((t) => t !== tToRemove));
  };

  const popularSuggestedTags = [
    'Culture',
    'Essays',
    'Design',
    'Architecture',
    'Philosophy',
    'Literature',
    'Art',
    'Field Report',
    'Archive',
  ];

  return (
    <div className="space-y-6">
      {/* 1. Lead Hero Visual */}
      <div className="p-5 bg-white border border-stone-200 rounded-xl space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-serif font-bold text-stone-900">Lead Hero Artwork & Photography</h4>
            <p className="text-xs text-stone-500">
              The primary visual displayed on the article cover, card grid, and social shares.
            </p>
          </div>

          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setHeroInputMode('url')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                heroInputMode === 'url' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
              }`}
            >
              Image URL
            </button>
            <button
              onClick={() => setHeroInputMode('upload')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                heroInputMode === 'upload' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
              }`}
            >
              Upload File
            </button>
          </div>
        </div>

        {heroInputMode === 'url' ? (
          <div>
            <input
              type="text"
              value={heroImage}
              onChange={(e) => onHeroImageChange(e.target.value)}
              placeholder="Enter public high-res image URL (e.g. Unsplash, CDN)..."
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white"
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center hover:border-stone-400 transition-colors bg-stone-50/50">
            <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-stone-700">Drag and drop hero artwork or select file</p>
            <p className="text-[10px] text-stone-400 mt-0.5">PNG, JPG, WebP up to 10MB</p>
            <label className="mt-3 inline-block px-4 py-1.5 bg-stone-900 text-stone-50 text-xs font-semibold rounded-lg cursor-pointer hover:bg-stone-800 transition-colors">
              <span>Choose File</span>
              <input type="file" accept="image/*" onChange={handleHeroFileUpload} className="hidden" />
            </label>
          </div>
        )}

        {heroImage && (
          <div className="relative w-full h-48 sm:h-64 bg-stone-100 rounded-xl overflow-hidden border border-stone-200">
            <img
              src={normalizeImageUrl(heroImage)}
              alt={heroImageAlt || 'Hero visual'}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Accessibility Alt Text (Required)
            </label>
            <input
              type="text"
              value={heroImageAlt}
              onChange={(e) => onHeroImageAltChange(e.target.value)}
              placeholder="Descriptive image summary for screen readers..."
              className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Photographer / Artist Credit
            </label>
            <input
              type="text"
              value={heroImageCredit}
              onChange={(e) => onHeroImageCreditChange(e.target.value)}
              placeholder="Photo by Jane Doe / Magnum Photos..."
              className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Editorial Caption
            </label>
            <input
              type="text"
              value={heroImageCaption}
              onChange={(e) => onHeroImageCaptionChange(e.target.value)}
              placeholder="The morning mist settling over the valley atelier before the first kiln firing..."
              className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>
        </div>
      </div>

      {/* 2. Categorization & Authorship */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category & Subcategory */}
        <div className="p-5 bg-white border border-stone-200 rounded-xl space-y-4 shadow-2xs">
          <h4 className="text-sm font-serif font-bold text-stone-900">Section & Category</h4>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Primary Section</label>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-medium text-stone-800"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.description || 'Editorial'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Subcategory / Topic Deck (Optional)
            </label>
            <input
              type="text"
              value={subcategory}
              onChange={(e) => onSubcategoryChange(e.target.value)}
              placeholder="e.g. Literary Profiles, Archival Studies..."
              className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        {/* Author Selector */}
        <div className="p-5 bg-white border border-stone-200 rounded-xl space-y-4 shadow-2xs">
          <h4 className="text-sm font-serif font-bold text-stone-900">Byline & Author</h4>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Assigned Author</label>
            <select
              value={authorId}
              onChange={(e) => onAuthorIdChange(e.target.value)}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-medium text-stone-800"
            >
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.role || 'Staff Writer'}
                </option>
              ))}
            </select>
          </div>

          {selectedAuthor && (
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200/80">
              <img
                src={selectedAuthor.avatar}
                alt={selectedAuthor.name}
                className="w-10 h-10 rounded-full object-cover border border-stone-200"
              />
              <div className="min-w-0">
                <p className="text-xs font-serif font-bold text-stone-900 truncate">
                  {selectedAuthor.name}
                </p>
                <p className="text-[11px] text-stone-500 truncate">{selectedAuthor.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Tags & Taxonomy */}
      <div className="p-5 bg-white border border-stone-200 rounded-xl space-y-3 shadow-2xs">
        <h4 className="text-sm font-serif font-bold text-stone-900">Editorial Tags</h4>
        <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-stone-50 border border-stone-200 rounded-lg">
          {tags.map((t) => (
            <span
              key={t}
              className="text-xs bg-white border border-stone-300/80 text-stone-800 px-2.5 py-1 rounded-md flex items-center gap-1 font-medium shadow-2xs"
            >
              #{t}
              <button
                onClick={() => handleRemoveTag(t)}
                className="text-stone-400 hover:text-rose-600 ml-1 font-bold"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type tag and press Enter..."
            className="flex-1 min-w-[120px] text-xs bg-transparent border-none focus:outline-none p-1 text-stone-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-stone-400 font-medium">Suggestions:</span>
          {popularSuggestedTags.map((st) => (
            <button
              key={st}
              onClick={() => {
                if (!tags.includes(st)) onTagsChange([...tags, st]);
              }}
              className="text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-600 px-2 py-0.5 rounded transition-colors"
            >
              +{st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Editorial Placement & Flags */}
      <div className="p-5 bg-white border border-stone-200 rounded-xl space-y-4 shadow-2xs">
        <h4 className="text-sm font-serif font-bold text-stone-900">Homepage Curation & Badges</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <label className="p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-start gap-3 cursor-pointer hover:bg-stone-100/70 transition-colors">
            <input
              type="checkbox"
              checked={isCoverStory}
              onChange={(e) => onIsCoverStoryChange(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <div>
              <span className="block text-xs font-bold text-stone-900">Lead Cover Story</span>
              <span className="block text-[11px] text-stone-500">
                Hero spotlight showcase on the magazine homepage.
              </span>
            </div>
          </label>

          <label className="p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-start gap-3 cursor-pointer hover:bg-stone-100/70 transition-colors">
            <input
              type="checkbox"
              checked={isTrending}
              onChange={(e) => onIsTrendingChange(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <div>
              <span className="block text-xs font-bold text-stone-900">Trending Dispatch</span>
              <span className="block text-[11px] text-stone-500">
                Featured in the Trending Stories ticker and carousel.
              </span>
            </div>
          </label>

          <label className="p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-start gap-3 cursor-pointer hover:bg-stone-100/70 transition-colors">
            <input
              type="checkbox"
              checked={isEditorsPick}
              onChange={(e) => onIsEditorsPickChange(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <div>
              <span className="block text-xs font-bold text-stone-900">Editor's Choice</span>
              <span className="block text-[11px] text-stone-500">
                Endorsed by the editor-in-chief with prominent badge.
              </span>
            </div>
          </label>

          <label className="p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-start gap-3 cursor-pointer hover:bg-stone-100/70 transition-colors">
            <input
              type="checkbox"
              checked={isUnique}
              onChange={(e) => onIsUniqueChange(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <div>
              <span className="block text-xs font-bold text-stone-900">Unique Feature</span>
              <span className="block text-[11px] text-stone-500">
                Single-topic singular investigation or bespoke folio.
              </span>
            </div>
          </label>

          <label className="p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-start gap-3 cursor-pointer hover:bg-stone-100/70 transition-colors">
            <input
              type="checkbox"
              checked={isSpecial}
              onChange={(e) => onIsSpecialChange(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <div>
              <span className="block text-xs font-bold text-stone-900">Special Collector's Item</span>
              <span className="block text-[11px] text-stone-500">
                Numbered edition item for archival collectors.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 5. Series & Issue Assignment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white border border-stone-200 rounded-xl space-y-3 shadow-2xs">
          <h4 className="text-sm font-serif font-bold text-stone-900">Editorial Series Collection</h4>
          <select
            value={seriesName}
            onChange={(e) => onSeriesNameChange(e.target.value)}
            className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-medium text-stone-800"
          >
            <option value="">None (Standalone Article)</option>
            {series.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="p-5 bg-white border border-stone-200 rounded-xl space-y-3 shadow-2xs">
          <h4 className="text-sm font-serif font-bold text-stone-900">Magazine Print Issue</h4>
          <select
            value={issueNumber}
            onChange={(e) => onIssueNumberChange(e.target.value)}
            className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-medium text-stone-800"
          >
            <option value="">None (Digital Exclusive)</option>
            {issues.map((iss) => (
              <option key={iss.id} value={iss.number}>
                Issue #{iss.number} — {iss.title} ({iss.date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 6. Publishing Status & Scheduling */}
      <div className="p-5 bg-white border border-stone-200 rounded-xl space-y-4 shadow-2xs">
        <h4 className="text-sm font-serif font-bold text-stone-900">Lifecycle Status & Scheduling</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Publication Status</label>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value as ArticleStatus)}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-bold text-stone-900"
            >
              <option value="DRAFT">Draft (Unpublished, Saved to Vault)</option>
              <option value="IN_REVIEW">In Review (Editorial Evaluation)</option>
              <option value="SCHEDULED">Scheduled for Automated Release</option>
              <option value="PUBLISHED">Published (Live to Worldwide Readers)</option>
              <option value="ARCHIVED">Archived (Unlisted from Index)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Scheduled Release Timestamp (Optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledPublishDate}
              onChange={(e) => onScheduledDateChange(e.target.value)}
              className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
