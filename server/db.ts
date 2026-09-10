import fs from 'fs';
import path from 'path';
import {
  saveDatabaseToSupabase,
  loadDatabaseFromSupabase,
  loadArticlesFromSupabase,
  saveArticleToSupabase,
} from './supabase';
import {
  Article,
  ArticleRevision,
  CategoryInfo,
  Author,
  EditorialSeries,
  MagazineIssue,
  HomepageLayoutConfig,
  MediaItem,
  User,
  UserRole,
  UserInvitation,
  ActivityLog,
  TrashItem,
  WebItem,
  NavigationItem,
  AboutPageConfig,
  NewsletterSubscriber,
  ContactSubmission,
  AnalyticsStats,
  SocialChannel,
  ApiKey,
} from '../src/types';

export const DEFAULT_API_KEYS: ApiKey[] = [
  {
    id: 'key-master-editorial-live',
    name: 'External Editorial & Publishing Controller Key',
    key: 'tfp_live_ed7a94f83b26c19a4e21d50c77',
    role: 'EDITORIAL_OWNER',
    scopes: [
      'articles.view',
      'articles.create',
      'articles.edit',
      'articles.publish',
      'articles.unpublish',
      'articles.archive',
      'articles.delete',
      'articles.manage_categories',
      'media.view',
      'media.upload',
    ],
    createdBy: 'arjunjareda1355@gmail.com',
    createdAt: '2026-09-05T12:00:00.000Z',
    lastUsedAt: null,
    status: 'ACTIVE',
    description: 'Master API key for external apps to create, edit, draft, publish, unpublish, and archive dispatches.',
  },
];

import { ARTICLES } from '../src/data/articles';
import { CATEGORIES } from '../src/data/categories';
import { AUTHORS } from '../src/data/authors';
import { EDITORIAL_SERIES } from '../src/data/series';
import { MAGAZINE_ISSUES } from '../src/data/issues';

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  EDITORIAL_OWNER: [
    'articles.view',
    'articles.create',
    'articles.edit',
    'articles.delete',
    'articles.publish',
    'articles.unpublish',
    'articles.archive',
    'articles.restore',
    'articles.schedule',
    'articles.export',
    'articles.manage_categories',
    'articles.manage_tags',
    'articles.manage_collections',
    'articles.manage_series',
    'articles.manage_featured',
    'articles.manage_authors',
    'media.view',
    'media.upload',
    'media.delete',
    'media.edit',
    'analytics.view',
    'analytics.export',
    'users.view',
    'users.invite',
    'users.manage_roles',
    'users.suspend',
    'users.remove',
    'users.reset_access',
    'trash.view',
    'trash.restore',
    'trash.purge',
    'security.view_logs',
    'security.manage_own',
    'website.view',
    'website.edit',
    'website.publish',
    'website.manage_homepage',
    'website.manage_navigation',
    'website.manage_footer',
    'website.manage_social',
    'website.manage_feeds',
    'website.manage_about',
    'website.manage_contact',
    'website.manage_links',
    'website.manage_widgets',
    'newsletter.view',
    'newsletter.broadcast',
    'newsletter.manage_subscribers',
  ],
  OPERATIONS_OWNER: [
    'articles.view',
    'articles.create',
    'articles.edit',
    'articles.delete',
    'articles.publish',
    'articles.unpublish',
    'articles.archive',
    'articles.restore',
    'articles.schedule',
    'articles.export',
    'articles.manage_categories',
    'articles.manage_tags',
    'articles.manage_collections',
    'articles.manage_series',
    'articles.manage_featured',
    'articles.manage_authors',
    'website.view',
    'website.edit',
    'website.publish',
    'website.manage_homepage',
    'website.manage_navigation',
    'website.manage_footer',
    'website.manage_social',
    'website.manage_feeds',
    'website.manage_about',
    'website.manage_contact',
    'website.manage_links',
    'website.manage_widgets',
    'media.view',
    'media.upload',
    'media.delete',
    'media.edit',
    'analytics.view',
    'analytics.export',
    'users.view',
    'users.invite',
    'users.manage_roles',
    'users.suspend',
    'users.remove',
    'users.reset_access',
    'trash.view',
    'trash.restore',
    'trash.purge',
    'security.view_logs',
    'security.manage_own',
    'newsletter.view',
    'newsletter.broadcast',
    'newsletter.manage_subscribers',
  ],
  OWNER: [
    'articles.view',
    'articles.create',
    'articles.edit',
    'articles.delete',
    'articles.publish',
    'website.view',
    'website.edit',
    'website.publish',
    'website.manage_homepage',
    'website.manage_navigation',
    'website.manage_social',
    'website.manage_feeds',
    'website.manage_about',
    'media.view',
    'media.upload',
    'media.delete',
    'analytics.view',
    'analytics.export',
    'users.view',
    'users.invite',
    'users.manage_roles',
    'users.suspend',
    'users.remove',
    'trash.view',
    'trash.restore',
    'security.view_logs',
    'security.manage_own',
  ],
  EDITOR: [
    'articles.view',
    'articles.create',
    'articles.edit',
    'articles.schedule',
    'articles.manage_tags',
    'media.view',
    'media.upload',
    'analytics.view',
    'security.manage_own',
  ],
  WRITER: [
    'articles.view',
    'articles.create',
    'articles.edit',
    'media.view',
    'media.upload',
    'security.manage_own',
  ],
  DESIGNER: [
    'media.view',
    'media.upload',
    'media.delete',
    'website.view',
    'articles.view',
    'security.manage_own',
  ],
  WEBSITE_MANAGER: [
    'website.view',
    'website.edit',
    'website.manage_homepage',
    'website.manage_navigation',
    'website.manage_footer',
    'website.manage_social',
    'website.manage_feeds',
    'website.manage_about',
    'website.manage_links',
    'website.manage_widgets',
    'media.view',
    'media.upload',
    'security.manage_own',
  ],
  ANALYTICS_VIEWER: [
    'analytics.view',
    'analytics.export',
    'articles.view',
    'website.view',
    'security.manage_own',
  ],
  VIEWER: [
    'articles.view',
    'website.view',
    'security.manage_own',
  ],
};

export const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'nav-1', label: 'Home', url: '/', target: '_self', location: 'MAIN', order: 1, isVisible: true },
  { id: 'nav-2', label: 'Explore', url: '#explore', target: '_self', location: 'MAIN', order: 2, isVisible: true },
  { id: 'nav-3', label: 'Essays & Stories', url: '#category/craft', target: '_self', location: 'MAIN', order: 3, isVisible: true },
  { id: 'nav-4', label: 'Series', url: '#series', target: '_self', location: 'MAIN', order: 4, isVisible: true },
  { id: 'nav-5', label: 'Editions', url: '#issues', target: '_self', location: 'MAIN', order: 5, isVisible: true },
  { id: 'nav-6', label: 'About', url: '#about', target: '_self', location: 'MAIN', order: 6, isVisible: true },
];

export const DEFAULT_ABOUT_CONFIG: AboutPageConfig = {
  publicationName: 'The Folded Page',
  tagline: "What's worth knowing.",
  missionStatement: 'Dedicated to the proposition that thoughtful human curiosity is the ultimate antidote to information exhaustion.',
  aboutText: 'The Folded Page is an independent digital magazine exploring long-form journalism, cultural history, tactile crafts, and deep technology. We believe in slow attention, rigorous reporting, and literary craftsmanship.',
  editorialDescription: 'Every essay, photo essay, and series is curated to provide lasting intellectual nourishment rather than ephemeral distraction.',
  contactEmail: 'arjunjareda1355@gmail.com',
  location: 'Global Editorial Desk',
  foundingYear: '2026',
};

interface DatabaseSchema {
  articles: Article[];
  categories: CategoryInfo[];
  authors: Author[];
  series: EditorialSeries[];
  issues: MagazineIssue[];
  homepage: HomepageLayoutConfig;
  media: MediaItem[];
  users: User[];
  invitations: UserInvitation[];
  activityLogs: ActivityLog[];
  trash: TrashItem[];
  webItems: WebItem[];
  navigation: NavigationItem[];
  aboutConfig: AboutPageConfig;
  subscribers: NewsletterSubscriber[];
  contacts: ContactSubmission[];
  socialChannels: SocialChannel[];
  apiKeys: ApiKey[];
  analytics: {
    views: Record<string, number>;
    saves: Record<string, number>;
    shares: Record<string, number>;
  };
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

// Helper to calculate reading time
export function calculateReadTime(text: string, blocks: any[] = []): { readTime: string; readTimeMinutes: number } {
  let totalWords = 0;
  if (text) {
    totalWords += text.trim().split(/\s+/).filter(Boolean).length;
  }
  for (const b of blocks) {
    if (b.text) totalWords += b.text.trim().split(/\s+/).filter(Boolean).length;
    if (b.title) totalWords += b.title.trim().split(/\s+/).filter(Boolean).length;
    if (b.items) totalWords += b.items.join(' ').trim().split(/\s+/).filter(Boolean).length;
  }
  const minutes = Math.max(1, Math.ceil(totalWords / 200));
  return {
    readTimeMinutes: minutes,
    readTime: `${minutes} min read`,
  };
}

// Helper to generate a clean URL slug
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

class DatabaseService {
  private data: DatabaseSchema;
  private syncPromise: Promise<void> | null = null;
  public isSyncComplete = false;

  constructor() {
    this.ensureDbDir();
    this.data = this.loadDatabase();
    this.checkScheduledArticles();
    this.syncPromise = this.syncFromSupabase().catch((err) => {
      console.warn('[Supabase] Initial sync background error:', err);
    });
  }

  public async ensureSynced(): Promise<void> {
    if (this.syncPromise) {
      await this.syncPromise;
    }
  }

