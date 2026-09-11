import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import {
  Article,
  CategoryInfo,
  Author,
  EditorialSeries,
  MagazineIssue,
  HomepageLayoutConfig,
  User,
  SocialChannel,
} from '../types';
import { ARTICLES } from '../data/articles';
import { CATEGORIES } from '../data/categories';
import { AUTHORS } from '../data/authors';
import { EDITORIAL_SERIES } from '../data/series';
import { MAGAZINE_ISSUES } from '../data/issues';
import { DEFAULT_SOCIAL_CHANNELS } from '../data/social';
import { api } from '../services/api';
import { magazineAudio } from '../utils/audioEngine';

export interface SavedStoryItem {
  articleId: string;
  savedAt: string;
  notes?: string;
}

export interface ReadingHistoryItem {
  articleId: string;
  readAt: string;
  progressPercent: number;
}

interface MagazineContextType {
  // Dynamic Data collections
  articles: Article[];
  categories: CategoryInfo[];
  authors: Author[];
  series: EditorialSeries[];
  issues: MagazineIssue[];
  homepageLayout: HomepageLayoutConfig | null;
  isLoading: boolean;
  refreshArticles: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Editorial Section Derived helpers
  coverStory: Article | null;
  trendingStories: Article[];
  foldStories: Article[];
  popularStories: Article[];
  uniqueStories: Article[];
  specialStories: Article[];
  editorsPicks: Article[];

  // Saved & Reading History
  savedStories: SavedStoryItem[];
  savedArticles: Article[];
  toggleSave: (articleId: string) => void;
  toggleSaveArticle: (articleOrId: Article | string) => void;
  isSaved: (articleId: string) => boolean;
  isArticleSaved: (articleId: string) => boolean;
  clearSaved: () => void;
  readingHistory: ReadingHistoryItem[];
  addToHistory: (articleId: string, progress?: number) => void;

  // UI Modals & Overlays
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isSavedDrawerOpen: boolean;
  setIsSavedDrawerOpen: (open: boolean) => void;
  isNewsletterOpen: boolean;
  setIsNewsletterOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  shareArticle: Article | null;
  setShareArticle: (article: Article | null) => void;
  subscriberCount: number;
  refreshSubscribers: () => Promise<void>;

  // Reader Preferences
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  setFontSize: (size: 'sm' | 'base' | 'lg' | 'xl') => void;
  readerTheme: 'paper' | 'white' | 'dark';
  setReaderTheme: (theme: 'paper' | 'white' | 'dark') => void;

  // Audio Narration
  activeAudioArticle: Article | null;
  isPlayingAudio: boolean;
  playAudio: (article: Article) => void;
  pauseAudio: () => void;
  toggleAudioPlay: () => void;
  stopAudio: () => void;
  audioProgress: number;
  setAudioProgress: (progress: number) => void;
  audioSpeed: number;
  setAudioSpeed: (speed: number) => void;

  // Social Channels & Feeds
  socialChannels: SocialChannel[];
  updateSocialChannels: (channels: SocialChannel[]) => Promise<void>;
  updateSocialChannel: (id: string, updates: Partial<SocialChannel>) => Promise<void>;
  addSocialChannel: (channel: Omit<SocialChannel, 'id'>) => Promise<void>;
  deleteSocialChannel: (id: string) => Promise<void>;
  resetSocialChannels: () => Promise<void>;

  // Admin Auth State
  currentUser: User | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  loginAsAdmin: (email: string, passcode?: string) => Promise<User>;
  registerUser: (data: { email: string; name?: string; password?: string }) => Promise<User>;
  logoutAdmin: () => void;
  logout: () => void;
}

const MagazineContext = createContext<MagazineContextType | undefined>(undefined);

