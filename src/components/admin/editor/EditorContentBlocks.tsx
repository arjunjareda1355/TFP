import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Copy,
  Heading2,
  Heading3,
  Quote,
  Image as ImageIcon,
  List,
  Film,
  Sparkles,
  AlignLeft,
  ChevronDown,
  Check,
  Type,
  Square,
  Volume2,
  Upload,
} from 'lucide-react';
import { ArticleContentBlock, ContentBlockType, GalleryImage } from '../../../types';
import { normalizeImageUrl, parseVideoUrl } from '../../../utils/mediaUtils';

interface EditorContentBlocksProps {
  blocks: ArticleContentBlock[];
  onAddBlock: (type: ContentBlockType, atIndex?: number) => void;
  onUpdateBlock: (index: number, updates: Partial<ArticleContentBlock>) => void;
  onMoveBlock: (index: number, direction: 'up' | 'down') => void;
  onDuplicateBlock: (index: number) => void;
  onDeleteBlock: (index: number) => void;
}

export const EditorContentBlocks: React.FC<EditorContentBlocksProps> = ({
  blocks,
  onAddBlock,
  onUpdateBlock,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
}) => {
  const [insertDropdownIndex, setInsertDropdownIndex] = useState<number | null>(null);

  const blockTypeOptions: { type: ContentBlockType; label: string; icon: any }[] = [
    { type: 'paragraph', label: 'Paragraph', icon: AlignLeft },
    { type: 'heading2', label: 'Section Header (H2)', icon: Heading2 },
    { type: 'heading3', label: 'Sub-Header (H3)', icon: Heading3 },
    { type: 'blockquote', label: 'Editorial Quote', icon: Quote },
    { type: 'callout', label: 'Key Insight Box', icon: Sparkles },
    { type: 'highlight', label: 'Pull Stat / Highlight', icon: Type },
    { type: 'image', label: 'Figure Image', icon: ImageIcon },
    { type: 'gallery', label: 'Photo Spread / Gallery', icon: Square },
    { type: 'list', label: 'Observations List', icon: List },
    { type: 'video', label: 'Video Embed', icon: Film },
    { type: 'divider', label: 'Ornamental Divider', icon: AlignLeft },
  ];

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateBlock(index, {
            imageUrl: reader.result,
            sourceType: 'UPLOAD',
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <div>
          <h3 className="text-sm font-serif font-bold text-stone-900">Story Content & Narrative Layout</h3>
          <p className="text-xs text-stone-500">
            Build your essay with modular typography, visual dispatches, and blockquotes.
          </p>
        </div>

        <button
          onClick={() => onAddBlock('paragraph')}
          className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Block</span>
        </button>
      </div>

      {/* Blocks List */}
      <div className="space-y-4">
        {blocks.map((block, idx) => (
          <div
            key={idx}
            className="group relative p-4 rounded-xl border border-stone-200 hover:border-stone-300 bg-white transition-all shadow-2xs"
          >
            {/* Block Header & Controls */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-stone-400 font-semibold">#{idx + 1}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-stone-100 text-stone-700 rounded">
                  {block.type}
                </span>
                {block.type === 'paragraph' && (
                  <label className="flex items-center gap-1.5 ml-2 cursor-pointer text-stone-600 hover:text-stone-900 select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(block.dropCap)}
                      onChange={(e) => onUpdateBlock(idx, { dropCap: e.target.checked })}
                      className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                    />
                    <span className="text-[11px]">Drop Cap</span>
                  </label>
                )}
              </div>

              {/* Block Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onMoveBlock(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-30 rounded hover:bg-stone-100"
                  title="Move Up"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onMoveBlock(idx, 'down')}
                  disabled={idx === blocks.length - 1}
                  className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-30 rounded hover:bg-stone-100"
                  title="Move Down"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDuplicateBlock(idx)}
                  className="p-1 text-stone-400 hover:text-stone-800 rounded hover:bg-stone-100"
                  title="Duplicate Block"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteBlock(idx)}
                  className="p-1 text-stone-400 hover:text-rose-600 rounded hover:bg-rose-50"
                  title="Delete Block"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Block Body Inputs according to type */}
            {block.type === 'paragraph' && (
              <textarea
                rows={Math.max(3, Math.ceil((block.text || '').length / 80))}
                value={block.text || ''}
                onChange={(e) => onUpdateBlock(idx, { text: e.target.value })}
                placeholder="Enter paragraph text..."
                className="w-full text-sm font-serif leading-relaxed text-stone-800 bg-stone-50/50 border border-stone-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white resize-y transition-all"
              />
            )}

            {block.type === 'heading2' && (
              <input
                type="text"
                value={block.text || ''}
                onChange={(e) => onUpdateBlock(idx, { text: e.target.value })}
                placeholder="Section Heading (H2)..."
                className="w-full text-lg font-serif font-bold text-stone-900 bg-stone-50/50 border border-stone-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
              />
            )}

            {block.type === 'heading3' && (
              <input
                type="text"
                value={block.text || ''}
                onChange={(e) => onUpdateBlock(idx, { text: e.target.value })}
                placeholder="Sub-Section Heading (H3)..."
                className="w-full text-base font-serif font-semibold text-stone-800 bg-stone-50/50 border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
              />
            )}

            {block.type === 'blockquote' && (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={block.text || ''}
                  onChange={(e) => onUpdateBlock(idx, { text: e.target.value })}
                  placeholder="Quotation text..."
                  className="w-full text-sm font-serif italic text-stone-800 bg-stone-50/50 border border-stone-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white resize-y transition-all"
                />
                <input
                  type="text"
                  value={block.cite || ''}
                  onChange={(e) => onUpdateBlock(idx, { cite: e.target.value })}
                  placeholder="Citation attribution (e.g. Roland Barthes, Camera Lucida)..."
                  className="w-full text-xs text-stone-600 bg-stone-50/50 border border-stone-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
                />
              </div>
            )}

            {block.type === 'callout' && (
              <div className="space-y-3 p-3 bg-stone-50/80 rounded-lg border border-stone-200">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={block.title || ''}
                    onChange={(e) => onUpdateBlock(idx, { title: e.target.value })}
                    placeholder="Insight Box Title..."
                    className="w-full text-xs uppercase font-bold tracking-wider text-stone-900 bg-white border border-stone-200 rounded p-2 focus:outline-none"
                  />
                  <select
                    value={block.calloutTone || 'default'}
                    onChange={(e) => onUpdateBlock(idx, { calloutTone: e.target.value as any })}
                    className="text-xs bg-white border border-stone-200 rounded p-1.5 font-medium text-stone-700"
                  >
                    <option value="default">Tone: Editorial Slate</option>
                    <option value="sage">Tone: Sage Green</option>
                    <option value="amber">Tone: Warm Amber</option>
                    <option value="indigo">Tone: Classic Indigo</option>
                  </select>
                </div>
                <textarea
                  rows={3}
                  value={block.text || ''}
                  onChange={(e) => onUpdateBlock(idx, { text: e.target.value })}
                  placeholder="Analysis, contextual background, or takeaway..."
                  className="w-full text-xs leading-relaxed text-stone-700 bg-white border border-stone-200 rounded p-2.5 focus:outline-none"
                />
              </div>
            )}

            {block.type === 'highlight' && (
              <div className="space-y-2 p-3 bg-stone-50/80 rounded-lg border border-stone-200">
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => onUpdateBlock(idx, { title: e.target.value })}
                  placeholder="Statistic / Hero Stat (e.g. 74% or 1928)..."
                  className="w-full text-sm font-serif font-bold text-stone-900 bg-white border border-stone-200 rounded p-2 focus:outline-none"
                />
                <textarea
                  rows={2}
                  value={block.text || ''}
                  onChange={(e) => onUpdateBlock(idx, { text: e.target.value })}
                  placeholder="Pull quote or stat narrative..."
                  className="w-full text-xs text-stone-700 bg-white border border-stone-200 rounded p-2 focus:outline-none"
                />
              </div>
            )}

            {block.type === 'image' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={block.imageUrl || ''}
                    onChange={(e) => onUpdateBlock(idx, { imageUrl: e.target.value })}
                    placeholder="Image URL (https://...)..."
                    className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                  <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(idx, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {block.imageUrl && (
                  <div className="w-full h-40 bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                    <img
                      src={normalizeImageUrl(block.imageUrl)}
                      alt={block.imageAlt || 'Block image'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={block.imageCaption || ''}
                    onChange={(e) => onUpdateBlock(idx, { imageCaption: e.target.value })}
                    placeholder="Image Caption..."
                    className="text-xs bg-stone-50 border border-stone-200 rounded p-2 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={block.imageCredit || ''}
                    onChange={(e) => onUpdateBlock(idx, { imageCredit: e.target.value })}
                    placeholder="Image Credit / Photographer..."
                    className="text-xs bg-stone-50 border border-stone-200 rounded p-2 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {block.type === 'list' && (
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-stone-700">
                    <input
                      type="radio"
                      checked={!block.ordered}
                      onChange={() => onUpdateBlock(idx, { ordered: false })}
                      className="text-stone-900 focus:ring-stone-900"
                    />
                    <span>Bulleted List</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-stone-700">
                    <input
                      type="radio"
                      checked={Boolean(block.ordered)}
                      onChange={() => onUpdateBlock(idx, { ordered: true })}
                      className="text-stone-900 focus:ring-stone-900"
                    />
                    <span>Numbered List</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  {(block.items || []).map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-center gap-2">
                      <span className="text-stone-400 font-mono text-xs w-4">
                        {block.ordered ? `${itemIdx + 1}.` : '•'}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const nextItems = [...(block.items || [])];
                          nextItems[itemIdx] = e.target.value;
                          onUpdateBlock(idx, { items: nextItems });
                        }}
                        className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded p-2 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const nextItems = (block.items || []).filter((_, i) => i !== itemIdx);
                          onUpdateBlock(idx, { items: nextItems });
                        }}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      onUpdateBlock(idx, { items: [...(block.items || []), 'New item observation'] });
                    }}
                    className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 pt-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>
            )}

            {block.type === 'video' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={block.videoUrl || ''}
                  onChange={(e) => onUpdateBlock(idx, { videoUrl: e.target.value })}
                  placeholder="YouTube, Vimeo, or MP4 URL (e.g. https://www.youtube.com/watch?v=...)..."
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded p-2 focus:outline-none"
                />
                <input
                  type="text"
                  value={block.text || ''}
                  onChange={(e) => onUpdateBlock(idx, { text: e.target.value })}
                  placeholder="Video caption or contextual note..."
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded p-2 focus:outline-none"
                />
              </div>
            )}

            {block.type === 'divider' && (
              <div className="py-2 text-center text-stone-400 select-none">
                <div className="w-24 h-px bg-stone-300 mx-auto my-2" />
                <span className="text-[10px] uppercase font-mono tracking-widest">Section Break</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Append New Block Palette at the bottom */}
      <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
        <span className="block text-xs font-serif font-bold text-stone-700 mb-2">
          Insert Next Content Block:
        </span>
        <div className="flex flex-wrap gap-2">
          {blockTypeOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.type}
                onClick={() => onAddBlock(opt.type)}
                className="px-3 py-1.5 bg-white hover:bg-stone-900 text-stone-700 hover:text-stone-50 border border-stone-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