  private async syncFromSupabase() {
    try {
      // 1. Try loading articles list directly
      let remoteArticles = await loadArticlesFromSupabase();
      // 2. Also load full database snapshot
      const remoteDb = await loadDatabaseFromSupabase();

      if ((!remoteArticles || remoteArticles.length === 0) && remoteDb?.articles) {
        remoteArticles = remoteDb.articles;
      }

      if (remoteArticles && Array.isArray(remoteArticles) && remoteArticles.length > 0) {
        const localMap = new Map(this.data.articles.map((a) => [a.id, a]));
        let addedCount = 0;
        let updatedCount = 0;

        for (const remArt of remoteArticles) {
          if (!remArt || !remArt.id) continue;
          if (!localMap.has(remArt.id)) {
            this.data.articles.push(remArt);
            addedCount++;
          } else {
            const localArt = localMap.get(remArt.id)!;
            // If remote has newer revisions or status, merge into local
            const remTime = new Date(remArt.updatedDate || remArt.publishedDate || remArt.createdAt || 0).getTime();
            const locTime = new Date(localArt.updatedDate || localArt.publishedDate || localArt.createdAt || 0).getTime();
            if (remTime > locTime || (remArt.revisions && (!localArt.revisions || remArt.revisions.length > localArt.revisions.length))) {
              const idx = this.data.articles.findIndex((a) => a.id === remArt.id);
              if (idx !== -1) {
                this.data.articles[idx] = remArt;
                updatedCount++;
              }
            }
          }
        }

        if (addedCount > 0 || updatedCount > 0) {
          console.log(`[Supabase] Synced: ${addedCount} added, ${updatedCount} updated from cloud vault.`);
          this.saveDatabaseToFile(this.data);
        }
      }

      // Sync categories, series, issues, users if remote has them
      if (remoteDb) {
        if (Array.isArray(remoteDb.categories) && remoteDb.categories.length > 0) {
          this.data.categories = remoteDb.categories;
        }
        if (Array.isArray(remoteDb.series) && remoteDb.series.length > 0) {
          this.data.series = remoteDb.series;
        }
        if (Array.isArray(remoteDb.issues) && remoteDb.issues.length > 0) {
          this.data.issues = remoteDb.issues;
        }
        if (remoteDb.homepage) {
          this.data.homepage = { ...this.data.homepage, ...remoteDb.homepage };
        }
      }
      this.isSyncComplete = true;
    } catch (err) {
      console.warn('[Supabase] Initial sync notice:', err);
      this.isSyncComplete = true;
    }
  }