export const MagazineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Collections state with persistent local cache
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const cached = localStorage.getItem('tfp_cached_articles');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return ARTICLES;
  });
  const [categories, setCategories] = useState<CategoryInfo[]>(CATEGORIES);
  const [authors, setAuthors] = useState<Author[]>(Object.values(AUTHORS));
  const [series, setSeries] = useState<EditorialSeries[]>(EDITORIAL_SERIES);
  const [issues, setIssues] = useState<MagazineIssue[]>(MAGAZINE_ISSUES);
  const [homepageLayout, setHomepageLayout] = useState<HomepageLayoutConfig | null>(null);
  const [socialChannels, setSocialChannels] = useState<SocialChannel[]>(() => {
    try {
      const saved = localStorage.getItem('tfp_social_channels');
      return saved ? JSON.parse(saved) : DEFAULT_SOCIAL_CHANNELS;
    } catch {
      return DEFAULT_SOCIAL_CHANNELS;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number>(() => {
    try {
      const cached = localStorage.getItem('tfp_cached_subscribers');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch {}
    return 1;
  });

  const refreshSubscribers = useCallback(async () => {
    try {
      const subs = await api.getNewsletterSubscribers();
      if (Array.isArray(subs)) {
        setSubscriberCount(subs.length);
        try {
          localStorage.setItem('tfp_cached_subscribers', JSON.stringify(subs));
        } catch {}
      }
    } catch (e) {
      console.warn('Could not load subscribers count:', e);
    }
  }, []);

  // Clerk Authentication integration
  const { user: clerkUser, isSignedIn } = useUser();
  const clerk = useClerk();

  // Keep admin token synced with Clerk user when signed in
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress;
      if (email) {
        localStorage.setItem('tfp_admin_token', email);
      }
    }
  }, [isSignedIn, clerkUser]);

  // Keep articles cached to localStorage
  useEffect(() => {
    if (articles && articles.length > 0) {
      try {
        localStorage.setItem('tfp_cached_articles', JSON.stringify(articles));
      } catch {}
    }
  }, [articles]);

  // Local admin session for immediate access/fallback
  const [localAdminUser, setLocalAdminUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('tfp_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Derived user from Clerk account OR local admin session
  const currentUser: User | null =
    isSignedIn && clerkUser
      ? {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || 'editor@thefoldedpage.press',
          name: clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'Editorial Contributor',
          role:
            (clerkUser.publicMetadata?.role as any) ||
            (clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase() === 'arjunjareda2007@gmail.com'
              ? 'EDITORIAL_OWNER'
              : clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase() === 'arjunjareda1355@gmail.com'
              ? 'OPERATIONS_OWNER'
              : 'READER'),
          status: 'ACTIVE',
          isPermanentOwner:
            clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase() === 'arjunjareda2007@gmail.com' ||
            clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase() === 'arjunjareda1355@gmail.com',
          avatar: clerkUser.imageUrl,
          bio: (clerkUser.publicMetadata?.bio as string) || 'Publisher & Editorial Staff',
        }
      : localAdminUser;

  // Saved & Reading History state
  const [savedStories, setSavedStories] = useState<SavedStoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('tfp_saved_stories');
      return saved ? JSON.parse(saved) : [{ articleId: 'story-01', savedAt: new Date().toISOString() }];
    } catch {
      return [{ articleId: 'story-01', savedAt: new Date().toISOString() }];
    }
  });

  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>(() => {
    try {
      const hist = localStorage.getItem('tfp_reading_history');
      return hist ? JSON.parse(hist) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [shareArticle, setShareArticle] = useState<Article | null>(null);

  const openAuthModal = useCallback((mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [readerTheme, setReaderTheme] = useState<'paper' | 'white' | 'dark'>('white');

  // Audio player state
  const [activeAudioArticle, setActiveAudioArticle] = useState<Article | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState(1);

  // Initial load of dynamic data from backend API
  const refreshArticles = useCallback(async () => {
    try {
      const res = await api.getArticles({ includeDrafts: true });
      if (res.articles && res.articles.length > 0) {
        setArticles((prev) => {
          const remoteList = res.articles;
          const remoteIds = new Set(remoteList.map((a) => a.id));
          const localOnly = prev.filter((a) => !remoteIds.has(a.id));
          const merged = [...remoteList, ...localOnly];
          try {
            localStorage.setItem('tfp_cached_articles', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch (e) {
      console.warn('Could not refresh articles from API:', e);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [artRes, catRes, auRes, serRes, issRes, layoutRes, socialRes] = await Promise.allSettled([
        api.getArticles({ includeDrafts: true }),
        api.getCategories(),
        api.getAuthors(),
        api.getSeries(),
        api.getIssues(),
        api.getHomepageLayout(),
        api.getSocialChannels(),
      ]);

      if (artRes.status === 'fulfilled' && artRes.value.articles.length > 0) {
        setArticles((prev) => {
          const remoteList = artRes.value.articles;
          const remoteIds = new Set(remoteList.map((a) => a.id));
          // Preserve any local drafts or freshly added items not yet returned
          const localOnly = prev.filter((a) => !remoteIds.has(a.id));
          const merged = [...remoteList, ...localOnly];
          try {
            localStorage.setItem('tfp_cached_articles', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
      if (catRes.status === 'fulfilled' && catRes.value.length > 0) {
        setCategories(catRes.value);
      }
      if (auRes.status === 'fulfilled' && auRes.value.length > 0) {
        setAuthors(auRes.value);
      }
      if (serRes.status === 'fulfilled' && serRes.value.length > 0) {
        setSeries(serRes.value);
      }
      if (issRes.status === 'fulfilled' && issRes.value.length > 0) {
        setIssues(issRes.value);
      }
      if (layoutRes.status === 'fulfilled') {
        setHomepageLayout(layoutRes.value);
      }
      if (socialRes.status === 'fulfilled' && socialRes.value.length > 0) {
        setSocialChannels(socialRes.value);
        try {
          localStorage.setItem('tfp_social_channels', JSON.stringify(socialRes.value));
        } catch {}
      }
      await refreshSubscribers();
    } catch (err) {
      console.warn('Error loading initial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Sync saved to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tfp_saved_stories', JSON.stringify(savedStories));
    } catch (e) {
      console.error(e);
    }
  }, [savedStories]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tfp_reading_history', JSON.stringify(readingHistory));
    } catch (e) {
      console.error(e);
    }
  }, [readingHistory]);

  // Save / Bookmark operations
  const toggleSave = (articleId: string) => {
    setSavedStories((prev) => {
      const exists = prev.some((item) => item.articleId === articleId);
      if (exists) {
        return prev.filter((item) => item.articleId !== articleId);
      } else {
        api.trackEvent('save', articleId);
        return [{ articleId, savedAt: new Date().toISOString() }, ...prev];
      }
    });
  };

  const toggleSaveArticle = (articleOrId: Article | string) => {
    const id = typeof articleOrId === 'string' ? articleOrId : articleOrId.id;
    toggleSave(id);
  };

  const isSaved = (articleId?: string) => {
    if (!articleId) return false;
    return savedStories.some((item) => item.articleId === articleId);
  };

  const isArticleSaved = isSaved;

  const clearSaved = () => {
    setSavedStories([]);
  };

  const addToHistory = (articleId: string, progress = 100) => {
    api.trackEvent('view', articleId);
    setReadingHistory((prev) => {
      const filtered = prev.filter((h) => h.articleId !== articleId);
      return [{ articleId, readAt: new Date().toISOString(), progressPercent: progress }, ...filtered].slice(0, 30);
    });
  };

  const savedArticles = savedStories
    .map((s) => articles.find((a) => a.id === s.articleId))
    .filter((a): a is Article => Boolean(a));

  // Audio controls powered by magazineAudio
  const playAudio = (article: Article) => {
    try {
      setActiveAudioArticle(article);
      setAudioProgress(0);
      setIsPlayingAudio(true);

      magazineAudio.play(
        article,
        {
          onProgress: (percent) => {
            setAudioProgress(percent);
          },
          onEnd: () => {
            setIsPlayingAudio(false);
            setAudioProgress(100);
          },
          onError: (err) => {
            console.error('Audio engine playback notice:', err);
          },
          onStateChange: (playing) => {
            setIsPlayingAudio(playing);
          },
        },
        audioSpeed
      );
    } catch (err) {
      console.error('Failed to start audio playback:', err);
      setIsPlayingAudio(false);
    }
  };

  const pauseAudio = () => {
    try {
      magazineAudio.pause();
      setIsPlayingAudio(false);
    } catch (err) {
      console.error('Error pausing audio:', err);
    }
  };

  const toggleAudioPlay = () => {
    try {
      if (isPlayingAudio) {
        magazineAudio.pause();
        setIsPlayingAudio(false);
      } else {
        if (activeAudioArticle) {
          magazineAudio.resume();
          setIsPlayingAudio(true);
        }
      }
    } catch (err) {
      console.error('Error toggling audio play:', err);
    }
  };

  const stopAudio = () => {
    try {
      magazineAudio.stop();
      setIsPlayingAudio(false);
      setActiveAudioArticle(null);
      setAudioProgress(0);
    } catch (err) {
      console.error('Error stopping audio:', err);
    }
  };

  const handleSetAudioProgress = (progress: number) => {
    try {
      setAudioProgress(progress);
      magazineAudio.seek(progress);
    } catch (err) {
      console.error('Error seeking audio progress:', err);
    }
  };

  const handleSetAudioSpeed = (speed: number) => {
    try {
      setAudioSpeed(speed);
      magazineAudio.setSpeed(speed);
    } catch (err) {
      console.error('Error setting audio speed:', err);
    }
  };

  // Admin Auth methods (supports Clerk & direct staff/owner session)
  const loginAsAdmin = async (email: string, passcode?: string): Promise<User> => {
    if (!email || !email.trim()) {
      throw new Error('Please enter a valid email address.');
    }
    const targetEmail = email.trim().toLowerCase();
    const res = await api.login(targetEmail, passcode);
    setLocalAdminUser(res.user);
    return res.user;
  };

  const registerUser = async (data: { email: string; name?: string; password?: string }): Promise<User> => {
    if (!data.email || !data.email.trim()) {
      throw new Error('Please enter an email address.');
    }
    const res = await api.register(data);
    setLocalAdminUser(res.user);
    return res.user;
  };

  const logoutAdmin = () => {
    try {
      localStorage.removeItem('tfp_admin_user');
      setLocalAdminUser(null);
      clerk.signOut();
    } catch (e) {
      console.warn('SignOut notice:', e);
    }
    api.logout();
  };

  // Social Channels management methods
  const updateSocialChannels = async (newChannels: SocialChannel[]) => {
    setSocialChannels(newChannels);
    try {
      localStorage.setItem('tfp_social_channels', JSON.stringify(newChannels));
      await api.updateSocialChannels(newChannels);
    } catch (e) {
      console.warn('Social channels save notice:', e);
    }
  };

  const updateSocialChannel = async (id: string, updates: Partial<SocialChannel>) => {
    const next = socialChannels.map((ch) => (ch.id === id ? { ...ch, ...updates } : ch));
    setSocialChannels(next);
    try {
      localStorage.setItem('tfp_social_channels', JSON.stringify(next));
      await api.updateSocialChannel(id, updates);
    } catch (e) {
      console.warn('Social channel save notice:', e);
    }
  };

  const addSocialChannel = async (channelData: Omit<SocialChannel, 'id'>) => {
    const newChannel: SocialChannel = {
      ...channelData,
      id: `custom-channel-${Date.now()}`,
      order: (socialChannels.length || 0) + 1,
      isActive: channelData.isActive !== undefined ? channelData.isActive : true,
    };
    const next = [...socialChannels, newChannel];
    await updateSocialChannels(next);
  };

  const deleteSocialChannel = async (id: string) => {
    const next = socialChannels.filter((c) => c.id !== id);
    await updateSocialChannels(next);
  };

  const resetSocialChannels = async () => {
    await updateSocialChannels(DEFAULT_SOCIAL_CHANNELS);
  };

  // Editorial Section Derived helpers
  // Helper: Check if an article was published or created within the last 48 hours (2 days)
  const isRecentArticle = (article: Article): boolean => {
    if (!article) return false;
    const now = Date.now();
    const twoDaysMs = 48 * 60 * 60 * 1000;

    if (article.createdAt) {
      const createdTime = new Date(article.createdAt).getTime();
      if (!isNaN(createdTime) && (now - createdTime) <= twoDaysMs && (now - createdTime) >= -60000) {
        return true;
      }
    }

    if (article.publishedDate) {
      const pubTime = new Date(article.publishedDate).getTime();
      if (!isNaN(pubTime) && (now - pubTime) <= twoDaysMs && (now - pubTime) >= -60000) {
        return true;
      }
    }

    return false;
  };

  // Only published stories for public display, sorted with newest first
  const publishedArticles = [...articles]
    .filter((a) => a.status === 'PUBLISHED' || !a.status)
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || a.publishedDate || 0).getTime();
      const timeB = new Date(b.createdAt || b.publishedDate || 0).getTime();
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });

  // Recent articles published in the last 48 hours (featured by default on main screen)
  const recentArticles = publishedArticles.filter(isRecentArticle);

  // Cover Story: check layout setting or isCoverStory flag or recent 2-day article or first published article
  const coverStory =
    (homepageLayout?.coverStoryId
      ? publishedArticles.find((a) => a.id === homepageLayout.coverStoryId)
      : null) ||
    publishedArticles.find((a) => a.isCoverStory) ||
    (recentArticles.length > 0 ? recentArticles[0] : null) ||
    publishedArticles[0] ||
    articles[0];

  // Helper to merge and deduplicate articles while prioritizing new 2-day articles
  const mergeWithRecent = (baseList: Article[], maxItems = 6): Article[] => {
    const list: Article[] = [];
    const seen = new Set<string>();

    // Add recent 2-day articles first
    for (const art of recentArticles) {
      if (!seen.has(art.id)) {
        seen.add(art.id);
        list.push(art);
      }
    }

    // Add base configured / flagged articles
    for (const art of baseList) {
      if (!seen.has(art.id)) {
        seen.add(art.id);
        list.push(art);
      }
    }

    // Fill with published articles if needed
    if (list.length < 4) {
      for (const art of publishedArticles) {
        if (!seen.has(art.id)) {
          seen.add(art.id);
          list.push(art);
        }
      }
    }

    return list.slice(0, Math.max(maxItems, list.length));
  };

  // Trending (Features new articles for 2 days + keeps existing trending configuration)
  const baseTrending = homepageLayout?.trendingStoryIds?.length
    ? homepageLayout.trendingStoryIds
        .map((id) => publishedArticles.find((a) => a.id === id))
        .filter((a): a is Article => Boolean(a))
    : publishedArticles.filter((a) => a.isTrending);
  const trendingStories = mergeWithRecent(baseTrending, 6);

  // The Fold (Features new articles for 2 days + keeps signature fold series)
  const baseFold = homepageLayout?.foldStoryIds?.length
    ? homepageLayout.foldStoryIds
        .map((id) => publishedArticles.find((a) => a.id === id))
        .filter((a): a is Article => Boolean(a))
    : publishedArticles.filter((a) => a.seriesName === 'THE FOLD' || a.isEditorsPick);
  const foldStories = mergeWithRecent(baseFold, 6);

  // Popular (Ranked + recent)
  const basePopular = homepageLayout?.popularStoryIds?.length
    ? homepageLayout.popularStoryIds
        .map((id) => publishedArticles.find((a) => a.id === id))
        .filter((a): a is Article => Boolean(a))
    : [...publishedArticles].sort((a, b) => (a.popularityRank || 99) - (b.popularityRank || 99));
  const popularStories = mergeWithRecent(basePopular, 6);

  // Unique
  const uniqueStories = homepageLayout?.uniqueStoryIds?.length
    ? homepageLayout.uniqueStoryIds
        .map((id) => publishedArticles.find((a) => a.id === id))
        .filter((a): a is Article => Boolean(a))
    : publishedArticles.filter((a) => a.isUnique || a.category === 'Unique');

  // Special
  const specialStories = homepageLayout?.specialStoryIds?.length
    ? homepageLayout.specialStoryIds
        .map((id) => publishedArticles.find((a) => a.id === id))
        .filter((a): a is Article => Boolean(a))
    : publishedArticles.filter((a) => a.isSpecial || a.category === 'Special');

  // Editor's Picks
  const baseEditorsPicks = homepageLayout?.editorsPickIds?.length
    ? homepageLayout.editorsPickIds
        .map((id) => publishedArticles.find((a) => a.id === id))
        .filter((a): a is Article => Boolean(a))
    : publishedArticles.filter((a) => a.isEditorsPick);
  const editorsPicks = mergeWithRecent(baseEditorsPicks, 4);

  return (
    <MagazineContext.Provider
      value={{
        articles,
        categories,
        authors,
        series,
        issues,
        homepageLayout,
        isLoading,
        refreshArticles,
        refreshAll,
        coverStory,
        trendingStories: trendingStories.length > 0 ? trendingStories : publishedArticles.slice(0, 4),
        foldStories: foldStories.length > 0 ? foldStories : publishedArticles.slice(0, 4),
        popularStories: popularStories.length > 0 ? popularStories : publishedArticles.slice(0, 6),
        uniqueStories: uniqueStories.length > 0 ? uniqueStories : publishedArticles.slice(0, 3),
        specialStories: specialStories.length > 0 ? specialStories : publishedArticles.slice(0, 3),
        editorsPicks: editorsPicks.length > 0 ? editorsPicks : publishedArticles.slice(0, 3),
        savedStories,
        savedArticles,
        toggleSave,
        toggleSaveArticle,
        isSaved,
        isArticleSaved,
        clearSaved,
        readingHistory,
        addToHistory,
        isSearchOpen,
        setIsSearchOpen,
        isSavedDrawerOpen,
        setIsSavedDrawerOpen,
        isNewsletterOpen,
        setIsNewsletterOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        shareArticle,
        setShareArticle,
        fontSize,
        setFontSize,
        readerTheme,
        setReaderTheme,
        activeAudioArticle,
        isPlayingAudio,
        playAudio,
        pauseAudio,
        toggleAudioPlay,
        stopAudio,
        audioProgress,
        setAudioProgress: handleSetAudioProgress,
        audioSpeed,
        setAudioSpeed: handleSetAudioSpeed,
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isOwner:
          currentUser?.isPermanentOwner ||
          currentUser?.role === 'EDITORIAL_OWNER' ||
          currentUser?.role === 'OPERATIONS_OWNER' ||
          currentUser?.role === 'OWNER' ||
          currentUser?.email.toLowerCase() === 'arjunjareda2007@gmail.com' ||
          currentUser?.email.toLowerCase() === 'arjunjareda1355@gmail.com',
        loginAsAdmin,
        registerUser,
        logoutAdmin,
        logout: logoutAdmin,
        socialChannels,
        updateSocialChannels,
        updateSocialChannel,
        addSocialChannel,
        deleteSocialChannel,
        resetSocialChannels,
        subscriberCount,
        refreshSubscribers,
      }}
    >
      {children}
    </MagazineContext.Provider>
  );
};

export const useMagazine = () => {
  const context = useContext(MagazineContext);
  if (!context) {
    throw new Error('useMagazine must be used within a MagazineProvider');
  }
  return context;
};
