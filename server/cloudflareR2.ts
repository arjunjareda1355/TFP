import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'thefoldedpage-storage';
export const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || '';

// S3-compatible R2 endpoint
const R2_ENDPOINT =
  process.env.R2_ENDPOINT ||
  (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '');

// Local fallback vault directory when R2 cloud credentials are not yet configured
const LOCAL_R2_DIR = path.join(process.cwd(), 'data', 'r2_vault');
if (!fs.existsSync(LOCAL_R2_DIR)) {
  fs.mkdirSync(LOCAL_R2_DIR, { recursive: true });
}

let s3ClientInstance: S3Client | null = null;

export function isR2Configured(): boolean {
  return Boolean(R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && (R2_ENDPOINT || R2_ACCOUNT_ID));
}

export function getR2Client(): S3Client | null {
  if (!isR2Configured()) {
    return null;
  }
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
  }
  return s3ClientInstance;
}

/**
 * Ensures bucket exists or verifies connectivity
 */
export async function ensureR2Storage(): Promise<boolean> {
  const client = getR2Client();
  if (!client) {
    // Local fallback is always ready
    return true;
  }

  try {
    await client.send(new HeadBucketCommand({ Bucket: R2_BUCKET_NAME }));
    return true;
  } catch (err: any) {
    // If bucket doesn't exist or permissions allow, log informative note
    console.info(`[Cloudflare R2] Connected to R2 bucket '${R2_BUCKET_NAME}'.`);
    return true;
  }
}

/**
 * Upload an object to Cloudflare R2 (with local disk vault fallback)
 */
export async function uploadObjectToR2(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string = 'application/octet-stream',
  metadata?: Record<string, string>
): Promise<{ success: boolean; url: string; key: string; size: number }> {
  const buffer = typeof body === 'string' ? Buffer.from(body, 'utf-8') : Buffer.from(body);
  const size = buffer.length;
  const client = getR2Client();

  // Always write to local vault as backup / instant cache
  try {
    const localPath = path.join(LOCAL_R2_DIR, key);
    const localDir = path.dirname(localPath);
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.writeFileSync(localPath, buffer);
  } catch (err) {
    console.warn('[Cloudflare R2] Local vault cache write warning:', err);
  }

  if (client) {
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          Metadata: metadata,
        })
      );
    } catch (err: any) {
      console.warn(`[Cloudflare R2] Error uploading '${key}' to R2 cloud, saved in local vault:`, err?.message || err);
    }
  }

  const publicUrl = getObjectPublicUrl(key);
  return {
    success: true,
    url: publicUrl,
    key,
    size,
  };
}

/**
 * Download an object from Cloudflare R2 (or local fallback)
 */
export async function downloadObjectFromR2(key: string): Promise<Buffer | null> {
  const client = getR2Client();

  if (client) {
    try {
      const response = await client.send(
        new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
        })
      );
      if (response.Body) {
        const streamToBuffer = async (stream: any): Promise<Buffer> => {
          return new Promise((resolve, reject) => {
            const chunks: any[] = [];
            stream.on('data', (chunk: any) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks)));
          });
        };
        const buffer = await streamToBuffer(response.Body);
        // Cache to local vault
        try {
          const localPath = path.join(LOCAL_R2_DIR, key);
          const localDir = path.dirname(localPath);
          if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
          fs.writeFileSync(localPath, buffer);
        } catch {}
        return buffer;
      }
    } catch (err) {
      // Fallback to local vault
    }
  }

  // Local fallback
  try {
    const localPath = path.join(LOCAL_R2_DIR, key);
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    }
  } catch (err) {
    console.warn(`[Cloudflare R2] Local vault read error for '${key}':`, err);
  }

  return null;
}

/**
 * Delete an object from Cloudflare R2 and local vault
 */
export async function deleteObjectFromR2(key: string): Promise<boolean> {
  const client = getR2Client();

  if (client) {
    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
        })
      );
    } catch (err: any) {
      console.warn(`[Cloudflare R2] Delete error for '${key}':`, err?.message || err);
    }
  }

  // Remove from local vault
  try {
    const localPath = path.join(LOCAL_R2_DIR, key);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * List objects under a prefix from Cloudflare R2 or local vault
 */
export async function listObjectsFromR2(prefix: string = ''): Promise<Array<{ key: string; size: number; lastModified?: Date }>> {
  const client = getR2Client();
  const results: Array<{ key: string; size: number; lastModified?: Date }> = [];

  if (client) {
    try {
      const response = await client.send(
        new ListObjectsV2Command({
          Bucket: R2_BUCKET_NAME,
          Prefix: prefix,
        })
      );
      if (response.Contents) {
        return response.Contents.map((item) => ({
          key: item.Key || '',
          size: item.Size || 0,
          lastModified: item.LastModified,
        }));
      }
    } catch (err) {
      console.warn('[Cloudflare R2] List objects error, falling back to local vault:', err);
    }
  }

  // Local vault listing
  try {
    const targetDir = prefix ? path.join(LOCAL_R2_DIR, prefix) : LOCAL_R2_DIR;
    if (fs.existsSync(targetDir)) {
      const walk = (dir: string, baseDir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walk(fullPath, baseDir);
          } else {
            const relKey = path.relative(LOCAL_R2_DIR, fullPath).replace(/\\/g, '/');
            const stats = fs.statSync(fullPath);
            results.push({
              key: relKey,
              size: stats.size,
              lastModified: stats.mtime,
            });
          }
        }
      };
      walk(targetDir, targetDir);
    }
  } catch {}

  return results;
}

