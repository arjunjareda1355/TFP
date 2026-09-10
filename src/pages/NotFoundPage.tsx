import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { EDITORIAL_ERROR_COPY } from '../utils/editorialErrorCopy';

interface NotFoundPageProps {
  onHome: () => void;
  onExplore?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onHome, onExplore }) => {
  const copy = EDITORIAL_ERROR_COPY.PAGE.NOT_FOUND;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center bg-[#FFFFFF] text-[#111110] relative overflow-hidden">
      {/* Very low opacity background emblem watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.06]">
        <BrandLogo variant="emblem" size={240} theme="light" />
      </div>

      <div className="relative z-10 space-y-4">
        <span className="font-mono-editorial text-xs font-bold uppercase tracking-widest text-[#EA580C] block mb-1">
          FOLIO 404
        </span>

        <h1 className="font-serif-editorial text-4xl sm:text-6xl font-medium tracking-tight text-[#111110]">
          "{copy.title}"
        </h1>

        <p className="text-base text-[#55524B] leading-relaxed max-w-md mx-auto">
          {copy.description}
        </p>

        {copy.reassurance && (
          <p className="text-xs font-mono-editorial text-[#8E8A81] pt-1">
            {copy.reassurance}
          </p>
        )}

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onHome}
            className="w-full sm:w-auto bg-[#EA580C] hover:bg-[#C2410C] text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 rounded-xs shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{copy.primaryAction}</span>
          </button>

          {onExplore && (
            <button
              onClick={onExplore}
              className="w-full sm:w-auto bg-white border border-[#D9D6CE] hover:bg-[#F7F5F0] text-[#111110] px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 rounded-xs"
            >
              <Compass className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>{copy.secondaryAction || 'Explore Dispatches'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

