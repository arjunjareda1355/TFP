-- ==========================================================
-- CLOUDFLARE D1 DATABASE SCHEMA
-- The Folded Page Publication & Content Architecture
-- Fully compatible with Cloudflare D1 (SQLite)
-- ==========================================================

-- 1. Files / R2 Storage Metadata
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  object_key TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  bucket TEXT NOT NULL DEFAULT 'thefoldedpage-storage',
  visibility TEXT NOT NULL DEFAULT 'public', -- 'public' | 'private'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready', -- 'uploading' | 'ready' | 'deleted' | 'error'
  public_url TEXT,
  metadata TEXT -- JSON string for tags, dimensions, alt text, etc.
);

CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_mime_type ON files(mime_type);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);

-- 2. Articles & Dispatches
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  kicker TEXT,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author TEXT NOT NULL,
  author_role TEXT,
  category TEXT NOT NULL,
  tags TEXT, -- JSON array of tags
  published_date TEXT,
  updated_date TEXT,
  reading_time TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT', -- 'DRAFT' | 'IN_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'
  issue_number INTEGER,
  series_id TEXT,
  series_order INTEGER,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  bookmarks INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_editors_pick INTEGER NOT NULL DEFAULT 0,
  is_trending INTEGER NOT NULL DEFAULT 0,
  is_breaking INTEGER NOT NULL DEFAULT 0,
  is_staff_pick INTEGER NOT NULL DEFAULT 0,
  is_exclusive INTEGER NOT NULL DEFAULT 0,
  is_cover_story INTEGER NOT NULL DEFAULT 0,
  is_unique INTEGER NOT NULL DEFAULT 0,
  is_special INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  allow_comments INTEGER NOT NULL DEFAULT 1,
  requires_subscription INTEGER NOT NULL DEFAULT 0,
  paywall_type TEXT DEFAULT 'free',
  word_count INTEGER DEFAULT 0,
  canonical_url TEXT,
  revisions TEXT, -- JSON array of revisions
  scheduled_publish_time TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles(published_date);

-- 3. Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible INTEGER DEFAULT 1,
  icon TEXT
);

-- 4. Editorial Series
CREATE TABLE IF NOT EXISTS series (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image TEXT,
  author TEXT,
  frequency TEXT,
  status TEXT DEFAULT 'ACTIVE',
  articles_count INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0
);

-- 5. Authors & Editorial Masthead
CREATE TABLE IF NOT EXISTS authors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  role TEXT,
  bio TEXT,
  avatar TEXT,
  email TEXT,
  twitter TEXT,
  linkedin TEXT,
  website TEXT,
  articles_count INTEGER DEFAULT 0,
  is_staff INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0
);

-- 6. Magazine Issues
CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY,
  issue_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  theme TEXT,
  cover_image TEXT,
  published_date TEXT,
  status TEXT DEFAULT 'PUBLISHED',
  pdf_url TEXT,
  editorial_note TEXT,
  articles_count INTEGER DEFAULT 0,
  editor_in_chief TEXT
);

-- 7. Users & Team Access Control
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'READER',
  is_permanent_owner INTEGER DEFAULT 0,
  custom_permissions TEXT, -- JSON array
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT,
  avatar_url TEXT
);

-- 8. User Invitations
CREATE TABLE IF NOT EXISTS user_invitations (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'PENDING',
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  invited_by TEXT,
  name TEXT,
  custom_permissions TEXT -- JSON array
);

-- 9. Activity & Audit Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT
);

-- 10. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  subscribed_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SUBSCRIBED',
  preferences TEXT -- JSON
);

-- 11. Contact Submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NEW'
);

-- 12. Trash / Soft-Deleted Items
CREATE TABLE IF NOT EXISTS trash_items (
  id TEXT PRIMARY KEY,
  original_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  deleted_at TEXT NOT NULL,
  deleted_by TEXT NOT NULL,
  data TEXT NOT NULL -- JSON payload of the archived item
);

-- 13. API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  scopes TEXT NOT NULL, -- JSON array
  created_at TEXT NOT NULL,
  last_used_at TEXT,
  is_active INTEGER DEFAULT 1
);
