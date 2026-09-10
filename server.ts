import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes';
import { db } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers with generous limits for article drafts, blocks, and image data
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS middleware allowing external apps to control dispatches & publishing
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, x-api-key, X-API-KEY, x-auth-token, Accept'
    );
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Ensure public & public/uploads exist
  const publicDir = path.join(process.cwd(), 'public');
  const uploadsDir = path.join(publicDir, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve static uploads
  app.use('/uploads', express.static(uploadsDir));
  app.use(express.static(publicDir));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      brand: 'The Folded Page',
      timestamp: new Date().toISOString(),
    });
  });

  // Robots.txt
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://thefoldedpage.press/api/sitemap.xml\n`
    );
  });

  // Fast, same-origin caching proxy for Clerk JS bundle and dynamic chunks
  const clerkChunkCache = new Map<string, { code: string; timestamp: number }>();

  async function fetchClerkChunk(safeFilename: string, clerkHost: string): Promise<string> {
    const urls = [
      `https://${clerkHost}/npm/@clerk/clerk-js@5.127.2/dist/${safeFilename}`,
      `https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5.127.2/dist/${safeFilename}`,
      `https://unpkg.com/@clerk/clerk-js@5.127.2/dist/${safeFilename}`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
        if (res.ok) {
          const code = await res.text();
          if (code && code.length > 50) {
            return code;
          }
        }
      } catch {}
    }
    return '';
  }

  // Pre-warm critical chunks asynchronously
  const prewarmChunks = [
    'clerk.browser.js',
    'signin_clerk.browser_0cc2cc_5.127.2.js',
    'signup_clerk.browser_0cc2cc_5.127.2.js',
  ];
  for (const chunk of prewarmChunks) {
    fetchClerkChunk(chunk, 'clerk.foldedpage.in').then((code) => {
      if (code) clerkChunkCache.set(chunk, { code, timestamp: Date.now() });
    }).catch(() => {});
  }

  app.get('/clerk-js/*', async (req, res) => {
    try {
      const rawPath = req.params[0] || 'clerk.browser.js';
      const safeFilename = path.basename(rawPath);
      const cached = clerkChunkCache.get(safeFilename);
      if (cached && Date.now() - cached.timestamp < 3600000 * 12) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(cached.code);
      }

      const clerkKey =
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
        process.env.CLERK_PUBLISHABLE_KEY ||
        process.env.VITE_CLERK_PUBLISHABLE_KEY ||
        'pk_live_Y2xlcmsuZm9sZGVkcGFnZS5pbiQ';
      let clerkHost = 'clerk.foldedpage.in';
      try {
        const raw = clerkKey.replace(/^pk_(test|live)_/, '').replace(/\$$/, '');
        const decoded = Buffer.from(raw, 'base64').toString('utf-8').replace(/\$$/, '');
        if (decoded && decoded.includes('.')) {
          clerkHost = decoded;
        }
      } catch {}

      const code = await fetchClerkChunk(safeFilename, clerkHost);

      if (code) {
        clerkChunkCache.set(safeFilename, { code, timestamp: Date.now() });
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(code);
      }
      res.status(502).send(`// Upstream Clerk chunk ${safeFilename} unavailable`);
    } catch (err: any) {
      console.error('[Clerk Proxy Error]:', err?.message || err);
      res.status(500).send('// ClerkJS proxy error');
    }
  });

  // Mount all publication & CMS API routes
  app.use('/api', apiRouter);

  // Background auto-publisher timer (runs every 20 seconds to publish scheduled stories)
  setInterval(() => {
    try {
      db.checkScheduledArticles();
    } catch (e) {
      console.error('Scheduled publishing check failed:', e);
    }
  }, 20000);

  // Development vs Production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[The Folded Page] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
