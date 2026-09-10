import React, { useState } from 'react';
import { Share2, Link as LinkIcon, Twitter, Mail, Check, Facebook } from 'lucide-react';
import { Article } from '../types';

interface ShareMenuProps {
  article: Article;
  className?: string;
  variant?: 'button' | 'inline';
}

export const ShareMenu: React.FC<ShareMenuProps> = ({
  article,
  className = '',
  variant = 'button',
}) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}`
    : 'https://thefoldedpage.press';
  const url = `${baseUrl}/#/${encodeURIComponent(article.title || article.slug)}`;
  const text = `"${article.title}" — via The Folded Page`;

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const shareViaEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `mailto:?subject=${encodeURIComponent(
      `Fascinating read: ${article.title}`
    )}&body=${encodeURIComponent(`${article.deck}\n\nRead the full dispatch here: ${url}`)}`;
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={copyToClipboard}
          className="p-2 bg-[#F9F8F6] hover:bg-[#F5F4F0] text-[#55524B] hover:text-[#111110] border border-[#E8E5DF] transition-colors rounded-xs flex items-center gap-1.5 text-xs font-mono-editorial"
          title="Copy direct link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <LinkIcon className="w-3.5 h-3.5" />}
          <span>{copied ? 'Link Copied' : 'Copy'}</span>
        </button>
        <button
          onClick={shareToTwitter}
          className="p-2 bg-[#F9F8F6] hover:bg-[#F5F4F0] text-[#55524B] hover:text-[#111110] border border-[#E8E5DF] transition-colors rounded-xs"
          title="Share to X"
        >
          <Twitter className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={shareViaEmail}
          className="p-2 bg-[#F9F8F6] hover:bg-[#F5F4F0] text-[#55524B] hover:text-[#111110] border border-[#E8E5DF] transition-colors rounded-xs"
          title="Share via Email"
        >
          <Mail className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 text-[#6E6A62] hover:text-[#111110] transition-colors"
        title="Share dispatch"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 bottom-full mb-2 w-48 bg-[#FFFFFF] border border-[#E8E5DF] shadow-xl p-2 z-30 rounded-xs space-y-1"
        >
          <button
            onClick={copyToClipboard}
            className="w-full text-left px-3 py-1.5 text-xs font-mono-editorial text-[#55524B] hover:text-[#111110] hover:bg-[#F9F8F6] flex items-center gap-2 rounded-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <LinkIcon className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy link'}</span>
          </button>
          <button
            onClick={shareToTwitter}
            className="w-full text-left px-3 py-1.5 text-xs font-mono-editorial text-[#55524B] hover:text-[#111110] hover:bg-[#F9F8F6] flex items-center gap-2 rounded-xs"
          >
            <Twitter className="w-3.5 h-3.5" />
            <span>Post to X</span>
          </button>
          <button
            onClick={shareViaEmail}
            className="w-full text-left px-3 py-1.5 text-xs font-mono-editorial text-[#55524B] hover:text-[#111110] hover:bg-[#F9F8F6] flex items-center gap-2 rounded-xs"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>
        </div>
      )}
    </div>
  );
};
