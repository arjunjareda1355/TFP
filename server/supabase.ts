import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Ensure environment variables are loaded
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jwziqhloqiwrjjnumexo.supabase.co';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const supabasePublic = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const STORAGE_BUCKET = 'thefoldedpage_data';

// Initialize storage bucket for durable persistence
let isBucketReady = false;

export async function ensureSupabaseStorage(): Promise<boolean> {
  if (isBucketReady) return true;
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === STORAGE_BUCKET);
    if (!exists) {
      await supabaseAdmin.storage.createBucket(STORAGE_BUCKET, { public: true });
    }
    isBucketReady = true;
    return true;
  } catch (err) {
    console.warn('[Supabase] Could not ensure storage bucket:', err);
    return false;
  }
}

/**
 * Saves full database snapshot to Supabase Storage
 */
export async function saveDatabaseToSupabase(databaseJson: any): Promise<boolean> {
  try {
    await ensureSupabaseStorage();
    const content = JSON.stringify(databaseJson, null, 2);
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload('database.json', content, {
        upsert: true,
        contentType: 'application/json',
      });

    if (error) {
      console.warn('[Supabase] Warning saving database.json to Supabase:', error.message);
      return false;
    }

    // Also persist articles.json separately for fast retrieval
    if (databaseJson.articles && Array.isArray(databaseJson.articles)) {
      await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload('articles.json', JSON.stringify(databaseJson.articles, null, 2), {
          upsert: true,
          contentType: 'application/json',
        });
    }

    return true;
  } catch (err: any) {
    console.warn('[Supabase] Save error:', err?.message || err);
    return false;
  }
}

/**
 * Loads database snapshot from Supabase Storage
 */
export async function loadDatabaseFromSupabase(): Promise<any | null> {
  try {
    await ensureSupabaseStorage();
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download('database.json');

    if (error || !data) {
      return null;
    }

    const text = await data.text();
    if (!text || text.trim().length === 0) return null;
    return JSON.parse(text);
  } catch (err: any) {
    console.warn('[Supabase] Load database error:', err?.message || err);
    return null;
  }
}

/**
 * Loads articles array directly from Supabase Storage
 */
export async function loadArticlesFromSupabase(): Promise<any[] | null> {
  try {
    await ensureSupabaseStorage();
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download('articles.json');

    if (!error && data) {
      const text = await data.text();
      if (text && text.trim().length > 0) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }

    // Fallback: check database.json
    const dbData = await loadDatabaseFromSupabase();
    if (dbData && Array.isArray(dbData.articles) && dbData.articles.length > 0) {
      return dbData.articles;
    }

    return null;
  } catch (err: any) {
    console.warn('[Supabase] Load articles error:', err?.message || err);
    return null;
  }
}

/**
 * Loads a single article from Supabase Storage
 */
export async function loadArticleFromSupabase(articleId: string): Promise<any | null> {
  try {
    await ensureSupabaseStorage();
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(`articles/${articleId}.json`);

    if (error || !data) return null;
    const text = await data.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/**
 * Saves a single article directly to Supabase
 */
export async function saveArticleToSupabase(article: any): Promise<boolean> {
  try {
    if (!article || !article.id) return false;
    await ensureSupabaseStorage();
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(`articles/${article.id}.json`, JSON.stringify(article, null, 2), {
        upsert: true,
        contentType: 'application/json',
      });
    return !error;
  } catch (err) {
    console.warn('[Supabase] Article backup error:', err);
    return false;
  }
}

/**
 * Deletes an article from Supabase
 */
export async function deleteArticleFromSupabase(articleId: string): Promise<boolean> {
  try {
    await ensureSupabaseStorage();
    await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([`articles/${articleId}.json`]);
    return true;
  } catch {
    return false;
  }
}
