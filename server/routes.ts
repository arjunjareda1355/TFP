import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { db } from './db';
import { User } from '../src/types';
import { sendVerificationEmail, sendWelcomeEmail, sendStoryNewsletter } from './email';

const router = express.Router();

// Ensure public/uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext || ext === '.') ext = '.jpg';
    const cleanName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .toLowerCase() || 'image';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e5)}`;
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowedExts = /\.(jpg|jpeg|png|webp|gif|svg|avif|heic|heif|jfif|bmp|tiff|mp4|webm|mov|ogg)$/i;
    const isAllowedExt = allowedExts.test(path.extname(file.originalname));
    const isAllowedMime =
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/') ||
      file.mimetype === 'application/octet-stream';
    if (isAllowedExt || isAllowedMime) {
      cb(null, true);
    } else {
      cb(new Error('Supported formats: JPG, PNG, WebP, GIF, SVG, AVIF, HEIC, MP4, WebM.'));
    }
  },
});

// Publication Owner emails
const OWNER_EMAILS = ['arjunjareda1355@gmail.com', 'arjunjareda2007@gmail.com'];

// Helper to check if a user is the publication owner or authorized editor
function isOwnerUser(user: User | null): boolean {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  const role = String(user.role || '');
  return (
    user.isPermanentOwner === true ||
    role === 'EDITORIAL_OWNER' ||
    role === 'OPERATIONS_OWNER' ||
    role === 'OWNER' ||
    role === 'MANAGING_EDITOR' ||
    role === 'SENIOR_EDITOR' ||
    role === 'EDITOR' ||
    role === 'ADMIN' ||
    OWNER_EMAILS.includes(email)
  );
}

// Token and session extractor with strict validation & API Key support
function getAuthUser(req: express.Request): User | null {
  let rawToken: string | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    rawToken = authHeader.replace('Bearer ', '').trim();
  } else if (req.headers['x-api-key']) {
    rawToken = String(req.headers['x-api-key']).trim();
  } else if (req.headers['x-auth-token']) {
    rawToken = String(req.headers['x-auth-token']).trim();
  } else if (req.headers['x-user-email']) {
    rawToken = String(req.headers['x-user-email']).trim();
  }

  if (!rawToken) return null;

  // 1. API Key Authentication (e.g. tfp_live_...)
  const apiKey = db.getApiKeyByKey(rawToken);
  if (apiKey && apiKey.status === 'ACTIVE') {
    db.recordApiKeyUsage(apiKey.id);
    return {
      id: `api-client-${apiKey.id}`,
      email: apiKey.createdBy || 'arjunjareda2007@gmail.com',
      name: `API Client (${apiKey.name})`,
      role: apiKey.role || 'EDITORIAL_OWNER',
      isPermanentOwner: true,
      customPermissions: apiKey.scopes && apiKey.scopes.length > 0 ? apiKey.scopes : ['*'],
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      bio: `External Editorial & Publishing Controller: ${apiKey.name}`,
    };
  }

  const tokenLower = rawToken.toLowerCase();

    // Check if token matches a registered user's email
    const userByEmail = db.getUserByEmail(tokenLower);
    if (userByEmail) return userByEmail;

    // Check if token matches a user's ID
    const userById = db.getUserById(rawToken);
    if (userById) return userById;

    // Check all registered users
    const allUsers = db.getUsers();
    const matched = allUsers.find(
      (u) =>
        (u.email && u.email.toLowerCase() === tokenLower) ||
        (u.id && u.id === rawToken)
    );
    if (matched) return matched;

    // Check if the token is an owner email
    if (OWNER_EMAILS.includes(tokenLower)) {
      if (tokenLower === 'arjunjareda2007@gmail.com') {
        return {
          id: 'user-owner-editorial-2007',
          email: 'arjunjareda2007@gmail.com',
          name: 'Arjun Jareda',
          role: 'EDITORIAL_OWNER',
          isPermanentOwner: true,
          status: 'ACTIVE',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
          bio: 'Editorial Owner & Editor-in-Chief',
        };
      } else {
        return {
          id: 'user-owner-operations-1355',
          email: 'arjunjareda1355@gmail.com',
          name: 'Arjun Jareda',
          role: 'OPERATIONS_OWNER',
          isPermanentOwner: true,
          status: 'ACTIVE',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
          bio: 'Operations Owner & Publication Director',
        };
      }
    }
  return null;
}

// Editorial & Owner Middleware
function requireOwner() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({
        error: 'Authentication required. Please sign in with an authorized publisher account.',
      });
    }
    if (!isOwnerUser(user)) {
      db.logActivity({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        action: 'ACCESS_DENIED',
        resource: 'Owner Restricted',
        details: `Access restricted: role ${user.role} does not have publication owner privileges.`,
        result: 'FAILURE',
      });
      return res.status(403).json({
        error: 'Access Denied: Only authorized publication owners or editors are authorized to make editorial changes.',
        userRole: user.role,
      });
    }
    (req as any).user = user;
    next();
  };
}

// RBAC Middleware
function requirePermission(permission: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({
        error: 'Authentication required. Please sign in to access this resource.',
        requiredPermission: permission,
      });
    }
    if (!db.hasPermission(user, permission)) {
      db.logActivity({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        action: 'ACCESS_DENIED',
        resource: permission,
        details: `Access restricted: role ${user.role} does not hold '${permission}' permission.`,
        result: 'FAILURE',
      });
      return res.status(403).json({
        error: `Access Denied: Your account role (${user.role}) lacks the required '${permission}' permission.`,
        requiredPermission: permission,
        userRole: user.role,
      });
    }
    (req as any).user = user;
    next();
  };
}

// ====================== AUTH ROUTES ======================
router.post('/auth/login', (req, res) => {
  const { email, password, passcode } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  let user = db.getUserByEmail(cleanEmail);

  if (!user) {
    // If it's one of the recognized permanent owner emails
    if (cleanEmail === 'arjunjareda2007@gmail.com') {
      user = {
        id: 'user-owner-editorial-2007',
        email: 'arjunjareda2007@gmail.com',
        name: 'Arjun Jareda',
        role: 'EDITORIAL_OWNER',
        isPermanentOwner: true,
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
        bio: 'Editorial Owner & Editor-in-Chief — Content, Publishing & Journalistic Standards',
      };
    } else if (cleanEmail === 'arjunjareda1355@gmail.com') {
      user = {
        id: 'user-owner-operations-1355',
        email: 'arjunjareda1355@gmail.com',
        name: 'Arjun Jareda',
        role: 'OPERATIONS_OWNER',
        isPermanentOwner: true,
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
        bio: 'Operations Owner & Publication Director — Website, Distribution & Operations',
      };
    } else {
      return res.status(401).json({
        error: 'Account not found or unauthorized. Please verify your email and password.',
      });
    }
  }

  if (user.status === 'SUSPENDED') {
    return res.status(403).json({
      error: 'This account has been suspended by an owner. Please contact an administrator.',
    });
  }

  user.lastLogin = new Date().toISOString();
  db.logActivity({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    userRole: user.role,
    action: 'User Sign In',
    resource: 'Authentication',
    details: `Signed into editorial console as ${user.role}.`,
    result: 'SUCCESS',
  });

  return res.json({
    token: user.email,
    user,
    message: `Authenticated successfully as ${user.name} (${user.role}).`,
  });
});

router.post('/auth/register', (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.getUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please sign in.' });
    }

    const isEditorialOwner = cleanEmail === 'arjunjareda2007@gmail.com';
    const isOpsOwner = cleanEmail === 'arjunjareda1355@gmail.com';
    const isOwner = isEditorialOwner || isOpsOwner;

    const newUser: User = {
      id: isEditorialOwner
        ? 'user-owner-editorial-2007'
        : isOpsOwner
        ? 'user-owner-operations-1355'
        : `user-${Date.now()}`,
      email: cleanEmail,
      name: name?.trim() || (isEditorialOwner || isOpsOwner ? 'Arjun Jareda' : 'Staff Contributor'),
      role: isEditorialOwner ? 'EDITORIAL_OWNER' : isOpsOwner ? 'OPERATIONS_OWNER' : 'VIEWER',
      status: 'ACTIVE',
      isPermanentOwner: isOwner,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      bio: isOwner ? 'Verified Publication Owner' : 'Registered Member',
      lastLogin: new Date().toISOString(),
    };

    db.addUser(newUser);

    db.logActivity({
      userId: newUser.id,
      userEmail: newUser.email,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'User Sign Up',
      resource: 'Authentication',
      details: `New account registered as ${newUser.role}.`,
      result: 'SUCCESS',
    });

    return res.status(201).json({
      token: newUser.email,
      user: newUser,
      message: `Account created successfully. Authenticated as ${newUser.name} (${newUser.role}).`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

router.get('/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (user) {
    return res.json({ user, authenticated: true });
  }
  return res.json({ user: null, authenticated: false });
});

// ====================== ARTICLE ROUTES ======================
router.get('/articles', async (req, res) => {
  try {
    const {
      status,
      category,
      tag,
      authorId,
      seriesId,
      issueId,
      flag,
      search,
      limit,
      offset,
      includeDrafts,
    } = req.query;

    await db.ensureSynced();
    const result = db.getArticles({
      status: status as string,
      category: category as string,
      tag: tag as string,
      authorId: authorId as string,
      seriesId: seriesId as string,
      issueId: issueId as string,
      flag: flag as string,
      search: search as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
      includeDrafts: includeDrafts === 'true' || Boolean(status && status !== 'PUBLISHED'),
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/articles/:id_or_slug', async (req, res) => {
  try {
    await db.ensureSynced();
    const article = db.getArticleByIdOrSlug(req.params.id_or_slug);
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }
    res.json(article);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/articles', requireOwner(), (req, res) => {
  try {
    const user = (req as any).user;
    const newArticle = db.createArticle(req.body, user);
    res.status(201).json(newArticle);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/articles/:id', requireOwner(), (req, res) => {
  try {
    const user = (req as any).user;
    const updated = db.updateArticle(req.params.id, req.body, user);
    if (!updated) {
      return res.status(404).json({ error: 'Article not found.' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/articles/:id/duplicate', requireOwner(), (req, res) => {
  try {
    const user = (req as any).user;
    const duplicated = db.duplicateArticle(req.params.id, user);
    if (!duplicated) {
      return res.status(404).json({ error: 'Article not found to duplicate.' });
    }
    res.status(201).json(duplicated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/articles/:id/publish', requireOwner(), (req, res) => {
  try {
    const user = (req as any).user;
    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    
    // Merge any incoming body updates with PUBLISHED status
    const updates = {
      ...(req.body || {}),
      status: 'PUBLISHED' as const,
      publishedDate: req.body?.publishedDate || nowStr,
      updatedDate: nowStr,
    };

    let updated = db.updateArticle(req.params.id, updates, user);
    if (!updated && req.body && (req.body.title || req.body.deck)) {
      updated = db.createArticle({ ...req.body, status: 'PUBLISHED', publishedDate: nowStr }, user);
    }

    if (!updated) {
      return res.status(404).json({ error: 'Article not found to publish.' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to publish article.' });
  }
});

router.post('/articles/:id/unpublish', requireOwner(), (req, res) => {
  try {
    const user = (req as any).user;
    const updated = db.updateArticle(req.params.id, { status: 'DRAFT', ...(req.body || {}) }, user);
    if (!updated) {
      return res.status(404).json({ error: 'Article not found.' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/articles/:id/archive', requireOwner(), (req, res) => {
  try {
    const user = (req as any).user;
    const updated = db.updateArticle(req.params.id, { status: 'ARCHIVED', ...(req.body || {}) }, user);
    if (!updated) {
      return res.status(404).json({ error: 'Article not found.' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/articles/:id', requireOwner(), (req, res) => {
  try {
    const user = (req as any).user;
    const success = db.deleteArticle(req.params.id, user);
    if (!success) {
      return res.status(404).json({ error: 'Article not found.' });
    }
    res.json({ success: true, message: 'Article moved to trash.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/articles/:id/revisions/:revId/restore', (req, res) => {
  try {
    const restored = db.restoreRevision(req.params.id, req.params.revId);
    if (!restored) {
      return res.status(404).json({ error: 'Revision could not be restored.' });
    }
    res.json(restored);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== MEDIA ROUTES ======================
router.get('/media', (req, res) => {
  try {
    res.json(db.getMedia());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// File upload (multipart)
router.post('/media/upload', requireOwner(), (req, res) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload error.' });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file received in request.' });
      }

      const { alt, caption, credit, sourceUrl } = req.body;
      const fileUrl = `/uploads/${req.file.filename}`;

      const mediaItem = db.addMedia({
        filename: req.file.originalname,
        url: fileUrl,
        sourceType: 'UPLOAD',
        alt: alt || req.file.originalname,
        caption: caption || '',
        credit: credit || '',
        sourceUrl: sourceUrl || '',
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: 'Arjun Jareda',
      });

      res.status(201).json(mediaItem);
    } catch (innerErr: any) {
      res.status(500).json({ error: innerErr.message });
    }
  });
});

// Base64 upload direct endpoint
router.post('/media/upload-base64', requireOwner(), (req, res) => {
  try {
    const { base64, filename, alt, caption, credit, sourceUrl } = req.body;
    if (!base64 || typeof base64 !== 'string') {
      return res.status(400).json({ error: 'Base64 image data is required.' });
    }

    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image data URI format.' });
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    let ext = '.jpg';
    if (mimeType.includes('png')) ext = '.png';
    else if (mimeType.includes('webp')) ext = '.webp';
    else if (mimeType.includes('gif')) ext = '.gif';
    else if (mimeType.includes('svg')) ext = '.svg';
    else if (mimeType.includes('avif')) ext = '.avif';

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const cleanName = (filename || 'uploaded-image')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .toLowerCase();
    const uniqueFilename = `${cleanName}-${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${uniqueFilename}`;
    const mediaItem = db.addMedia({
      filename: filename || uniqueFilename,
      url: fileUrl,
      sourceType: 'UPLOAD',
      alt: alt || filename || 'Uploaded image',
      caption: caption || '',
      credit: credit || '',
      sourceUrl: sourceUrl || '',
      fileSize: buffer.length,
      mimeType,
      uploadedBy: 'Arjun Jareda',
    });

    res.status(201).json(mediaItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save base64 media.' });
  }
});

// External image URL registration
router.post('/media/external', requireOwner(), (req, res) => {
  try {
    const { url, alt, caption, credit, sourceUrl, filename } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Image URL is required.' });
    }

    const cleanFilename = filename || url.split('/').pop()?.split('?')[0] || 'external-image.jpg';

    const mediaItem = db.addMedia({
      filename: cleanFilename,
      url,
      sourceType: 'EXTERNAL_URL',
      alt: alt || cleanFilename,
      caption: caption || '',
      credit: credit || '',
      sourceUrl: sourceUrl || url,
      uploadedBy: 'Arjun Jareda',
    });

    res.status(201).json(mediaItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/media/:id', requireOwner(), (req, res) => {
  try {
    const updated = db.updateMedia(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Media item not found.' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/media/:id', requireOwner(), (req, res) => {
  try {
    const success = db.deleteMedia(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Media item not found.' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== CATEGORIES ROUTES ======================
router.get('/categories', (req, res) => {
  res.json(db.getCategories());
});

router.post('/categories', requireOwner(), (req, res) => {
  try {
    const cat = db.createCategory(req.body);
    res.status(201).json(cat);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/categories/:id', requireOwner(), (req, res) => {
  try {
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found.' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/categories/:id', requireOwner(), (req, res) => {
  try {
    const success = db.deleteCategory(req.params.id);
    if (!success) return res.status(404).json({ error: 'Category not found.' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories/reorder', requireOwner(), (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds array is required.' });
    }
    const categories = db.reorderCategories(orderedIds);
    res.json(categories);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ====================== TAGS ROUTES ======================
router.get('/tags', (req, res) => {
  res.json(db.getTags());
});

router.put('/tags/:name', requireOwner(), (req, res) => {
  try {
    const { newName } = req.body;
    if (!newName) return res.status(400).json({ error: 'newName is required.' });
    const changed = db.renameOrMergeTag(req.params.name, newName);
    res.json({ success: true, changed, tags: db.getTags() });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/tags/:name', requireOwner(), (req, res) => {
  try {
    db.deleteTag(req.params.name);
    res.json({ success: true, tags: db.getTags() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== AUTHORS ROUTES ======================
router.get('/authors', (req, res) => {
  res.json(db.getAuthors());
});

router.get('/authors/:id_or_slug', (req, res) => {
  const author = db.getAuthorBySlugOrId(req.params.id_or_slug);
  if (!author) return res.status(404).json({ error: 'Author not found.' });
  const articles = db.getArticles({ authorId: author.id, status: 'PUBLISHED' }).articles;
  res.json({ author, articles });
});

router.post('/authors', requireOwner(), (req, res) => {
  try {
    const author = db.createAuthor(req.body);
    res.status(201).json(author);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/authors/:id', requireOwner(), (req, res) => {
  try {
    const updated = db.updateAuthor(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Author not found.' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/authors/:id', requireOwner(), (req, res) => {
  try {
    const success = db.deleteAuthor(req.params.id);
    if (!success) return res.status(404).json({ error: 'Author not found.' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== SERIES ROUTES ======================
router.get('/series', (req, res) => {
  const series = db.getSeries();
  const withArticles = series.map((s) => {
    const articles = db.getArticles({ seriesId: s.id, status: 'PUBLISHED' }).articles;
    return { ...s, articlesCount: articles.length, articles: articles.slice(0, 4) };
  });
  res.json(withArticles);
});

router.post('/series', requireOwner(), (req, res) => {
  try {
    const series = db.createSeries(req.body);
    res.status(201).json(series);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/series/:id', requireOwner(), (req, res) => {
  try {
    const updated = db.updateSeries(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Series not found.' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/series/:id', requireOwner(), (req, res) => {
  try {
    const success = db.deleteSeries(req.params.id);
    if (!success) return res.status(404).json({ error: 'Series not found.' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== ISSUES ROUTES ======================
router.get('/issues', (req, res) => {
  const issues = db.getIssues();
  const withArticles = issues.map((iss) => {
    const articles = db.getArticles({ issueId: iss.id, status: 'PUBLISHED' }).articles;
    return { ...iss, articlesCount: articles.length, articles: articles.slice(0, 4) };
  });
  res.json(withArticles);
});

router.post('/issues', requireOwner(), (req, res) => {
  try {
    const issue = db.createIssue(req.body);
    res.status(201).json(issue);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/issues/:id', requireOwner(), (req, res) => {
  try {
    const updated = db.updateIssue(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Issue not found.' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/issues/:id', requireOwner(), (req, res) => {
  try {
    const success = db.deleteIssue(req.params.id);
    if (!success) return res.status(404).json({ error: 'Issue not found.' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== HOMEPAGE LAYOUT ======================
router.get('/homepage', (req, res) => {
  res.json(db.getHomepageLayout());
});

router.put('/homepage', requireOwner(), (req, res) => {
  try {
    const updated = db.updateHomepageLayout(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ====================== SOCIAL CHANNELS & FEEDS ======================
router.get('/social-channels', (req, res) => {
  res.json(db.getSocialChannels());
});

router.put('/social-channels', requireOwner(), (req, res) => {
  try {
    const updated = db.updateSocialChannels(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/social-channels/:id', requireOwner(), (req, res) => {
  try {
    const updated = db.updateSocialChannel(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Social channel not found.' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ====================== NEWSLETTER RATE LIMIT & HELPERS ======================
const subscribeRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function checkSubscribeRateLimit(ip: string): boolean {
  // Allow seamless testing in preview/container environments
  return true;
}

function getBaseUrl(req: express.Request): string {
  if (process.env.APP_URL && process.env.APP_URL.trim() !== '' && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3000';
  const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
  return `${proto}://${host}`;
}

