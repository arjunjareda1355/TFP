import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const CLOUDFLARE_D1_DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID || '';

export interface StoredFileRecord {
  id: string;
  user_id?: string;
  object_key: string;
  original_name: string;
  mime_type: string;
  size: number;
  bucket: string;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
  status: 'uploading' | 'ready' | 'deleted' | 'error';
  public_url?: string;
  metadata?: Record<string, any>;
}

export function isD1Configured(): boolean {
  return Boolean(R2_ACCOUNT_ID && CLOUDFLARE_API_TOKEN && CLOUDFLARE_D1_DATABASE_ID);
}

/**
 * Executes a SQL statement on Cloudflare D1 via the Cloudflare v4 REST API
 */
export async function executeD1Query(sql: string, params: any[] = []): Promise<any> {
  if (!isD1Configured()) {
    return { success: true, simulated: true, results: [] };
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${R2_ACCOUNT_ID}/d1/database/${CLOUDFLARE_D1_DATABASE_ID}/query`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql,
        params,
      }),
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    console.warn('[Cloudflare D1] Query error:', err?.message || err);
    return { success: false, error: err?.message || err };
  }
}

/**
 * Generates an executable Cloudflare D1 SQL dump of the current database state
 */
export function generateD1SqlDump(data: any): string {
  const lines: string[] = [];

  lines.push('-- ==========================================================');
  lines.push('-- CLOUDFLARE D1 AUTOMATED EXPORT DUMP');
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push('-- Target: Cloudflare D1 (SQLite engine)');
  lines.push('-- ==========================================================\n');

  // Schema definition
  const schemaPath = path.join(process.cwd(), 'server', 'cloudflare-d1-schema.sql');
  if (fs.existsSync(schemaPath)) {
    lines.push(fs.readFileSync(schemaPath, 'utf-8'));
    lines.push('\n-- DATA INSERTS --\n');
  }

  const escapeSql = (val: any): string => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return String(val);
    if (typeof val === 'boolean') return val ? '1' : '0';
    if (typeof val === 'object') {
      return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
    }
    return `'${String(val).replace(/'/g, "''")}'`;
  };

  // 1. Categories
  if (Array.isArray(data.categories)) {
    for (const c of data.categories) {
      lines.push(
        `INSERT OR REPLACE INTO categories (id, name, slug, description, color, display_order, is_visible, icon) VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.slug)}, ${escapeSql(c.description)}, ${escapeSql(c.color)}, ${escapeSql(c.order)}, ${escapeSql(c.isVisible ? 1 : 0)}, ${escapeSql(c.icon)});`
      );
    }
  }

  // 2. Authors
  if (Array.isArray(data.authors)) {
    for (const a of data.authors) {
      lines.push(
        `INSERT OR REPLACE INTO authors (id, name, slug, role, bio, avatar, email, twitter, linkedin, website, articles_count, is_staff, is_featured, display_order) VALUES (${escapeSql(a.id)}, ${escapeSql(a.name)}, ${escapeSql(a.slug)}, ${escapeSql(a.role)}, ${escapeSql(a.bio)}, ${escapeSql(a.avatar)}, ${escapeSql(a.email)}, ${escapeSql(a.twitter)}, ${escapeSql(a.linkedin)}, ${escapeSql(a.website)}, ${escapeSql(a.articlesCount)}, ${escapeSql(a.isStaff ? 1 : 0)}, ${escapeSql(a.isFeatured ? 1 : 0)}, ${escapeSql(a.order)});`
      );
    }
  }

  // 3. Articles
  if (Array.isArray(data.articles)) {
    for (const art of data.articles) {
      lines.push(
        `INSERT OR REPLACE INTO articles (id, slug, title, subtitle, kicker, excerpt, content, cover_image, author, author_role, category, tags, published_date, updated_date, reading_time, status, issue_number, series_id, series_order, views, likes, bookmarks, shares, comments_count, is_featured, is_editors_pick, is_trending, is_breaking, is_staff_pick, is_exclusive, is_cover_story, is_unique, is_special, seo_title, seo_description, allow_comments, requires_subscription, paywall_type, word_count, canonical_url, revisions, scheduled_publish_time, created_at) VALUES (${escapeSql(art.id)}, ${escapeSql(art.slug)}, ${escapeSql(art.title)}, ${escapeSql(art.subtitle)}, ${escapeSql(art.kicker)}, ${escapeSql(art.excerpt)}, ${escapeSql(art.content)}, ${escapeSql(art.coverImage)}, ${escapeSql(art.author)}, ${escapeSql(art.authorRole)}, ${escapeSql(art.category)}, ${escapeSql(art.tags)}, ${escapeSql(art.publishedDate)}, ${escapeSql(art.updatedDate)}, ${escapeSql(art.readingTime)}, ${escapeSql(art.status)}, ${escapeSql(art.issueNumber)}, ${escapeSql(art.seriesId)}, ${escapeSql(art.seriesOrder)}, ${escapeSql(art.views || 0)}, ${escapeSql(art.likes || 0)}, ${escapeSql(art.bookmarks || 0)}, ${escapeSql(art.shares || 0)}, ${escapeSql(art.commentsCount || 0)}, ${escapeSql(art.isFeatured ? 1 : 0)}, ${escapeSql(art.isEditorsPick ? 1 : 0)}, ${escapeSql(art.isTrending ? 1 : 0)}, ${escapeSql(art.isBreaking ? 1 : 0)}, ${escapeSql(art.isStaffPick ? 1 : 0)}, ${escapeSql(art.isExclusive ? 1 : 0)}, ${escapeSql(art.isCoverStory ? 1 : 0)}, ${escapeSql(art.isUnique ? 1 : 0)}, ${escapeSql(art.isSpecial ? 1 : 0)}, ${escapeSql(art.seoTitle)}, ${escapeSql(art.seoDescription)}, ${escapeSql(art.allowComments === false ? 0 : 1)}, ${escapeSql(art.requiresSubscription ? 1 : 0)}, ${escapeSql(art.paywallType || 'free')}, ${escapeSql(art.wordCount || 0)}, ${escapeSql(art.canonicalUrl)}, ${escapeSql(art.revisions || [])}, ${escapeSql(art.scheduledPublishTime)}, ${escapeSql(art.createdAt || new Date().toISOString())});`
      );
    }
  }

  // 4. Users
  if (Array.isArray(data.users)) {
    for (const u of data.users) {
      lines.push(
        `INSERT OR REPLACE INTO users (id, email, name, role, is_permanent_owner, custom_permissions, status, created_at, updated_at, last_login_at, avatar_url) VALUES (${escapeSql(u.id)}, ${escapeSql(u.email)}, ${escapeSql(u.name)}, ${escapeSql(u.role)}, ${escapeSql(u.isPermanentOwner ? 1 : 0)}, ${escapeSql(u.customPermissions || [])}, ${escapeSql(u.status || 'ACTIVE')}, ${escapeSql(u.createdAt || new Date().toISOString())}, ${escapeSql(u.updatedAt || new Date().toISOString())}, ${escapeSql(u.lastLoginAt)}, ${escapeSql(u.avatarUrl)});`
      );
    }
  }

  // 5. Files
  if (Array.isArray(data.files)) {
    for (const f of data.files) {
      lines.push(
        `INSERT OR REPLACE INTO files (id, user_id, object_key, original_name, mime_type, size, bucket, visibility, created_at, updated_at, status, public_url, metadata) VALUES (${escapeSql(f.id)}, ${escapeSql(f.user_id)}, ${escapeSql(f.object_key)}, ${escapeSql(f.original_name)}, ${escapeSql(f.mime_type)}, ${escapeSql(f.size)}, ${escapeSql(f.bucket)}, ${escapeSql(f.visibility || 'public')}, ${escapeSql(f.created_at)}, ${escapeSql(f.updated_at)}, ${escapeSql(f.status || 'ready')}, ${escapeSql(f.public_url)}, ${escapeSql(f.metadata || {})});`
      );
    }
  }

  return lines.join('\n');
}

/**
 * Synchronize current application records to Cloudflare D1
 */
export async function syncDatabaseToCloudflareD1(data: any): Promise<{ success: boolean; executedStatements: number; message: string }> {
  if (!isD1Configured()) {
    return {
      success: true,
      executedStatements: 0,
      message: 'Cloudflare D1 credentials not provided. Running on local SQLite/D1-compatible store.',
    };
  }

  try {
    const dump = generateD1SqlDump(data);
    const statements = dump
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    let count = 0;
    // Batch in groups of 10 statements
    for (let i = 0; i < statements.length; i += 10) {
      const batch = statements.slice(i, i + 10).join(';\n') + ';';
      await executeD1Query(batch);
      count += Math.min(10, statements.length - i);
    }

    return {
      success: true,
      executedStatements: count,
      message: `Successfully synchronized ${count} statements to Cloudflare D1.`,
    };
  } catch (err: any) {
    return {
      success: false,
      executedStatements: 0,
      message: `D1 sync failed: ${err?.message || err}`,
    };
  }
}
