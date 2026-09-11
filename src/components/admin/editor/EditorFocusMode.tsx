import React from 'react';
import {
  Minimize2,
  Sparkles,
  Save,
  Clock,
  Type,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Quote,
  Heading2,
  FileText,
} from 'lucide-react';
import { ArticleContentBlock } from '../../../types';

interface EditorFocusModeProps {
  title: string;
  subtitle: string;
  deck: string;
  blocks: ArticleContentBlock[];
  totalWords: number;
  readTime: string;
  autoSaveStatus: string;
  onTitleChange: (v: string) => void;
  onSubtitleChange: (v: string) => void;
  onDeckChange: (v: string) => void;
  onUpdateBlock: (index: number, updates: Partial<ArticleContentBlock>) => void;
  onAddBlock: (type: ArticleContentBlock['type']) => void;
  onDeleteBlock: (index: number) => void;
  onExitFocus: () => void;
  onSaveDraft: () => void;
}

export const EditorFocusMode: React.FC<EditorFocusModeProps> = ({
  title,
  subtitle,
  deck,
  blocks,
  totalWords,
  readTime,
  autoSaveStatus,
  onTitleChange,
  onSubtitleChange,
  onDeckChange,
  onUpdateBlock,
  onAddBlock,
  onDeleteBlock,
  onExitFocus,
  onSaveDraft,
}) => {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 py-12 px-4 sm:px-6 relative">
      {/* Floating Top Exit Control */}
      <div className="fixed top-6 right-6 z-40 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200/80 shadow-xs">
        <span className="text-[11px] font-mono text-stone-500 font-medium">Zen Mode</span>
        <button
          onClick={onExitFocus}
          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
          title="Exit Focus Mode (Return to Studio)"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Focus Writing Sheet */}
      <div className="max-w-2xl mx-auto space-y-8 pt-4 pb-24">
        {/* Title input */}
        <textarea
          rows={2}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Title of your dispatch..."
          className="w-full text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-950 placeholder-stone-300 bg-transparent border-none focus:outline-none resize-none leading-tight tracking-tight"
        />

        {/* Deck / Subtitle input */}
        <textarea
          rows={2}
          value={deck || subtitle}
          onChange={(e) => {
            onDeckChange(e.target.value);
            onSubtitleChange(e.target.value);
          }}
          placeholder="An arresting deck, thesis, or inquiry subtitle..."
          className="w-full text-lg sm:text-xl font-serif italic text-stone-600 placeholder-stone-300 bg-transparent border-none focus:outline-none resize-none leading-relaxed"
        />

        <div className="w-16 h-0.5 bg-stone-300/80 my-4" />

        {/* Content Blocks */}
        <div className="space-y-6">
          {blocks.map((block, idx) => (
            <div key={idx} className="group relative">
              {block.type === 'heading2' ? (
                <input
                  type="text"
                  value={block.text || ''}
                  onChange={(e) => onUpdateBlock(idx, { text: e.target.value })}
                  placeholder="Section heading..."
                  className="w-full text-2xl font-serif font-bold text-stone-900 bg-transparent border-none focus:outline-none placeholder-stone-300 pt-4"
                />
              ) : block.type === 'heading3' ? (
                <input
                  type="text"
                  value={block.text || ''}
                  onChange={(e) => onUpdateBlock(idx, { text: e.target.value })}
                  placeholder="Sub-heading..."
                  className="w-full text-xl font-serif font-semibold text-stone-800 bg-transparent border-none focus:outline-none placeholder-stone-300 pt-2"
                />
              ) : block.type === 'blockquote' ? (
                <div className="border-l-2 border-stone-800 pl-4 py-1 space-y-2">
                  <textarea
                    rows={3}
                    value={block.text || ''}
                    onChange={(e) => onUpdateBlock(idx, { text: e.target.value })}
                    placeholder="Quotation text..."
                    className="w-full text-lg font-serif italic text-stone-800 bg-transparent border-none focus:outline-none resize-none placeholder-stone-300"
                  />
                  <input
                    type="text"
                    value={block.cite || ''}
                    onChange={(e) => onUpdateBlock(idx, { cite: e.target.value })}
                    placeholder="— Citation attribution..."
                    className="w-full text-xs font-sans text-stone-500 bg-transparent border-none focus:outline-none placeholder-stone-300"
                  />
                </div>
              ) : block.type === 'callout' || block.type === 'highlight' ? (
                <div className="p-5 rounded-xl border border-stone-200 bg-white/80 space-y-2">
                  <input
                    type="text"
                    value={block.title || ''}
                    onChange={(e) => onUpdateBlock(idx, { title: e.target.value })}
                    placeholder="Insight Title..."
                    className="w-full text-xs uppercase tracking-widest font-bold text-stone-800 bg-transparent border-none focus:outline-none"
                  />
                  <textarea
                    rows={3}
                    value={block.text || ''}
                    onChange={(e) => onUpdateBlock(idx, { text: e.target.value })}
                    placeholder="Insight analysis..."
                    className="w-full text-sm text-stone-700 bg-transparent border-none focus:outline-none resize-none"
                  />
                </div>
              ) : (
                <div className="relative">
                  {block.dropCap && idx === 0 && (
                    <span className="float-left text-5xl font-serif font-bold text-stone-900 pr-3 leading-none select-none">
                      {(block.text || 'T')[0]}
                    </span>
                  )}
                  <textarea
                    rows={Math.max(3, Math.ceil((block.text || '').length / 60))}
                    value={block.text || ''}
                    onChange={(e) => onUpdateBlock(idx, { text: e.target.value })}
                    placeholder="Continue your prose..."
                    className="w-full text-base sm:text-lg font-serif leading-relaxed text-stone-800 bg-transparent border-none focus:outline-none resize-none placeholder-stone-300"
                  />
                </div>
              )}

              {/* Hover Block Toolbar */}
              <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-stone-200/90 shadow-xs z-10">
                <button
                  onClick={() => onDeleteBlock(idx)}
                  className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors shrink-0"
                  title="Remove block"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Append Controls */}
        <div className="pt-8 flex items-center justify-center gap-2 sm:gap-3 flex-wrap border-t border-stone-200/60">
          <button
            onClick={() => onAddBlock('paragraph')}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-xs font-medium text-stone-700 flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Paragraph</span>
          </button>
          <button
            onClick={() => onAddBlock('heading2')}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-xs font-medium text-stone-700 flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
          >
            <Heading2 className="w-3.5 h-3.5" />
            <span>Heading</span>
          </button>
          <button
            onClick={() => onAddBlock('blockquote')}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-xs font-medium text-stone-700 flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
          >
            <Quote className="w-3.5 h-3.5" />
            <span>Quote</span>
          </button>
        </div>
      </div>

      {/* Floating Bottom Telemetry Bar */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900/95 backdrop-blur-md text-stone-200 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg border border-stone-700 flex items-center gap-2 sm:gap-4 text-xs font-sans max-w-[95vw] shrink-0">
        <span className="font-serif font-bold text-stone-100 hidden sm:inline">The Folded Page Focus</span>
        <span className="text-stone-600 hidden sm:inline">•</span>
        <span className="shrink-0">{totalWords} words</span>
        <span className="text-stone-600">•</span>
        <span className="shrink-0">{readTime}</span>
        <span className="text-stone-600 hidden sm:inline">•</span>
        <span className="text-emerald-400 hidden sm:flex items-center gap-1 shrink-0">
          <Clock className="w-3.5 h-3.5" />
          Auto-Saving
        </span>
        <button
          onClick={onSaveDraft}
          className="ml-1 sm:ml-2 px-3 py-1 bg-stone-100 hover:bg-white text-stone-900 rounded-full font-semibold transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap"
        >
          <Save className="w-3 h-3 shrink-0" />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
};
