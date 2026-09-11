import React, { useState, useEffect } from 'react';
import { Search, Bookmark, Menu, X, ArrowRight, Sparkles, BookOpen, Compass, Flame, TrendingUp, Layers, Mail, Volume2, ShieldCheck } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import { useMagazine } from '../context/MagazineContext';
import { BrandLogo } from './BrandLogo';
import { CATEGORIES } from '../data/categories';
import { AdminTab } from './admin/AdminLayout';

interface NavbarProps {
  onNavigateHome: () => void;
  onNavigateCategory: (slug: string) => void;
  onNavigateToday: () => void;
  onNavigateExplore: () => void;
  onNavigateIssues: () => void;
  onNavigateSeries: () => void;
  onNavigateAbout: () => void;
  onNavigateSaved: () => void;
  onNavigateAdmin?: (tab?: AdminTab) => void;
  onNavigateNewsletter?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateHome,
  onNavigateCategory,
  onNavigateToday,
  onNavigateExplore,
  onNavigateIssues,
  onNavigateSeries,
  onNavigateAbout,
  onNavigateSaved,
  onNavigateAdmin,
  onNavigateNewsletter,
}) => {
  const {
    savedStories,
    setIsSearchOpen,
    setIsNewsletterOpen,
    openAuthModal,
    isOwner,
    isAuthenticated,
    currentUser,
    logout,
    logoutAdmin,
  } = useMagazine();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // Lock body scroll when drawer menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { label: 'Home', action: onNavigateHome },
    { label: 'Trending', action: () => onNavigateCategory('trending'), icon: Flame },
    { label: 'Popular', action: () => onNavigateCategory('popular'), icon: TrendingUp },
    { label: 'Unique', action: () => onNavigateCategory('unique'), icon: Sparkles },
    { label: 'Special', action: () => onNavigateCategory('special'), icon: Bookmark },
    { label: 'Explore', action: onNavigateExplore, icon: Compass },
    { label: 'Issues', action: onNavigateIssues, icon: BookOpen },
    { label: 'Today', action: onNavigateToday },
    { label: 'About', action: onNavigateAbout },
    {
      label: 'Newsletter',
      action: () => {
        if (onNavigateNewsletter) {
          onNavigateNewsletter();
        } else {
          setIsNewsletterOpen(true);
        }
      },
      icon: Mail,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full transition-all duration-300 bg-[#FFFFFF]">
        {/* Top micro-bar for date and editorial tagline (Pure White & Charcoal) */}
        <div className="bg-[#FAFAFA] text-[#55524B] text-[11px] py-1.5 px-4 sm:px-8 border-b border-[#E8E5DF] font-mono-editorial hidden md:flex justify-between items-center tracking-wide">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-[#111110]">VOL. 04 — NO. 88</span>
            <span className="text-[#D4CEBF]">•</span>
            <span>AUGUST 31, 2026</span>
            <span className="text-[#D4CEBF]">•</span>
            <span className="text-[#111110] italic font-serif-editorial">"What's worth knowing."</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#736E65]">GLOBAL DIGITAL EDITION</span>
            <span className="text-[#D4CEBF]">•</span>
            <button 
              id="top-bar-newsletter-btn"
              onClick={() => setIsNewsletterOpen(true)}
              className="text-[#111110] font-semibold hover:text-[#EA580C] transition-colors underline-offset-2 hover:underline flex items-center gap-1"
            >
              <Mail className="w-3 h-3 text-[#EA580C]" />
              <span>Join The Folded Letter</span>
            </button>
          </div>
        </div>

        {/* Main navigation container - Pure White Editorial */}
        <div
          className={`w-full transition-all duration-300 border-b border-[#E8E5DF] bg-[#FFFFFF] ${
            isScrolled
              ? 'py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
              : 'py-3.5 sm:py-4'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Logo with official folded page brand mark & masthead image */}
            <div className="flex items-center gap-4">
              <button
                id="brand-logo-btn"
                onClick={() => {
                  onNavigateHome();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group flex items-center text-left focus:outline-none transition-transform hover:opacity-95"
                title="The Folded Page — Home"
                aria-label="The Folded Page Home"
              >
                <BrandLogo
                  variant="header-brand"
                  size={isScrolled ? 36 : 42}
                  theme="light"
                />
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-[#55524B]">
              {navLinks.map((item, idx) => {
                return (
                  <button
                    key={idx}
                    id={`nav-link-${item.label.toLowerCase()}`}
                    onClick={() => {
                      item.action();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-2.5 py-1.5 rounded transition-all text-[#55524B] hover:text-[#111110] hover:bg-[#F5F4F0]"
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Search Trigger with Brand Badge */}
              <button
                id="search-trigger-btn"
                onClick={() => setIsSearchOpen(true)}
                className="px-2.5 py-1.5 text-[#55524B] hover:text-[#111110] hover:bg-[#F5F4F0] transition-all rounded border border-[#E8E5DF] hover:border-[#EA580C]/50 flex items-center gap-2 text-xs font-medium group"
                title="Search The Folded Page (Ctrl + K)"
                aria-label="Search articles"
              >
                <BrandLogo variant="emblem" size={16} theme="light" className="opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-transform" />
                <span className="hidden sm:inline text-[11px] font-mono-editorial text-[#55524B] group-hover:text-[#111110]">Search</span>
                <kbd className="hidden md:inline-flex items-center gap-0.5 text-[9px] font-mono text-[#8E8A81] bg-[#F5F4F0] px-1.5 py-0.5 rounded border border-[#E8E5DF]">
                  ⌘K
                </kbd>
              </button>

              {/* Saved Stories Trigger */}
              <button
                id="saved-stories-trigger-btn"
                onClick={onNavigateSaved}
                className="p-2 text-[#55524B] hover:text-[#111110] hover:bg-[#F5F4F0] transition-colors rounded relative border border-[#E8E5DF]"
                title="Saved Stories"
                aria-label="Saved Stories"
              >
                <Bookmark className="w-4 h-4" />
                {savedStories.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EA580C] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {savedStories.length}
                  </span>
                )}
              </button>

              {/* Auth Integration: Header Controls */}
              {!isAuthenticated ? (
                <>
                  {/* Desktop Auth Buttons */}
                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      id="navbar-signin-btn"
                      onClick={() => openAuthModal('login')}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#111110] hover:text-[#EA580C] hover:bg-[#F5F4F0] rounded-xs border border-[#E8E5DF] transition-colors cursor-pointer"
                      title="Sign in to your account"
                    >
                      <span>Sign In</span>
                    </button>

                    <button
                      id="navbar-signup-btn"
                      onClick={() => openAuthModal('signup')}
                      className="inline-flex items-center gap-1.5 bg-[#111110] hover:bg-[#EA580C] text-white text-xs font-semibold uppercase tracking-wider px-3 py-1.5 transition-colors duration-150 rounded-xs shadow-xs cursor-pointer"
                      title="Create a free reader account"
                    >
                      <span>Create Account</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <SignedIn>
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          userButtonAvatarBox: 'w-7 h-7 ring-1 ring-[#E8E5DF] hover:ring-[#EA580C]',
                        },
                      }}
                    />
                  </SignedIn>
                  {!currentUser?.id?.startsWith('user_') && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-full bg-[#111110] text-white flex items-center justify-center text-xs font-bold font-serif-editorial">
                        {currentUser?.name?.charAt(0) || 'A'}
                      </div>
                      <button
                        onClick={() => {
                          if (typeof logout === 'function') logout();
                          else if (typeof logoutAdmin === 'function') logoutAdmin();
                        }}
                        className="text-[11px] font-mono-editorial text-[#8E8A81] hover:text-[#EA580C] px-2 py-1 border border-[#E8E5DF] rounded-xs transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Header Subscribe Button */}
              <button
                id="header-subscribe-btn"
                type="button"
                onClick={() => setIsNewsletterOpen(true)}
                className="hidden lg:inline-flex items-center gap-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold uppercase tracking-wider px-3 py-2 transition-colors rounded-xs shadow-xs cursor-pointer"
                title="Subscribe to The Folded Letter"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Subscribe</span>
              </button>

              {/* 3-Line Hamburger Menu Toggle (Works seamlessly on all screen sizes) */}
              <button
                id="three-line-menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 transition-all rounded-xs border ${
                  isMenuOpen
                    ? 'bg-[#111110] text-white border-[#111110]'
                    : 'bg-[#F9F8F6] text-[#111110] border-[#E8E5DF] hover:bg-[#EAE8E2]'
                }`}
                title="Open Navigation Menu (☰)"
                aria-label="Toggle Complete Navigation Menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-over Full Navigation Drawer (Clean Pure White & Charcoal) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="relative ml-auto w-full max-w-md bg-[#FFFFFF] border-l border-[#E8E5DF] h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between z-10 shadow-2xl animate-in slide-in-from-right duration-250">
            <div>
              {/* Drawer Top Bar */}
              <div className="flex items-center justify-between pb-5 border-b border-[#E8E5DF] mb-6">
                <BrandLogo variant="header-brand" size={34} theme="light" />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-[#55524B] hover:text-[#111110] bg-[#F5F4F0] hover:bg-[#EAE8E2] transition-colors rounded"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions Search Bar */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E8E5DF] hover:border-[#EA580C] rounded text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5 text-xs text-[#6E6A62]">
                    <Search className="w-4 h-4 text-[#EA580C]" />
                    <span className="font-serif-editorial text-sm text-[#111110]">Search all stories & topics...</span>
                  </div>
                  <kbd className="text-[10px] font-mono bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E8E5DF] text-[#8E8A81]">
                    ⌘K
                  </kbd>
                </button>
              </div>

              {/* Main Section Navigation Links */}
              <div className="space-y-1 mb-6">
                <span className="text-[11px] font-mono-editorial font-bold uppercase text-[#8E8A81] tracking-wider block mb-2 px-2">
                  Editorial Sections
                </span>
                {navLinks.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        item.action();
                        setIsMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left font-serif-editorial text-lg rounded text-[#111110] hover:bg-[#F5F4F0] hover:text-[#EA580C] transition-colors group"
                    >
                      <span className="flex items-center gap-3">
                        {Icon && <Icon className="w-4 h-4 text-[#EA580C]" />}
                        <span className="font-medium">{item.label}</span>
                      </span>
                      <span className="text-xs font-mono-editorial text-[#A8A49C] group-hover:text-[#EA580C]">
                        0{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Category Topics Grid */}
              <div className="pt-4 border-t border-[#E8E5DF] mb-6">
                <span className="text-[11px] font-mono-editorial font-bold uppercase text-[#8E8A81] tracking-wider block mb-3 px-2">
                  Browse by Subject
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.slice(0, 8).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onNavigateCategory(cat.slug);
                        setIsMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-left px-3 py-2 bg-[#F9F8F6] hover:bg-[#F0EDE6] rounded text-xs text-[#111110] hover:text-[#EA580C] transition-colors border border-[#E8E5DF] truncate"
                    >
                      <span className="font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Drawer Actions & Account */}
            <div className="pt-4 border-t border-[#E8E5DF] space-y-3">
              {/* Account Drawer Block */}
              <div className="p-3 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs">
                {!isAuthenticated ? (
                  <div>
                    <div className="text-left mb-2">
                      <span className="text-[11px] font-mono-editorial font-bold uppercase text-[#8E8A81] tracking-wider block">
                        Member & Reader Access
                      </span>
                      <p className="text-xs text-[#6E6A62] font-serif-editorial italic mt-0.5">
                        Sign in to sync saved stories, preferences, and reading history.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        type="button"
                        id="menu-signin-btn"
                        onClick={() => {
                          setIsMenuOpen(false);
                          openAuthModal('login');
                        }}
                        className="w-full py-2.5 px-3 text-center text-xs font-semibold text-[#111110] bg-[#FFFFFF] border border-[#E8E5DF] hover:bg-[#F5F4F0] rounded-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        id="menu-signup-btn"
                        onClick={() => {
                          setIsMenuOpen(false);
                          openAuthModal('signup');
                        }}
                        className="w-full py-2.5 px-3 text-center text-xs font-semibold text-white bg-[#111110] hover:bg-[#EA580C] rounded-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E8E5DF]">
                      <div className="flex items-center gap-2">
                        <SignedIn>
                          <UserButton afterSignOutUrl="/" showName={true} />
                        </SignedIn>
                        {!currentUser?.id?.startsWith('user_') && (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#111110] text-white flex items-center justify-center text-xs font-bold font-serif-editorial">
                              {currentUser?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-bold text-[#111110] block leading-tight">
                                {currentUser?.name || 'Reader'}
                              </span>
                              <span className="text-[10px] text-[#8E8A81] font-mono-editorial block">
                                {currentUser?.email}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono-editorial uppercase font-bold text-[#16A34A] bg-[#DCFCE7] border border-[#BBF7D0] px-2 py-0.5 rounded-xs">
                          Active Session
                        </span>
                        {!currentUser?.id?.startsWith('user_') && (
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof logout === 'function') logout();
                              else if (typeof logoutAdmin === 'function') logoutAdmin();
                              setIsMenuOpen(false);
                            }}
                            className="text-[10px] font-mono-editorial text-[#8E8A81] hover:text-[#EA580C] px-1.5 py-0.5 border border-[#E8E5DF] rounded-xs cursor-pointer"
                          >
                            Logout
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Publisher CMS Desk Button - STRICTLY shown ONLY after login with owners email */}
                    {isOwner && (
                      <button
                        type="button"
                        id="menu-staff-cms-desk-button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          if (onNavigateAdmin) {
                            onNavigateAdmin('overview');
                          } else {
                            window.location.hash = '/admin/overview';
                          }
                        }}
                        className="w-full group flex items-center justify-between p-3 bg-[#FFFFFF] hover:bg-[#FFF7ED] border border-[#E8E5DF] hover:border-[#EA580C] rounded-xs transition-all shadow-xs text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xs bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C] group-hover:scale-105 transition-transform shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono-editorial font-bold uppercase tracking-wider text-[#111110] group-hover:text-[#EA580C] block transition-colors">
                                Staff CMS Desk
                              </span>
                              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 bg-[#EA580C] text-white rounded-xs">
                                Owner
                              </span>
                            </div>
                            <span className="text-[11px] text-[#6E6A62] font-serif-editorial italic block">
                              Editorial studio, articles & management
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#8E8A81] group-hover:text-[#EA580C] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  id="menu-subscribe-button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsNewsletterOpen(true);
                  }}
                  className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white py-3 text-center text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xs shadow-sm transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Subscribe to The Folded Letter</span>
                </button>
                {onNavigateNewsletter && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onNavigateNewsletter();
                    }}
                    className="w-full text-center text-[11px] text-[#6E6A62] hover:text-[#EA580C] font-mono-editorial transition-colors py-1 cursor-pointer"
                  >
                    Or read past dispatches archive &rarr;
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-[#6E6A62] font-mono-editorial pt-1 px-1">
                <span>The Folded Page © 2026</span>
                <span className="text-[#EA580C]">What's worth knowing.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
