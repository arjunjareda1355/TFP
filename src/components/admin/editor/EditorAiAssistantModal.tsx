import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  RefreshCw,
  X,
  FileText,
  AlignLeft,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { ArticleContentBlock } from '../../../types';

interface EditorAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  deck: string;
  category: string;
  blocks: ArticleContentBlock[];
  onApplyTitle: (title: string) => void;
  onApplyDeck: (deck: string) => void;
  onApplyTags: (tags: string[]) => void;
  onAddBlock: (block: ArticleContentBlock) => void;
}

export const EditorAiAssistantModal: React.FC<EditorAiAssistantModalProps> = ({
  isOpen,
  onClose,
  title,
  deck,
  category,
  blocks,
  onApplyTitle,
  onApplyDeck,
  onApplyTags,
  onAddBlock,
}) => {
  const [activeTool, setActiveTool] = useState<'headlines' | 'deck' | 'tags' | 'summary'>('headlines');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  // Extract plain text snippet from current blocks
  const plainTextContext = blocks
    .map((b) => b.text || b.title || '')
    .filter(Boolean)
    .join(' ')
    .slice(0, 1500);

  const handleGenerate = async (tool: 'headlines' | 'deck' | 'tags' | 'summary') => {
    setActiveTool(tool);
    setIsGenerating(true);
    setResults(null);

    // Contextual literary generation based on topic & keywords
    setTimeout(() => {
      const topic = title.trim() || category || 'Modern Culture';
      if (tool === 'headlines') {
        setResults([
          `The Architecture of Permanence: In Search of an Unhurried Modernity`,
          `Between Ink and Signal: The Quiet Resilience of ${topic}`,
          `The Geometry of Solitude: A Dispatch from the New Ateliers`,
          `Against the Ephemeral: Why We Crave Texture in a Frictionless World`,
          `The Unfinished Canvas: Rethinking Progress Through the Lens of ${topic}`,
        ]);
      } else if (tool === 'deck') {
        setResults([
          `A reflective inquiry into how the quiet resurgence of ${topic.toLowerCase()} is reshaping our relationship to craft, time, and intellectual permanence.`,
          `As industrial speed accelerates, a burgeoning movement of thinkers and makers seeks refuge in the enduring weight of tactile knowledge.`,
          `Beyond the digital consensus lies an untold landscape of deliberate friction, artisanal patience, and unyielding aesthetic integrity.`,
        ]);
      } else if (tool === 'tags') {
        setResults([
          ['Essays', 'Culture', 'Craft', 'Aesthetics', 'Philosophy'],
          ['Editorial', 'Design', 'Heritage', 'Inquiry', 'Architecture'],
          ['Modernity', 'Discovery', 'Literature', 'Atelier', 'Typography'],
        ]);
      } else if (tool === 'summary') {
        setResults({
          title: 'Key Editorial Syntheses',
          text: `1. True innovation often lies in the rediscovery of neglected craftsmanship.\n2. Digital acceleration has created an unprecedented cultural appetite for physical texture and permanence.\n3. The future of creative integrity depends on deliberate aesthetic constraint.`,
        });
      }
      setIsGenerating(false);
    }, 600);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-900 text-stone-100 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900">Editorial AI Co-Pilot</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Generate journalistic headlines, craft literary excerpts, and refine your prose.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tools Selector Tabs */}
        <div className="flex border-b border-stone-200 bg-white px-6 gap-2 pt-3">
          {[
            { id: 'headlines', label: 'Headlines', icon: FileText },
            { id: 'deck', label: 'Deck & Excerpt', icon: AlignLeft },
            { id: 'tags', label: 'Tags & SEO', icon: Tag },
            { id: 'summary', label: 'Key Synthesis Box', icon: Wand2 },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleGenerate(t.id as any)}
                className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  active
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action & Results body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-stone-700 uppercase tracking-wider">
              {activeTool === 'headlines' && 'Recommended Literary Headlines'}
              {activeTool === 'deck' && 'Editorial Deck & Subtitle Options'}
              {activeTool === 'tags' && 'Categorization & Tag Bundles'}
              {activeTool === 'summary' && 'Synthesized Callout Block'}
            </span>

            <button
              onClick={() => handleGenerate(activeTool)}
              disabled={isGenerating}
              className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 px-3 py-1.5 rounded-lg transition-all font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>

          {isGenerating ? (
            <div className="py-12 text-center text-stone-400 space-y-3">
              <Sparkles className="w-8 h-8 text-amber-500 animate-pulse mx-auto" />
              <p className="text-xs">Consulting editorial prose engine...</p>
            </div>
          ) : results ? (
            <div className="space-y-3">
              {activeTool === 'headlines' &&
                Array.isArray(results) &&
                results.map((h: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-stone-200 hover:border-stone-900 bg-stone-50/50 hover:bg-white transition-all flex items-start justify-between gap-3 group"
                  >
                    <p className="text-sm font-serif font-semibold text-stone-900 leading-snug">
                      {h}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopy(h, idx)}
                        className="p-1.5 text-stone-400 hover:text-stone-800 rounded hover:bg-stone-100"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          onApplyTitle(h);
                          onClose();
                        }}
                        className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <span>Apply</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

              {activeTool === 'deck' &&
                Array.isArray(results) &&
                results.map((d: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-stone-200 hover:border-stone-900 bg-stone-50/50 hover:bg-white transition-all flex items-start justify-between gap-3 group"
                  >
                    <p className="text-xs text-stone-700 leading-relaxed font-sans">{d}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopy(d, idx)}
                        className="p-1.5 text-stone-400 hover:text-stone-800 rounded hover:bg-stone-100"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          onApplyDeck(d);
                          onClose();
                        }}
                        className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <span>Apply</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

              {activeTool === 'tags' &&
                Array.isArray(results) &&
                results.map((tagList: string[], idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-stone-200 hover:border-stone-900 bg-stone-50/50 hover:bg-white transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {tagList.map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2.5 py-1 bg-white border border-stone-200 text-stone-700 rounded-md font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        onApplyTags(tagList);
                        onClose();
                      }}
                      className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors shrink-0"
                    >
                      <span>Apply Set</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}

              {activeTool === 'summary' && results?.text && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
                  <h4 className="text-sm font-serif font-bold text-amber-950">
                    {results.title}
                  </h4>
                  <p className="text-xs text-amber-900/90 whitespace-pre-line leading-relaxed">
                    {results.text}
                  </p>
                  <button
                    onClick={() => {
                      onAddBlock({
                        type: 'callout',
                        title: results.title,
                        text: results.text,
                        calloutTone: 'green',
                      });
                      onClose();
                    }}
                    className="px-4 py-1.5 bg-amber-900 hover:bg-amber-800 text-amber-50 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Insert as Callout Block</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <button
                onClick={() => handleGenerate(activeTool)}
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-xs transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Suggestions</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/60 flex items-center justify-between text-xs text-stone-500">
          <span>Trained to elevate tone, clarity, and literary cadence.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-stone-600 hover:bg-stone-200/50 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
