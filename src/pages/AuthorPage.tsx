import React, { useMemo } from 'react';
import { useMagazine } from '../context/MagazineContext';
import { AUTHORS } from '../data/authors';
import { Author, Article } from '../types';
import {
  ArrowLeft,
  MapPin,
  Twitter,
  Youtube,
  Instagram,
  Linkedin,
  Music,
  Globe,
  Calendar,
  GraduationCap,
  Sparkles,
  BookOpen,
  Mic,
  Clock,
  ExternalLink,
  Feather,
  Compass,
} from 'lucide-react';

interface AuthorPageProps {
  authorSlugOrId: string;
  onSelectStory: (slug: string) => void;
  onBack: () => void;
}

export const AuthorPage: React.FC<AuthorPageProps> = ({
  authorSlugOrId,
  onSelectStory,
  onBack,
}) => {
  const { authors, articles } = useMagazine();

  // Find author from context or fallback to static AUTHORS
  const author: Author = useMemo(() => {
    const clean = (authorSlugOrId || '').toLowerCase().trim();
    const allAuthors = [...authors, ...Object.values(AUTHORS)];
    const found = allAuthors.find(
      (a) =>
        a.id.toLowerCase() === clean ||
        (a.slug && a.slug.toLowerCase() === clean) ||
        (a.name && a.name.toLowerCase() === clean) ||
        (clean.includes('arjun') && a.id.includes('arjun'))
    );
    return found || AUTHORS.arjun;
  }, [authorSlugOrId, authors]);

  // Find articles by this author
  const authorArticles: Article[] = useMemo(() => {
    return articles.filter(
      (art) =>
        art.author?.id === author.id ||
        art.authorId === author.id ||
        (art.author?.name &&
          art.author.name.toLowerCase() === author.name.toLowerCase()) ||
        (author.id.includes('arjun') &&
          (art.id.includes('arjun') ||
            art.slug.includes('arjun') ||
            art.tags.some((t) => t.toLowerCase().includes('arjun'))))
    );
  }, [articles, author]);

  const isArjun =
    author.id === 'arjun-bharti-mina' ||
    author.id.includes('arjun') ||
    author.name.toLowerCase().includes('arjun');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FFFFFF] text-[#111110]">
      {/* Back button */}
      <div className="mb-8 pb-4 border-b border-[#E8E5DF]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6E6A62] hover:text-[#EA580C] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
      </div>

      {/* Author Header Card */}
      <header className="mb-12 bg-[#F9F8F6] border border-[#E8E5DF] p-6 sm:p-10 rounded-xs shadow-xs">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <img
            src={author.avatar}
            alt={author.name}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-2 border-[#E8E5DF] shadow-xs shrink-0"
          />
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-editorial font-bold uppercase tracking-wider text-[#EA580C]">
                {author.role}
              </span>
              {isArjun && (
                <span className="px-2 py-0.5 text-[10px] font-mono-editorial font-semibold bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/30 rounded-xs uppercase">
                  Publisher
                </span>
              )}
            </div>

            <h1 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-medium text-[#111110]">
              {author.name}
            </h1>

            {author.aliases && author.aliases.length > 0 && (
              <p className="text-xs font-mono-editorial text-[#6E6A62]">
                Also known online as{' '}
                <strong className="text-[#111110]">
                  {author.aliases.join(' & ')}
                </strong>
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-mono-editorial text-[#6E6A62] pt-1">
              {author.birthDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#EA580C]" />
                  Born {author.birthDate}
                </span>
              )}
              {author.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                  {author.location}
                </span>
              )}
              {author.education && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#EA580C]" />
                  {author.education}
                </span>
              )}
            </div>

            <p className="font-serif-editorial text-base sm:text-lg text-[#2C2A26] leading-relaxed pt-2">
              {author.bio}
            </p>

            {author.quote && (
              <blockquote className="italic font-serif-editorial text-sm sm:text-base text-[#111110] border-l-2 border-[#EA580C] pl-3 py-1 my-2">
                "{author.quote}"
              </blockquote>
            )}

            {/* Official Channels & Links */}
            <div className="flex flex-wrap items-center gap-2.5 pt-3">
              {author.spotify && (
                <a
                  href={author.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E8E5DF] text-xs font-mono-editorial font-semibold text-[#1DB954] hover:border-[#1DB954] transition-colors rounded-xs shadow-2xs"
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Spotify Artist</span>
                  <ExternalLink className="w-3 h-3 text-[#8E8A81]" />
                </a>
              )}

              {author.youtube && (
                <a
                  href={author.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E8E5DF] text-xs font-mono-editorial font-semibold text-[#EA580C] hover:border-[#EA580C] transition-colors rounded-xs shadow-2xs"
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>YouTube Channel</span>
                  <ExternalLink className="w-3 h-3 text-[#8E8A81]" />
                </a>
              )}

              {author.instagram && (
                <a
                  href={author.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E8E5DF] text-xs font-mono-editorial font-semibold text-[#E1306C] hover:border-[#E1306C] transition-colors rounded-xs shadow-2xs"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                  <ExternalLink className="w-3 h-3 text-[#8E8A81]" />
                </a>
              )}

              {author.linkedin && (
                <a
                  href={author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E8E5DF] text-xs font-mono-editorial font-semibold text-[#0077B5] hover:border-[#0077B5] transition-colors rounded-xs shadow-2xs"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-[#8E8A81]" />
                </a>
              )}

              {author.twitter && (
                <a
                  href={
                    author.twitter.startsWith('http')
                      ? author.twitter
                      : `https://x.com/${author.twitter.replace('@', '')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E8E5DF] text-xs font-mono-editorial font-semibold text-[#111110] hover:border-[#111110] transition-colors rounded-xs shadow-2xs"
                >
                  <Twitter className="w-3.5 h-3.5" />
                  <span>@{author.twitter.replace('@', '')}</span>
                  <ExternalLink className="w-3 h-3 text-[#8E8A81]" />
                </a>
              )}

              {author.website && (
                <a
                  href={author.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E8E5DF] text-xs font-mono-editorial font-semibold text-[#EA580C] hover:border-[#EA580C] transition-colors rounded-xs shadow-2xs"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Website</span>
                  <ExternalLink className="w-3 h-3 text-[#8E8A81]" />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Special Expanded Sections for Arjun Bharti Mina */}
      {isArjun && (
        <div className="space-y-8 mb-16">
          {/* Biography & Early Life */}
          <section className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 sm:p-8 rounded-xs shadow-xs space-y-4">
            <h2 className="text-xs font-mono-editorial font-bold uppercase tracking-wider text-[#EA580C] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BIOGRAPHY &amp; EARLY LIFE</span>
            </h2>
            <div className="font-serif-editorial text-base sm:text-lg text-[#2C2A26] leading-relaxed space-y-3">
              <p>
                Arjun Bharti Mina is an Indian independent music artist, digital creator, writer, YouTuber and student from Rajasthan, India. Also known online as Arjun Mina and Arjun Jareda, he works across music, storytelling, digital media, technology and creative content.
              </p>
              <p>
                Born on 13 May 2007 in Nadoti, Karauli, Rajasthan, Arjun developed an interest in music, writing, technology and digital media from an early age. He later pursued his education in Jaipur, including a B.Tech in Civil Engineering at Swami Keshwanand Institute of Technology, Management &amp; Gramothan (SKIT).
              </p>
            </div>
          </section>

          {/* Music & Creative Work */}
          <section className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 sm:p-8 rounded-xs shadow-xs space-y-4">
            <h2 className="text-xs font-mono-editorial font-bold uppercase tracking-wider text-[#EA580C] flex items-center gap-2">
              <Music className="w-3.5 h-3.5" />
              <span>MUSIC &amp; CREATIVE WORK</span>
            </h2>
            <p className="font-serif-editorial text-base sm:text-lg text-[#2C2A26] leading-relaxed">
              Music is an important part of Arjun's creative identity. As an independent artist, he writes and releases original music combining Hindi songwriting, rap, emotional themes and contemporary storytelling.
            </p>

            <div className="p-5 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs space-y-3">
              <h3 className="text-xs font-mono-editorial font-bold uppercase tracking-wider text-[#111110]">
                Publicly Listed Music Catalog
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {[
                  'Darmiyan',
                  'Raat Adhuri Hai',
                  'Lakeerien',
                  'The Civil Engineer',
                  'Raza',
                  'Street Shade',
                  'Ruh Da Hani',
                  'Shikhar Mera Hai',
                  'Bapu Mera Rab Verga',
                  'Har Dhun Pe Meena',
                  'Aahatein Teri',
                  'Mera Safar',
                ].map((song) => (
                  <div
                    key={song}
                    className="p-2.5 bg-[#FFFFFF] border border-[#E8E5DF] text-xs font-serif-editorial text-[#111110] rounded-xs shadow-2xs flex items-center gap-2"
                  >
                    <Music className="w-3 h-3 text-[#EA580C] shrink-0" />
                    <span className="truncate">{song}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-mono-editorial text-[#6E6A62] pt-1">
                Available on Spotify, Apple Music, YouTube Music, and major digital streaming platforms.
              </p>
            </div>

            <p className="font-serif-editorial text-base text-[#2C2A26] leading-relaxed pt-2">
              Beyond music, Arjun creates videos and digital projects involving storytelling, AI, editing, technology and online media. His YouTube presence under <strong>Arjun Mina</strong> is another major part of his creative journey, with third-party channel analytics listing more than <strong>21,000 subscribers and 60 million views</strong>.
            </p>
          </section>

          {/* Writing, Publishing & Podcast */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 rounded-xs shadow-xs space-y-3">
              <h2 className="text-xs font-mono-editorial font-bold uppercase tracking-wider text-[#EA580C] flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>WRITING &amp; PUBLISHING</span>
              </h2>
              <p className="font-serif-editorial text-sm sm:text-base text-[#2C2A26] leading-relaxed">
                In 2026, Arjun was listed as a co-author of <em>Dhruv Rathee’s Ultimate 100+ Career Path Guide</em>, a career-focused ebook covering more than 100 modern career possibilities, skills, industries and career pathways. Google Books lists Arjun Bharti Mina as one of the authors and describes him as an Indian independent music artist, digital creator and student from Rajasthan.
              </p>
              <p className="text-xs text-[#55524B]">
                His broader creative projects extend into visual publishing, fiction, audio storytelling and podcasting.
              </p>
            </section>

            <section className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 rounded-xs shadow-xs space-y-3">
              <h2 className="text-xs font-mono-editorial font-bold uppercase tracking-wider text-[#EA580C] flex items-center gap-2">
                <Mic className="w-3.5 h-3.5" />
                <span>PODCAST &amp; DIGITAL PRESENCE</span>
              </h2>
              <p className="font-serif-editorial text-sm sm:text-base text-[#2C2A26] leading-relaxed">
                Arjun presents <em>“Real Talk with Arjun,”</em> a podcast where he discusses his personal journey, education, content creation, music, YouTube and experiences as a young creator.
              </p>
              <p className="text-xs text-[#55524B]">
                Public podcast listings describe episodes chronicling his trajectory from childhood in Nadoti through engineering studies and independent digital content creation.
              </p>
            </section>
          </div>

          {/* Vision */}
          <section className="bg-[#F9F8F6] border border-[#E8E5DF] p-6 sm:p-8 rounded-xs shadow-xs space-y-3">
            <h2 className="text-xs font-mono-editorial font-bold uppercase tracking-wider text-[#EA580C] flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              <span>LONG-TERM VISION</span>
            </h2>
            <p className="font-serif-editorial text-base sm:text-lg text-[#2C2A26] leading-relaxed">
              Arjun Bharti Mina's work represents a combination of music, storytelling, technology and digital creativity. Rather than limiting himself to a single medium, he continues to experiment with different ways of creating and communicating.
            </p>
            <blockquote className="my-3 p-4 bg-[#FFFFFF] border-l-3 border-[#EA580C] italic text-lg text-[#111110] rounded-xs shadow-2xs">
              "His long-term vision is to build a creative identity that connects music, literature, technology and digital innovation, while encouraging young people to explore their interests, develop skills and create their own opportunities."
            </blockquote>
          </section>
        </div>
      )}

      {/* Dispatches & Articles by this Author */}
      <section className="mb-16">
        <div className="flex items-center justify-between gap-4 border-b border-[#E8E5DF] pb-4 mb-6">
          <h2 className="font-serif-editorial text-2xl font-medium text-[#111110]">
            Dispatches &amp; Stories ({authorArticles.length})
          </h2>
          <span className="text-xs font-mono-editorial text-[#8E8A81]">
            Curated by The Folded Page
          </span>
        </div>

        {authorArticles.length === 0 ? (
          <div className="p-8 text-center bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-[#55524B] text-sm font-serif-editorial">
            No published dispatches under this author yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {authorArticles.map((art) => (
              <article
                key={art.id}
                onClick={() => onSelectStory(art.slug)}
                className="group cursor-pointer bg-[#FFFFFF] border border-[#E8E5DF] hover:border-[#EA580C] transition-colors p-5 rounded-xs shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {art.heroImage && (
                    <div className="aspect-16/9 overflow-hidden rounded-xs border border-[#E8E5DF] mb-3">
                      <img
                        src={art.heroImage}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[10px] font-mono-editorial text-[#EA580C] uppercase font-bold">
                    <span>{art.category}</span>
                    <span>•</span>
                    <span className="text-[#6E6A62]">{art.readTime}</span>
                  </div>
                  <h3 className="font-serif-editorial text-xl font-medium text-[#111110] group-hover:text-[#EA580C] transition-colors leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-[#55524B] line-clamp-3 leading-relaxed">
                    {art.deck || art.subtitle}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E8E5DF] flex items-center justify-between text-xs font-mono-editorial text-[#6E6A62]">
                  <span>{art.publishedDate}</span>
                  <span className="text-[#EA580C] font-semibold group-hover:underline inline-flex items-center gap-1">
                    Read Story &rarr;
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