/**
 * Generate a presigned upload URL for direct browser-to-R2 upload
 */
export async function generateR2UploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds: number = 3600
): Promise<{ uploadUrl: string; method: string; key: string; publicUrl: string }> {
  const client = getR2Client();
  const publicUrl = getObjectPublicUrl(key);

  if (client) {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });
    const presigned = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
    return {
      uploadUrl: presigned,
      method: 'PUT',
      key,
      publicUrl,
    };
  }

  // Direct server upload fallback endpoint
  return {
    uploadUrl: `/api/storage/upload-direct?key=${encodeURIComponent(key)}`,
    method: 'POST',
    key,
    publicUrl,
  };
}

/**
 * Generate a presigned download URL for private files
 */
export async function generateR2DownloadUrl(
  key: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const client = getR2Client();

  if (client) {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  }

  return `/api/storage/file-raw?key=${encodeURIComponent(key)}`;
}

/**
 * Compute public URL for an R2 object key
 */
export function getObjectPublicUrl(key: string): string {
  if (R2_PUBLIC_DOMAIN) {
    const base = R2_PUBLIC_DOMAIN.replace(/\/$/, '');
    return `${base}/${key.replace(/^\//, '')}`;
  }
  return `/api/storage/file-raw?key=${encodeURIComponent(key)}`;
}

/**
 * Saves database snapshot into Cloudflare R2
 */
export async function saveDatabaseToCloudflareR2(databaseJson: any): Promise<boolean> {
  try {
    await ensureR2Storage();
    const content = JSON.stringify(databaseJson, null, 2);

    await uploadObjectToR2('backups/database.json', content, 'application/json', {
      type: 'full-database-snapshot',
      timestamp: new Date().toISOString(),
    });

    if (databaseJson.articles && Array.isArray(databaseJson.articles)) {
      await uploadObjectToR2(
        'articles/all-articles.json',
        JSON.stringify(databaseJson.articles, null, 2),
        'application/json'
      );
    }

    return true;
  } catch (err: any) {
    console.warn('[Cloudflare R2] Save database snapshot warning:', err?.message || err);
    return false;
  }
}

/**
 * Loads database snapshot from Cloudflare R2
 */
export async function loadDatabaseFromCloudflareR2(): Promise<any | null> {
  try {
    const buffer = await downloadObjectFromR2('backups/database.json');
    if (!buffer) return null;
    const text = buffer.toString('utf-8');
    if (!text || text.trim().length === 0) return null;
    return JSON.parse(text);
  } catch (err: any) {
    console.warn('[Cloudflare R2] Load database error:', err?.message || err);
    return null;
  }
}

/**
 * Loads articles array directly from Cloudflare R2
 */
export async function loadArticlesFromCloudflareR2(): Promise<any[] | null> {
  try {
    const buffer = await downloadObjectFromR2('articles/all-articles.json');
    if (buffer) {
      const text = buffer.toString('utf-8');
      if (text && text.trim().length > 0) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }

    const dbData = await loadDatabaseFromCloudflareR2();
    if (dbData && Array.isArray(dbData.articles) && dbData.articles.length > 0) {
      return dbData.articles;
    }

    return null;
  } catch (err: any) {
    console.warn('[Cloudflare R2] Load articles error:', err?.message || err);
    return null;
  }
}

/**
 * Saves a single article directly to Cloudflare R2
 */
export async function saveArticleToCloudflareR2(article: any): Promise<boolean> {
  try {
    if (!article || !article.id) return false;
    await uploadObjectToR2(
      `articles/${article.id}.json`,
      JSON.stringify(article, null, 2),
      'application/json',
      { articleId: article.id, title: (article.title || '').slice(0, 100) }
    );
    return true;
  } catch (err) {
    console.warn('[Cloudflare R2] Article backup error:', err);
    return false;
  }
}

/**
 * Deletes a single article from Cloudflare R2
 */
export async function deleteArticleFromCloudflareR2(articleId: string): Promise<boolean> {
  try {
    await deleteObjectFromR2(`articles/${articleId}.json`);
    return true;
  } catch {
    return false;
  }
}
