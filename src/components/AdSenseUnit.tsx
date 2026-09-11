import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface AdSenseUnitProps {
  client?: string;
  slot?: string;
  format?: string;
  responsive?: boolean;
  className?: string;
}

export const AdSenseUnit: React.FC<AdSenseUnitProps> = ({
  client = 'ca-pub-9840710184594635',
  slot = '6804370003',
  format = 'auto',
  responsive = true,
  className = 'my-8',
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isPushed = useRef(false);

  useEffect(() => {
    if (isPushed.current) return;

    let timeoutId: any = null;
    let observer: ResizeObserver | null = null;

    const tryPush = () => {
      if (isPushed.current) return;
      const el = adRef.current;
      if (el && el.offsetWidth > 0) {
        try {
          if (typeof window !== 'undefined') {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            isPushed.current = true;
          }
        } catch (e) {
          console.warn('AdSense notice:', e);
        }
      }
    };

    if (adRef.current) {
      if (adRef.current.offsetWidth > 0) {
        tryPush();
      } else if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (entry.contentRect.width > 0) {
              tryPush();
              if (observer) observer.disconnect();
              break;
            }
          }
        });
        observer.observe(adRef.current);
      } else {
        timeoutId = setTimeout(tryPush, 300);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div className={`adsense-container w-full max-w-4xl mx-auto px-4 text-center overflow-hidden min-w-[280px] ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '250px' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};