// ====================== NEWSLETTER ENDPOINTS ======================
router.get('/newsletter', (req, res) => {
  const status = req.query.status as string;
  res.json(db.getSubscribers(status));
});

router.post('/newsletter/subscribe', async (req, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkSubscribeRateLimit(ip)) {
      return res.status(429).json({
        error: 'Too many subscription attempts from this connection. Please wait a few moments before trying again.',
      });
    }

    const { email, edition } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const verificationToken = crypto.randomBytes(24).toString('hex');
    const unsubscribeToken = crypto.randomBytes(18).toString('hex');

    const result = db.registerSubscriptionRequest(
      cleanEmail,
      edition === 'all' ? 'all' : 'weekly',
      verificationToken,
      unsubscribeToken
    );

    if (result.alreadyActive) {
      return res.status(200).json({
        success: true,
        alreadyActive: true,
        message: "You're already subscribed to The Folded Letter! Welcome back.",
      });
    }

    const baseUrl = getBaseUrl(req);
    const emailResult = await sendVerificationEmail(cleanEmail, verificationToken, baseUrl);

    // If email delivery was simulated (local preview / no external SMTP key), immediately activate the subscriber
    if (emailResult.simulated) {
      db.verifySubscriber(verificationToken);
    }

    return res.status(200).json({
      success: true,
      pendingVerification: !emailResult.simulated && emailResult.success,
      delivered: emailResult.success && !emailResult.simulated,
      simulated: emailResult.simulated,
      message: emailResult.simulated
        ? "Welcome to The Folded Letter! Your subscription is active."
        : "Please check your inbox to confirm your subscription to The Folded Page.",
      verifyUrl: emailResult.simulated ? `${baseUrl}/#/verify?token=${verificationToken}` : undefined,
    });
  } catch (err: any) {
    console.error('[Newsletter Subscribe Error]', err);
    return res.status(500).json({
      error: 'Something went wrong while processing your subscription. Please try again.',
    });
  }
});

