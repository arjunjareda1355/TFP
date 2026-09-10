import React from 'react';

export interface BrandLogoProps {
  variant?: 'masthead' | 'header-brand' | 'full' | 'horizontal' | 'emblem' | 'wordmark';
  theme?: 'light' | 'dark' | 'cream' | 'monochrome';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showTagline?: boolean;
  className?: string;
  id?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'header-brand',
  theme = 'light',
  size = 'md',
  showTagline = true,
  className = '',
  id,
}) => {
  const isDark = theme === 'dark';
  const mainColor = isDark ? '#F5F3EF' : '#111110';
  const mutedColor = isDark ? '#9E9A91' : '#4A4742';
  const accentColor = '#EA580C';

  // Emblem sizing
  const getEmblemDimensions = () => {
    if (typeof size === 'number') return { width: size, height: size };
    switch (size) {
      case 'xs': return { width: 22, height: 22 };
      case 'sm': return { width: 32, height: 32 };
      case 'md': return { width: 44, height: 44 };
      case 'lg': return { width: 68, height: 68 };
      case 'xl': return { width: 96, height: 96 };
      default: return { width: 44, height: 44 };
    }
  };

  const emblemDims = getEmblemDimensions();
  const foldId = `fold-${theme}-${Math.random().toString(36).substr(2, 4)}`;

  // The Emblem SVG (TFP Monogram + Page Fold Corner)
  const renderEmblem = (w: number, h: number, customClass: string = '') => {
    return (
      <svg
        viewBox="0 0 500 500"
        width={w}
        height={h}
        className={`flex-shrink-0 select-none brand-emblem no-copy ${customClass}`}
        aria-hidden="true"
        onContextMenu={(e) => e.preventDefault()}
        style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
      >
        <defs>
          <linearGradient id={`${foldId}-grad`} x1="0%" y1="100%" x2="100%" y2="0%">
            {isDark ? (
              <>
                <stop offset="0%" stopColor="#C2410C" />
                <stop offset="35%" stopColor="#EA580C" />
                <stop offset="70%" stopColor="#FDBA74" />
                <stop offset="95%" stopColor="#FFF7ED" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#1A1918" />
                <stop offset="35%" stopColor="#4A463F" />
                <stop offset="70%" stopColor="#C2BCB0" />
                <stop offset="95%" stopColor="#EDE7DC" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </>
            )}
          </linearGradient>

          <linearGradient id={`${foldId}-shadow`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
          </linearGradient>

          <filter id={`${foldId}-filter`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="-4" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.35" />
          </filter>
        </defs>

        <g transform="translate(250, 250) scale(0.95)">
          {/* Central T Top Bar & Stem */}
          <path
            d="M -215 -225 L 110 -225 L 110 -175 L 85 -175 C 80 -200 65 -205 18 -205 L 18 190 C 18 220 30 228 50 230 L 50 245 L -50 245 L -50 230 C -30 228 -18 220 -18 190 L -18 -205 C -65 -205 -80 -200 -85 -175 L -110 -175 L -110 -225 Z"
            fill={mainColor}
          />

          {/* Serif F Upper and Middle Arms */}
          <path
            d="M -200 -125 L -70 -125 L -18 -125 L -18 -75 L -70 -75 C -110 -75 -125 -70 -135 -40 L -155 -40 L -155 -105 L -185 -105 C -195 -105 -200 -115 -200 -125 Z"
            fill={mainColor}
          />
          <path
            d="M -160 0 L -18 0 L -18 35 L -100 35 C -125 35 -138 42 -145 60 L -165 60 L -165 -15 L -140 -15 C -145 0 -155 0 -160 0 Z"
            fill={mainColor}
          />

          {/* Left Foot Serif of F */}
          <path
            d="M -195 100 L -125 100 L -125 80 C -150 80 -160 70 -165 40 L -195 40 Z"
            fill={mainColor}
          />

          {/* The 'P' Large Curving Bowl on the Right */}
          <path
            d="M 0 -135 C 90 -135 215 -105 215 15 C 215 110 120 145 0 145 L 0 95 C 65 95 145 75 145 15 C 145 -45 75 -85 0 -85 Z"
            fill={mainColor}
          />

          {/* The Curled Folded Page Effect on P's Loop */}
          <path
            d="M 35 -135 C 100 -130 180 -90 190 0 C 130 -30 70 -70 20 -115 Z"
            fill={`url(#${foldId}-shadow)`}
          />
          
          <path
            d="M 18 -135 C 90 -130 195 -80 215 15 C 180 50 115 5 20 -110 C 18 -125 18 -130 18 -135 Z"
            fill={`url(#${foldId}-grad)`}
            filter={`url(#${foldId}-filter)`}
          />

          <path
            d="M 215 15 C 170 30 80 -25 18 -135"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            fill="none"
            opacity="0.9"
          />
        </g>
      </svg>
    );
  };

  // Pure SVG Artistic Masthead matching uploaded image exactly
  const renderMastheadSVG = (height: number = 44) => {
    return (
      <svg
        viewBox="0 0 740 185"
        height={height}
        className="w-auto max-w-full select-none brand-masthead no-copy pointer-events-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onContextMenu={(e) => e.preventDefault()}
        style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
      >
        <g>
          {/* Cursive script "The" */}
          <text
            x="48"
            y="65"
            fontFamily="'Alex Brush', 'Great Vibes', 'Italianno', cursive"
            fontSize="88"
            fill={mainColor}
            transform="rotate(-4 48 65)"
          >
            The
          </text>

          {/* FOLDED PAGE in High-Contrast Didone Serif */}
          <text
            x="10"
            y="126"
            fontFamily="'Playfair Display', 'Newsreader', Didot, Georgia, serif"
            fontSize="82"
            fontWeight="800"
            letterSpacing="0.04em"
            fill={mainColor}
          >
            FOLDED P<tspan dx="-3">A</tspan><tspan dx="-1">G</tspan><tspan dx="-1">E</tspan>
          </text>

          {/* Artistic flourish crossbar accent on 'A' */}
          <path
            d="M 446 103 Q 470 90, 500 110 Q 532 128, 558 107"
            stroke={mainColor}
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 460 104 Q 495 95, 526 114"
            stroke={mainColor}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />

          {/* Subtitle Tagline with flanking divider lines */}
          {showTagline && (
            <g transform="translate(0, 158)">
              <line x1="55" y1="0" x2="160" y2="0" stroke={mutedColor} strokeWidth="1.2" />
              <text
                x="180"
                y="4"
                fontFamily="'Plus Jakarta Sans', -apple-system, sans-serif"
                fontSize="14"
                fontWeight="600"
                letterSpacing="0.38em"
                fill={mutedColor}
              >
                WHAT'S WORTH KNOWING.
              </text>
              <line x1="565" y1="0" x2="670" y2="0" stroke={mutedColor} strokeWidth="1.2" />
            </g>
          )}
        </g>
      </svg>
    );
  };

  // Only the emblem
  if (variant === 'emblem') {
    return (
      <div
        id={id}
        className={`inline-flex items-center justify-center select-none brand-logo no-copy ${className}`}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
      >
        {renderEmblem(emblemDims.width, emblemDims.height)}
      </div>
    );
  }

  // Only the masthead image lockup
  if (variant === 'masthead') {
    const mastheadH = typeof size === 'number' ? size : size === 'lg' ? 62 : size === 'sm' ? 36 : 46;
    return (
      <div
        id={id}
        className={`inline-flex items-center select-none brand-logo no-copy ${className}`}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
      >
        {renderMastheadSVG(mastheadH)}
      </div>
    );
  }

  // Header Brand: Logo Emblem + Exact Masthead
  if (variant === 'header-brand' || variant === 'horizontal') {
    const emblemSize = typeof size === 'number' ? Math.round(size * 0.85) : size === 'lg' ? 48 : size === 'sm' ? 32 : 40;
    const mastheadHeight = typeof size === 'number' ? size : size === 'lg' ? 52 : size === 'sm' ? 34 : 42;

    return (
      <div
        id={id}
        className={`inline-flex items-center gap-2.5 sm:gap-3.5 select-none brand-logo no-copy ${className}`}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
      >
        {renderEmblem(emblemSize, emblemSize)}
        <div className="flex items-center pointer-events-none select-none">
          {renderMastheadSVG(mastheadHeight)}
        </div>
      </div>
    );
  }

  // Full stacked brand mark (for footer or splash)
  if (variant === 'full') {
    return (
      <div
        id={id}
        className={`flex flex-col items-center text-center select-none brand-logo no-copy ${className}`}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="mb-3 select-none">
          {renderEmblem(size === 'xl' ? 120 : size === 'lg' ? 84 : 64, size === 'xl' ? 120 : size === 'lg' ? 84 : 64)}
        </div>
        <div className="select-none pointer-events-none">
          {renderMastheadSVG(size === 'xl' ? 68 : 52)}
        </div>
      </div>
    );
  }

  // Wordmark only
  return (
    <div
      id={id}
      className={`inline-flex items-center select-none brand-logo no-copy ${className}`}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
    >
      {renderMastheadSVG(40)}
    </div>
  );
};
