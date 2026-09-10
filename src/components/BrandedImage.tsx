import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { RefreshCw } from 'lucide-react';
import { normalizeImageUrl } from '../utils/mediaUtils';

export interface BrandedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  className?: string;
  aspectRatio?: string; // e.g. 'aspect-[16/9]', 'aspect-[4/3]', 'aspect-square'
  containerClassName?: string;
  fallbackText?: string;
  showRetry?: boolean;
  logoOpacity?: number; // default 0.10 (10%)
  onLoadSuccess?: () => void;
  onLoadError?: (err: any) => void;
}

/**
 * BrandedImage Component for The Folded Page
 * 
 * Replaces browser broken image icons and blank spaces with a pristine,
 * brand-consistent editorial fallback featuring the official low-opacity
 * The Folded Page logo emblem against a #F7F5F0 warm backdrop.
 * 
 * Features:
 * - Automatic Google Drive, Google Photos, Dropbox, Imgur normalization
 * - Seamless loading skeleton state (no jumpy layout shift)
 * - Error detection without exposing raw broken URLs
 * - Very low opacity (8% - 15%) official logo watermark
 * - Optional retry button for editorial/admin contexts
 * - Zero layout shift (maintains original aspect ratio and container dimensions)
 */
export const BrandedImage: React.FC<BrandedImageProps> = ({
  src,
  alt = 'Article illustration',
  className = 'w-full h-full object-cover',
  aspectRatio,
  containerClassName = '',
  fallbackText,
  showRetry = false,
  logoOpacity = 0.10,
  onLoadSuccess,
  onLoadError,
  ...rest
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);

  const effectiveSrc = normalizeImageUrl(src);

  useEffect(() => {
    if (!effectiveSrc || effectiveSrc.trim() === '' || effectiveSrc === 'undefined' || effectiveSrc === 'null') {
      setStatus('error');
      return;
    }

    setStatus('loading');
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.src = effectiveSrc;

    img.onload = () => {
      setStatus('loaded');
      onLoadSuccess?.();
    };

    img.onerror = (err) => {
      setStatus('error');
      onLoadError?.(err);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [effectiveSrc, retryCount, onLoadSuccess, onLoadError]);

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setStatus('loading');
    setRetryCount((prev) => prev + 1);
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#F7F5F0] select-none ${aspectRatio || ''} ${containerClassName}`}
      role="img"
      aria-label={status === 'error' ? 'Image unavailable' : alt}
    >
      {/* Loading Skeleton */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-[#F7F5F0] flex items-center justify-center animate-pulse">
          <div style={{ opacity: logoOpacity * 0.7 }}>
            <BrandLogo variant="emblem" size="md" theme="light" />
          </div>
        </div>
      )}

      {/* Successfully Loaded Image */}
      {status === 'loaded' && effectiveSrc && (
        <img
          src={effectiveSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          className={`${className} transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          {...rest}
        />
      )}

      {/* Branded Fallback on Error or Missing Source */}
      {status === 'error' && (
        <div className="absolute inset-0 bg-[#F7F5F0] flex flex-col items-center justify-center p-3 text-center transition-all">
          {/* Very faint official emblem logo */}
          <div
            className="flex items-center justify-center transition-transform hover:scale-105"
            style={{ opacity: Math.min(Math.max(logoOpacity, 0.08), 0.15) }}
          >
            <BrandLogo variant="emblem" size="md" theme="light" />
          </div>

          {/* Optional subtle editorial caption */}
          {fallbackText && (
            <span className="mt-2 text-[10px] font-mono-editorial text-[#8E8A81] tracking-wider uppercase font-semibold">
              {fallbackText}
            </span>
          )}

          {/* Optional Retry Trigger */}
          {showRetry && (
            <button
              onClick={handleRetry}
              className="mt-2 inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono-editorial uppercase font-bold bg-white border border-[#D9D6CE] text-[#55524B] hover:text-[#111110] hover:bg-[#EDE9DF] rounded-xs shadow-2xs transition-colors"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
