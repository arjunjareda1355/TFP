import React from 'react';
import { AUTHORS } from '../data/authors';
import { ArrowLeft, Sparkles, Compass, ShieldCheck, Feather, Heart, Mail } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { EditorialPrinciplesBanner } from '../components/EditorialPrinciplesBanner';

interface AboutPageProps {
  onBack: () => void;
  onNavigateNewsletter: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack, onNavigateNewsletter }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FFFFFF] text-[#111110]">
      {/* Back button */}
      <div className="mb-8 pb-4 border-b border-[#E8E5DF]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6E6A62] hover:text-[#EA580C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
      </div>

      {/* Hero Header with Brand */}
      <header className="mb-14 pb-10 border-b border-[#E8E5DF]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-4 font-mono-editorial">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MANIFESTO & IDENTITY</span>
        </div>
        <div className="mb-6">
          <BrandLogo variant="masthead" theme="light" className="max-w-xl" />
        </div>
        <p className="font-serif-editorial italic text-2xl sm:text-3xl text-[#55524B]">
          "What's worth knowing."
        </p>
      </header>

      {/* Main Editorial Manifesto Text */}
      <div className="space-y-8 font-serif-editorial text-lg sm:text-xl text-[#2C2A26] font-normal leading-relaxed mb-16">
        <p className="editorial-drop-cap">
          We live in a deluge of instantaneous noise. Every second, millions of algorithms battle to hijack human attention with manufactured urgency, synthetic rage, and disposable headlines that evaporate by morning.
        </p>

        <p>
          The Folded Page was founded on a quiet, counter-cultural conviction: <strong className="text-[#111110]">true human curiosity is a sacred faculty</strong>. Not everything trending deserves your mind, and some of the most extraordinary people, crafts, natural anomalies, and philosophical ideas exist far away from the algorithmic spotlight.
        </p>

        <blockquote className="my-10 p-6 sm:p-8 bg-[#F9F8F6] border-l-4 border-[#EA580C] border-y border-r border-[#E8E5DF] italic text-2xl sm:text-3xl text-[#111110] leading-snug rounded-xs shadow-xs">
          "The crease of a folded page marks something you refused to forget — an idea so striking you stopped turning and paused."
        </blockquote>

        <p>
          We are not a conventional daily news outlet, nor are we confined to a single narrow beat. Our editors investigate across contemporary culture, deep-sea ecology, watchmaking, culinary history, architectural joinery, artificial intelligence, and remote island geography.
        </p>
      </div>

      {/* Editorial Standards Box */}
      <section className="mb-16 bg-[#F9F8F6] p-8 border border-[#E8E5DF] rounded-xs shadow-xs">
        <h3 className="font-serif-editorial text-2xl font-medium text-[#111110] mb-4">
          Our Four Commitments
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#E8E5DF]">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#EA580C] mb-1 font-mono-editorial flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 1. Rigorous Ground Truth
            </h4>
            <p className="text-xs sm:text-sm text-[#55524B]">
              Every dispatch undergoes multi-source fact-checking. We prioritize original field reporting and primary documents over aggregations.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#EA580C] mb-1 font-mono-editorial flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> 2. The Slow Cadence
            </h4>
            <p className="text-xs sm:text-sm text-[#55524B]">
              We do not chase the 5-minute news cycle. We publish only when a story contains timeless value and lasting depth.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#EA580C] mb-1 font-mono-editorial flex items-center gap-1.5">
              <Feather className="w-4 h-4" /> 3. Typographic Craft
            </h4>
            <p className="text-xs sm:text-sm text-[#55524B]">
              Words deserve dignified visual rhythm. We obsess over line lengths, contrast, typography pairing, and quiet reading environments.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#EA580C] mb-1 font-mono-editorial flex items-center gap-1.5">
              <Heart className="w-4 h-4" /> 4. Reader Autonomy
            </h4>
            <p className="text-xs sm:text-sm text-[#55524B]">
              No surveillance trackers, pop-up ads, deceptive clickbait headlines, or intrusive engagement hooks.
            </p>
          </div>
        </div>
      </section>

      {/* Full Editorial Code & Principles */}
      <section className="mb-16 -mx-4 sm:-mx-6 lg:-mx-8">
        <EditorialPrinciplesBanner />
      </section>

      {/* Editorial Board / Authors */}
      <section className="mb-16">
        <h3 className="font-mono-editorial text-xs uppercase tracking-widest text-[#8E8A81] font-bold mb-6">
          THE EDITORIAL MASTHEAD & CONTRIBUTORS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Object.values(AUTHORS).map((author) => (
            <div
              key={author.id}
              className="p-5 bg-[#FFFFFF] border border-[#E8E5DF] flex items-start gap-4 rounded-xs shadow-xs"
            >
              <img
                src={author.avatar}
                alt={author.name}
                className="w-14 h-14 rounded-full object-cover border border-[#E8E5DF] shrink-0"
              />
              <div className="space-y-1">
                <h4 className="font-serif-editorial text-lg font-medium text-[#111110]">
                  {author.name}
                </h4>
                <span className="text-[11px] font-mono-editorial text-[#EA580C] block font-bold uppercase">
                  {author.role} • {author.location}
                </span>
                <p className="text-xs text-[#55524B] leading-relaxed line-clamp-3">
                  {author.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter callout */}
      <div className="p-8 bg-[#F9F8F6] border border-[#E8E5DF] text-center space-y-4 rounded-xs shadow-xs">
        <h3 className="font-serif-editorial text-2xl font-medium text-[#111110]">
          Stay connected with our dispatches
        </h3>
        <p className="text-xs sm:text-sm text-[#55524B] max-w-md mx-auto">
          Get our weekly folded letter featuring our deepest investigations, rare book notes, and editorial recommendations.
        </p>
        <button
          onClick={onNavigateNewsletter}
          className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs shadow-xs"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Subscribe to The Folded Letter</span>
        </button>
      </div>
    </div>
  );
};
