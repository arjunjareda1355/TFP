import React, { useState } from 'react';
import { PageRoute } from '../types';
import { CATEGORIES } from '../data/categories';
import {
  ArrowRight,
  CheckCircle2,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Rss,
  Mail,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useMagazine } from '../context/MagazineContext';
import { BrandLogo } from './BrandLogo';
import { getSocialIconComponent } from './SocialChannelsStrip';
import { DEFAULT_SOCIAL_CHANNELS } from '../data/social';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export interface FooterProps {
  onNavigate?: (route: PageRoute) => void;
  onNavigateHome?: () => void;
  onNavigateCategory?: (categorySlug: string) => void;
  onNavigateToday?: () => void;
  onNavigateExplore?: () => void;
  onNavigateIssues?: (issueId?: string) => void;
  onNavigateSeries?: (seriesId?: string) => void;
  onNavigateAbout?: () => void;
  onNavigateNewsletter?: () => void;
  onNavigateSaved?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onNavigateHome,
  onNavigateCategory,
  onNavigateToday,
  onNavigateExplore,
  onNavigateIssues,
  onNavigateSeries,
  onNavigateAbout,
  onNavigateNewsletter,
  onNavigateSaved,
}) => {
  const { setIsNewsletterOpen, series, issues, socialChannels, isAuthenticated, isOwner, openAuthModal } = useMagazine();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const activeFooterChannels =
    socialChannels && socialChannels.length > 0
      ? socialChannels.filter((c) => c.isActive !== false)
      : DEFAULT_SOCIAL_CHANNELS;

  const handleNav = (route: PageRoute) => {
    try {
      if (onNavigate) {
        onNavigate(route);
      } else {
        switch (route.type) {
          case 'home':
            if (onNavigateHome) onNavigateHome();
            else window.location.hash = '/';
            break;
          case 'category':
            if (onNavigateCategory) onNavigateCategory(route.categorySlug);
            else window.location.hash = `/category/${route.categorySlug}`;
            break;
          case 'today':
            if (onNavigateToday) onNavigateToday();
            else window.location.hash = '/today';
            break;
          case 'explore':
            if (onNavigateExplore) onNavigateExplore();
            else window.location.hash = '/explore';
            break;
          case 'issues':
            if (onNavigateIssues) onNavigateIssues(route.issueId);
            else window.location.hash = route.issueId ? `/issues/${route.issueId}` : '/issues';
            break;
          case 'series':
            if (onNavigateSeries) onNavigateSeries(route.seriesId);
            else window.location.hash = route.seriesId ? `/series/${route.seriesId}` : '/series';
            break;
          case 'about':
            if (onNavigateAbout) onNavigateAbout();
            else window.location.hash = '/about';
            break;
          case 'newsletter':
            if (onNavigateNewsletter) onNavigateNewsletter();
            else window.location.hash = '/newsletter';
            break;
          case 'saved':
            if (onNavigateSaved) onNavigateSaved();
            else window.location.hash = '/saved';
            break;
          case 'admin':
            window.location.hash = route.subview ? `/admin/${route.subview}` : '/admin/overview';
            break;
          default:
            window.location.hash = '/';
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Footer navigation error:', err);
      window.location.hash = '/';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.subscribeNewsletter(cleanEmail, 'weekly');
      setSubscribed(true);
      setSuccessMessage(res.message || 'Please check your inbox to confirm your subscription.');
      showToast(res.message || 'Subscription request received.', 'success');
      setEmail('');
    } catch (err: any) {
      const msg = err.message || 'Failed to process subscription.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Curate display items
  const displaySeries = series && series.length > 0 ? series.slice(0, 5) : [
    { id: 'the-fold', name: 'THE FOLD' },
    { id: 'the-discovery', name: 'The Discovery Log' },
    { id: 'people-to-know', name: 'People To Know' },
    { id: 'places-to-see', name: 'Places To See' },
    { id: 'why-it-matters', name: 'Why It Matters' },
  ];

  const displayIssues = issues && issues.length > 0 ? issues.slice(0, 3) : [
    { id: 'issue-04', number: 'ISSUE 04', title: 'The Solitude Project' },
    { id: 'issue-03', number: 'ISSUE 03', title: 'The Things We Love' },
    { id: 'issue-02', number: 'ISSUE 02', title: 'The Internet Issue' },
  ];

  return (
    <footer className="bg-[#FFFFFF] text-[#111110] pt-16 pb-12 border-t border-[#E8E5DF] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Brand statement banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-[#E8E5DF]">
          <div className="lg:col-span-6 space-y-4">
            <button
              onClick={() => handleNav({ type: 'home' })}
              className="text-left focus:outline-none block hover:opacity-90 transition-opacity"
            >
              <BrandLogo variant="header-brand" size={46} theme="light" />
            </button>
            <p className="text-sm text-[#55524B] font-normal leading-relaxed max-w-md pt-2">
              A modern editorial magazine covering trending, popular, unique, unusual, fascinating, and noteworthy things from around the world. We follow human curiosity over algorithmic noise.
            </p>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="bg-[#F9F8F6] p-6 border border-[#E8E5DF] rounded-xs shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C] block mb-1 font-mono-editorial">
                THE FOLDED LETTER
              </span>
              <h4 className="font-serif-editorial text-xl font-medium text-[#111110] mb-2">
                Interesting things, beautifully delivered.
              </h4>
              <p className="text-xs text-[#55524B] mb-4">
                A weekly curated dispatch of stories, ideas, and discoveries worth knowing. Never spam, strictly substance.
              </p>

              {subscribed ? (
                <div className="bg-[#F0FDF4] border border-[#86EFAC] p-3 text-xs text-[#16A34A] flex items-center gap-2 rounded-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
                  <span>{successMessage || 'You are subscribed to The Folded Letter. Welcome aboard.'}</span>
                </div>
              ) : (
                <div>
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <input
                      type="email"
                      required
                      disabled={loading}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Enter your email address"
                      className="flex-1 bg-[#FFFFFF] border border-[#E8E5DF] text-xs text-[#111110] px-3.5 py-2.5 focus:outline-none focus:border-[#EA580C] placeholder:text-[#8E8A81] rounded-xs disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 transition-colors flex items-center gap-1.5 shrink-0 rounded-xs shadow-xs disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Subscribe</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </form>
                  {error && (
                    <div className="flex items-center gap-1 text-[11px] text-[#DC2626] mt-1.5 font-mono-editorial">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle navigation columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 py-12 border-b border-[#E8E5DF] text-xs">
          {/* Main Sections */}
          <div>
            <h5 className="font-mono-editorial text-[11px] uppercase tracking-widest text-[#8E8A81] mb-4 font-semibold">
              Sections
            </h5>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => handleNav({ type: 'home' })}
                  className="hover:text-[#EA580C] text-[#55524B] transition-colors text-left"
                >
                  Front Page
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ type: 'category', categorySlug: 'trending' })}
                  className="hover:text-[#EA580C] text-[#55524B] transition-colors text-left"
                >
                  Trending Now
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ type: 'category', categorySlug: 'popular' })}
                  className="hover:text-[#EA580C] text-[#55524B] transition-colors text-left"
                >
                  Popular Right Now
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ type: 'category', categorySlug: 'unique' })}
                  className="hover:text-[#EA580C] text-[#55524B] transition-colors text-left"
                >
                  Unique Discoveries
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ type: 'category', categorySlug: 'special' })}
                  className="hover:text-[#EA580C] text-[#55524B] transition-colors text-left"
                >
                  Special Profiles
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ type: 'today' })}
                  className="hover:text-[#EA580C] text-[#55524B] transition-colors text-left"
                >
                  Today's Briefing
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ type: 'explore' })}
                  className="hover:text-[#EA580C] text-[#55524B] transition-colors text-left font-medium"
                >
                  Explore Archive →
                </button>
              </li>
            </ul>
          </div>

          {/* Categories Grid */}
          <div>
            <h5 className="font-mono-editorial text-[11px] uppercase tracking-widest text-[#8E8A81] mb-4 font-semibold">
              Categories
            </h5>
            <ul className="space-y-2.5">
              {CATEGORIES.slice(4, 10).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleNav({ type: 'category', categorySlug: cat.slug })}
                    className="hover:text-[#EA580C] text-[#55524B] transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Editorial Series */}
          <div>
            <h5 className="font-mono-editorial text-[11px] uppercase tracking-widest text-[#8E8A81] mb-4 font-semibold">
              Editorial Series
            </h5>
            <ul className="space-y-2.5">
              {displaySeries.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => handleNav({ type: 'series', seriesId: s.id })}
                    className="hover:text-[#EA580C] text-[#55524B] transition-colors text-left"
                  >
                    {s.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleNav({ type: 'series' })}
                  className="hover:text-[#EA580C] text-[#EA580C] transition-colors text-left font-semibold"
                >
                  All Series Overview →
                </button>
              </li>
            </ul>
          </div>

          {/* Editions & Issues */}
          <div>
            <h5 className="font-mono-editorial text-[11px] uppercase tracking-widest text-[#8E8A81] mb-4 font-semibold">
              Editions
            </h5>
            <ul className="space-y-2.5">
              {displayIssues.map((iss) => (
                <li key={iss.id}>
                  <button
                    onClick={() => handleNav({ type: 'issues', issueId: iss.id })}
                    className="hover:text-[#EA580C] text-[#55524B] transition-colors text-left line-clamp-1"
                    title={`${iss.number}: ${iss.title}`}
                  >
                    {iss.number}: {iss.title}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleNav({ type: 'issues' })}
                  className="hover:text-[#EA580C] text-[#EA580C] transition-colors text-left font-semibold"
                >
                  View All Archives →
                </button>
              </li>
            </ul>
          </div>

          {/* Social Media Accounts & Feeds */}
          <div>
            <h5 className="font-mono-editorial text-[11px] uppercase tracking-widest text-[#8E8A81] mb-4 font-semibold">
              Social & Feeds
            </h5>
            <ul className="space-y-2.5">
              {activeFooterChannels.map((ch) => {
                const Icon = getSocialIconComponent(ch.iconName, ch.id);
                const isNewsletter = ch.id === 'newsletter' || ch.url === '#newsletter';

                if (isNewsletter) {
                  return (
                    <li key={ch.id}>
                      <button
                        onClick={() => setIsNewsletterOpen(true)}
                        className="hover:text-[#EA580C] text-[#55524B] transition-colors inline-flex items-center gap-1.5 text-left"
                      >
                        <Icon className="w-3 h-3 text-[#111110]" />
                        <span>{ch.name}</span>
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={ch.id}>
                    <a
                      href={ch.url}
                      target={ch.url.startsWith('/') ? undefined : '_blank'}
                      rel={ch.url.startsWith('/') ? undefined : 'noopener noreferrer'}
                      className="hover:text-[#EA580C] text-[#55524B] transition-colors inline-flex items-center gap-1.5"
                    >
                      <Icon className="w-3 h-3 text-[#111110]" />
                      <span>{ch.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* About & Journal */}
          <div>
            <h5 className="font-mono-editorial text-[11px] uppercase tracking-widest text-[#8E8A81] mb-4 font-semibold">
              The Masthead
            </h5>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => handleNav({ type: 'about' })}
                  className="hover:text-[#EA580C] text-[#55524B] transition-colors text-left"
                >
                  Editorial Manifesto
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ type: 'newsletter' })}
                  className="hover:text-[#EA580C] text-[#55524B] transition-colors text-left"
                >
                  The Folded Letter Dispatch
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ type: 'saved' })}
                  className="hover:text-[#EA580C] text-[#55524B] transition-colors text-left"
                >
                  Your Saved Reading List
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsNewsletterOpen(true)}
                  className="hover:text-[#EA580C] text-[#55524B] transition-colors text-left"
                >
                  Membership & Audio
                </button>
              </li>
              {!isAuthenticated ? (
                <>
                  <li>
                    <button
                      onClick={() => openAuthModal('login')}
                      className="hover:text-[#EA580C] text-[#55524B] transition-colors text-left"
                    >
                      Sign In to Account
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => openAuthModal('signup')}
                      className="hover:text-[#EA580C] text-[#EA580C] font-semibold transition-colors text-left"
                    >
                      Create Reader Account
                    </button>
                  </li>
                </>
              ) : (
                isOwner && (
                  <li>
                    <button
                      onClick={() => handleNav({ type: 'admin', subview: 'overview' })}
                      className="hover:text-[#EA580C] text-[#8E8A81] hover:underline transition-colors text-left font-mono-editorial text-[11px] pt-1 block"
                    >
                      Publisher CMS Desk &rarr;
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom copyright and legal statement */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8E8A81] font-mono-editorial">
          <div className="flex items-center gap-2">
            <span>© 2026 THE FOLDED PAGE</span>
            <span>•</span>
            <span className="text-[#EA580C]">WHAT'S WORTH KNOWING.</span>
          </div>

          <div className="flex items-center gap-6">
            <span>PRINT & DIGITAL REGISTRY</span>
            <span>ISSN 2981-9041</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