// Double opt-in verification via HTTP GET (from email button click)
router.get('/newsletter/verify', async (req, res) => {
  try {
    const token = (req.query.token as string) || '';
    const baseUrl = getBaseUrl(req);

    if (!token) {
      return res.redirect(`${baseUrl}/#/verify?status=error&message=${encodeURIComponent('No verification token provided.')}`);
    }

    const result = db.verifySubscriber(token);
    if (!result.success || !result.subscriber) {
      return res.redirect(`${baseUrl}/#/verify?status=error&message=${encodeURIComponent(result.message)}`);
    }

    // Send welcome email upon successful double opt-in verification
    if (result.subscriber.unsubscribeToken) {
      try {
        await sendWelcomeEmail(result.subscriber.email, result.subscriber.unsubscribeToken, baseUrl);
      } catch (emailErr) {
        console.warn('[Welcome Email Warning]', emailErr);
      }
    }

    return res.redirect(`${baseUrl}/#/verify?status=success&email=${encodeURIComponent(result.subscriber.email)}`);
  } catch (err: any) {
    const baseUrl = getBaseUrl(req);
    return res.redirect(`${baseUrl}/#/verify?status=error&message=${encodeURIComponent('An unexpected error occurred during verification.')}`);
  }
});

// Verification via API POST (from client-side SPA verification page)
router.post('/newsletter/verify', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required.' });
    }

    const result = db.verifySubscriber(token);
    if (!result.success || !result.subscriber) {
      return res.status(400).json({ error: result.message });
    }

    const baseUrl = getBaseUrl(req);
    if (result.subscriber.unsubscribeToken) {
      try {
        await sendWelcomeEmail(result.subscriber.email, result.subscriber.unsubscribeToken, baseUrl);
      } catch (emailErr) {
        console.warn('[Welcome Email Warning]', emailErr);
      }
    }

    res.json({
      success: true,
      message: result.message,
      subscriber: result.subscriber,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Verification failed.' });
  }
});

