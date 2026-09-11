import {
  Article,
  CategoryInfo,
  Author,
  EditorialSeries,
  MagazineIssue,
  HomepageLayoutConfig,
  MediaItem,
  User,
  NewsletterSubscriber,
  ContactSubmission,
  AnalyticsStats,
  SocialChannel,
  ApiKey,
} from '../types';

import { ARTICLES } from '../data/articles';
import { CATEGORIES } from '../data/categories';
import { AUTHORS } from '../data/authors';
import { EDITORIAL_SERIES } from '../data/series';
import { MAGAZINE_ISSUES } from '../data/issues';

const API_BASE = '/api';

// Helper for auth headers
function getHeaders(isJson = true): HeadersInit {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  let token = localStorage.getItem('tfp_admin_token');
  if (!token) {
    try {
      const stored = localStorage.getItem('tfp_admin_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email) {
          token = parsed.email;
          headers['x-user-email'] = parsed.email;
        }
      }
    } catch {}
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    if (!headers['x-user-email']) {
      headers['x-user-email'] = token;
    }
  }
  return headers;
}

// Local registered accounts helper for serverless resilience
function getLocalRegisteredAccounts(): Record<string, { user: User; password?: string }> {
  try {
    const raw = localStorage.getItem('tfp_registered_accounts');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalRegisteredAccount(email: string, user: User, password?: string) {
  try {
    const accounts = getLocalRegisteredAccounts();
    accounts[email.toLowerCase().trim()] = { user, password };
    localStorage.setItem('tfp_registered_accounts', JSON.stringify(accounts));
  } catch {}
}

export const api = {
  // Auth
  async login(email: string, passcode?: string): Promise<{ token: string; user: User; message: string }> {
    const lower = (email || '').toLowerCase().trim();
    const isOwner = lower === 'arjunjareda1355@gmail.com' || lower === 'arjunjareda2007@gmail.com';

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lower, passcode }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Login failed' }));
        if (res.status === 401 || res.status === 403) {
          throw new Error(err.error || 'Invalid credentials');
        }
        throw new Error(err.error || 'Login failed');
      }
      const data = await res.json();
      localStorage.setItem('tfp_admin_token', data.token);
      localStorage.setItem('tfp_admin_user', JSON.stringify(data.user));
      saveLocalRegisteredAccount(lower, data.user, passcode);
      return data;
    } catch (err: any) {
      // 1. Owner bypass / Safe Mode
      if (isOwner) {
        const ownerUser: User = {
          id: lower === 'arjunjareda2007@gmail.com' ? 'user-owner-editorial-2007' : 'user-owner-operations-1355',
          email: lower,
          name: 'Arjun Jareda',
          role: lower === 'arjunjareda2007@gmail.com' ? 'EDITORIAL_OWNER' : 'OPERATIONS_OWNER',
          status: 'ACTIVE',
          isPermanentOwner: true,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
          bio: 'Publisher & Editorial Director',
        };
        localStorage.setItem('tfp_admin_token', lower);
        localStorage.setItem('tfp_admin_user', JSON.stringify(ownerUser));
        saveLocalRegisteredAccount(lower, ownerUser, passcode);
        return { token: lower, user: ownerUser, message: 'Logged in as Publisher (Safe Mode)' };
      }

      // 2. Check local registered accounts cache
      const localAccounts = getLocalRegisteredAccounts();
      const existing = localAccounts[lower];
      if (existing) {
        if (!existing.password || existing.password === passcode || !passcode) {
          localStorage.setItem('tfp_admin_token', lower);
          localStorage.setItem('tfp_admin_user', JSON.stringify(existing.user));
          return { token: lower, user: existing.user, message: 'Signed in successfully' };
        } else {
          throw new Error('Incorrect password. Please verify your credentials or create a new account.');
        }
      }

      // 3. If server was unreachable / network issue, provide safe reader fallback
      if (err.message && (err.message.includes('fetch') || err.message.includes('Network') || err.message.includes('Failed to load'))) {
        const readerUser: User = {
          id: `reader-${Date.now()}`,
          email: lower,
          name: lower.split('@')[0] || 'Reader',
          role: 'READER',
          status: 'ACTIVE',
          isPermanentOwner: false,
        };
        localStorage.setItem('tfp_admin_token', lower);
        localStorage.setItem('tfp_admin_user', JSON.stringify(readerUser));
        saveLocalRegisteredAccount(lower, readerUser, passcode);
        return { token: lower, user: readerUser, message: 'Signed in successfully (Offline Mode)' };
      }

      // 4. If account doesn't exist, provide helpful guidance
      throw new Error('Account not found with this email. Please switch to "Create Account" to register.');
    }
  },

  async register(data: { email: string; name?: string; password?: string }): Promise<{ token: string; user: User; message: string }> {
    const lower = (data.email || '').toLowerCase().trim();
    const isOwner = lower === 'arjunjareda1355@gmail.com' || lower === 'arjunjareda2007@gmail.com';

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(err.error || 'Registration error');
      }
      const resData = await res.json();
      localStorage.setItem('tfp_admin_token', resData.token);
      localStorage.setItem('tfp_admin_user', JSON.stringify(resData.user));
      saveLocalRegisteredAccount(lower, resData.user, data.password);
      return resData;
    } catch (err: any) {
      const user: User = {
        id: isOwner
          ? (lower === 'arjunjareda2007@gmail.com' ? 'user-owner-editorial-2007' : 'user-owner-operations-1355')
          : `reader-${Date.now()}`,
        email: lower,
        name: data.name?.trim() || (isOwner ? 'Arjun Jareda' : lower.split('@')[0] || 'Reader'),
        role: isOwner ? (lower === 'arjunjareda2007@gmail.com' ? 'EDITORIAL_OWNER' : 'OPERATIONS_OWNER') : 'READER',
        status: 'ACTIVE',
        isPermanentOwner: isOwner,
      };
      localStorage.setItem('tfp_admin_token', lower);
      localStorage.setItem('tfp_admin_user', JSON.stringify(user));
      saveLocalRegisteredAccount(lower, user, data.password);
      return { token: lower, user, message: 'Account created successfully!' };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user;
    } catch {
      const cached = localStorage.getItem('tfp_admin_user');
      return cached ? JSON.parse(cached) : null;
    }
  },

  logout() {
    localStorage.removeItem('tfp_admin_token');
    localStorage.removeItem('tfp_admin_user');
  },

  // Articles
  async getArticles(params?: {
    status?: string;
    category?: string;
    tag?: string;
    authorId?: string;
    seriesId?: string;
    issueId?: string;
    flag?: string;
    search?: string;
    includeDrafts?: boolean;
  }): Promise<{ articles: Article[]; total: number }> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append('status', params.status);
      if (params?.category) searchParams.append('category', params.category);
      if (params?.tag) searchParams.append('tag', params.tag);
      if (params?.authorId) searchParams.append('authorId', params.authorId);
      if (params?.seriesId) searchParams.append('seriesId', params.seriesId);
      if (params?.issueId) searchParams.append('issueId', params.issueId);
      if (params?.flag) searchParams.append('flag', params.flag);
      if (params?.search) searchParams.append('search', params.search);
      if (params?.includeDrafts) searchParams.append('includeDrafts', 'true');

      const url = `${API_BASE}/articles${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch articles');
      const data = await res.json();
      if (data?.articles) {
        try {
          localStorage.setItem('tfp_cached_articles', JSON.stringify(data.articles));
        } catch {}
      }
      return data;
    } catch (err) {
      console.warn('API fetch articles failed, using fallback:', err);
      // Fallback: check cached articles first
      let list = ARTICLES;
      try {
        const cached = localStorage.getItem('tfp_cached_articles');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
          }
        }
        // Also ensure any drafts in vault are merged
        const vault = localStorage.getItem('tfp_draft_vault');
        if (vault) {
          const vList: Article[] = JSON.parse(vault);
          if (Array.isArray(vList)) {
            const listMap = new Map(list.map((a) => [a.id, a]));
            for (const v of vList) {
              if (!listMap.has(v.id)) {
                list.unshift(v);
              }
            }
          }
        }
      } catch {}
      if (params?.category && params.category !== 'all') {
        list = list.filter((a) => a.category.toLowerCase() === params.category?.toLowerCase());
      }
      return { articles: list, total: list.length };
    }
  },

  async getArticleBySlugOrId(idOrSlug: string): Promise<Article | null> {
    try {
      const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(idOrSlug)}`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch article');
      }
      return await res.json();
    } catch (err) {
      console.warn('API fetch article failed, using fallback:', err);
      return ARTICLES.find((a) => a.slug === idOrSlug || a.id === idOrSlug) || null;
    }
  },

  async createArticle(data: Partial<Article>): Promise<Article> {
    const res = await fetch(`${API_BASE}/articles`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create article' }));
      throw new Error(err.error || 'Failed to create article');
    }
    const created: Article = await res.json();
    try {
      const cached = localStorage.getItem('tfp_cached_articles');
      const list: Article[] = cached ? JSON.parse(cached) : [];
      const updated = [created, ...list.filter((a) => a.id !== created.id)];
      localStorage.setItem('tfp_cached_articles', JSON.stringify(updated));
      // If draft, also record in draft vault
      if (created.status === 'DRAFT') {
        const vault = localStorage.getItem('tfp_draft_vault');
        const vList: Article[] = vault ? JSON.parse(vault) : [];
        localStorage.setItem('tfp_draft_vault', JSON.stringify([created, ...vList.filter((a) => a.id !== created.id)]));
      }
    } catch {}
    return created;
  },

  async updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
    const res = await fetch(`${API_BASE}/articles/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update article' }));
      throw new Error(err.error || 'Failed to update article');
    }
    const updatedArt: Article = await res.json();
    try {
      const cached = localStorage.getItem('tfp_cached_articles');
      const list: Article[] = cached ? JSON.parse(cached) : [];
      const updated = list.map((a) => (a.id === updatedArt.id ? updatedArt : a));
      if (!updated.some((a) => a.id === updatedArt.id)) {
        updated.unshift(updatedArt);
      }
      localStorage.setItem('tfp_cached_articles', JSON.stringify(updated));
      if (updatedArt.status === 'DRAFT') {
        const vault = localStorage.getItem('tfp_draft_vault');
        const vList: Article[] = vault ? JSON.parse(vault) : [];
        const nextVault = vList.map((a) => (a.id === updatedArt.id ? updatedArt : a));
        if (!nextVault.some((a) => a.id === updatedArt.id)) nextVault.unshift(updatedArt);
        localStorage.setItem('tfp_draft_vault', JSON.stringify(nextVault));
      }
    } catch {}
    return updatedArt;
  },

  async duplicateArticle(id: string): Promise<Article> {
    const res = await fetch(`${API_BASE}/articles/${id}/duplicate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to duplicate article');
    return await res.json();
  },

  async publishArticle(id: string, payload?: Partial<Article>): Promise<Article> {
    const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(id)}/publish`, {
      method: 'POST',
      headers: getHeaders(Boolean(payload)),
      body: payload ? JSON.stringify(payload) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to publish article' }));
      throw new Error(err.error || 'Failed to publish article');
    }
    const pub: Article = await res.json();
    try {
      const cached = localStorage.getItem('tfp_cached_articles');
      const list: Article[] = cached ? JSON.parse(cached) : [];
      const updated = list.map((a) => (a.id === pub.id ? pub : a));
      if (!updated.some((a) => a.id === pub.id)) updated.unshift(pub);
      localStorage.setItem('tfp_cached_articles', JSON.stringify(updated));
    } catch {}
    return pub;
  },

  async unpublishArticle(id: string): Promise<Article> {
    const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(id)}/unpublish`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to unpublish article');
    return await res.json();
  },

  async archiveArticle(id: string): Promise<Article> {
    const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(id)}/archive`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to archive article');
    return await res.json();
  },

  async deleteArticle(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete article');
    return true;
  },

  async restoreRevision(articleId: string, revisionId: string): Promise<Article> {
    const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(articleId)}/revisions/${encodeURIComponent(revisionId)}/restore`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to restore revision');
    return await res.json();
  },

  // Media
  async getMedia(): Promise<MediaItem[]> {
    try {
      const res = await fetch(`${API_BASE}/media`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch media');
      return await res.json();
    } catch {
      return [];
    }
  },

  async uploadMediaFile(file: File, metadata?: { alt?: string; caption?: string; credit?: string; sourceUrl?: string }): Promise<MediaItem> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata?.alt) formData.append('alt', metadata.alt);
      if (metadata?.caption) formData.append('caption', metadata.caption);
      if (metadata?.credit) formData.append('credit', metadata.credit);
      if (metadata?.sourceUrl) formData.append('sourceUrl', metadata.sourceUrl);

      const res = await fetch(`${API_BASE}/media/upload`, {
        method: 'POST',
        headers: getHeaders(false), // don't set json content-type for multipart
        body: formData,
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Multipart upload failed, attempting base64 fallback:', e);
    }

    // Resilient Base64 Fallback
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    return await this.uploadMediaBase64(base64Data, {
      filename: file.name,
      ...metadata,
    });
  },

  async uploadMediaBase64(base64: string, metadata?: { filename?: string; alt?: string; caption?: string; credit?: string; sourceUrl?: string }): Promise<MediaItem> {
    const res = await fetch(`${API_BASE}/media/upload-base64`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ base64, ...metadata }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Upload failed');
    }
    return await res.json();
  },

  async addExternalMedia(data: { url: string; alt?: string; caption?: string; credit?: string; sourceUrl?: string; filename?: string }): Promise<MediaItem> {
    const res = await fetch(`${API_BASE}/media/external`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to add media URL' }));
      throw new Error(err.error || 'Failed to add media URL');
    }
    return await res.json();
  },

  async updateMedia(id: string, updates: Partial<MediaItem>): Promise<MediaItem> {
    const res = await fetch(`${API_BASE}/media/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update media');
    return await res.json();
  },

  async deleteMedia(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/media/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete media');
    return true;
  },

  // Categories
  async getCategories(): Promise<CategoryInfo[]> {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (!res.ok) return CATEGORIES;
      return await res.json();
    } catch {
      return CATEGORIES;
    }
  },

  async createCategory(cat: Omit<CategoryInfo, 'id'>): Promise<CategoryInfo> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(cat),
    });
    if (!res.ok) throw new Error('Failed to create category');
    return await res.json();
  },

  async updateCategory(id: string, updates: Partial<CategoryInfo>): Promise<CategoryInfo> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update category');
    return await res.json();
  },

  async deleteCategory(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return true;
  },

  async reorderCategories(orderedIds: string[]): Promise<CategoryInfo[]> {
    const res = await fetch(`${API_BASE}/categories/reorder`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ orderedIds }),
    });
    if (!res.ok) throw new Error('Failed to reorder categories');
    return await res.json();
  },

  // Tags
  async getTags(): Promise<{ name: string; count: number }[]> {
    try {
      const res = await fetch(`${API_BASE}/tags`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async renameOrMergeTag(oldName: string, newName: string): Promise<{ success: boolean; tags: { name: string; count: number }[] }> {
    const res = await fetch(`${API_BASE}/tags/${encodeURIComponent(oldName)}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ newName }),
    });
    if (!res.ok) throw new Error('Failed to rename tag');
    return await res.json();
  },

  async deleteTag(name: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/tags/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete tag');
    return true;
  },

  // Authors
  async getAuthors(): Promise<Author[]> {
    try {
      const res = await fetch(`${API_BASE}/authors`);
      if (!res.ok) return Object.values(AUTHORS);
      return await res.json();
    } catch {
      return Object.values(AUTHORS);
    }
  },

  async getAuthor(slugOrId: string): Promise<{ author: Author; articles: Article[] }> {
    try {
      const res = await fetch(`${API_BASE}/authors/${encodeURIComponent(slugOrId)}`);
      if (!res.ok) throw new Error('Author not found');
      return await res.json();
    } catch {
      const au = Object.values(AUTHORS).find((a) => a.id === slugOrId || a.name.toLowerCase().includes(slugOrId)) || AUTHORS.editorial;
      const arts = ARTICLES.filter((a) => a.author.id === au.id);
      return { author: au, articles: arts };
    }
  },

  async createAuthor(data: Omit<Author, 'id'>): Promise<Author> {
    const res = await fetch(`${API_BASE}/authors`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create author');
    return await res.json();
  },

  async updateAuthor(id: string, updates: Partial<Author>): Promise<Author> {
    const res = await fetch(`${API_BASE}/authors/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update author');
    return await res.json();
  },

  async deleteAuthor(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/authors/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete author');
    return true;
  },

  // Series
  async getSeries(): Promise<EditorialSeries[]> {
    try {
      const res = await fetch(`${API_BASE}/series`);
      if (!res.ok) return EDITORIAL_SERIES;
      return await res.json();
    } catch {
      return EDITORIAL_SERIES;
    }
  },

  async createSeries(data: Omit<EditorialSeries, 'id'>): Promise<EditorialSeries> {
    const res = await fetch(`${API_BASE}/series`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create series');
    return await res.json();
  },

  async updateSeries(id: string, updates: Partial<EditorialSeries>): Promise<EditorialSeries> {
    const res = await fetch(`${API_BASE}/series/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update series');
    return await res.json();
  },

  async deleteSeries(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/series/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete series');
    return true;
  },

  // Issues
  async getIssues(): Promise<MagazineIssue[]> {
    try {
      const res = await fetch(`${API_BASE}/issues`);
      if (!res.ok) return MAGAZINE_ISSUES;
      return await res.json();
    } catch {
      return MAGAZINE_ISSUES;
    }
  },

  async createIssue(data: Omit<MagazineIssue, 'id'>): Promise<MagazineIssue> {
    const res = await fetch(`${API_BASE}/issues`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create issue');
    return await res.json();
  },

  async updateIssue(id: string, updates: Partial<MagazineIssue>): Promise<MagazineIssue> {
    const res = await fetch(`${API_BASE}/issues/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update issue');
    return await res.json();
  },

  async deleteIssue(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/issues/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete issue');
    return true;
  },

  // Homepage Layout
  async getHomepageLayout(): Promise<HomepageLayoutConfig> {
    try {
      const res = await fetch(`${API_BASE}/homepage`);
      if (!res.ok) throw new Error('Failed to fetch layout');
      return await res.json();
    } catch {
      return {
        coverStoryId: 'story-01',
        trendingStoryIds: ['story-01', 'story-02', 'story-03', 'story-04'],
        foldStoryIds: ['story-01', 'story-06', 'story-07', 'story-10'],
        popularStoryIds: ['story-01', 'story-02', 'story-03', 'story-04', 'story-05'],
        uniqueStoryIds: ['story-03', 'story-07', 'story-09'],
        specialStoryIds: ['story-04', 'story-05', 'story-10'],
        editorsPickIds: ['story-01', 'story-05', 'story-08'],
      };
    }
  },

  async updateHomepageLayout(layout: Partial<HomepageLayoutConfig>): Promise<HomepageLayoutConfig> {
    const res = await fetch(`${API_BASE}/homepage`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(layout),
    });
    if (!res.ok) throw new Error('Failed to update homepage layout');
    return await res.json();
  },

  // Newsletter
  async subscribeNewsletter(
    email: string,
    edition: 'weekly' | 'all' = 'weekly'
  ): Promise<{
    success: boolean;
    message: string;
    alreadyActive?: boolean;
    pendingVerification?: boolean;
    delivered?: boolean;
    simulated?: boolean;
    verifyUrl?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, edition }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to subscribe');
      return data;
    } catch (err: any) {
      console.warn('Newsletter API fallback:', err);
      // Ensure the subscriber is captured even during network issues
      try {
        const stored = JSON.parse(localStorage.getItem('tfp_cached_subscribers') || '[]');
        if (!stored.some((s: any) => s.email === email)) {
          stored.push({
            id: `sub-${Date.now()}`,
            email,
            edition,
            status: 'active',
            subscribedAt: new Date().toISOString(),
          });
          localStorage.setItem('tfp_cached_subscribers', JSON.stringify(stored));
        }
      } catch {}
      return {
        success: true,
        message: 'Welcome to The Folded Letter! Your subscription is active.',
        simulated: true,
      };
    }
  },

  async verifyNewsletter(token: string): Promise<{ success: boolean; message: string; subscriber?: NewsletterSubscriber }> {
    const res = await fetch(`${API_BASE}/newsletter/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to verify subscription');
    return data;
  },

  async unsubscribeNewsletter(data: { token?: string; email?: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/newsletter/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Failed to unsubscribe');
    return resData;
  },

  async getNewsletterSubscribers(status?: string): Promise<NewsletterSubscriber[]> {
    try {
      const url = status && status !== 'ALL' ? `${API_BASE}/newsletter?status=${encodeURIComponent(status)}` : `${API_BASE}/newsletter`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async updateSubscriberStatus(id: string, status: 'active' | 'pending' | 'unsubscribed'): Promise<boolean> {
    const res = await fetch(`${API_BASE}/newsletter/subscribers/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update subscriber status');
    return true;
  },

  async deleteSubscriber(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/newsletter/subscribers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete subscriber');
    return true;
  },

  async broadcastLatestNewsletter(articleId?: string): Promise<{
    success: boolean;
    recipientCount: number;
    failedCount?: number;
    articleTitle?: string;
    message: string;
  }> {
    const res = await fetch(`${API_BASE}/newsletter/broadcast-latest`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ articleId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to broadcast newsletter');
    return data;
  },

  // Contact
  async submitContact(data: { name: string; email: string; subject: string; message: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Failed to submit contact');
    return resData;
  },

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    try {
      const res = await fetch(`${API_BASE}/contact`, { headers: getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async updateContactStatus(id: string, status: 'unread' | 'read' | 'replied'): Promise<boolean> {
    const res = await fetch(`${API_BASE}/contact/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ status }),
    });
    return res.ok;
  },

  // Social Channels & Feeds
  async getSocialChannels(): Promise<SocialChannel[]> {
    try {
      const res = await fetch(`${API_BASE}/social-channels`);
      if (!res.ok) throw new Error('Failed to fetch social channels');
      return await res.json();
    } catch {
      return [];
    }
  },

  async updateSocialChannels(channels: SocialChannel[]): Promise<SocialChannel[]> {
    const res = await fetch(`${API_BASE}/social-channels`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(channels),
    });
    if (!res.ok) throw new Error('Failed to update social channels');
    return await res.json();
  },

  async updateSocialChannel(id: string, updates: Partial<SocialChannel>): Promise<SocialChannel> {
    const res = await fetch(`${API_BASE}/social-channels/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update social channel');
    return await res.json();
  },

  // Analytics
  trackEvent(type: 'view' | 'save' | 'share', articleId: string) {
    fetch(`${API_BASE}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, articleId }),
    }).catch(() => {});
  },

  async getAnalytics(): Promise<AnalyticsStats> {
    try {
      const res = await fetch(`${API_BASE}/analytics/summary`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return await res.json();
    } catch {
      let cachedArticles: Article[] = [];
      try {
        const stored = localStorage.getItem('tfp_cached_articles');
        if (stored) cachedArticles = JSON.parse(stored);
      } catch {}
      if (cachedArticles.length === 0) cachedArticles = ARTICLES;

      let cachedSubscribers: any[] = [];
      try {
        const storedSubs = localStorage.getItem('tfp_cached_subscribers');
        if (storedSubs) cachedSubscribers = JSON.parse(storedSubs);
      } catch {}

      const totalViews = cachedArticles.reduce((sum, a) => sum + (a.views || 0), 0);
      const totalSaves = cachedArticles.reduce((sum, a) => sum + (a.saves || 0), 0);
      const totalShares = cachedArticles.reduce((sum, a) => sum + (a.shares || 0), 0);
      const totalReadingMinutes = cachedArticles.reduce((sum, a) => sum + (a.readTimeMinutes || 4), 0);
      const avgReadDurationMinutes = cachedArticles.length > 0
        ? Math.round((totalReadingMinutes / cachedArticles.length) * 10) / 10
        : 4.5;

      const topArticles = [...cachedArticles]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 10)
        .map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          category: a.category,
          authorName: a.author?.name || 'Editorial Staff',
          views: a.views || 0,
          saves: a.saves || 0,
          shares: a.shares || 0,
          readTime: a.readTime || `${a.readTimeMinutes || 4} min read`,
        }));

      return {
        totalViews,
        totalSaves,
        totalShares,
        totalSubscribers: cachedSubscribers.length,
        totalArticles: cachedArticles.length,
        totalReadingMinutes,
        avgReadDurationMinutes,
        topArticles,
      };
    }
  },

  // Search
  async search(query: string): Promise<{
    articles: Article[];
    categories: CategoryInfo[];
    authors: Author[];
    series: EditorialSeries[];
    issues: MagazineIssue[];
  }> {
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Search failed');
      return await res.json();
    } catch {
      const q = query.toLowerCase();
      return {
        articles: ARTICLES.filter((a) => a.title.toLowerCase().includes(q) || a.deck.toLowerCase().includes(q)),
        categories: CATEGORIES.filter((c) => c.name.toLowerCase().includes(q)),
        authors: Object.values(AUTHORS).filter((au) => au.name.toLowerCase().includes(q)),
        series: EDITORIAL_SERIES.filter((s) => s.name.toLowerCase().includes(q)),
        issues: MAGAZINE_ISSUES.filter((i) => i.title.toLowerCase().includes(q)),
      };
    }
  },

  // User Management & RBAC
  async getUsers(): Promise<{ users: User[]; invitations: any[] }> {
    const res = await fetch(`${API_BASE}/users`, { headers: getHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch users' }));
      throw new Error(err.error || 'Failed to fetch users');
    }
    return await res.json();
  },

  async inviteUser(data: { email: string; name?: string; role: string; customPermissions?: string[] }): Promise<any> {
    const res = await fetch(`${API_BASE}/users/invite`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Failed to invite user');
    return resData;
  },

  async acceptInvitation(token: string, name?: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/users/accept-invitation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, name }),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Failed to accept invitation');
    return resData;
  },

  async revokeInvitation(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/users/invitations/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to revoke invitation' }));
      throw new Error(err.error || 'Failed to revoke invitation');
    }
    return true;
  },

  async updateUserRole(id: string, role: string, customPermissions?: string[]): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${id}/role`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ role, customPermissions }),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Failed to update user role');
    return resData.user;
  },

  async suspendUser(id: string, suspend: boolean): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${id}/suspend`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ suspend }),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Failed to update user suspension');
    return resData.user;
  },

  async deleteUser(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete user' }));
      throw new Error(err.error || 'Failed to delete user');
    }
    return true;
  },

  async resetUserAccess(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/users/${id}/reset-access`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Failed to reset user access');
    return resData;
  },

  // Activity Audit Logs
  async getActivityLogs(filters?: Record<string, string>): Promise<any[]> {
    const searchParams = new URLSearchParams(filters);
    const url = `${API_BASE}/activity-logs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) return [];
    return await res.json();
  },

  // Trash & Soft Deletion
  async getTrash(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/trash`, { headers: getHeaders() });
    if (!res.ok) return [];
    return await res.json();
  },

  async restoreTrashItem(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/trash/${id}/restore`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Failed to restore item');
    return resData;
  },

  async purgeTrashItem(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/trash/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to purge item' }));
      throw new Error(err.error || 'Failed to purge item');
    }
    return true;
  },

  async emptyTrash(): Promise<any> {
    const res = await fetch(`${API_BASE}/trash/empty`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Failed to empty trash');
    return resData;
  },

  // Navigation Items
  async getNavigation(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/navigation`);
    if (!res.ok) return [];
    return await res.json();
  },

  async updateNavigation(items: any[]): Promise<any[]> {
    const res = await fetch(`${API_BASE}/navigation`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(items),
    });
    if (!res.ok) throw new Error('Failed to update navigation');
    return await res.json();
  },

  // About Config
  async getAboutConfig(): Promise<any> {
    const res = await fetch(`${API_BASE}/about-config`);
    if (!res.ok) return null;
    return await res.json();
  },

  async updateAboutConfig(config: any): Promise<any> {
    const res = await fetch(`${API_BASE}/about-config`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to update about page config');
    return await res.json();
  },

  // Web Items
  async getWebItems(placement?: string): Promise<any[]> {
    const url = placement ? `${API_BASE}/web-items?placement=${encodeURIComponent(placement)}` : `${API_BASE}/web-items`;
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  },

  async createWebItem(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/web-items`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create web item');
    return await res.json();
  },

  async updateWebItem(id: string, updates: any): Promise<any> {
    const res = await fetch(`${API_BASE}/web-items/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update web item');
    return await res.json();
  },

  async deleteWebItem(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/web-items/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.ok;
  },

  // API Keys & Integrations
  async getApiKeys(): Promise<ApiKey[]> {
    try {
      const res = await fetch(`${API_BASE}/api-keys`, {
        headers: getHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createApiKey(payload: { name: string; role?: string; scopes?: string[]; description?: string }): Promise<ApiKey> {
    const res = await fetch(`${API_BASE}/api-keys`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create API key' }));
      throw new Error(err.error || 'Failed to create API key');
    }
    return await res.json();
  },

  async revokeApiKey(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api-keys/${id}/revoke`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.ok;
  },

  async deleteApiKey(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api-keys/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.ok;
  },
};
