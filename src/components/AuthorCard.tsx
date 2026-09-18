import React from 'react';
import { Author } from '../types';
import { MapPin, Twitter, Youtube, Instagram, Linkedin, Music, Globe } from 'lucide-react';

interface AuthorCardProps {
  author: Author;
  className?: string;
  variant?: 'compact' | 'full';
  onSelectStory?: (slug: string) => void;
}

export const AuthorCard: React.FC<AuthorCardProps> = ({
  author,
  className = '',
  variant = 'full',
}) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img
          src={author.avatar}
          alt={author.name}
          className="w-10 h-10 rounded-full object-cover border border-[#E8E5DF]"
        />
        <div>
          <span className="font-serif-editorial text-sm font-medium text-[#111110] block">
            {author.name}
          </span>
          <span className="text-[10px] font-mono-editorial text-[#6E6A62] uppercase block font-bold">
            {author.role}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#F9F8F6] border border-[#E8E5DF] p-6 sm:p-7 flex flex-col sm:flex-row gap-5 items-start rounded-xs shadow-xs ${className}`}>
      <img
        src={author.avatar}
        alt={author.name}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shrink-0 border border-[#E8E5DF]"
      />
      <div className="space-y-3 flex-1 min-w-0">
        <div>
          <span className="text-[10px] font-mono-editorial uppercase font-bold text-[#EA580C] block tracking-wider">
            {author.role}
          </span>
          <h4 className="font-serif-editorial text-xl sm:text-2xl font-medium text-[#111110] mt-0.5">
            {author.name}
          </h4>
          {author.aliases && author.aliases.length > 0 && (
            <p className="text-[11px] font-mono-editorial text-[#6E6A62] mt-0.5">
              Also known as: {author.aliases.join(', ')}
            </p>
          )}
        </div>

        <p className="text-xs sm:text-sm text-[#55524B] leading-relaxed">
          {author.bio}
        </p>

        {author.quote && (
          <p className="italic text-xs font-serif-editorial text-[#111110] border-l-2 border-[#EA580C] pl-3 py-0.5">
            "{author.quote}"
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono-editorial text-[#6E6A62] pt-1">
          {author.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
              {author.location}
            </span>
          )}
          {author.spotify && (
            <a
              href={author.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#1DB954] hover:underline"
              title="Spotify Artist"
            >
              <Music className="w-3.5 h-3.5" />
              <span>Spotify</span>
            </a>
          )}
          {author.youtube && (
            <a
              href={author.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#EA580C] hover:underline"
              title="YouTube Channel"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>YouTube</span>
            </a>
          )}
          {author.instagram && (
            <a
              href={author.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#E1306C] hover:underline"
              title="Instagram"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>
          )}
          {author.linkedin && (
            <a
              href={author.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#0077B5] hover:underline"
              title="LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>
          )}
          {author.twitter && (
            <a
              href={author.twitter.startsWith('http') ? author.twitter : `https://x.com/${author.twitter.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#111110] hover:underline"
              title="X / Twitter"
            >
              <Twitter className="w-3.5 h-3.5" />
              <span>@{author.twitter.replace('@', '')}</span>
            </a>
          )}
          {author.website && (
            <a
              href={author.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#EA580C] hover:underline"
              title="Website"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Website</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
