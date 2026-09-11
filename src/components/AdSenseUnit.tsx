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

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      // Ignore push errors (e.g. adblocker or already loaded)
    }
  }, []);

  return (
    <div className={`adsense-container max-w-4xl mx-auto px-4 text-center overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};
