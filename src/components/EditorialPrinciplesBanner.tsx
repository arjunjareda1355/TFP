import React, { useState } from 'react';
import {
  ShieldCheck,
  Compass,
  Sparkles,
  Feather,
  Eye,
  BookOpen,
  Clock,
  ArrowRight,
  X,
  CheckCircle2,
  Bookmark,
  ExternalLink,
} from 'lucide-react';

interface PrincipleItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  codeNumber: string;
  detailedOverview: string;
  pillars: string[];
  fieldworkStandard: string;
  readerPromise: string;
}

export const EditorialPrinciplesBanner: React.FC = () => {
  const [selectedPrinciple, setSelectedPrinciple] = useState<PrincipleItem | null>(null);

  const principles: PrincipleItem[] = [
    {
      id: 'curiosity-first',
      codeNumber: 'CODE-01',
      icon: Compass,
      title: 'Curiosity First',
      desc: 'We follow genuine human fascination rather than algorithmic trends or clickbait formulas.',
      detailedOverview:
        'Our editorial desk operates with complete independence from programmatic traffic incentives. We greenlight investigative essays and cultural profiles based on intrinsic human merit, intellectual surprise, and enduring historical value.',
      pillars: [
        'Algorithmic agnosticism: No clickbait headlines, artificially stoked outrage, or trend-chasing.',
        'Serendipitous curation: Illuminating obscure cultural phenomena, archival treasures, and overlooked masteries.',
        'Writer-led discovery: Giving writers open latitude to explore nuance rather than predetermined outcomes.',
      ],
      fieldworkStandard:
        'Every story begins with an unresolved curiosity question, verified through firsthand interviews and deep archival inspection.',
      readerPromise:
        'You will never encounter deceptive titles or fabricated urgency. Every dispatch is written because it genuinely matters.',
    },
    {
      id: 'intellectual-rigor',
      codeNumber: 'CODE-02',
      icon: ShieldCheck,
      title: 'Intellectual Rigor',
      desc: 'Even when examining viral phenomena, our reporting remains strictly truthful, verified, and contextual.',
      detailedOverview:
        'Rigorous journalism is our foundational pillar. We cross-verify facts through primary sources, peer-reviewed academic literature, archival artifacts, and on-the-ground field reporting.',
      pillars: [
        'Dual-source corroboration on all factual claims and investigative disclosures.',
        'Clear separation of verifiable factual reporting, analytical commentary, and personal essays.',
        'Transparent error correction policy with permanent version logs visible to readers.',
      ],
      fieldworkStandard:
        'All scientific, technical, and historical assertions are reviewed by subject-matter consultants before publication.',
      readerPromise:
        'Our reporting can be relied upon with absolute confidence for research, academic citation, and thoughtful discourse.',
    },
    {
      id: 'crafted-storytelling',
      codeNumber: 'CODE-03',
      icon: Feather,
      title: 'Crafted Storytelling',
      desc: 'Long-form essays written with literary care, typography discipline, and respectful pacing.',
      detailedOverview:
        'We view long-form journalism as an enduring literary craft. We take pride in rhythm, precision of vocabulary, structured pacing, and typographic clarity designed for prolonged, fatigue-free reading.',
      pillars: [
        'Unrushed editorial cycles allowing writers the time needed to polish narrative arcs.',
        'Clean, distractions-free typography adhering to classical book design proportions.',
        'Careful structural editing that balances analytical rigor with evocative prose.',
      ],
      fieldworkStandard:
        'Every draft undergoes line-by-line editorial polishing, fact-checking, and layout typesetting.',
      readerPromise:
        'Prose that respects your intelligence, celebrates language, and offers an immersive, restorative reading experience.',
    },
    {
      id: 'visual-truth',
      codeNumber: 'CODE-04',
      icon: Eye,
      title: 'Visual Truth',
      desc: 'Real documentary photography and authentic fieldwork without synthetic generic imagery.',
      detailedOverview:
        'Visual integrity is as crucial as written truth. We commission documentary photographers and visual artists who capture authentic field moments, natural lighting, and unmanipulated human environments.',
      pillars: [
        'Strict provenance: Every image carries transparent attribution, camera location, and photographer credit.',
        'Zero synthetic deception: We never substitute real human subjects with generic artificial renderings.',
        'Photo essay integrity: Providing full context and field captions for every visual frame.',
      ],
      fieldworkStandard:
        'Photographers and visual contributors maintain full metadata logs and field journals.',
      readerPromise:
        'What you see in our pages is authentic reality captured by perceptive human eyes in real places.',
    },
    {
      id: 'cross-disciplinary',
      codeNumber: 'CODE-05',
      icon: BookOpen,
      title: 'Cross-Disciplinary',
      desc: 'Connecting ancient monastic crafts to quantum optics and digital anthropology seamlessly.',
      detailedOverview:
        'The most profound insights happen at the intersection of divergent disciplines. We bridge historical techniques, modern science, philosophical inquiry, architecture, and technology into unified cultural perspectives.',
      pillars: [
        'Bridging humanities and hard sciences to understand systemic transformations.',
        'Explaining complex technological and scientific shifts without patronizing oversimplification.',
        'Finding unexpected parallels between traditional artisanal wisdom and futuristic innovation.',
      ],
      fieldworkStandard:
        'Interviews systematically pair technical specialists with cultural historians to illuminate hidden connections.',
      readerPromise:
        'Expanded perspectives that help you understand how varied facets of our world interlock and evolve.',
    },
    {
      id: 'slow-attention',
      codeNumber: 'CODE-06',
      icon: Clock,
      title: 'Slow Attention',
      desc: "Treating the reader's attention as a sacred reservoir worthy of meaningful depth.",
      detailedOverview:
        'In an age of relentless notification feeds and cognitive fragmentation, we treat slow, sustained attention as an essential human sanctuary. We create reading spaces that encourage reflection over rapid consumption.',
      pillars: [
        'Zero intrusive pop-ups, auto-playing video interruptions, or manipulative sensory hooks.',
        'Complete thematic editions published weekly and seasonally, encouraging focused reading sessions.',
        'Respectful offline-friendly and reading-optimized article presentation.',
      ],
      fieldworkStandard:
        'Calculated reading times and section markers calibrated for deep immersion and intellectual nourishment.',
      readerPromise:
        'A calm, elegant environment where you can absorb complex ideas without cognitive strain.',
    },
  ];

  return (
    <section 
      className="py-14 sm:py-20 border-b border-[#E8E5DF] bg-[#FFFFFF] no-copy-zone select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10 select-none">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-2 font-mono-editorial select-none">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OUR EDITORIAL CODE</span>
          </div>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-medium tracking-tight text-[#111110] leading-tight select-none">
            "There's always something worth unfolding."
          </h2>
          <p className="text-sm sm:text-base text-[#55524B] font-normal leading-relaxed mt-2 select-none">
            The Folded Page is dedicated to the idea that thoughtful human curiosity is the ultimate antidote to information exhaustion. Click any principle below to explore our journalistic standards and ethical commitments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 select-none">
          {principles.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedPrinciple(item)}
                className="group text-left bg-[#FFFFFF] border border-[#E8E5DF] hover:border-[#111110] p-6 flex flex-col justify-between rounded-xs shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:ring-offset-2"
                aria-label={`Learn more about principle: ${item.title}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-[#F9F8F6] border border-[#E8E5DF] group-hover:border-[#EA580C]/40 group-hover:bg-[#FFF7ED] flex items-center justify-center text-[#EA580C] rounded-xs transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono-editorial text-[11px] font-semibold tracking-wider text-[#8C827A] uppercase bg-[#F4F1EA] px-2 py-0.5 rounded-xs">
                      {item.codeNumber}
                    </span>
                  </div>
                  <h3 className="font-serif-editorial text-xl font-medium text-[#111110] group-hover:text-[#EA580C] transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#55524B] font-normal leading-relaxed mb-4">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F0ECE1] flex items-center justify-between text-xs font-semibold text-[#8C827A] group-hover:text-[#111110] transition-colors">
                  <span className="font-mono-editorial uppercase tracking-wider text-[11px]">Read Standards</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform text-[#EA580C]" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DETAILED PRINCIPLE MODAL */}
      {selectedPrinciple && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111110]/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedPrinciple(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="principle-modal-title"
        >
          <div
            className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#E8E5DF] pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FFF7ED] border border-[#EA580C]/30 flex items-center justify-center text-[#EA580C] rounded-xs">
                  <selectedPrinciple.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-editorial text-xs font-bold uppercase tracking-widest text-[#EA580C]">
                      {selectedPrinciple.codeNumber}
                    </span>
                    <span className="text-xs text-[#8C827A]">• Editorial Code</span>
                  </div>
                  <h3 id="principle-modal-title" className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-[#111110]">
                    {selectedPrinciple.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPrinciple(null)}
                className="text-[#8C827A] hover:text-[#111110] p-1.5 rounded-xs hover:bg-[#F4F1EA] transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6 text-[#2C2A26]">
              <div>
                <h4 className="font-mono-editorial text-xs font-bold uppercase tracking-wider text-[#8C827A] mb-2">
                  Editorial Mandate
                </h4>
                <p className="text-sm sm:text-base leading-relaxed text-[#403D37]">
                  {selectedPrinciple.detailedOverview}
                </p>
              </div>

              <div>
                <h4 className="font-mono-editorial text-xs font-bold uppercase tracking-wider text-[#8C827A] mb-3">
                  Core Standards & Protocols
                </h4>
                <ul className="space-y-2.5">
                  {selectedPrinciple.pillars.map((pillar, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#403D37]">
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                      <span>{pillar}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E8E5DF] p-4 rounded-xs">
                <h4 className="font-mono-editorial text-xs font-bold uppercase tracking-wider text-[#EA580C] mb-1">
                  Fieldwork Verification Standard
                </h4>
                <p className="text-xs sm:text-sm text-[#55524B] leading-relaxed">
                  {selectedPrinciple.fieldworkStandard}
                </p>
              </div>

              <div className="border-t border-[#E8E5DF] pt-4">
                <h4 className="font-mono-editorial text-xs font-bold uppercase tracking-wider text-[#8C827A] mb-1">
                  The Reader Guarantee
                </h4>
                <p className="text-xs sm:text-sm font-medium text-[#111110] leading-relaxed italic font-serif-editorial">
                  "{selectedPrinciple.readerPromise}"
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-5 border-t border-[#E8E5DF] flex items-center justify-between">
              <span className="text-xs text-[#8C827A] font-mono-editorial">
                Reviewed & Maintained by Editorial Directorate (Publisher & Editor-in-Chief)
              </span>
              <button
                type="button"
                onClick={() => setSelectedPrinciple(null)}
                className="bg-[#111110] hover:bg-[#2C2A26] text-[#FFFFFF] px-4 py-2 text-xs font-semibold rounded-xs transition-colors"
              >
                Close Code
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
