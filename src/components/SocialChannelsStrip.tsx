import React from 'react';
import {
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Rss,
  Mail,
  ExternalLink,
  Radio,
  Share2,
  Edit3,
  Globe,
  MessageSquare,
  Bookmark,
  Send,
} from 'lucide-react';
import { useMagazine } from '../context/MagazineContext';
import { SocialChannel } from '../types';
import { DEFAULT_SOCIAL_CHANNELS } from '../data/social';

export const getSocialIconComponent = (iconName?: string, id?: string) => {
  const normalized = (iconName || id || '').toLowerCase();
  if (normalized.includes('twitter') || normalized.includes('x')) return Twitter;
  if (normalized.includes('instagram')) return Instagram;
  if (normalized.includes('youtube')) return Youtube;
  if (normalized.includes('linkedin')) return Linkedin;
  if (normalized.includes('rss') || normalized.includes('feed')) return Rss;
  if (normalized.includes('newsletter') || normalized.includes('mail')) return Mail;
  if (normalized.includes('telegram') || normalized.includes('send')) return Send;
  if (normalized.includes('message') || normalized.includes('chat')) return MessageSquare;
  if (normalized.includes('bookmark')) return Bookmark;
  return Globe;
};

interface SocialChannelsStripProps {
  onOpenNewsletter?: () => void;
}

export const SocialChannelsStrip: React.FC<SocialChannelsStripProps> = ({
  onOpenNewsletter,
}) => {
  const { socialChannels, isOwner, isAuthenticated } = useMagazine();

  const channelsToDisplay: SocialChannel[] =
    socialChannels && socialChannels.length > 0
      ? socialChannels.filter((c) => c.isActive !== false)
      : DEFAULT_SOCIAL_CHANNELS;

  return (
    <section
      id="social-channels-section"
      className="py-14 sm:py-18 bg-[#F9F8F6] border-y border-[#E8E5DF] transition-colors"
      aria-label="Social Media and Editorial Channels"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#E8E5DF] gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono-editorial font-bold uppercase tracking-widest text-[#EA580C] mb-2">
              <Share2 className="w-3.5 h-3.5" />
              <span>FOLLOW & ENGAGE</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-serif-editorial text-3xl sm:text-4xl font-medium tracking-tight text-[#111110]">
                Editorial Channels & Feeds
              </h2>
              {isOwner && (
                <a
                  href="#admin/social"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#111110] text-[#FFFFFF] hover:bg-[#EA580C] text-xs font-mono-editorial font-bold rounded-xs transition-colors shadow-xs"
                  title="Edit Social Media Links & Feeds"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Links</span>
                </a>
              )}
            </div>
            <p className="font-serif-editorial italic text-sm sm:text-base text-[#6E6A62] mt-1">
              "Follow The Folded Page across social mediums, open syndication feeds, and digital platforms."
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono-editorial text-xs text-[#8E8A81]">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#16A34A] animate-pulse" />
              <span>{channelsToDisplay.length} ACTIVE CHANNELS</span>
            </span>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {channelsToDisplay.map((ch) => {
            const Icon = getSocialIconComponent(ch.iconName, ch.id);
            const isNewsletter = ch.id === 'newsletter' || ch.url === '#newsletter';

            return (
              <a
                key={ch.id}
                id={`social-channel-${ch.id}`}
                href={ch.url}
                target={isNewsletter ? undefined : '_blank'}
                rel={isNewsletter ? undefined : 'noopener noreferrer'}
                onClick={
                  isNewsletter && onOpenNewsletter
                    ? (e) => {
                        e.preventDefault();
                        onOpenNewsletter();
                      }
                    : undefined
                }
                className="group relative bg-[#FFFFFF] border border-[#E8E5DF] hover:border-[#111110] p-6 rounded-xs transition-all duration-200 hover:shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xs bg-[#F9F8F6] border border-[#E8E5DF] group-hover:bg-[#111110] group-hover:text-[#FFFFFF] text-[#111110] flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-2">
                      {ch.badge && (
                        <span className="text-[10px] font-mono-editorial font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F4F3EF] text-[#6E6A62] border border-[#E8E5DF] rounded-xs">
                          {ch.badge}
                        </span>
                      )}
                      <ExternalLink className="w-3.5 h-3.5 text-[#8E8A81] group-hover:text-[#111110] transition-colors" />
                    </div>
                  </div>

                  <div className="mb-2">
                    <h3 className="font-serif-editorial text-xl font-bold text-[#111110] group-hover:text-[#EA580C] transition-colors">
                      {ch.name}
                    </h3>
                    <span className="font-mono-editorial text-xs text-[#EA580C] font-medium">
                      {ch.handle}
                    </span>
                  </div>

                  <p className="text-xs text-[#55524B] leading-relaxed font-normal mt-1">
                    {ch.description}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-[#E8E5DF] flex items-center justify-between text-xs font-mono-editorial">
                  <span className="text-[#8E8A81]">
                    Audience: <strong className="text-[#111110] font-semibold">{ch.followerCount || 'Subscribers'}</strong>
                  </span>
                  <span className="text-[#111110] font-semibold group-hover:text-[#EA580C] transition-colors inline-flex items-center gap-1">
                    <span>Connect</span>
                    <span>→</span>
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

