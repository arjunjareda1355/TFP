import React from 'react';
import {
  Globe,
  Share2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { normalizeImageUrl } from '../../../utils/mediaUtils';

interface EditorSeoTabProps {
  title: string;
  deck: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  heroImage: string;
  onSlugChange: (v: string) => void;
  onMetaTitleChange: (v: string) => void;
  onMetaDescriptionChange: (v: string) => void;
  onCanonicalUrlChange: (v: string) => void;
}

export const EditorSeoTab: React.FC<EditorSeoTabProps> = ({
  title,
  deck,
  slug,
  metaTitle,
  metaDescription,
  canonicalUrl,
  heroImage,
  onSlugChange,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onCanonicalUrlChange,
}) => {
  const displayTitle = metaTitle.trim() || title.trim() || 'Untitled Dispatch';
  const displayDesc = metaDescription.trim() || deck.trim() || 'Read the full inquiry and discovery on The Folded Page.';
  const displayUrl = `https://thefoldedpage.org/article/${slug || 'dispatch'}`;

  const titleLength = displayTitle.length;
  const descLength = displayDesc.length;

  return (
    <div className="space-y-6">
      {/* 1. Meta Tags Form */}
      <div className="p-5 bg-white border border-stone-200 rounded-xl space-y-4 shadow-2xs">
        <h4 className="text-sm font-serif font-bold text-stone-900">Search Engine Metadata</h4>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-stone-700">SEO Page Title</label>
            <span
              className={`text-[11px] font-mono ${
                titleLength > 60 ? 'text-rose-600 font-bold' : titleLength >= 40 ? 'text-emerald-600' : 'text-stone-400'
              }`}
            >
              {titleLength}/60 chars
            </span>
          </div>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder={title || 'Enter search title...'}
            className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white"
          />
          <p className="text-[11px] text-stone-400 mt-1">
            Recommended length: 50-60 characters for optimal display in Google SERPs.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-stone-700">Meta Description</label>
            <span
              className={`text-[11px] font-mono ${
                descLength > 160 ? 'text-rose-600 font-bold' : descLength >= 120 ? 'text-emerald-600' : 'text-stone-400'
              }`}
            >
              {descLength}/160 chars
            </span>
          </div>
          <textarea
            rows={3}
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder={deck || 'Enter search excerpt and meta summary...'}
            className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white"
          />
          <p className="text-[11px] text-stone-400 mt-1">
            Recommended length: 120-160 characters.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            URL Permalink Slug
          </label>
          <div className="flex items-center">
            <span className="text-xs text-stone-400 bg-stone-100 px-3 py-2 border border-r-0 border-stone-200 rounded-l-lg select-none">
              /article/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) =>
                onSlugChange(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                )
              }
              placeholder="url-friendly-slug"
              className="flex-1 text-xs p-2 bg-stone-50 border border-stone-200 rounded-r-lg font-mono focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Canonical URL (Optional)
          </label>
          <input
            type="text"
            value={canonicalUrl}
            onChange={(e) => onCanonicalUrlChange(e.target.value)}
            placeholder="https://thefoldedpage.org/article/original-slug (leave blank if original)"
            className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* 2. Google SERP Live Simulation */}
      <div className="p-5 bg-white border border-stone-200 rounded-xl space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 text-stone-700">
          <Search className="w-4 h-4 text-stone-400" />
          <h4 className="text-xs font-serif font-bold uppercase tracking-wider">
            Google Search Preview
          </h4>
        </div>

        <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-1 font-sans">
          <div className="flex items-center gap-2 text-[11px] text-stone-500">
            <Globe className="w-3 h-3 text-stone-400" />
            <span className="truncate">{displayUrl}</span>
          </div>
          <h5 className="text-base text-blue-700 hover:underline cursor-pointer font-medium leading-snug line-clamp-1">
            {displayTitle} | The Folded Page
          </h5>
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {displayDesc}
          </p>
        </div>
      </div>

      {/* 3. OpenGraph / Twitter Social Card Live Preview */}
      <div className="p-5 bg-white border border-stone-200 rounded-xl space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 text-stone-700">
          <Share2 className="w-4 h-4 text-stone-400" />
          <h4 className="text-xs font-serif font-bold uppercase tracking-wider">
            Social Card Preview (X / Twitter & LinkedIn)
          </h4>
        </div>

        <div className="max-w-md bg-stone-50 border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
          {heroImage ? (
            <div className="h-44 bg-stone-200 overflow-hidden">
              <img
                src={normalizeImageUrl(heroImage)}
                alt="Social Preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-32 bg-stone-900 flex items-center justify-center text-stone-400 text-xs font-serif">
              The Folded Page Publication
            </div>
          )}
          <div className="p-3.5 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-mono">
              thefoldedpage.org
            </span>
            <h5 className="text-sm font-serif font-bold text-stone-900 line-clamp-1">
              {displayTitle}
            </h5>
            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-sans">
              {displayDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
