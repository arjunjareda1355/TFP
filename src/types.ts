export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  email?: string;
  location?: string;
  twitter?: string;
  website?: string;
  slug?: string;
}

export type ContentBlockType =
  | 'paragraph'
  | 'subheading'
  | 'heading2'
  | 'heading3'
  | 'pullquote'
  | 'blockquote'
  | 'highlight'
  | 'callout'
  | 'image'
  | 'gallery'
  | 'list'
  | 'divider'
  | 'video'
  | 'embed'
  | 'button';

export interface GalleryImage {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  credit?: string;
  sourceUrl?: string;
  sourceType?: 'UPLOAD' | 'EXTERNAL_URL';
}

export interface ArticleContentBlock {
  id?: string;
  type: ContentBlockType;
  text?: string;
  title?: string;
  cite?: string;
  items?: string[];
  ordered?: boolean;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  imageCredit?: string;
  imageSourceUrl?: string;
  sourceType?: 'UPLOAD' | 'EXTERNAL_URL';
  galleryImages?: GalleryImage[];
  galleryLayout?: 'grid' | 'masonry' | 'carousel';
  videoUrl?: string;
  embedType?: 'youtube' | 'vimeo' | 'custom';
  buttonLabel?: string;
  buttonUrl?: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline';
  calloutTone?: 'default' | 'amber' | 'blue' | 'green' | 'rose';
  dropCap?: boolean;
}

export type ArticleStatus = 'DRAFT' | 'IN_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export interface ArticleRevision {
  id: string;
  savedAt: string;
  authorName: string;
  title: string;
  deck?: string;
  blocksCount: number;
  wordCount: number;
  data: Partial<Article>;
  note?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  deck: string;
  category: string;
  subcategory?: string;
  tags: string[];
  author: Author;
  authorId?: string;
  status?: ArticleStatus;
  publishedDate: string;
  updatedDate?: string;
  scheduledPublishTime?: string;
  scheduledPublishDate?: string;
  readTime: string;
  readTimeMinutes: number;
  audioMinutes?: number;
  heroImage: string;
  heroImageType?: 'UPLOAD' | 'EXTERNAL_URL';
  heroImageAlt?: string;
  heroImageCaption?: string;
  heroImageCredit?: string;
  heroImageSourceUrl?: string;
  blocks: ArticleContentBlock[];
  
  // Editorial Flags
  isCoverStory?: boolean;
  isTrending?: boolean;
  isPopular?: boolean;
  isUnique?: boolean;
  isSpecial?: boolean;
  isEditorsPick?: boolean;
  isFeatured?: boolean;
  
  // Relations
  seriesName?: string;
  seriesId?: string;
  issueNumber?: string;
  issueId?: string;
  issue?: string;
  viewCount?: number;
  popularityRank?: number;
  featuredQuote?: string;
  relatedSlugs?: string[];
  manualRelatedIds?: string[];
  
  // SEO & Social
  seoTitle?: string;
  metaTitle?: string;
  seoDescription?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  socialTitle?: string;
  socialDescription?: string;
  socialImage?: string;
  
  // Stats
  views?: number;
  saves?: number;
  shares?: number;
  createdAt?: string;
  revisions?: ArticleRevision[];
}

export interface EditorialSeries {
  id: string;
  name: string;
  slug?: string;
  tagline: string;
  description: string;
  coverImage: string;
  coverImageType?: 'UPLOAD' | 'EXTERNAL_URL';
  frequency?: string;
  cadence?: string;
  curator?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface MagazineIssue {
  id: string;
  number: string;
  title: string;
  slug?: string;
  theme: string;
  date: string;
  coverImage: string;
  coverImageType?: 'UPLOAD' | 'EXTERNAL_URL';
  description?: string;
  curatorNote: string;
  featuredStorySlugs?: string[];
  articleSlugs?: string[];
  featuredArticleIds?: string[];
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  accentColor: string;
  iconName: string;
  isPrimary?: boolean;
  order?: number;
  isActive?: boolean;
  coverImage?: string;
}

export type Category = CategoryInfo;

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  sourceType: 'UPLOAD' | 'EXTERNAL_URL';
  alt?: string;
  caption?: string;
  credit?: string;
  sourceUrl?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  uploadedBy?: string;
  usageCount?: number;
}

export interface HomepageLayoutConfig {
  coverStoryId: string;
  trendingStoryIds: string[];
  foldStoryIds: string[];
  popularStoryIds: string[];
  uniqueStoryIds: string[];
  specialStoryIds: string[];
  editorsPickIds: string[];
  updatedAt?: string;
}

export type UserRole =
  | 'EDITORIAL_OWNER'
  | 'OPERATIONS_OWNER'
  | 'OWNER'
  | 'MANAGING_EDITOR'
  | 'SENIOR_EDITOR'
  | 'EDITOR'
  | 'CONTRIBUTOR'
  | 'WRITER'
  | 'DESIGNER'
  | 'WEBSITE_MANAGER'
  | 'OPERATIONS_SPECIALIST'
  | 'MODERATOR'
  | 'ANALYTICS_VIEWER'
  | 'VIEWER'
  | 'READER';

export type RoleName = UserRole;

