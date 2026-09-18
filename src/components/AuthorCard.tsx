import React from 'react';
import { Author } from '../types';
import { MapPin, Twitter } from 'lucide-react';

interface AuthorCardProps {
  author: Author;
  className?: string;
  variant?: 'compact' | 'full';
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
    <div className={`bg-[#F9F8F6] border border-[#E8E5DF] p-6 flex flex-col sm:flex-row gap-5 items-start rounded-xs shadow-xs ${className}`}>
      <img
        src={author.avatar}
        alt={author.name}
        className="w-16 h-16 rounded-full object-cover shrink-0 border border-[#E8E5DF]"
      />
      <div className="space-y-2">
        <div>
          <span className="text-[10px] font-mono-editorial uppercase font-bold text-[#EA580C] block">
            {author.role}
          </span>
          <h4 className="font-serif-editorial text-xl font-medium text-[#111110]">
            {author.name}
          </h4>
        </div>
        <p className="text-xs sm:text-sm text-[#55524B] leading-relaxed">
          {author.bio}
        </p>
        <div className="flex items-center gap-4 text-xs font-mono-editorial text-[#6E6A62] pt-1">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#EA580C]" />
            {author.location}
          </span>
          {author.twitter && (
            <span className="flex items-center gap-1 text-[#EA580C]">
              <Twitter className="w-3 h-3" />
              @{author.twitter}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