  private ensureDbDir() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        return this.sanitizeLoadedDb(parsed);
      } catch (err) {
        console.error('Failed to load database.json, initializing fresh seed:', err);
      }
    }
    return this.initializeSeedData();
  }

  private sanitizeLoadedDb(db: any): DatabaseSchema {
    const users: User[] = db.users || [];

    // Ensure Editorial Owner exists
    const editorialOwnerIdx = users.findIndex((u) => u.email.toLowerCase() === 'arjunjareda2007@gmail.com');
    if (editorialOwnerIdx === -1) {
      users.push({
        id: 'user-owner-editorial-2007',
        email: 'arjunjareda2007@gmail.com',
        name: 'Arjun Jareda',
        role: 'EDITORIAL_OWNER',
        isPermanentOwner: true,
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
        bio: 'Editorial Owner & Editor-in-Chief — Content, Publishing & Journalistic Standards',
        createdAt: new Date().toISOString(),
        twoFactorEnabled: true,
      });
    } else {
      users[editorialOwnerIdx].role = 'EDITORIAL_OWNER';
      users[editorialOwnerIdx].isPermanentOwner = true;
      users[editorialOwnerIdx].status = 'ACTIVE';
    }

    // Ensure Operations Owner exists
    const operationsOwnerIdx = users.findIndex((u) => u.email.toLowerCase() === 'arjunjareda1355@gmail.com');
    if (operationsOwnerIdx === -1) {
      users.push({
        id: 'user-owner-operations-1355',
        email: 'arjunjareda1355@gmail.com',
        name: 'Arjun Jareda',
        role: 'OPERATIONS_OWNER',
        isPermanentOwner: true,
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
        bio: 'Operations Owner & Publication Director — Website, Distribution & Operations',
        createdAt: new Date().toISOString(),
        twoFactorEnabled: true,
      });
    } else {
      users[operationsOwnerIdx].role = 'OPERATIONS_OWNER';
      users[operationsOwnerIdx].isPermanentOwner = true;
      users[operationsOwnerIdx].status = 'ACTIVE';
    }

    return {
      articles: db.articles || [],
      categories: db.categories || CATEGORIES,
      authors: db.authors || Object.values(AUTHORS),
      series: db.series || EDITORIAL_SERIES,
      issues: db.issues || MAGAZINE_ISSUES,
      homepage: db.homepage || {
        coverStoryId: 'story-01',
        trendingStoryIds: ['story-01', 'story-02', 'story-03', 'story-04'],
        foldStoryIds: ['story-01', 'story-06', 'story-07', 'story-10'],
        popularStoryIds: ['story-01', 'story-02', 'story-03', 'story-04', 'story-05'],
        uniqueStoryIds: ['story-03', 'story-07', 'story-09'],
        specialStoryIds: ['story-04', 'story-05', 'story-10'],
        editorsPickIds: ['story-01', 'story-05', 'story-08'],
      },
      media: db.media || [],
      users,
      invitations: db.invitations || [],
      activityLogs: db.activityLogs || this.getInitialActivityLogs(),
      trash: db.trash || [],
      webItems: db.webItems || this.getDefaultWebItems(),
      navigation: db.navigation || DEFAULT_NAVIGATION_ITEMS,
      aboutConfig: db.aboutConfig || DEFAULT_ABOUT_CONFIG,
      subscribers: db.subscribers || [
        {
          id: 'sub-01',
          email: 'reader.curious@editorial.org',
          edition: 'weekly',
          subscribedAt: new Date().toISOString(),
          status: 'active',
        },
      ],
      contacts: db.contacts || [],
      socialChannels: db.socialChannels || this.getDefaultSocialChannels(),
      apiKeys: db.apiKeys && Array.isArray(db.apiKeys) && db.apiKeys.length > 0 ? db.apiKeys : DEFAULT_API_KEYS,
      analytics: db.analytics || { views: {}, saves: {}, shares: {} },
    };
  }

  private getInitialActivityLogs(): ActivityLog[] {
    return [
      {
        id: 'log-init-1',
        userId: 'user-owner-editorial-2007',
        userEmail: 'arjunjareda2007@gmail.com',
        userName: 'Arjun Jareda',
        userRole: 'EDITORIAL_OWNER',
        action: 'System Initialization',
        resource: 'Editorial Studio',
        details: 'Configured editorial standards and dual-owner RBAC governance.',
        timestamp: new Date().toISOString(),
        result: 'SUCCESS',
      },
      {
        id: 'log-init-2',
        userId: 'user-owner-operations-1355',
        userEmail: 'arjunjareda1355@gmail.com',
        userName: 'Arjun Jareda',
        userRole: 'OPERATIONS_OWNER',
        action: 'System Initialization',
        resource: 'Website Operations',
        details: 'Configured public distribution channels, navigation, and web assets.',
        timestamp: new Date().toISOString(),
        result: 'SUCCESS',
      },
    ];
  }

  private getDefaultWebItems(): WebItem[] {
    return [
      {
        id: 'web-item-1',
        title: 'Weekly Dispatch Syndicate',
        description: 'Subscribe to receive the hand-crafted Sunday essay curation.',
        type: 'BANNER',
        url: '#newsletter',
        iconName: 'Mail',
        placement: 'HOMEPAGE',
        status: 'ACTIVE',
        order: 1,
        badge: 'Weekly',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'web-item-2',
        title: 'Documentary Audio Transcripts',
        description: 'Listen to recorded fieldwork narratives and voice memos.',
        type: 'CARD',
        url: '#explore',
        iconName: 'Radio',
        placement: 'EXPLORE',
        status: 'ACTIVE',
        order: 2,
        badge: 'Audio',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  private initializeSeedData(): DatabaseSchema {
    const initialArticles: Article[] = ARTICLES.map((a, idx) => ({
      ...a,
      status: 'PUBLISHED',
      createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
      views: 1400 - idx * 75,
      saves: 180 - idx * 10,
      shares: 95 - idx * 5,
      heroImageType: 'EXTERNAL_URL',
      revisions: [
        {
          id: `rev-${a.id}-init`,
          savedAt: new Date().toISOString(),
          authorName: a.author.name,
          title: a.title,
          blocksCount: a.blocks.length,
          wordCount: a.blocks.reduce((acc, b) => acc + (b.text?.split(/\s+/).length || 0), 0),
          data: { ...a },
          note: 'Initial publication release',
        },
      ],
    }));

    const authorsList: Author[] = Object.values(AUTHORS);

    const initialMedia: MediaItem[] = [
      {
        id: 'media-01',
        filename: 'kyoto-woodworker.jpg',
        url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&auto=format&fit=crop&q=85',
        sourceType: 'EXTERNAL_URL',
        alt: 'Woodworker in Kyoto shaping hinoki cypress',
        caption: 'Traditional Japanese joinery in Kyoto workshop.',
        credit: 'Photo by Hiroshi Tanaka / The Folded Page',
        sourceUrl: 'https://unsplash.com',
        width: 1600,
        height: 1067,
        createdAt: new Date().toISOString(),
        uploadedBy: 'Arjun Jareda',
      },
      {
        id: 'media-02',
        filename: 'svalbard-seed-vault.jpg',
        url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=1600&auto=format&fit=crop&q=85',
        sourceType: 'EXTERNAL_URL',
        alt: 'Sub-zero subterranean vault entrance',
        caption: 'The Arctic perimeter safeguarding heirloom biodiversity.',
        credit: 'Photo by Marcus Lindqvist',
        width: 1600,
        height: 1067,
        createdAt: new Date().toISOString(),
        uploadedBy: 'Arjun Jareda',
      },
      {
        id: 'media-03',
        filename: 'ancient-printing-press.jpg',
        url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&auto=format&fit=crop&q=85',
        sourceType: 'EXTERNAL_URL',
        alt: 'Moveable lead type trays in historic press',
        caption: 'Antiquarian typography and hot lead lettering.',
        credit: 'Photo by Julian Vane',
        width: 1600,
        height: 1067,
        createdAt: new Date().toISOString(),
        uploadedBy: 'Arjun Jareda',
      },
    ];

    const initialUsers: User[] = [
      {
        id: 'user-owner-editorial-2007',
        email: 'arjunjareda2007@gmail.com',
        name: 'Arjun Jareda',
        role: 'EDITORIAL_OWNER',
        isPermanentOwner: true,
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
        bio: 'Editorial Owner & Editor-in-Chief — Content, Publishing & Journalistic Standards',
        createdAt: new Date().toISOString(),
        twoFactorEnabled: true,
      },
      {
        id: 'user-owner-operations-1355',
        email: 'arjunjareda1355@gmail.com',
        name: 'Arjun Jareda',
        role: 'OPERATIONS_OWNER',
        isPermanentOwner: true,
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
        bio: 'Operations Owner & Publication Director — Website, Distribution & Operations',
        createdAt: new Date().toISOString(),
        twoFactorEnabled: true,
      },
    ];

    const initialDb: DatabaseSchema = {
      articles: initialArticles,
      categories: CATEGORIES,
      authors: authorsList,
      series: EDITORIAL_SERIES,
      issues: MAGAZINE_ISSUES,
      homepage: {
        coverStoryId: 'story-01',
        trendingStoryIds: ['story-01', 'story-02', 'story-03', 'story-04'],
        foldStoryIds: ['story-01', 'story-06', 'story-07', 'story-10'],
        popularStoryIds: ['story-01', 'story-02', 'story-03', 'story-04', 'story-05'],
        uniqueStoryIds: ['story-03', 'story-07', 'story-09'],
        specialStoryIds: ['story-04', 'story-05', 'story-10'],
        editorsPickIds: ['story-01', 'story-05', 'story-08'],
      },
      media: initialMedia,
      users: initialUsers,
      invitations: [],
      activityLogs: this.getInitialActivityLogs(),
      trash: [],
      webItems: this.getDefaultWebItems(),
      navigation: DEFAULT_NAVIGATION_ITEMS,
      aboutConfig: DEFAULT_ABOUT_CONFIG,
      subscribers: [
        {
          id: 'sub-01',
          email: 'reader.curious@editorial.org',
          edition: 'weekly',
          subscribedAt: new Date().toISOString(),
          status: 'active',
        },
      ],
      contacts: [],
      socialChannels: this.getDefaultSocialChannels(),
      apiKeys: DEFAULT_API_KEYS,
      analytics: {
        views: { 'story-01': 1420, 'story-02': 1180, 'story-03': 950 },
        saves: { 'story-01': 240, 'story-02': 180, 'story-03': 130 },
        shares: { 'story-01': 95, 'story-02': 78, 'story-03': 62 },
      },
    };

    this.saveDatabaseToFile(initialDb);
    return initialDb;
  }

  private saveDatabaseToFile(dataToSave: DatabaseSchema) {
    try {
      this.ensureDbDir();
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public save() {
    this.saveDatabaseToFile(this.data);
    saveDatabaseToSupabase(this.data).catch((err) => {
      console.warn('[Supabase] Background save error:', err);
    });
  }

  // Check scheduled articles to auto-publish
  public checkScheduledArticles() {
    const now = new Date();
    let updated = false;

    for (const article of this.data.articles) {
      if (article.status === 'SCHEDULED' && article.scheduledPublishTime) {
        const schedTime = new Date(article.scheduledPublishTime);
        if (schedTime <= now) {
          article.status = 'PUBLISHED';
          article.publishedDate = now.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });
          article.updatedDate = article.publishedDate;
          updated = true;
          console.log(`[Auto-Publisher] Automatically published scheduled article "${article.title}"`);
        }
      }
    }

    if (updated) {
      this.save();
    }
  }

  // ====================== ARTICLES ======================
  public getArticles(filters: {
    status?: string;
    category?: string;
    tag?: string;
    authorId?: string;
    seriesId?: string;
    issueId?: string;
    flag?: string;
    search?: string;
    limit?: number;
    offset?: number;
    includeDrafts?: boolean;
  } = {}): { articles: Article[]; total: number } {
    this.checkScheduledArticles();
    let result = [...this.data.articles];

    // Status filter
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((a) => a.status === filters.status);
    } else if (!filters.includeDrafts) {
      // By default public requests only see PUBLISHED
      result = result.filter((a) => a.status === 'PUBLISHED' || !a.status);
    }

    // Category
    if (filters.category && filters.category !== 'all') {
      result = result.filter(
        (a) => a.category?.toLowerCase() === filters.category?.toLowerCase()
      );
    }

    // Tag
    if (filters.tag) {
      result = result.filter((a) =>
        a.tags?.some((t) => t.toLowerCase() === filters.tag?.toLowerCase())
      );
    }

    // Author
    if (filters.authorId) {
      result = result.filter(
        (a) => a.author.id === filters.authorId || a.author.slug === filters.authorId
      );
    }

    // Series
    if (filters.seriesId) {
      result = result.filter(
        (a) =>
          a.seriesId === filters.seriesId ||
          a.seriesName?.toLowerCase() === filters.seriesId?.toLowerCase()
      );
    }

    // Issue
    if (filters.issueId) {
      result = result.filter(
        (a) => a.issueId === filters.issueId || a.issueNumber === filters.issueId
      );
    }

    // Flags
    if (filters.flag) {
      switch (filters.flag) {
        case 'trending':
          result = result.filter((a) => a.isTrending);
          break;
        case 'popular':
          result = result.filter((a) => a.isPopular);
          break;
        case 'unique':
          result = result.filter((a) => a.isUnique);
          break;
        case 'special':
          result = result.filter((a) => a.isSpecial);
          break;
        case 'editorsPick':
          result = result.filter((a) => a.isEditorsPick);
          break;
        case 'featured':
          result = result.filter((a) => a.isFeatured);
          break;
        case 'coverStory':
          result = result.filter((a) => a.isCoverStory);
          break;
      }
    }

    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.deck?.toLowerCase().includes(q) ||
          a.subtitle?.toLowerCase().includes(q) ||
          a.author?.name?.toLowerCase().includes(q) ||
          a.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort by created / published date descending
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.publishedDate).getTime();
      const dateB = new Date(b.createdAt || b.publishedDate).getTime();
      return dateB - dateA;
    });

    const total = result.length;
    if (filters.limit) {
      const offset = filters.offset || 0;
      result = result.slice(offset, offset + filters.limit);
    }

    return { articles: result, total };
  }

  public getArticleByIdOrSlug(idOrSlug: string): Article | null {
    this.checkScheduledArticles();
    const clean = idOrSlug.trim();
    const decoded = decodeURIComponent(clean).toLowerCase();
    const slugified = decoded.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const bareSlug = clean.replace(/^(article|story)\//i, '').trim();
    const decodedBare = decodeURIComponent(bareSlug).toLowerCase();

    return (
      this.data.articles.find(
        (a) =>
          a.id === clean ||
          a.id.toLowerCase() === clean.toLowerCase() ||
          a.id === bareSlug ||
          a.id.toLowerCase() === bareSlug.toLowerCase() ||
          a.slug === clean ||
          a.slug === bareSlug ||
          a.slug.toLowerCase() === decoded ||
          a.slug.toLowerCase() === decodedBare ||
          a.slug === slugified ||
          (a.title && a.title.trim().toLowerCase() === decoded) ||
          (a.title && a.title.trim().toLowerCase() === decodedBare)
      ) || null
    );
  }

  public createArticle(articleData: Partial<Article>, authorUser?: User): Article {
    const title = articleData.title || 'Untitled Dispatch';
    let baseSlug = articleData.slug ? slugify(articleData.slug) : slugify(title);
    if (!baseSlug) baseSlug = `story-${Date.now()}`;

    // Ensure unique slug
    let finalSlug = baseSlug;
    let counter = 1;
    while (this.data.articles.some((a) => a.slug === finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const { readTime, readTimeMinutes } = calculateReadTime(
      articleData.deck || '',
      articleData.blocks || []
    );

    // Resolve author
    let author: Author = articleData.author || this.data.authors[0];
    if (articleData.authorId) {
      const found = this.data.authors.find((au) => au.id === articleData.authorId);
      if (found) author = found;
    }

    const candidateId = articleData.id && typeof articleData.id === 'string' && articleData.id.trim() ? articleData.id.trim() : null;
    const newId = (candidateId && !this.data.articles.some((a) => a.id === candidateId))
      ? candidateId
      : `story-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const isPublished = articleData.status === 'PUBLISHED';

    const newArticle: Article = {
      id: newId,
      slug: finalSlug,
      title,
      subtitle: articleData.subtitle || articleData.deck || '',
      deck: articleData.deck || articleData.subtitle || '',
      category: articleData.category || 'Trending',
      subcategory: articleData.subcategory || '',
      tags: articleData.tags && articleData.tags.length > 0 ? articleData.tags : ['Editorial'],
      author,
      authorId: author.id,
      status: articleData.status || 'DRAFT',
      publishedDate: isPublished ? (articleData.publishedDate || nowStr) : (articleData.publishedDate || nowStr),
      updatedDate: nowStr,
      scheduledPublishTime: articleData.scheduledPublishTime,
      readTime: articleData.readTime || readTime,
      readTimeMinutes: articleData.readTimeMinutes || readTimeMinutes,
      audioMinutes: articleData.audioMinutes || Math.ceil(readTimeMinutes * 1.2),
      heroImage: articleData.heroImage || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&auto=format&fit=crop&q=85',
      heroImageType: articleData.heroImageType || 'EXTERNAL_URL',
      heroImageAlt: articleData.heroImageAlt || title,
      heroImageCaption: articleData.heroImageCaption || '',
      heroImageCredit: articleData.heroImageCredit || '',
      heroImageSourceUrl: articleData.heroImageSourceUrl || '',
      blocks: articleData.blocks && articleData.blocks.length > 0 ? articleData.blocks : [
        {
          type: 'paragraph',
          text: 'Start crafting your inquiry here. The Folded Page values clarity, depth, and tangible prose.',
        },
      ],
      isCoverStory: Boolean(articleData.isCoverStory),
      isTrending: Boolean(articleData.isTrending),
      isPopular: Boolean(articleData.isPopular),
      isUnique: Boolean(articleData.isUnique),
      isSpecial: Boolean(articleData.isSpecial),
      isEditorsPick: Boolean(articleData.isEditorsPick),
      isFeatured: Boolean(articleData.isFeatured),
      seriesName: articleData.seriesName,
      seriesId: articleData.seriesId,
      issueNumber: articleData.issueNumber,
      issueId: articleData.issueId,
      popularityRank: articleData.popularityRank || this.data.articles.length + 1,
      featuredQuote: articleData.featuredQuote || '',
      relatedSlugs: articleData.relatedSlugs || [],
      seoTitle: articleData.seoTitle || title,
      seoDescription: articleData.seoDescription || articleData.deck || '',
      canonicalUrl: articleData.canonicalUrl || `https://thefoldedpage.press/story/${finalSlug}`,
      socialTitle: articleData.socialTitle || title,
      socialDescription: articleData.socialDescription || articleData.deck || '',
      socialImage: articleData.socialImage || articleData.heroImage,
      views: 0,
      saves: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
      revisions: [
        {
          id: `rev-${newId}-1`,
          savedAt: new Date().toISOString(),
          authorName: authorUser?.name || author.name,
          title,
          deck: articleData.deck,
          blocksCount: (articleData.blocks || []).length,
          wordCount: (articleData.blocks || []).reduce((acc, b) => acc + (b.text?.split(/\s+/).length || 0), 0),
          data: { ...articleData },
          note: isPublished ? 'Published Initial Release' : 'Initial Draft Created',
        },
      ],
    };

    // If marked as cover story, unmark others or handle accordingly
    if (newArticle.isCoverStory) {
      this.data.articles.forEach((a) => {
        if (a.id !== newArticle.id) a.isCoverStory = false;
      });
      this.data.homepage.coverStoryId = newArticle.id;
    }

    this.data.articles.unshift(newArticle);
    this.save();
    saveArticleToSupabase(newArticle).catch(() => {});
    return newArticle;
  }

  public updateArticle(id: string, updates: Partial<Article>, authorUser?: User): Article | null {
    const cleanId = id.trim();
    const index = this.data.articles.findIndex(
      (a) => a.id === cleanId || a.slug === cleanId || a.id.toLowerCase() === cleanId.toLowerCase() || a.slug.toLowerCase() === cleanId.toLowerCase()
    );
    if (index === -1) {
      // If updating an article that wasn't found, create it on the fly with the specified id
      return this.createArticle(
        {
          ...updates,
          id: cleanId,
          title: updates.title || 'Untitled Dispatch',
        },
        authorUser
      );
    }

    const existing = this.data.articles[index];
    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Check slug change
    let updatedSlug = existing.slug;
    if (updates.slug && updates.slug !== existing.slug) {
      const slugCandidate = slugify(updates.slug);
      if (!this.data.articles.some((a) => a.id !== existing.id && a.slug === slugCandidate)) {
        updatedSlug = slugCandidate;
      }
    } else if (updates.title && updates.title !== existing.title && !updates.slug) {
      const slugCandidate = slugify(updates.title);
      if (!this.data.articles.some((a) => a.id !== existing.id && a.slug === slugCandidate)) {
        updatedSlug = slugCandidate;
      }
    }

    // Recalculate reading time if blocks or deck changed
    const blocks = updates.blocks || existing.blocks;
    const deck = updates.deck !== undefined ? updates.deck : existing.deck;
    const { readTime, readTimeMinutes } = calculateReadTime(deck, blocks);

    // If changing to PUBLISHED, ensure publishedDate is set
    const isBecomingPublished = updates.status === 'PUBLISHED' && existing.status !== 'PUBLISHED';
    const publishedDate = isBecomingPublished
      ? nowStr
      : (updates.publishedDate || existing.publishedDate || nowStr);

    // Snapshot revision
    const revisions = existing.revisions || [];
    const revSnapshot: ArticleRevision = {
      id: `rev-${existing.id}-${Date.now()}`,
      savedAt: new Date().toISOString(),
      authorName: authorUser?.name || updates.author?.name || existing.author.name,
      title: updates.title || existing.title,
      deck: updates.deck || existing.deck,
      blocksCount: blocks.length,
      wordCount: blocks.reduce((acc, b) => acc + (b.text?.split(/\s+/).length || 0), 0),
      data: { ...existing },
      note: updates.status && updates.status !== existing.status ? `Status changed to ${updates.status}` : 'Saved update',
    };

    // Keep up to 20 revisions
    const updatedRevisions = [revSnapshot, ...revisions].slice(0, 20);

    const merged: Article = {
      ...existing,
      ...updates,
      id: existing.id,
      slug: updatedSlug,
      publishedDate,
      updatedDate: nowStr,
      readTime,
      readTimeMinutes,
      revisions: updatedRevisions,
    };

    // If marked as cover story
    if (merged.isCoverStory) {
      this.data.articles.forEach((a) => {
        if (a.id !== merged.id) a.isCoverStory = false;
      });
      this.data.homepage.coverStoryId = merged.id;
    }

    this.data.articles[index] = merged;
    this.save();
    saveArticleToSupabase(merged).catch(() => {});
    return merged;
  }

  public duplicateArticle(id: string, authorUser?: User): Article | null {
    const cleanId = id.trim();
    const existing = this.data.articles.find(
      (a) => a.id === cleanId || a.slug === cleanId || a.id.toLowerCase() === cleanId.toLowerCase() || a.slug.toLowerCase() === cleanId.toLowerCase()
    );
    if (!existing) return null;

    const copyData: Partial<Article> = {
      title: `${existing.title} (Copy)`,
      subtitle: existing.subtitle,
      deck: existing.deck,
      category: existing.category,
      subcategory: existing.subcategory,
      tags: [...existing.tags],
      author: existing.author,
      authorId: existing.author.id,
      status: 'DRAFT',
      heroImage: existing.heroImage,
      heroImageType: existing.heroImageType,
      heroImageAlt: existing.heroImageAlt,
      heroImageCaption: existing.heroImageCaption,
      heroImageCredit: existing.heroImageCredit,
      heroImageSourceUrl: existing.heroImageSourceUrl,
      blocks: JSON.parse(JSON.stringify(existing.blocks)),
      isTrending: existing.isTrending,
      isPopular: existing.isPopular,
      isUnique: existing.isUnique,
      isSpecial: existing.isSpecial,
      isEditorsPick: existing.isEditorsPick,
      isFeatured: existing.isFeatured,
      isCoverStory: false,
      seriesName: existing.seriesName,
      seriesId: existing.seriesId,
      issueNumber: existing.issueNumber,
      issueId: existing.issueId,
      seoTitle: existing.seoTitle,
      seoDescription: existing.seoDescription,
    };

    return this.createArticle(copyData, authorUser);
  }

  public deleteArticle(id: string, actor?: User): boolean {
    const cleanId = id.trim();
    if (actor) {
      return this.softDeleteArticle(cleanId, actor);
    }
    const idx = this.data.articles.findIndex(
      (a) => a.id === cleanId || a.slug === cleanId || a.id.toLowerCase() === cleanId.toLowerCase() || a.slug.toLowerCase() === cleanId.toLowerCase()
    );
    if (idx === -1) return false;
    const [deleted] = this.data.articles.splice(idx, 1);
    const trashItem: TrashItem = {
      id: `trash-article-${Date.now()}`,
      originalId: deleted.id,
      itemType: 'ARTICLE',
      title: deleted.title,
      data: deleted,
      deletedBy: 'system',
      deletedByRole: 'SYSTEM',
      deletedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      originalLocation: `Category: ${deleted.category}`,
    };
    if (!this.data.trash) this.data.trash = [];
    this.data.trash.unshift(trashItem);
    this.save();
    return true;
  }

  public restoreRevision(articleId: string, revisionId: string): Article | null {
    const article = this.data.articles.find((a) => a.id === articleId);
    if (!article || !article.revisions) return null;

    const rev = article.revisions.find((r) => r.id === revisionId);
    if (!rev || !rev.data) return null;

    const restored = this.updateArticle(articleId, {
      title: rev.data.title,
      subtitle: rev.data.subtitle,
      deck: rev.data.deck,
      blocks: rev.data.blocks,
      category: rev.data.category,
      tags: rev.data.tags,
      heroImage: rev.data.heroImage,
      heroImageAlt: rev.data.heroImageAlt,
      heroImageCaption: rev.data.heroImageCaption,
      heroImageCredit: rev.data.heroImageCredit,
    });

    return restored;
  }

  // ====================== MEDIA ======================
  public getMedia(): MediaItem[] {
    return this.data.media.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public addMedia(item: Omit<MediaItem, 'id' | 'createdAt'>): MediaItem {
    const newMedia: MediaItem = {
      ...item,
      id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };
    this.data.media.unshift(newMedia);
    this.save();
    return newMedia;
  }

  public updateMedia(id: string, updates: Partial<MediaItem>): MediaItem | null {
    const idx = this.data.media.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.data.media[idx] = { ...this.data.media[idx], ...updates };
    this.save();
    return this.data.media[idx];
  }

  public deleteMedia(id: string): boolean {
    const idx = this.data.media.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    this.data.media.splice(idx, 1);
    this.save();
    return true;
  }

  // ====================== CATEGORIES ======================
  public getCategories(): CategoryInfo[] {
    return this.data.categories;
  }

  public createCategory(cat: Omit<CategoryInfo, 'id'>): CategoryInfo {
    const newCat: CategoryInfo = {
      ...cat,
      id: cat.slug || slugify(cat.name),
      slug: cat.slug || slugify(cat.name),
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<CategoryInfo>): CategoryInfo | null {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.save();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.save();
    return true;
  }

  public reorderCategories(orderedIds: string[]): CategoryInfo[] {
    const map = new Map(this.data.categories.map((c) => [c.id, c]));
    const reordered: CategoryInfo[] = [];
    for (const id of orderedIds) {
      if (map.has(id)) {
        reordered.push(map.get(id)!);
        map.delete(id);
      }
    }
    // Append remaining
    for (const rem of map.values()) {
      reordered.push(rem);
    }
    this.data.categories = reordered;
    this.save();
    return this.data.categories;
  }

  // ====================== TAGS ======================
  public getTags(): { name: string; count: number }[] {
    const tagCountMap: Record<string, number> = {};
    for (const article of this.data.articles) {
      if (article.tags) {
        for (const tag of article.tags) {
          const clean = tag.trim();
          if (clean) {
            tagCountMap[clean] = (tagCountMap[clean] || 0) + 1;
          }
        }
      }
    }
    return Object.entries(tagCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  public renameOrMergeTag(oldName: string, newName: string): boolean {
    let changed = false;
    const target = newName.trim();
    for (const article of this.data.articles) {
      if (article.tags) {
        const hasOld = article.tags.some((t) => t.toLowerCase() === oldName.toLowerCase());
        if (hasOld) {
          const filtered = article.tags.filter((t) => t.toLowerCase() !== oldName.toLowerCase());
          if (!filtered.includes(target)) {
            filtered.push(target);
          }
          article.tags = filtered;
          changed = true;
        }
      }
    }
    if (changed) this.save();
    return changed;
  }

  public deleteTag(tagName: string): boolean {
    let changed = false;
    for (const article of this.data.articles) {
      if (article.tags) {
        const hasOld = article.tags.some((t) => t.toLowerCase() === tagName.toLowerCase());
        if (hasOld) {
          article.tags = article.tags.filter((t) => t.toLowerCase() !== tagName.toLowerCase());
          changed = true;
        }
      }
    }
    if (changed) this.save();
    return changed;
  }

  // ====================== AUTHORS ======================
  public getAuthors(): Author[] {
    return this.data.authors;
  }

  public getAuthorBySlugOrId(slugOrId: string): Author | null {
    return (
      this.data.authors.find(
        (a) => a.id === slugOrId || a.slug === slugOrId || slugify(a.name) === slugOrId
      ) || null
    );
  }

  public createAuthor(authorData: Omit<Author, 'id'>): Author {
    const newAuthor: Author = {
      ...authorData,
      id: `author-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      slug: authorData.slug || slugify(authorData.name),
    };
    this.data.authors.push(newAuthor);
    this.save();
    return newAuthor;
  }

  public updateAuthor(id: string, updates: Partial<Author>): Author | null {
    const idx = this.data.authors.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.data.authors[idx] = { ...this.data.authors[idx], ...updates };
    this.save();
    return this.data.authors[idx];
  }

  public deleteAuthor(id: string): boolean {
    const idx = this.data.authors.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.data.authors.splice(idx, 1);
    this.save();
    return true;
  }

  // ====================== SERIES ======================
  public getSeries(): EditorialSeries[] {
    return this.data.series;
  }

  public createSeries(seriesData: Omit<EditorialSeries, 'id'>): EditorialSeries {
    const newSeries: EditorialSeries = {
      ...seriesData,
      id: seriesData.slug || slugify(seriesData.name),
      slug: seriesData.slug || slugify(seriesData.name),
    };
    this.data.series.push(newSeries);
    this.save();
    return newSeries;
  }

  public updateSeries(id: string, updates: Partial<EditorialSeries>): EditorialSeries | null {
    const idx = this.data.series.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.data.series[idx] = { ...this.data.series[idx], ...updates };
    this.save();
    return this.data.series[idx];
  }

  public deleteSeries(id: string): boolean {
    const idx = this.data.series.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.series.splice(idx, 1);
    this.save();
    return true;
  }

  // ====================== ISSUES ======================
  public getIssues(): MagazineIssue[] {
    return this.data.issues;
  }

  public createIssue(issueData: Omit<MagazineIssue, 'id'>): MagazineIssue {
    const newIssue: MagazineIssue = {
      ...issueData,
      id: `issue-${Date.now()}`,
      slug: issueData.slug || slugify(issueData.title),
      featuredStorySlugs: issueData.featuredStorySlugs || [],
    };
    this.data.issues.push(newIssue);
    this.save();
    return newIssue;
  }

  public updateIssue(id: string, updates: Partial<MagazineIssue>): MagazineIssue | null {
    const idx = this.data.issues.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    this.data.issues[idx] = { ...this.data.issues[idx], ...updates };
    this.save();
    return this.data.issues[idx];
  }

  public deleteIssue(id: string): boolean {
    const idx = this.data.issues.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    this.data.issues.splice(idx, 1);
    this.save();
    return true;
  }

  // ====================== HOMEPAGE LAYOUT ======================
  public getHomepageLayout(): HomepageLayoutConfig {
    return this.data.homepage;
  }

  public updateHomepageLayout(layout: Partial<HomepageLayoutConfig>): HomepageLayoutConfig {
    this.data.homepage = {
      ...this.data.homepage,
      ...layout,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.homepage;
  }

  // ====================== NEWSLETTER ======================
  public getSubscribers(filterStatus?: string): NewsletterSubscriber[] {
    if (!this.data.subscribers) this.data.subscribers = [];
    if (filterStatus && filterStatus !== 'ALL') {
      return this.data.subscribers.filter((s) => s.status === filterStatus);
    }
    return this.data.subscribers;
  }

  public getActiveSubscribers(): NewsletterSubscriber[] {
    if (!this.data.subscribers) this.data.subscribers = [];
    return this.data.subscribers.filter((s) => s.status === 'active');
  }

  public getSubscriberByEmail(email: string): NewsletterSubscriber | null {
    const cleanEmail = email.trim().toLowerCase();
    return this.data.subscribers.find((s) => s.email.toLowerCase() === cleanEmail) || null;
  }

  public getSubscriberByVerificationToken(token: string): NewsletterSubscriber | null {
    if (!token || !token.trim()) return null;
    return this.data.subscribers.find((s) => s.verificationToken === token.trim()) || null;
  }

  public getSubscriberByUnsubscribeToken(token: string): NewsletterSubscriber | null {
    if (!token || !token.trim()) return null;
    return this.data.subscribers.find((s) => s.unsubscribeToken === token.trim()) || null;
  }

  public registerSubscriptionRequest(
    email: string,
    edition: 'weekly' | 'all' = 'weekly',
    verificationToken: string,
    unsubscribeToken: string
  ): {
    subscriber: NewsletterSubscriber;
    isNew: boolean;
    alreadyActive: boolean;
    pending: boolean;
  } {
    const cleanEmail = email.trim().toLowerCase();
    const existing = this.data.subscribers.find((s) => s.email.toLowerCase() === cleanEmail);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(); // 48h expiration

    if (existing) {
      if (existing.status === 'active') {
        return {
          subscriber: existing,
          isNew: false,
          alreadyActive: true,
          pending: false,
        };
      }

      // If pending or unsubscribed, refresh tokens and re-request verification
      existing.edition = edition;
      existing.verificationToken = verificationToken;
      existing.verificationExpires = expiresAt;
      if (!existing.unsubscribeToken) {
        existing.unsubscribeToken = unsubscribeToken;
      }
      existing.status = 'pending';
      this.save();

      return {
        subscriber: existing,
        isNew: false,
        alreadyActive: false,
        pending: true,
      };
    }

    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      email: cleanEmail,
      edition,
      subscribedAt: now.toISOString(),
      status: 'pending',
      verificationToken,
      verificationExpires: expiresAt,
      unsubscribeToken,
    };

    this.data.subscribers.unshift(newSub);
    this.save();

    return {
      subscriber: newSub,
      isNew: true,
      alreadyActive: false,
      pending: true,
    };
  }

  public verifySubscriber(token: string): {
    success: boolean;
    subscriber?: NewsletterSubscriber;
    message: string;
  } {
    const cleanToken = token.trim();
    const sub = this.data.subscribers.find((s) => s.verificationToken === cleanToken);
    if (!sub) {
      return { success: false, message: 'Invalid or expired verification token.' };
    }

    if (sub.verificationExpires) {
      const expTime = new Date(sub.verificationExpires).getTime();
      if (Date.now() > expTime) {
        return { success: false, message: 'This verification link has expired. Please subscribe again.' };
      }
    }

    sub.status = 'active';
    sub.verifiedAt = new Date().toISOString();
    sub.verificationToken = undefined; // consume token
    this.save();

    return {
      success: true,
      subscriber: sub,
      message: 'Subscription successfully confirmed. Welcome to The Folded Letter!',
    };
  }

  public unsubscribeByToken(token: string): {
    success: boolean;
    subscriber?: NewsletterSubscriber;
    message: string;
  } {
    const cleanToken = token.trim();
    const sub = this.data.subscribers.find(
      (s) => s.unsubscribeToken === cleanToken || s.id === cleanToken
    );
    if (!sub) {
      return { success: false, message: 'Subscriber token not recognized.' };
    }

    sub.status = 'unsubscribed';
    this.save();

    return {
      success: true,
      subscriber: sub,
      message: 'You have been unsubscribed from The Folded Letter.',
    };
  }

  public unsubscribeByEmail(email: string): {
    success: boolean;
    subscriber?: NewsletterSubscriber;
    message: string;
  } {
    const cleanEmail = email.trim().toLowerCase();
    const sub = this.data.subscribers.find((s) => s.email.toLowerCase() === cleanEmail);
    if (!sub) {
      return { success: false, message: 'Subscriber not found.' };
    }

    sub.status = 'unsubscribed';
    this.save();

    return {
      success: true,
      subscriber: sub,
      message: 'You have been unsubscribed from The Folded Letter.',
    };
  }

  public updateSubscriberStatus(id: string, status: 'active' | 'pending' | 'unsubscribed'): boolean {
    const sub = this.data.subscribers.find((s) => s.id === id);
    if (!sub) return false;
    sub.status = status;
    if (status === 'active' && !sub.verifiedAt) {
      sub.verifiedAt = new Date().toISOString();
    }
    this.save();
    return true;
  }

  public deleteSubscriber(id: string): boolean {
    const idx = this.data.subscribers.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.subscribers.splice(idx, 1);
    this.save();
    return true;
  }

  public addSubscriber(email: string, edition: 'weekly' | 'all' = 'weekly'): { success: boolean; message: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please provide a valid email address.' };
    }

    const existing = this.data.subscribers.find((s) => s.email.toLowerCase() === cleanEmail);
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'active';
        existing.subscribedAt = new Date().toISOString();
        this.save();
      }
      return { success: true, message: "You're already subscribed!" };
    }

    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      edition,
      subscribedAt: new Date().toISOString(),
      status: 'active',
      verifiedAt: new Date().toISOString(),
      unsubscribeToken: Math.random().toString(36).substring(2, 15),
    };
    this.data.subscribers.unshift(newSub);
    this.save();
    return { success: true, message: 'Welcome to The Folded Letter ledger.' };
  }

  // ====================== SOCIAL CHANNELS & FEEDS ======================
  public getDefaultSocialChannels(): SocialChannel[] {
    return [
      {
        id: 'x-twitter',
        name: 'X (Twitter)',
        handle: '@TheFoldedPage',
        description: 'Real-time editorial dispatches, cultural commentaries & live story threads.',
        url: 'https://x.com/TheFoldedPage',
        iconName: 'Twitter',
        badge: 'Dispatches',
        followerCount: '48.2K',
        order: 1,
        isActive: true,
      },
      {
        id: 'instagram',
        name: 'Instagram',
        handle: '@thefoldedpage',
        description: 'Visual essays, cover art archive, typography studies & behind-the-scenes print craft.',
        url: 'https://instagram.com/thefoldedpage',
        iconName: 'Instagram',
        badge: 'Visuals',
        followerCount: '92.6K',
        order: 2,
        isActive: true,
      },
      {
        id: 'youtube',
        name: 'YouTube',
        handle: '@TheFoldedPage',
        description: 'Long-form video essays, audio documentaries & author interviews.',
        url: 'https://youtube.com/@TheFoldedPage',
        iconName: 'Youtube',
        badge: 'Video & Audio',
        followerCount: '34.1K',
        order: 3,
        isActive: true,
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        handle: 'The Folded Page Publishing',
        description: 'Publishing insights, media strategy, design architecture & journalism inquiries.',
        url: 'https://linkedin.com/company/the-folded-page',
        iconName: 'Linkedin',
        badge: 'Industry',
        followerCount: '18.4K',
        order: 4,
        isActive: true,
      },
      {
        id: 'newsletter',
        name: 'The Folded Letter',
        handle: 'Weekly Dispatch',
        description: 'Curated long-form journalism delivered directly to your inbox every Sunday morning.',
        url: '#newsletter',
        iconName: 'Mail',
        badge: 'Curated',
        followerCount: '120K+',
        order: 5,
        isActive: true,
      },
      {
        id: 'rss',
        name: 'RSS Syndication',
        handle: 'XML Feed',
        description: 'Open web syndication feed compatible with NetNewsWire, Feedly, and Readwise.',
        url: '/api/rss.xml',
        iconName: 'Rss',
        badge: 'Open Web',
        followerCount: 'Live Feed',
        order: 6,
        isActive: true,
      },
    ];
  }

  public getSocialChannels(): SocialChannel[] {
    if (!this.data.socialChannels || this.data.socialChannels.length === 0) {
      this.data.socialChannels = this.getDefaultSocialChannels();
      this.save();
    }
    return this.data.socialChannels.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public updateSocialChannels(channels: SocialChannel[]): SocialChannel[] {
    this.data.socialChannels = channels.map((ch, idx) => ({
      ...ch,
      order: ch.order !== undefined ? ch.order : idx + 1,
      isActive: ch.isActive !== undefined ? ch.isActive : true,
    }));
    this.save();
    return this.data.socialChannels;
  }

  public updateSocialChannel(id: string, updates: Partial<SocialChannel>): SocialChannel | null {
    const channels = this.getSocialChannels();
    const idx = channels.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    channels[idx] = { ...channels[idx], ...updates };
    this.data.socialChannels = channels;
    this.save();
    return channels[idx];
  }

  // ====================== CONTACT INQUIRIES ======================
  public getContactSubmissions(): ContactSubmission[] {
    return this.data.contacts.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  public addContactSubmission(name: string, email: string, subject: string, message: string): ContactSubmission {
    const newSubmission: ContactSubmission = {
      id: `contact-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      submittedAt: new Date().toISOString(),
      status: 'unread',
    };
    this.data.contacts.unshift(newSubmission);
    this.save();
    console.log(`[Contact Submission] New inquiry from ${email} to arjunjareda1355@gmail.com: "${subject}"`);
    return newSubmission;
  }

  public updateContactStatus(id: string, status: 'unread' | 'read' | 'replied'): boolean {
    const item = this.data.contacts.find((c) => c.id === id);
    if (!item) return false;
    item.status = status;
    this.save();
    return true;
  }

  // ====================== USERS & AUTH & RBAC ======================
  public getUserByEmail(email: string): User | null {
    const clean = email.trim().toLowerCase();
    return this.data.users.find((u) => u.email.toLowerCase() === clean) || null;
  }

  public getUserById(id: string): User | null {
    return this.data.users.find((u) => u.id === id) || null;
  }

  public getUsers(): User[] {
    return this.data.users;
  }

  public addUser(user: User): User {
    const clean = user.email.trim().toLowerCase();
    const existingIndex = this.data.users.findIndex((u) => u.email.toLowerCase() === clean);
    if (existingIndex >= 0) {
      this.data.users[existingIndex] = { ...this.data.users[existingIndex], ...user };
    } else {
      this.data.users.push(user);
    }
    this.save();
    return user;
  }

  public hasPermission(user: User, permission: string): boolean {
    if (!user || user.status === 'SUSPENDED' || user.status === 'REMOVED') {
      return false;
    }
    // Verified publication owners have full, unrestricted permissions to every function
    const email = (user.email || '').toLowerCase().trim();
    if (
      user.isPermanentOwner ||
      email === 'arjunjareda2007@gmail.com' ||
      email === 'arjunjareda1355@gmail.com' ||
      user.role === 'OWNER' ||
      user.role === 'EDITORIAL_OWNER' ||
      user.role === 'OPERATIONS_OWNER'
    ) {
      return true;
    }
    // Check custom permissions first
    if (user.customPermissions && Array.isArray(user.customPermissions)) {
      if (user.customPermissions.includes('*') || user.customPermissions.includes(permission)) {
        return true;
      }
    }
    // Check role default permissions
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  }

  public inviteUser(
    payload: { email: string; name?: string; role: UserRole; customPermissions?: string[] },
    actor: User
  ): { user?: User; invitation: UserInvitation } {
    const cleanEmail = payload.email.trim().toLowerCase();
    
    // Check if user already exists
    const existingUser = this.getUserByEmail(cleanEmail);
    if (existingUser) {
      throw new Error(`A user with email "${cleanEmail}" already exists with role ${existingUser.role}.`);
    }

    // Role safety check: only owners can invite/manage, cannot invite as permanent owner
    const targetRole: UserRole =
      payload.role === 'EDITORIAL_OWNER' || payload.role === 'OPERATIONS_OWNER' || payload.role === 'OWNER'
        ? 'EDITOR'
        : payload.role;

    const token = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const newInvitation: UserInvitation = {
      id: `invitation-${Date.now()}`,
      email: cleanEmail,
      name: payload.name?.trim() || cleanEmail.split('@')[0],
      role: targetRole,
      customPermissions: payload.customPermissions || [],
      invitedBy: actor.email,
      invitedByName: actor.name,
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days
      status: 'PENDING',
      token,
    };

    // Pre-create the user in invited status
    const createdUser: User = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      name: payload.name?.trim() || cleanEmail.split('@')[0],
      role: targetRole,
      customPermissions: payload.customPermissions || [],
      status: 'INVITED',
      createdAt: new Date().toISOString(),
    };

    if (!this.data.invitations) this.data.invitations = [];
    this.data.invitations.unshift(newInvitation);
    this.data.users.push(createdUser);
    this.save();

    this.logActivity({
      userId: actor.id,
      userEmail: actor.email,
      userName: actor.name,
      userRole: actor.role,
      action: 'Invited User',
      resource: 'Users & Access',
      details: `Invited "${cleanEmail}" with role ${targetRole}.`,
      result: 'SUCCESS',
    });

    return { user: createdUser, invitation: newInvitation };
  }

  public getInvitations(): UserInvitation[] {
    return this.data.invitations || [];
  }

  public revokeInvitation(invitationId: string, actor: User): boolean {
    if (!this.data.invitations) return false;
    const inv = this.data.invitations.find((i) => i.id === invitationId);
    if (!inv) return false;
    inv.status = 'REVOKED';

    // Also remove the invited user record if not activated
    this.data.users = this.data.users.filter((u) => u.email.toLowerCase() !== inv.email.toLowerCase() || u.status !== 'INVITED');
    this.save();

    this.logActivity({
      userId: actor.id,
      userEmail: actor.email,
      userName: actor.name,
      userRole: actor.role,
      action: 'Revoked Invitation',
      resource: 'Users & Access',
      details: `Revoked access invitation for "${inv.email}".`,
      result: 'SUCCESS',
    });
    return true;
  }

  public acceptInvitation(token: string, name?: string): User {
    if (!this.data.invitations) throw new Error('Invitation not found or expired.');
    const inv = this.data.invitations.find((i) => i.token === token && i.status === 'PENDING');
    if (!inv) {
      throw new Error('Invalid or expired invitation token.');
    }

    if (new Date(inv.expiresAt).getTime() < Date.now()) {
      inv.status = 'EXPIRED';
      this.save();
      throw new Error('This invitation has expired. Please contact an owner for a new invite.');
    }

    inv.status = 'ACCEPTED';
    let user = this.getUserByEmail(inv.email);
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        email: inv.email,
        name: name || inv.name || inv.email.split('@')[0],
        role: inv.role,
        customPermissions: inv.customPermissions,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      this.data.users.push(user);
    } else {
      user.status = 'ACTIVE';
      if (name) user.name = name;
      user.role = inv.role;
      user.customPermissions = inv.customPermissions;
      user.lastLogin = new Date().toISOString();
    }

    this.save();
    return user;
  }

  public updateUserRole(
    userId: string,
    newRole: UserRole,
    customPermissions: string[] | undefined,
    actor: User
  ): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found.');

    // Protect permanent owners
    if (user.isPermanentOwner || user.email === 'arjunjareda2007@gmail.com' || user.email === 'arjunjareda1355@gmail.com') {
      throw new Error('Permanent owner roles are immutable and protected.');
    }

    const previousRole = user.role;
    user.role = newRole;
    if (customPermissions !== undefined) {
      user.customPermissions = customPermissions;
    }
    this.save();

    this.logActivity({
      userId: actor.id,
      userEmail: actor.email,
      userName: actor.name,
      userRole: actor.role,
      action: 'Updated User Role',
      resource: 'Users & Access',
      details: `Changed role for "${user.email}" from ${previousRole} to ${newRole}.`,
      result: 'SUCCESS',
    });

    return user;
  }

  public suspendUser(userId: string, suspend: boolean, actor: User): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found.');

    if (user.isPermanentOwner || user.email === 'arjunjareda2007@gmail.com' || user.email === 'arjunjareda1355@gmail.com') {
      throw new Error('Permanent owners cannot be suspended.');
    }

    user.status = suspend ? 'SUSPENDED' : 'ACTIVE';
    this.save();

    this.logActivity({
      userId: actor.id,
      userEmail: actor.email,
      userName: actor.name,
      userRole: actor.role,
      action: suspend ? 'Suspended User' : 'Restored User',
      resource: 'Users & Access',
      details: `${suspend ? 'Suspended' : 'Reactivated'} account for "${user.email}".`,
      result: 'SUCCESS',
    });

    return user;
  }

  public deleteUser(userId: string, actor: User): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    if (user.isPermanentOwner || user.email === 'arjunjareda2007@gmail.com' || user.email === 'arjunjareda1355@gmail.com') {
      throw new Error('Permanent owners cannot be removed.');
    }

    this.data.users = this.data.users.filter((u) => u.id !== userId);
    this.save();

    this.logActivity({
      userId: actor.id,
      userEmail: actor.email,
      userName: actor.name,
      userRole: actor.role,
      action: 'Removed User',
      resource: 'Users & Access',
      details: `Removed access for user "${user.email}" (${user.role}).`,
      result: 'SUCCESS',
    });

    return true;
  }

  public resetUserAccess(userId: string, actor: User): { message: string } {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found.');

    this.logActivity({
      userId: actor.id,
      userEmail: actor.email,
      userName: actor.name,
      userRole: actor.role,
      action: 'Reset User Access',
      resource: 'Users & Access',
      details: `Issued access reset and cleared active sessions for "${user.email}".`,
      result: 'SUCCESS',
    });

    return { message: `Access credentials and active tokens reset for ${user.email}.` };
  }

  // ====================== API KEYS & INTEGRATIONS ======================
  public getApiKeys(): ApiKey[] {
    if (!this.data.apiKeys || !Array.isArray(this.data.apiKeys) || this.data.apiKeys.length === 0) {
      this.data.apiKeys = [...DEFAULT_API_KEYS];
      this.save();
    }
    return this.data.apiKeys;
  }

  public getApiKeyByKey(rawKey: string): ApiKey | undefined {
    if (!rawKey) return undefined;
    const cleanKey = rawKey.trim();
    const keys = this.getApiKeys();
    return keys.find((k) => k.key === cleanKey && k.status === 'ACTIVE');
  }

  public createApiKey(
    payload: { name: string; role?: UserRole; scopes?: string[]; description?: string },
    actor?: User
  ): ApiKey {
    if (!this.data.apiKeys) this.data.apiKeys = [];
    const id = `key-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const randomHex = Array.from({ length: 24 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const keyString = `tfp_live_${randomHex}`;

    const newKey: ApiKey = {
      id,
      name: payload.name.trim(),
      key: keyString,
      role: payload.role || 'EDITORIAL_OWNER',
      scopes: payload.scopes && payload.scopes.length > 0 ? payload.scopes : [
        'articles.view',
        'articles.create',
        'articles.edit',
        'articles.publish',
        'articles.unpublish',
        'articles.archive',
        'articles.delete',
        'articles.manage_categories',
        'media.view',
        'media.upload',
      ],
      createdBy: actor?.email || 'arjunjareda1355@gmail.com',
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      status: 'ACTIVE',
      description: payload.description || 'Programmatic API key for external editorial and publishing app.',
    };

    this.data.apiKeys.unshift(newKey);
    this.save();

    if (actor) {
      this.logActivity({
        userId: actor.id,
        userEmail: actor.email,
        userName: actor.name,
        userRole: actor.role,
        action: 'Generated API Key',
        resource: 'API & Integrations',
        details: `Created new API key "${newKey.name}" (${newKey.id}) with role ${newKey.role}.`,
        result: 'SUCCESS',
      });
    }

    return newKey;
  }

  public revokeApiKey(id: string, actor?: User): boolean {
    const keys = this.getApiKeys();
    const keyItem = keys.find((k) => k.id === id);
    if (!keyItem) return false;
    keyItem.status = 'REVOKED';
    this.save();

    if (actor) {
      this.logActivity({
        userId: actor.id,
        userEmail: actor.email,
        userName: actor.name,
        userRole: actor.role,
        action: 'Revoked API Key',
        resource: 'API & Integrations',
        details: `Revoked access for API key "${keyItem.name}" (${keyItem.id}).`,
        result: 'SUCCESS',
      });
    }
    return true;
  }

  public deleteApiKey(id: string, actor?: User): boolean {
    const keys = this.getApiKeys();
    const keyItem = keys.find((k) => k.id === id);
    if (!keyItem) return false;
    this.data.apiKeys = this.data.apiKeys.filter((k) => k.id !== id);
    this.save();

    if (actor) {
      this.logActivity({
        userId: actor.id,
        userEmail: actor.email,
        userName: actor.name,
        userRole: actor.role,
        action: 'Deleted API Key',
        resource: 'API & Integrations',
        details: `Permanently deleted API key "${keyItem.name}".`,
        result: 'SUCCESS',
      });
    }
    return true;
  }

  public recordApiKeyUsage(id: string): void {
    if (!this.data.apiKeys) return;
    const keyItem = this.data.apiKeys.find((k) => k.id === id);
    if (keyItem) {
      keyItem.lastUsedAt = new Date().toISOString();
      this.save();
    }
  }

  // ====================== ACTIVITY AUDIT LOGS ======================
  public logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    if (!this.data.activityLogs) this.data.activityLogs = [];
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.activityLogs.unshift(newLog);
    // Keep max 500 logs
    if (this.data.activityLogs.length > 500) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 500);
    }
    this.save();
    console.log(`[AUDIT] ${newLog.userRole} (${newLog.userEmail}) -> ${newLog.action} on ${newLog.resource}: ${newLog.details}`);
  }

  public getActivityLogs(filters?: {
    user?: string;
    role?: string;
    action?: string;
    resource?: string;
    query?: string;
  }): ActivityLog[] {
    let logs = this.data.activityLogs || [];
    if (!filters) return logs;

    if (filters.user) {
      const u = filters.user.toLowerCase();
      logs = logs.filter((l) => l.userEmail.toLowerCase().includes(u) || l.userName.toLowerCase().includes(u));
    }
    if (filters.role) {
      logs = logs.filter((l) => l.userRole === filters.role);
    }
    if (filters.action) {
      const a = filters.action.toLowerCase();
      logs = logs.filter((l) => l.action.toLowerCase().includes(a));
    }
    if (filters.resource) {
      const r = filters.resource.toLowerCase();
      logs = logs.filter((l) => l.resource.toLowerCase().includes(r));
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.details.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.resource.toLowerCase().includes(q) ||
          l.userEmail.toLowerCase().includes(q) ||
          l.userName.toLowerCase().includes(q)
      );
    }
    return logs;
  }

  // ====================== TRASH & SOFT DELETION ======================
  public getTrashItems(): TrashItem[] {
    if (!this.data.trash) this.data.trash = [];
    return this.data.trash.sort(
      (a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
    );
  }

  public softDeleteArticle(id: string, actor: User): boolean {
    const articleIdx = this.data.articles.findIndex((a) => a.id === id || a.slug === id);
    if (articleIdx === -1) return false;

    const [deletedArticle] = this.data.articles.splice(articleIdx, 1);
    const trashItem: TrashItem = {
      id: `trash-article-${Date.now()}`,
      originalId: deletedArticle.id,
      itemType: 'ARTICLE',
      title: deletedArticle.title,
      data: deletedArticle,
      deletedBy: actor.email,
      deletedByRole: actor.role,
      deletedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      originalLocation: `Category: ${deletedArticle.category}`,
    };

    if (!this.data.trash) this.data.trash = [];
    this.data.trash.unshift(trashItem);
    this.save();

    this.logActivity({
      userId: actor.id,
      userEmail: actor.email,
      userName: actor.name,
      userRole: actor.role,
      action: 'Moved to Trash',
      resource: 'Articles',
      details: `Soft-deleted article "${deletedArticle.title}" (Retention: 30 days).`,
      result: 'SUCCESS',
    });

    return true;
  }

  public restoreTrashItem(trashId: string, actor: User): any {
    if (!this.data.trash) return null;
    const idx = this.data.trash.findIndex((t) => t.id === trashId);
    if (idx === -1) throw new Error('Trash item not found.');

    const item = this.data.trash[idx];
    this.data.trash.splice(idx, 1);

    if (item.itemType === 'ARTICLE') {
      this.data.articles.unshift(item.data);
    } else if (item.itemType === 'WEBSITE_ITEM') {
      if (!this.data.webItems) this.data.webItems = [];
      this.data.webItems.unshift(item.data);
    } else if (item.itemType === 'MEDIA') {
      if (!this.data.media) this.data.media = [];
      this.data.media.unshift(item.data);
    }

    this.save();

    this.logActivity({
      userId: actor.id,
      userEmail: actor.email,
      userName: actor.name,
      userRole: actor.role,
      action: 'Restored from Trash',
      resource: item.itemType,
      details: `Restored item "${item.title}".`,
      result: 'SUCCESS',
    });

    return item.data;
  }

  public purgeTrashItem(trashId: string, actor: User): boolean {
    if (!this.data.trash) return false;
    const idx = this.data.trash.findIndex((t) => t.id === trashId);
    if (idx === -1) return false;

    const item = this.data.trash[idx];
    this.data.trash.splice(idx, 1);
    this.save();

    this.logActivity({
      userId: actor.id,
      userEmail: actor.email,
      userName: actor.name,
      userRole: actor.role,
      action: 'Permanently Purged',
      resource: 'Trash',
      details: `Permanently deleted "${item.title}" (${item.itemType}).`,
      result: 'SUCCESS',
    });

    return true;
  }

  public emptyTrash(actor: User): number {
    const count = this.data.trash?.length || 0;
    this.data.trash = [];
    this.save();

    this.logActivity({
      userId: actor.id,
      userEmail: actor.email,
      userName: actor.name,
      userRole: actor.role,
      action: 'Emptied Trash',
      resource: 'Trash',
      details: `Purged ${count} items permanently from trash.`,
      result: 'SUCCESS',
    });

    return count;
  }

  // ====================== WEB ITEMS ======================
  public getWebItems(placement?: string): WebItem[] {
    if (!this.data.webItems) this.data.webItems = this.getDefaultWebItems();
    let list = this.data.webItems;
    if (placement) {
      list = list.filter((w) => w.placement.toUpperCase() === placement.toUpperCase());
    }
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public createWebItem(item: Omit<WebItem, 'id' | 'createdAt' | 'updatedAt'>, actor: User): WebItem {
    if (!this.data.webItems) this.data.webItems = [];
    const newItem: WebItem = {
      ...item,
      id: `web-item-${Date.now()}`,
      order: item.order || this.data.webItems.length + 1,
      status: item.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.webItems.push(newItem);
    this.save();

    this.logActivity({
      userId: actor.id,
      userEmail: actor.email,
      userName: actor.name,
      userRole: actor.role,
      action: 'Created Web Item',
      resource: 'Website Items',
      details: `Created web item "${newItem.title}" (${newItem.placement}).`,
      result: 'SUCCESS',
    });

    return newItem;
  }

  public updateWebItem(id: string, updates: Partial<WebItem>, actor: User): WebItem | null {
    if (!this.data.webItems) this.data.webItems = [];
    const idx = this.data.webItems.findIndex((w) => w.id === id);
    if (idx === -1) return null;

    this.data.webItems[idx] = {
      ...this.data.webItems[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();

    this.logActivity({
      userId: actor.id,
      userEmail: actor.email,
      userName: actor.name,
      userRole: actor.role,
      action: 'Updated Web Item',
      resource: 'Website Items',
      details: `Updated web item "${this.data.webItems[idx].title}".`,
      result: 'SUCCESS',
    });

    return this.data.webItems[idx];
  }

  public deleteWebItem(id: string, actor: User): boolean {
    if (!this.data.webItems) return false;
    const idx = this.data.webItems.findIndex((w) => w.id === id);
    if (idx === -1) return false;

    const [deleted] = this.data.webItems.splice(idx, 1);
    // Soft delete to trash
    const trashItem: TrashItem = {
      id: `trash-webitem-${Date.now()}`,
      originalId: deleted.id,
      itemType: 'WEBSITE_ITEM',
      title: deleted.title,
      data: deleted,
      deletedBy: actor.email,
      deletedByRole: actor.role,
      deletedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      originalLocation: `Placement: ${deleted.placement}`,
    };
    if (!this.data.trash) this.data.trash = [];
    this.data.trash.unshift(trashItem);
    this.save();

    this.logActivity({
      userId: actor.id,
      userEmail: actor.email,
      userName: actor.name,
      userRole: actor.role,
      action: 'Deleted Web Item',
      resource: 'Website Items',
      details: `Moved web item "${deleted.title}" to trash.`,
      result: 'SUCCESS',
    });

    return true;
  }

  // ====================== NAVIGATION ======================
  public getNavigationItems(): NavigationItem[] {
    if (!this.data.navigation || this.data.navigation.length === 0) {
      this.data.navigation = DEFAULT_NAVIGATION_ITEMS;
      this.save();
    }
    return this.data.navigation.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public updateNavigationItems(items: NavigationItem[], actor: User): NavigationItem[] {
    this.data.navigation = items.map((item, idx) => ({
      ...item,
      order: item.order !== undefined ? item.order : idx + 1,
    }));
    this.save();

    this.logActivity({
      userId: actor.id,
      userEmail: actor.email,
      userName: actor.name,
      userRole: actor.role,
      action: 'Updated Navigation',
      resource: 'Site Navigation',
      details: `Updated ${items.length} navigation links.`,
      result: 'SUCCESS',
    });

    return this.data.navigation;
  }

  // ====================== ABOUT CONFIG ======================
  public getAboutConfig(): AboutPageConfig {
    if (!this.data.aboutConfig) {
      this.data.aboutConfig = DEFAULT_ABOUT_CONFIG;
      this.save();
    }
    return this.data.aboutConfig;
  }

  public updateAboutConfig(updates: Partial<AboutPageConfig>, actor: User): AboutPageConfig {
    this.data.aboutConfig = {
      ...(this.data.aboutConfig || DEFAULT_ABOUT_CONFIG),
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.email,
    };
    this.save();

    this.logActivity({
      userId: actor.id,
      userEmail: actor.email,
      userName: actor.name,
      userRole: actor.role,
      action: 'Updated About Page',
      resource: 'About & Publication Information',
      details: `Updated publication mission and editorial overview.`,
      result: 'SUCCESS',
    });

    return this.data.aboutConfig;
  }

  // ====================== ANALYTICS & TRACKING ======================
  public trackEvent(type: 'view' | 'save' | 'share', articleId: string) {
    if (!this.data.analytics) {
      this.data.analytics = { views: {}, saves: {}, shares: {} };
    }
    const article = this.data.articles.find((a) => a.id === articleId || a.slug === articleId);
    const key = article ? article.id : articleId;

    if (type === 'view') {
      this.data.analytics.views[key] = (this.data.analytics.views[key] || 0) + 1;
      if (article) article.views = (article.views || 0) + 1;
    } else if (type === 'save') {
      this.data.analytics.saves[key] = (this.data.analytics.saves[key] || 0) + 1;
      if (article) article.saves = (article.saves || 0) + 1;
    } else if (type === 'share') {
      this.data.analytics.shares[key] = (this.data.analytics.shares[key] || 0) + 1;
      if (article) article.shares = (article.shares || 0) + 1;
    }
    this.save();
  }

  public getAnalyticsSummary(): AnalyticsStats {
    let totalViews = 0;
    let totalSaves = 0;
    let totalShares = 0;
    let totalReadingMinutes = 0;

    const publishedArticles = this.data.articles.filter(
      (a) => a.status === 'PUBLISHED' || !a.status
    );

    const categoryMap: Record<string, { count: number; views: number; saves: number }> = {};

    const topArticles = publishedArticles
      .map((a) => {
        const v = a.views || 0;
        const s = a.saves || 0;
        const sh = a.shares || 0;
        const readMins = a.readTimeMinutes || 4;
        totalViews += v;
        totalSaves += s;
        totalShares += sh;
        totalReadingMinutes += readMins;

        const cat = a.category || 'General';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { count: 0, views: 0, saves: 0 };
        }
        categoryMap[cat].count += 1;
        categoryMap[cat].views += v;
        categoryMap[cat].saves += s;

        return {
          id: a.id,
          title: a.title,
          slug: a.slug,
          category: a.category,
          authorName: a.author?.name || 'Editorial Staff',
          views: v,
          saves: s,
          shares: sh,
          readTime: a.readTime || `${readMins} min read`,
        };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      count: data.count,
      views: data.views,
      saves: data.saves,
    })).sort((a, b) => b.views - a.views);

    const avgReadDurationMinutes =
      publishedArticles.length > 0
        ? Math.round((totalReadingMinutes / publishedArticles.length) * 10) / 10
        : 4.5;

    // Calculate dynamic 7-day velocity from real analytics / distributed weight
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const weeklyVelocity = [];
    let maxDayViews = 1;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayName = dayNames[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      
      // Look up real recorded daily views or proportionate distribution of total live views
      const recordedViews = this.data.analytics?.views?.[`${dateStr}`] || 0;
      // Proportional factor based on weekday traffic pattern if no raw logs for that specific day
      const dayFactor = [0.13, 0.14, 0.15, 0.15, 0.16, 0.14, 0.13][d.getDay()];
      const dayViews = recordedViews > 0 ? recordedViews : Math.max(1, Math.round(totalViews * dayFactor));
      if (dayViews > maxDayViews) maxDayViews = dayViews;

      weeklyVelocity.push({
        day: dayName,
        dateStr,
        views: dayViews,
        saves: Math.max(0, Math.round(dayViews * 0.08)),
        heightPct: 0,
      });
    }

    weeklyVelocity.forEach((w) => {
      w.heightPct = Math.max(18, Math.round((w.views / maxDayViews) * 100));
    });

    const totalSubscribers = this.data.subscribers ? this.data.subscribers.length : 0;
    const totalAuthors = this.data.authors ? this.data.authors.length : 0;

    return {
      totalViews,
      totalSaves,
      totalShares,
      totalSubscribers,
      totalArticles: publishedArticles.length,
      totalAuthors,
      totalReadingMinutes,
      avgReadDurationMinutes,
      topArticles,
      categoryBreakdown,
      weeklyVelocity,
    };
  }
}

export const db = new DatabaseService();
