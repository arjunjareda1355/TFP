import React from 'react';
import { Article, Author, ArticleContentBlock } from '../../../types';
import { EditorContentBlocks } from './EditorContentBlocks';
import { EditorPreviewTab } from './EditorPreviewTab';

interface EditorSplitPreviewProps {
  title: string;
  subtitle: string;
  deck: string;
  category: string;
  blocks: ArticleContentBlock[];
  author?: Author;
  heroImage: string;
  heroImageAlt: string;
  heroImageCaption: string;
  heroImageCredit: string;
  readTime: string;
  audioMinutes?: number;
  onTitleChange: (v: string) => void;
  onSubtitleChange: (v: string) => void;
  onDeckChange: (v: string) => void;
  onAddBlock: (type: ArticleContentBlock['type'], atIndex?: number) => void;
  onUpdateBlock: (index: number, updates: Partial<ArticleContentBlock>) => void;
  onMoveBlock: (index: number, direction: 'up' | 'down') => void;
  onDuplicateBlock: (index: number) => void;
  onDeleteBlock: (index: number) => void;
}

export const EditorSplitPreview: React.FC<EditorSplitPreviewProps> = ({
  title,
  subtitle,
  deck,
  category,
  blocks,
  author,
  heroImage,
  heroImageAlt,
  heroImageCaption,
  heroImageCredit,
  readTime,
  audioMinutes,
  onTitleChange,
  onSubtitleChange,
  onDeckChange,
  onAddBlock,
  onUpdateBlock,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
}) => {
  const previewArticle: Partial<Article> = {
    title,
    subtitle,
    deck,
    category,
    blocks,
    heroImage,
    heroImageAlt,
    heroImageCaption,
    heroImageCredit,
    readTime,
    audioMinutes,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left Pane: Writing Canvas */}
      <div className="space-y-6 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-serif font-bold text-stone-900 mb-1">
              Headline
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Article headline..."
              className="w-full text-xl font-serif font-bold text-stone-950 p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-serif font-bold text-stone-900 mb-1">
              Deck / Subtitle
            </label>
            <textarea
              rows={2}
              value={deck || subtitle}
              onChange={(e) => {
                onDeckChange(e.target.value);
                onSubtitleChange(e.target.value);
              }}
              placeholder="Thesis or excerpt..."
              className="w-full text-xs font-serif italic text-stone-800 p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white resize-none"
            />
          </div>
        </div>

        <EditorContentBlocks
          blocks={blocks}
          onAddBlock={onAddBlock}
          onUpdateBlock={onUpdateBlock}
          onMoveBlock={onMoveBlock}
          onDuplicateBlock={onDuplicateBlock}
          onDeleteBlock={onDeleteBlock}
        />
      </div>

      {/* Right Pane: Live Synchronized Preview */}
      <div className="sticky top-20">
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 shadow-xs max-h-[85vh] overflow-y-auto">
          <div className="mb-3 flex items-center justify-between pb-2 border-b border-stone-200 text-xs">
            <span className="font-serif font-bold text-stone-900">Live Reader Simulation</span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Instant Sync Active
            </span>
          </div>
          <EditorPreviewTab article={previewArticle} author={author} />
        </div>
      </div>
    </div>
  );
};