export type PermissionKey =
  // Articles
  | 'articles.view'
  | 'articles.create'
  | 'articles.edit'
  | 'articles.delete'
  | 'articles.publish'
  | 'articles.unpublish'
  | 'articles.archive'
  | 'articles.restore'
  | 'articles.schedule'
  | 'articles.export'
  | 'articles.manage_categories'
  | 'articles.manage_tags'
  | 'articles.manage_collections'
  | 'articles.manage_series'
  | 'articles.manage_featured'
  // Website
  | 'website.view'
  | 'website.edit'
  | 'website.publish'
  | 'website.manage_homepage'
  | 'website.manage_navigation'
  | 'website.manage_footer'
  | 'website.manage_social'
  | 'website.manage_feeds'
  | 'website.manage_about'
  | 'website.manage_contact'
  | 'website.manage_links'
  | 'website.manage_widgets'
  // Users & Roles
  | 'users.view'
  | 'users.invite'
  | 'users.manage_roles'
  | 'users.suspend'
  | 'users.remove'
  | 'users.reset_access'
  // Media
  | 'media.view'
  | 'media.upload'
  | 'media.delete'
  // Analytics
  | 'analytics.view'
  | 'analytics.export'
  // Security
  | 'security.view_logs'
  | 'security.manage_own'
  // Trash
  | 'trash.view'
  | 'trash.restore'
  | 'trash.purge';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  customPermissions?: string[];
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'REMOVED';
  isPermanentOwner?: boolean;
  avatar?: string;
  bio?: string;
  createdAt?: string;
  lastLogin?: string;
  twoFactorEnabled?: boolean;
}

export interface UserInvitation {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  customPermissions?: string[];
  invitedBy: string;
  invitedByName?: string;
  invitedAt: string;
  expiresAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  token: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: UserRole | string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  result: 'SUCCESS' | 'FAILURE' | 'WARNING';
  ip?: string;
}

export interface TrashItem {
  id: string;
  originalId: string;
  itemType: 'ARTICLE' | 'WEBSITE_ITEM' | 'SERIES' | 'ISSUE' | 'MEDIA';
  title: string;
  data: any;
  deletedBy: string;
  deletedByRole: string;
  deletedAt: string;
  expiresAt: string;
  originalLocation?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  role: UserRole;
  scopes: string[];
  createdBy: string;
  createdAt: string;
  lastUsedAt?: string | null;
  status: 'ACTIVE' | 'REVOKED';
  description?: string;
}

export interface WebItem {
  id: string;
  title: string;
  description?: string;
  type: 'LINK' | 'BUTTON' | 'BANNER' | 'CARD' | 'SOCIAL_LINK' | 'FEED' | 'ANNOUNCEMENT' | 'WIDGET';
  url: string;
  iconName?: string;
  imageUrl?: string;
  placement: 'HOMEPAGE' | 'HEADER' | 'NAVIGATION' | 'FOOTER' | 'ABOUT' | 'EXPLORE' | 'ARTICLE' | 'SIDEBAR';
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  order: number;
  badge?: string;
  targetBlank?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  target: '_self' | '_blank';
  location: 'MAIN' | 'FOOTER' | 'MOBILE';
  order: number;
  isVisible: boolean;
}

export interface AboutPageConfig {
  publicationName: string;
  tagline: string;
  missionStatement: string;
  aboutText: string;
  editorialDescription: string;
  contactEmail: string;
  location: string;
  foundingYear: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  edition: 'weekly' | 'all';
  subscribedAt: string;
  status: 'active' | 'pending' | 'unsubscribed';
  verifiedAt?: string;
  verificationToken?: string;
  verificationExpires?: string;
  unsubscribeToken?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: 'unread' | 'read' | 'replied';
}

export interface SocialChannel {
  id: string;
  name: string;
  handle: string;
  description: string;
  url: string;
  iconName?: string;
  badge?: string;
  followerCount?: string;
  order?: number;
  isActive?: boolean;
}

export interface AnalyticsStats {
  totalViews: number;
  totalSaves: number;
  totalShares: number;
  totalSubscribers?: number;
  totalArticles?: number;
  totalAuthors?: number;
  totalReadingMinutes?: number;
  avgReadDurationMinutes?: number;
  topArticles: {
    id: string;
    title: string;
    slug?: string;
    category?: string;
    authorName?: string;
    views: number;
    saves: number;
    shares: number;
    readTime?: string;
  }[];
  categoryBreakdown?: { category: string; count: number; views: number; saves: number }[];
  weeklyVelocity?: { day: string; dateStr: string; views: number; saves: number; heightPct: number }[];
}

export type PageRoute = 
  | { type: 'home' }
  | { type: 'article'; slug: string }
  | { type: 'category'; categorySlug: string }
  | { type: 'explore' }
  | { type: 'today' }
  | { type: 'issues'; issueId?: string }
  | { type: 'series'; seriesId?: string }
  | { type: 'author'; slug: string }
  | { type: 'saved' }
  | { type: 'about' }
  | { type: 'newsletter' }
  | { type: 'contact' }
  | { type: 'search'; query?: string }
  | { type: 'admin'; subview?: string; articleId?: string }
  | { type: 'admin-login' }
  | { type: 'notfound' };
