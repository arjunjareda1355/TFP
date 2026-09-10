import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { useMagazine } from '../context/MagazineContext';

export const ShareModal: React.FC = () => {
  const { shareArticle, setShareArticle } = useMagazine();
  const [copied, setCopied] = useState(false);

  if (!shareArticle) return null;

  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}`
    : 'https://thefoldedpage.press';
  const articleTitle = shareArticle.title || shareArticle.slug;
  const currentUrl = `${baseUrl}/#/${encodeURIComponent(articleTitle)}`;
  const shareText = `"${shareArticle.title}" — The Folded Page: What's worth knowing`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const shareOptions = [
    {
      name: 'X (formerly Twitter)',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
      color: 'bg-black text-white',
    },
    {
      name: 'WhatsApp',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`,
      color: 'bg-[#25D366] text-white',
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      color: 'bg-[#0A66C2] text-white',
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      color: 'bg-[#1877F2] text-white',
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={() => setShareArticle(null)}
    >
      <div
        className="w-full max-w-md bg-[#FFFFFF] border border-[#E8E5DF] shadow-2xl p-6 relative rounded-xs animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShareArticle(null)}
          className="absolute top-4 right-4 p-1.5 text-[#6E6A62] hover:text-[#111110] hover:bg-[#F5F4F0] rounded-xs transition-colors"
          aria-label="Close share modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-2 font-mono-editorial">
          <Share2 className="w-3.5 h-3.5" />
          <span>PASS IT ALONG</span>
        </div>

        <h3 className="font-serif-editorial text-2xl font-medium text-[#111110] mb-2 leading-tight">
          Share this story
        </h3>

        <p className="text-xs text-[#55524B] mb-6 line-clamp-2">
          {shareArticle.title}
        </p>

        {/* Copy Link Field */}
        <div className="mb-6">
          <label className="block text-[10px] font-mono-editorial uppercase text-[#6E6A62] tracking-wider mb-1.5 font-bold">
            Article Web Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-[#F9F8F6] border border-[#E8E5DF] text-xs text-[#111110] px-3 py-2 select-all focus:outline-none rounded-xs"
            />
            <button
              onClick={handleCopy}
              className="bg-[#111110] hover:bg-[#EA580C] text-white text-xs font-semibold uppercase tracking-wider px-3.5 py-2 transition-colors flex items-center gap-1.5 rounded-xs shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share buttons */}
        <div className="space-y-2">
          <label className="block text-[10px] font-mono-editorial uppercase text-[#6E6A62] tracking-wider mb-2 font-bold">
            Social Networks & Messaging
          </label>
          <div className="grid grid-cols-2 gap-2">
            {shareOptions.map((opt) => (
              <a
                key={opt.name}
                href={opt.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center py-2.5 px-3 text-xs font-medium ${opt.color} hover:opacity-90 transition-opacity rounded-xs shadow-xs`}
              >
                {opt.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
