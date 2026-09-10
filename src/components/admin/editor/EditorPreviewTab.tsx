import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Clock,
  Volume2,
  Share2,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { Article, Author } from '../../../types';
import { normalizeImageUrl } from '../../../utils/mediaUtils';

interface EditorPreviewTabProps {
  article: Partial<Article>;
  author?: Author;
}

export const EditorPreviewTab: React.FC<EditorPreviewTabProps> = ({
  article,
  author,
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const blocks = article.blocks || [];
  const currentAuthor = author || article.author || {
    name: 'The Editorial Desk',
    role: 'Staff Writer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Writers and correspondents of The Folded Page.',
  };

  const getContainerWidth = () => {
    if (device === 'mobile') return 'max-w-[390px]';
    if (device === 'tablet') return 'max-w-[768px]';
    return 'max-w-4xl';
  };

  return (
    <div className="space-y-6">
      {/* Device Toolbar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-serif font-bold text-stone-900">Device Viewport:</span>
          <div className="flex items-center bg-stone-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setDevice('desktop')}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all font-medium ${
                device === 'desktop' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all font-medium ${
                device === 'tablet' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all font-medium ${
                device === 'mobile' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone</span>
            </button>
          </div>
        </div>

        <span className="text-[11px] font-mono text-stone-400">
          {device === 'desktop' ? '100% Fluid Width' : device === 'tablet' ? '768px Width' : '390px Width'}
        </span>
      </div>

      {/* Simulated Preview Container */}
      <div className="flex justify-center p-4 sm:p-8 bg-stone-100 rounded-2xl border border-stone-200 overflow-x-auto min-h-[700px]">
        <div
          className={`w-full ${getContainerWidth()} bg-[#faf8f5] border border-stone-300/80 rounded-2xl shadow-xl overflow-hidden transition-all duration-300`}
        >
          {/* Magazine Article Header */}
          <article className="p-6 sm:p-10 md:p-12 space-y-8">
            {/* Category & Series */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-widest text-amber-900 bg-amber-50 px-2.5 py-1 rounded border border-amber-200/60">
                {article.category || 'Culture'}
              </span>
              {article.seriesName && (
                <span className="text-[11px] font-serif italic text-stone-500">
                  Series: {article.seriesName}
                </span>
              )}
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-950 leading-[1.15] tracking-tight">
              {article.title || 'Untitled Dispatch'}
            </h1>

            {/* Deck */}
            {article.deck && (
              <p className="text-base sm:text-xl font-serif italic text-stone-600 leading-relaxed max-w-2xl">
                {article.deck}
              </p>
            )}

            {/* Author Byline & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-stone-200/80">
              <div className="flex items-center gap-3">
                <img
                  src={currentAuthor.avatar}
                  alt={currentAuthor.name}
                  className="w-10 h-10 rounded-full object-cover border border-stone-200"
                />
                <div>
                  <p className="text-xs font-serif font-bold text-stone-900">{currentAuthor.name}</p>
                  <p className="text-[11px] text-stone-500">{currentAuthor.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readTime || '4 min read'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-stone-700">
                  <Volume2 className="w-3.5 h-3.5 text-amber-800" />
                  {article.audioMinutes || 5} min audio
                </span>
              </div>
            </div>

            {/* Hero Image Spread */}
            {article.heroImage && (
              <figure className="space-y-2 -mx-6 sm:-mx-10 md:-mx-12">
                <div className="w-full h-64 sm:h-96 md:h-[450px] overflow-hidden bg-stone-200">
                  <img
                    src={normalizeImageUrl(article.heroImage)}
                    alt={article.heroImageAlt || 'Hero visual'}
                    className="w-full h-full object-cover"
                  />
                </div>
                {(article.heroImageCaption || article.heroImageCredit) && (
                  <figcaption className="px-6 sm:px-10 md:px-12 text-xs text-stone-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1 italic">
                    <span>{article.heroImageCaption}</span>
                    <span className="font-sans not-italic text-[11px] text-stone-400">
                      {article.heroImageCredit}
                    </span>
                  </figcaption>
                )}
              </figure>
            )}

            {/* Article Content Blocks */}
            <div className="space-y-6 pt-4 max-w-2xl mx-auto font-serif text-stone-800 text-base sm:text-lg leading-relaxed">
              {blocks.map((block, idx) => {
                if (block.type === 'heading2') {
                  return (
                    <h2 key={idx} className="text-2xl sm:text-3xl font-bold text-stone-900 pt-6 tracking-tight">
                      {block.text}
                    </h2>
                  );
                }
                if (block.type === 'heading3') {
                  return (
                    <h3 key={idx} className="text-xl sm:text-2xl font-semibold text-stone-800 pt-4">
                      {block.text}
                    </h3>
                  );
                }
                if (block.type === 'blockquote') {
                  return (
                    <blockquote key={idx} className="my-6 pl-5 border-l-2 border-amber-900 italic text-stone-800 font-serif text-lg sm:text-xl space-y-2">
                      <p>"{block.text}"</p>
                      {block.cite && (
                        <cite className="block text-xs font-sans not-italic text-stone-500 font-medium">
                          — {block.cite}
                        </cite>
                      )}
                    </blockquote>
                  );
                }
                if (block.type === 'callout') {
                  const toneColors = {
                    sage: 'bg-emerald-50/70 border-emerald-200 text-emerald-950',
                    amber: 'bg-amber-50/70 border-amber-200 text-amber-950',
                    indigo: 'bg-indigo-50/70 border-indigo-200 text-indigo-950',
                    default: 'bg-stone-100 border-stone-200 text-stone-900',
                  };
                  const color = toneColors[block.calloutTone || 'default'] || toneColors.default;
                  return (
                    <div key={idx} className={`my-6 p-6 rounded-xl border ${color} space-y-2`}>
                      {block.title && (
                        <h4 className="text-xs uppercase font-sans font-bold tracking-wider">
                          {block.title}
                        </h4>
                      )}
                      <p className="text-sm sm:text-base leading-relaxed font-sans">{block.text}</p>
                    </div>
                  );
                }
                if (block.type === 'highlight') {
                  return (
                    <div key={idx} className="my-8 py-6 px-4 text-center border-y border-stone-200 space-y-2">
                      {block.title && (
                        <span className="block text-4xl sm:text-5xl font-serif font-bold text-amber-900">
                          {block.title}
                        </span>
                      )}
                      <p className="text-base sm:text-lg italic text-stone-700 max-w-lg mx-auto">
                        {block.text}
                      </p>
                    </div>
                  );
                }
                if (block.type === 'image') {
                  return (
                    <figure key={idx} className="my-8 space-y-2">
                      <div className="rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                        <img
                          src={normalizeImageUrl(block.imageUrl || '')}
                          alt={block.imageAlt || ''}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                      {block.imageCaption && (
                        <figcaption className="text-xs text-stone-500 italic text-center">
                          {block.imageCaption}
                        </figcaption>
                      )}
                    </figure>
                  );
                }
                if (block.type === 'list') {
                  return (
                    <div key={idx} className="my-6">
                      {block.ordered ? (
                        <ol className="list-decimal pl-5 space-y-2 font-sans text-sm sm:text-base">
                          {(block.items || []).map((it, i) => (
                            <li key={i}>{it}</li>
                          ))}
                        </ol>
                      ) : (
                        <ul className="list-disc pl-5 space-y-2 font-sans text-sm sm:text-base">
                          {(block.items || []).map((it, i) => (
                            <li key={i}>{it}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                }
                if (block.type === 'divider') {
                  return (
                    <div key={idx} className="py-8 flex items-center justify-center">
                      <div className="w-16 h-px bg-stone-300" />
                    </div>
                  );
                }

                // Standard Paragraph
                return (
                  <p key={idx} className="mb-4">
                    {block.dropCap && idx === 0 && (
                      <span className="float-left text-5xl font-serif font-bold text-stone-900 pr-3 leading-none select-none">
                        {(block.text || 'T')[0]}
                      </span>
                    )}
                    {block.dropCap && idx === 0
                      ? (block.text || '').slice(1)
                      : block.text}
                  </p>
                );
              })}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
