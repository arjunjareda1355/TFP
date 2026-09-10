import React from 'react';
import {
  FileText,
  MessageSquareQuote,
  Camera,
  Compass,
  Zap,
  Sparkles,
  X,
  ArrowRight,
} from 'lucide-react';
import { ArticleContentBlock } from '../../../types';

export interface ArticleTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
  deck: string;
  blocks: ArticleContentBlock[];
}

export const ARTICLE_TEMPLATES: ArticleTemplate[] = [
  {
    id: 'essay',
    name: 'Longform Investigative Essay',
    category: 'Essays',
    description: 'A deeply researched, literary narrative with dramatic pacing, section breaks, and pulled quotes.',
    icon: FileText,
    tags: ['Essays', 'Culture', 'Longform'],
    deck: 'An exhaustive inquiry into the quiet shifts transforming our modern aesthetic and intellectual landscape.',
    blocks: [
      {
        type: 'paragraph',
        text: 'The silence that precedes an intellectual revolution is never absolute. Rather, it is a deliberate, rhythmic pause in which the old consensus crumbles before the new vocabulary has even begun to take shape.',
        dropCap: true,
      },
      {
        type: 'heading2',
        text: 'I. The Archaeology of Consensus',
      },
      {
        type: 'paragraph',
        text: 'To understand the contemporary landscape, one must first look at the foundations laid three decades prior. What was once heralded as an enduring truth has quietly revealed its fragile fault lines.',
      },
      {
        type: 'blockquote',
        text: 'We do not live in the world we perceive; we live in the language we inherit to describe it.',
        cite: 'Editorial Archive, Winter 1988',
      },
      {
        type: 'heading2',
        text: 'II. The Architecture of the New Era',
      },
      {
        type: 'paragraph',
        text: 'Across workshops, studios, and archives, thinkers and makers are forging an entirely different standard of permanence—one that balances digital agility with physical gravity.',
      },
      {
        type: 'callout',
        title: 'Core Synthesis',
        text: 'True innovation rarely arrives with fanfare. It is discovered in the painstaking recalibration of neglected craftsmanship.',
        calloutTone: 'green',
      },
      {
        type: 'paragraph',
        text: 'As we stand at this threshold, the obligation is not merely to document what is passing, but to rigorously examine the instruments of tomorrow.',
      },
    ],
  },
  {
    id: 'interview',
    name: 'In-Depth Dialogue & Q&A',
    category: 'Voices',
    description: 'A conversational dialogue between editor and subject, punctuated with biographical reflections and portrait pauses.',
    icon: MessageSquareQuote,
    tags: ['Voices', 'Interview', 'Philosophy'],
    deck: 'A wide-ranging conversation on craft, persistence, and the unexpected perils of effortless reproduction.',
    blocks: [
      {
        type: 'paragraph',
        text: 'We met on a rainy Tuesday morning in a studio crowded with reference monographs, proofs, and early prototypes. Over two cups of dark espresso, we spoke about the evolution of the printed word and why tactile friction still matters.',
        dropCap: true,
      },
      {
        type: 'heading3',
        text: 'The Folded Page: When you began thirty years ago, did you anticipate the current appetite for archival permanence?',
      },
      {
        type: 'paragraph',
        text: 'Subject: "Not in the slightest. We thought the digital wave would erase every trace of paper. But humanity has a physical memory. The eye tires of glass; the fingers crave texture and heft."',
      },
      {
        type: 'highlight',
        text: 'The eye tires of glass; the fingers crave texture and heft.',
        calloutTone: 'amber',
      },
      {
        type: 'heading3',
        text: 'The Folded Page: How do you know when a piece of work is truly completed?',
      },
      {
        type: 'paragraph',
        text: 'Subject: "A work is never finished—only abandoned at a moment when any further intervention would rob it of its vital imperfection."',
      },
      {
        type: 'callout',
        title: 'Biographical Note',
        text: 'Our guest has spent four decades directing international typography symposia and preserving heritage printing presses across Europe.',
        calloutTone: 'blue',
      },
    ],
  },
  {
    id: 'photo_essay',
    name: 'Visual Field Report & Photo Essay',
    category: 'Art & Design',
    description: 'Image-led reportage with panoramic gallery spreads, field notes, and geographic observation.',
    icon: Camera,
    tags: ['Visuals', 'Photography', 'Field Report'],
    deck: 'A photographic journey into remote ateliers and architectural relics untouched by industrial acceleration.',
    blocks: [
      {
        type: 'paragraph',
        text: 'High in the mist-veiled valley, sunlight catches the raw slate roofs of centuries-old stonemason cottages. Here, time is measured not in hours, but in the slow setting of natural lime mortar.',
        dropCap: true,
      },
      {
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80',
        imageCaption: 'The morning mist over the valley atelier before the first kiln firing.',
        imageCredit: 'Field Photography Desk',
        imageAlt: 'Mist rising over stone atelier',
      },
      {
        type: 'heading2',
        text: 'Field Notes: The Geometry of Stone',
      },
      {
        type: 'paragraph',
        text: 'Every block is cut with hand chisels, following the natural grain of the mountain. The resulting texture absorbs light with an organic warmth that no manufactured synthetic can replicate.',
      },
      {
        type: 'gallery',
        galleryLayout: 'grid',
        galleryImages: [
          {
            id: 'g-1',
            url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
            caption: 'Working drawings and geometric studies.',
          },
          {
            id: 'g-2',
            url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
            caption: 'Selected raw pigments and natural binding oils.',
          },
        ],
      },
    ],
  },
  {
    id: 'critique',
    name: 'Cultural Critique & Review',
    category: 'Critique',
    description: 'Structured critical appraisal with historical context, analytical verdicts, and key takeaways.',
    icon: Compass,
    tags: ['Critique', 'Literature', 'Culture'],
    deck: 'Examining the latest landmark monograph: does it redefine the canon, or merely celebrate its own nostalgia?',
    blocks: [
      {
        type: 'paragraph',
        text: 'Few publications arrive with as much anticipation as this latest retrospective. To claim the mantle of definitive biography is a dangerous ambition, particularly when the subject spent a lifetime defying categorization.',
        dropCap: true,
      },
      {
        type: 'heading2',
        text: 'The Argument and Its Limitations',
      },
      {
        type: 'paragraph',
        text: 'The author succeeds brilliantly in cataloging the formative years, yet struggles when grappling with the radical turns of the final decade.',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'Exemplary access to unpublished correspondence and personal journals.',
          'Meticulous archival reproductions of preliminary working proofs.',
          'Occasionally hesitant when challenging established biographical myths.',
        ],
      },
      {
        type: 'callout',
        title: 'Editorial Verdict',
        text: 'Essential reading for scholars; provocative and deeply rewarding for the discerning generalist.',
        calloutTone: 'default',
      },
    ],
  },
  {
    id: 'dispatch',
    name: 'Breaking Dispatch / Memo',
    category: 'Dispatches',
    description: 'Fast-moving, concise bulletin for timely editorial updates, announcements, or short memos.',
    icon: Zap,
    tags: ['Dispatches', 'Editorial', 'Bulletin'],
    deck: 'A concise bulletin from the editorial board regarding current developments and forthcoming initiatives.',
    blocks: [
      {
        type: 'paragraph',
        text: 'The editorial board has confirmed the theme and curatorial parameters for our upcoming quarterly collection, inviting submissions across three primary categories.',
        dropCap: true,
      },
      {
        type: 'heading2',
        text: 'Key Dates & Submission Windows',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Preliminary manuscripts due: First Monday of next month.',
          'Editorial review and peer consultation window: Two weeks.',
          'Final press proofing and international print release.',
        ],
      },
    ],
  },
];

interface EditorTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ArticleTemplate) => void;
}

export const EditorTemplatesModal: React.FC<EditorTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-900 text-stone-100 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900">Editorial Starter Templates</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Kickstart your inquiry with pre-structured literary layouts and blocks.
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

        {/* Templates List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {ARTICLE_TEMPLATES.map((tmpl) => {
            const IconComp = tmpl.icon;
            return (
              <div
                key={tmpl.id}
                onClick={() => {
                  onSelectTemplate(tmpl);
                  onClose();
                }}
                className="group relative p-5 rounded-xl border border-stone-200 hover:border-stone-900 bg-white hover:bg-stone-50/60 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-stone-100 group-hover:bg-stone-900 text-stone-700 group-hover:text-stone-50 rounded-xl transition-colors shrink-0">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-serif font-semibold text-stone-900 group-hover:text-amber-900 transition-colors">
                        {tmpl.name}
                      </h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1 max-w-xl line-clamp-2">
                      {tmpl.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {tmpl.tags.map((t) => (
                        <span key={t} className="text-[10px] text-stone-400 bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-stone-600 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all">
                  <span>Use Template</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/50 flex items-center justify-between text-xs text-stone-500">
          <span>Templates populate content blocks and deck without overwriting your title or hero image.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
