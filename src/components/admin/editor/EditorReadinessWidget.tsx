import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
} from 'lucide-react';
import { ArticleContentBlock } from '../../../types';

interface EditorReadinessWidgetProps {
  title: string;
  deck: string;
  category: string;
  tags: string[];
  heroImage: string;
  heroImageAlt: string;
  metaDescription: string;
  blocks: ArticleContentBlock[];
  totalWords: number;
}

export const EditorReadinessWidget: React.FC<EditorReadinessWidgetProps> = ({
  title,
  deck,
  category,
  tags,
  heroImage,
  heroImageAlt,
  metaDescription,
  blocks,
  totalWords,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const checks = [
    {
      id: 'title',
      label: 'Compelling Headline (5+ characters)',
      passed: title.trim().length >= 5,
      weight: 15,
    },
    {
      id: 'deck',
      label: 'Editorial Deck / Subtitle provided',
      passed: deck.trim().length >= 10,
      weight: 15,
    },
    {
      id: 'category',
      label: 'Section Category selected',
      passed: Boolean(category && category !== 'all'),
      weight: 10,
    },
    {
      id: 'hero',
      label: 'Lead Hero Image assigned',
      passed: Boolean(heroImage && heroImage.startsWith('http')),
      weight: 15,
    },
    {
      id: 'alt',
      label: 'Accessibility Alt Text for Hero Image',
      passed: heroImageAlt.trim().length >= 3,
      weight: 10,
    },
    {
      id: 'length',
      label: 'Substantial Editorial Body (150+ words)',
      passed: totalWords >= 150,
      weight: 15,
    },
    {
      id: 'structure',
      label: 'Structural Content Blocks (Heading/Quote/List)',
      passed: blocks.some((b) => b.type === 'heading2' || b.type === 'heading3' || b.type === 'blockquote' || b.type === 'callout'),
      weight: 10,
    },
    {
      id: 'seo',
      label: 'Search & Social Meta Description',
      passed: metaDescription.trim().length >= 25 || deck.trim().length >= 25,
      weight: 10,
    },
  ];

  const score = checks.reduce((acc, c) => acc + (c.passed ? c.weight : 0), 0);
  const passedCount = checks.filter((c) => c.passed).length;

  const getScoreBadge = () => {
    if (score >= 90) return { label: 'Print Ready', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 65) return { label: 'Strong Draft', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'In Development', color: 'text-stone-600 bg-stone-100 border-stone-200' };
  };

  const badge = getScoreBadge();

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs transition-all">
      {/* Summary Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-stone-50/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-stone-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-stone-400'}
                strokeDasharray={`${score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-stone-800">{score}%</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-bold text-stone-900">Publication Readiness</span>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              {passedCount} of {checks.length} editorial benchmarks satisfied
            </p>
          </div>
        </div>

        <div className="text-stone-400 hover:text-stone-700">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Checklist */}
      {isExpanded && (
        <div className="p-4 border-t border-stone-100 bg-stone-50/40 space-y-2 text-xs">
          {checks.map((chk) => (
            <div key={chk.id} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                {chk.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-stone-300 shrink-0" />
                )}
                <span className={chk.passed ? 'text-stone-800' : 'text-stone-500 line-through decoration-stone-300'}>
                  {chk.label}
                </span>
              </div>
              <span className="text-[10px] font-mono text-stone-400">+{chk.weight}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