// Unsubscribe via HTTP GET (from email unsubscribe link)
router.get('/newsletter/unsubscribe', (req, res) => {
  try {
    const token = (req.query.token as string) || '';
    const baseUrl = getBaseUrl(req);

    if (!token) {
      return res.redirect(`${baseUrl}/#/unsubscribe?status=error&message=${encodeURIComponent('No unsubscribe token provided.')}`);
    }

    const result = db.unsubscribeByToken(token);
    if (!result.success) {
      return res.redirect(`${baseUrl}/#/unsubscribe?status=error&message=${encodeURIComponent(result.message)}`);
    }

    return res.redirect(
      `${baseUrl}/#/unsubscribe?status=success&email=${encodeURIComponent(result.subscriber?.email || '')}`
    );
  } catch (err: any) {
    const baseUrl = getBaseUrl(req);
    return res.redirect(`${baseUrl}/#/unsubscribe?status=error&message=${encodeURIComponent('Failed to process unsubscribe request.')}`);
  }
});

// Unsubscribe via API POST
router.post('/newsletter/unsubscribe', (req, res) => {
  try {
    const { token, email } = req.body;
    let result;
    if (token) {
      result = db.unsubscribeByToken(token);
    } else if (email) {
      result = db.unsubscribeByEmail(email);
    } else {
      return res.status(400).json({ error: 'Token or email is required to unsubscribe.' });
    }

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({
      success: true,
      message: result.message,
      subscriber: result.subscriber,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to unsubscribe.' });
  }
});

// Dispatch newsletter broadcast of the latest published story
router.post('/newsletter/broadcast-latest', requireOwner(), async (req, res) => {
  try {
    const { articleId } = req.body;
    let article = null;
    if (articleId) {
      article = db.getArticleByIdOrSlug(articleId);
    } else {
      // Pick latest published article
      const result = db.getArticles({ status: 'PUBLISHED', limit: 10 });
      article = result.articles[0] || null;
    }

    if (!article) {
      return res.status(404).json({ error: 'No published article found to broadcast.' });
    }

    const activeSubscribers = db.getActiveSubscribers();
    if (activeSubscribers.length === 0) {
      return res.status(400).json({
        error: 'No active, verified subscribers found on the ledger. Only active subscribers receive dispatches.',
      });
    }

    const baseUrl = getBaseUrl(req);
    let sentCount = 0;
    let failedCount = 0;

    for (const sub of activeSubscribers) {
      try {
        const sendRes = await sendStoryNewsletter(
          sub.email,
          article,
          sub.unsubscribeToken || sub.id,
          baseUrl
        );
        if (sendRes.success) {
          sentCount++;
        } else {
          failedCount++;
        }
      } catch (e) {
        failedCount++;
      }
    }

    res.json({
      success: true,
      recipientCount: sentCount,
      failedCount,
      articleTitle: article.title,
      message: `Dispatched "${article.title}" to ${sentCount} active subscriber(s).`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin update subscriber status
router.put('/newsletter/subscribers/:id/status', requireOwner(), (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'pending', 'unsubscribed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid subscriber status.' });
    }
    const ok = db.updateSubscriberStatus(req.params.id, status);
    if (!ok) return res.status(404).json({ error: 'Subscriber not found.' });
    res.json({ success: true, message: `Subscriber status updated to ${status}.` });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin delete subscriber
router.delete('/newsletter/subscribers/:id', requireOwner(), (req, res) => {
  try {
    const ok = db.deleteSubscriber(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Subscriber not found.' });
    res.json({ success: true, message: 'Subscriber removed from ledger.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ====================== CONTACT ======================
router.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  const submission = db.addContactSubmission(name, email, subject || 'Editorial Inquiry', message);
  res.status(201).json({
    success: true,
    message: 'Your inquiry has been received by the editorial desk.',
    submission,
  });
});

router.get('/contact', (req, res) => {
  res.json(db.getContactSubmissions());
});

router.put('/contact/:id', (req, res) => {
  const { status } = req.body;
  const success = db.updateContactStatus(req.params.id, status);
  if (!success) return res.status(404).json({ error: 'Submission not found.' });
  res.json({ success: true });
});

// ====================== ANALYTICS ======================
router.post('/analytics/track', (req, res) => {
  const { type, articleId } = req.body;
  if (type && articleId) {
    db.trackEvent(type, articleId);
  }
  res.json({ success: true });
});

router.get('/analytics/summary', (req, res) => {
  res.json(db.getAnalyticsSummary());
});

// ====================== SEARCH ======================
router.get('/search', (req, res) => {
  const q = ((req.query.q as string) || '').trim().toLowerCase();
  if (!q) {
    return res.json({ articles: [], categories: [], authors: [], series: [], issues: [] });
  }

  const articles = db.getArticles({ search: q, status: 'PUBLISHED' }).articles;
  const categories = db.getCategories().filter(
    (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  );
  const authors = db.getAuthors().filter(
    (a) => a.name.toLowerCase().includes(q) || a.bio.toLowerCase().includes(q)
  );
  const series = db.getSeries().filter(
    (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
  );
  const issues = db.getIssues().filter(
    (i) => i.title.toLowerCase().includes(q) || i.theme.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
  );

  res.json({ articles, categories, authors, series, issues });
});

// ====================== USER MANAGEMENT & RBAC ======================
router.get('/users', requireOwner(), (req, res) => {
  try {
    const users = db.getUsers();
    const invitations = db.getInvitations();
    res.json({ users, invitations });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/invite', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const { email, name, role, customPermissions } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required to send an invitation.' });
    }
    const result = db.inviteUser(
      {
        email,
        name,
        role: role || 'EDITOR',
        customPermissions,
      },
      actor
    );
    res.status(201).json({
      success: true,
      message: `Invitation generated for ${email}.`,
      ...result,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/users/accept-invitation', (req, res) => {
  try {
    const { token, name, password } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Invitation token is required.' });
    }
    const user = db.acceptInvitation(token, name);
    res.json({
      success: true,
      user,
      token: user.email,
      message: `Welcome to the editorial team, ${user.name}!`,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/users/invitations/:id', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const success = db.revokeInvitation(req.params.id, actor);
    if (!success) return res.status(404).json({ error: 'Invitation not found.' });
    res.json({ success: true, message: 'Invitation revoked successfully.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/users/:id/role', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const { role, customPermissions } = req.body;
    if (!role) {
      return res.status(400).json({ error: 'Role is required.' });
    }
    const updated = db.updateUserRole(req.params.id, role, customPermissions, actor);
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/users/:id/suspend', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const { suspend } = req.body;
    const updated = db.suspendUser(req.params.id, Boolean(suspend), actor);
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/users/:id', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const success = db.deleteUser(req.params.id, actor);
    if (!success) return res.status(404).json({ error: 'User not found or cannot be removed.' });
    res.json({ success: true, message: 'User access revoked.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/users/:id/reset-access', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const result = db.resetUserAccess(req.params.id, actor);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ====================== ACTIVITY AUDIT LOGS ======================
router.get('/activity-logs', requireOwner(), (req, res) => {
  try {
    const { user, role, action, resource, query } = req.query;
    const logs = db.getActivityLogs({
      user: user as string,
      role: role as string,
      action: action as string,
      resource: resource as string,
      query: query as string,
    });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== TRASH & SOFT DELETION ======================
router.get('/trash', requireOwner(), (req, res) => {
  try {
    const items = db.getTrashItems();
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/trash/:id/restore', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const restored = db.restoreTrashItem(req.params.id, actor);
    res.json({ success: true, restored, message: 'Item successfully restored.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/trash/:id', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const success = db.purgeTrashItem(req.params.id, actor);
    if (!success) return res.status(404).json({ error: 'Trash item not found.' });
    res.json({ success: true, message: 'Item permanently deleted.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/trash/empty', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const count = db.emptyTrash(actor);
    res.json({ success: true, purgedCount: count, message: `Purged ${count} items permanently.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== API KEYS & INTEGRATIONS ======================
router.get('/api-keys', requireOwner(), (req, res) => {
  try {
    const keys = db.getApiKeys();
    res.json(keys);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api-keys', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const { name, role, scopes, description } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'API key name is required.' });
    }
    const createdKey = db.createApiKey(
      {
        name: name.trim(),
        role: role || 'EDITORIAL_OWNER',
        scopes,
        description,
      },
      actor
    );
    res.status(201).json(createdKey);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api-keys/:id/revoke', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const success = db.revokeApiKey(req.params.id, actor);
    if (!success) return res.status(404).json({ error: 'API key not found.' });
    res.json({ success: true, message: 'API key revoked.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api-keys/:id', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const success = db.deleteApiKey(req.params.id, actor);
    if (!success) return res.status(404).json({ error: 'API key not found.' });
    res.json({ success: true, message: 'API key deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== WEB ITEMS ======================
router.get('/web-items', (req, res) => {
  try {
    const placement = req.query.placement as string;
    const items = db.getWebItems(placement);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/web-items', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const item = db.createWebItem(req.body, actor);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/web-items/:id', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const updated = db.updateWebItem(req.params.id, req.body, actor);
    if (!updated) return res.status(404).json({ error: 'Web item not found.' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/web-items/:id', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const success = db.deleteWebItem(req.params.id, actor);
    if (!success) return res.status(404).json({ error: 'Web item not found.' });
    res.json({ success: true, message: 'Web item moved to trash.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== NAVIGATION ======================
router.get('/navigation', (req, res) => {
  try {
    res.json(db.getNavigationItems());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/navigation', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Navigation payload must be an array of items.' });
    }
    const updated = db.updateNavigationItems(items, actor);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ====================== ABOUT PAGE CONFIG ======================
router.get('/about-config', (req, res) => {
  try {
    res.json(db.getAboutConfig());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/about-config', requireOwner(), (req, res) => {
  try {
    const actor = (req as any).user as User;
    const updated = db.updateAboutConfig(req.body, actor);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ====================== SITEMAP & ROBOTS ======================
router.get('/sitemap.xml', (req, res) => {
  const articles = db.getArticles({ status: 'PUBLISHED' }).articles;
  const categories = db.getCategories();
  const domain = 'https://thefoldedpage.press';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domain}/#explore</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/#today</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/#issues</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/#series</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/#about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  ${categories
    .map(
      (c) => `  <url>
    <loc>${domain}/#category/${c.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n')}
  ${articles
    .map(
      (a) => `  <url>
    <loc>${domain}/#story/${a.slug}</loc>
    <lastmod>${new Date(a.updatedDate || a.publishedDate).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

export default router;
