import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import apiRouter from './routes';
import { db } from './db';

export const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || '';
export const CLERK_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY ||
  process.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_live_Y2xlcmsuZm9sZGVkcGFnZS5pbiQ';

// Catch unhandled errors globally to prevent unexpected process exit in production
process.on('uncaughtException', (err) => {
  console.error('[The Folded Page] Uncaught exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[The Folded Page] Unhandled rejection at:', promise, 'reason:', reason);
});

let serverStarted = false;

export async function startServer() {
  if (serverStarted) {
    console.log('[The Folded Page] Server already active, ignoring duplicate startServer() call.');
    return;
  }
  serverStarted = true;

  const app = express();
  // Support Cloud Run / container-assigned port, fallback to port 3000 in dev
  const PORT = Number(process.env.PORT) || 3000;

  // Determine production vs development mode
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    (Boolean(process.env.PORT) && process.env.PORT !== '3000') ||
    (!process.env.VITE_DEV_MODE && hasDist);

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
      'Content-Type, Authorization, x-api-key, X-API-KEY, api-key, API-KEY, x-auth-token, x-user-email, Accept, Origin, X-Requested-With'
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

  // Health check for Cloud Run startup/liveness probes
  app.get(['/api/health', '/healthz', '/health'], (req, res) => {
    res.json({
      status: 'ok',
      brand: 'The Folded Page',
      timestamp: new Date().toISOString(),
      port: PORT,
      mode: isProduction ? 'production' : 'development',
    });
  });

  // Default crawler headers - ensure search engines are explicitly permitted to index
  app.use((req, res, next) => {
    if (req.path.startsWith('/admin') || req.path.startsWith('/api/admin')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    } else {
      res.setHeader('X-Robots-Tag', 'all, index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    }
    next();
  });

  // Robots.txt
  app.get('/robots.txt', (req, res) => {
    const host = req.get('host') || 'foldedpage.in';
    const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
    const domain = host.includes('localhost') || host.includes('run.app')
      ? `${proto}://${host}`
      : 'https://foldedpage.in';

    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Robots-Tag', 'all, index, follow');
    res.send(
      `# robots.txt for The Folded Page\nUser-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/\nDisallow: /api/admin\nDisallow: /api/keys\nDisallow: /api/trash\nDisallow: /api/audit-logs\n\n# Sitemaps\nSitemap: ${domain}/sitemap.xml\nSitemap: ${domain}/api/sitemap.xml\n`
    );
  });

  // Dynamic XML Sitemap
  app.get(['/sitemap.xml', '/sitemap'], (req, res) => {
    const articles = db.getArticles({ status: 'PUBLISHED' }).articles;
    const categories = db.getCategories();

    const host = req.get('host') || 'foldedpage.in';
    const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
    const domain = host.includes('localhost') || host.includes('run.app')
      ? `${proto}://${host}`
      : 'https://foldedpage.in';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${domain}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domain}/explore</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/today</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/issues</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/series</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${domain}/newsletter</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  ${categories
    .map(
      (c) => `  <url>
    <loc>${domain}/category/${c.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`
    )
    .join('\n')}
  ${articles
    .map(
      (a) => `  <url>
    <loc>${domain}/story/${a.slug}</loc>
    <lastmod>${new Date(a.updatedDate || a.publishedDate || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>${
      a.heroImage
        ? `\n    <image:image>\n      <image:loc>${
            a.heroImage.startsWith('http') ? a.heroImage : `${domain}${a.heroImage}`
          }</image:loc>\n      <image:title>${(a.title || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')}</image:title>\n    </image:image>`
        : ''
    }
  </url>`
    )
    .join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Robots-Tag', 'all, index, follow');
    res.send(xml);
  });

  // Ads.txt for Google AdSense & authorized digital sellers verification
  app.get('/ads.txt', (req, res) => {
    res.type('text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(`google.com, pub-9840710184594635, DIRECT, f08c47fec0942fa0\n`);
  });

  // Fast, same-origin caching proxy for Clerk JS bundle and dynamic chunks
  const clerkChunkCache = new Map<string, { code: string; timestamp: number }>();
  const publicClerkDir = path.join(publicDir, 'clerk-js');
  const nodeClerkDist = path.join(process.cwd(), 'node_modules', '@clerk', 'clerk-js', 'dist');

  async function fetchClerkChunk(safeFilename: string, clerkHost: string): Promise<string> {
    // 1. Instant local disk resolution (zero latency, zero network dependency)
    try {
      const p1 = path.join(publicClerkDir, safeFilename);
      if (fs.existsSync(p1)) {
        return fs.readFileSync(p1, 'utf-8');
      }
      const p2 = path.join(nodeClerkDist, safeFilename);
      if (fs.existsSync(p2)) {
        return fs.readFileSync(p2, 'utf-8');
      }
    } catch {}

    // 2. Outbound fallback to Clerk frontend and CDNs
    const urls = [
      `https://${clerkHost}/npm/@clerk/clerk-js@5/dist/${safeFilename}`,
      `https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/${safeFilename}`,
      `https://unpkg.com/@clerk/clerk-js@5/dist/${safeFilename}`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
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
    'framework_clerk.browser_0cc2cc_5.127.2.js',
    'signin_clerk.browser_0cc2cc_5.127.2.js',
    'signup_clerk.browser_0cc2cc_5.127.2.js',
  ];
  for (const chunk of prewarmChunks) {
    fetchClerkChunk(chunk, 'clerk.foldedpage.in').then((code) => {
      if (code) clerkChunkCache.set(chunk, { code, timestamp: Date.now() });
    }).catch(() => {});
  }

  const clerkHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const rawPath = req.params[0] || req.path;
      const safeFilename = path.basename(rawPath) || 'clerk.browser.js';
      if (!safeFilename.endsWith('.js')) {
        return next();
      }

      const cached = clerkChunkCache.get(safeFilename);
      if (cached && Date.now() - cached.timestamp < 3600000 * 24) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(cached.code);
      }

      const host = req.headers.host || '';
      const isProdHost = host.includes('foldedpage.in');
      const clerkKey = isProdHost
        ? CLERK_PUBLISHABLE_KEY
        : (process.env.VITE_CLERK_PUBLISHABLE_KEY ||
           process.env.CLERK_PUBLISHABLE_KEY ||
           'pk_test_c21vb3RoLXdhaG9vLTExNTEuY2xlcmsuYWNjb3VudHMuZGV2JA');
      let clerkHost = isProdHost ? 'clerk.foldedpage.in' : 'smooth-wahoo-1151.clerk.accounts.dev';
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

      // Safe JS fallback comment instead of 404 or HTML
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      return res.send(`/* clerk chunk fallback ${safeFilename} */`);
    } catch (err: any) {
      console.warn('[Clerk Proxy Notice]:', err?.message || err);
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      return res.send('/* clerk fallback */');
    }
  };

  // Intercept Clerk bundle and dynamic chunks both under /clerk-js/ and at root
  app.use((req, res, next) => {
    // Explicitly bypass Vite dev modules, node_modules dependencies, and internal routes
    if (
      req.path.startsWith('/node_modules') ||
      req.path.startsWith('/@') ||
      req.path.startsWith('/src') ||
      req.path.includes('@clerk')
    ) {
      return next();
    }

    if (
      (req.method === 'GET' || req.method === 'HEAD') &&
      (
        req.path.startsWith('/clerk-js/') ||
        req.path === '/clerk.browser.js' ||
        (req.path.endsWith('.js') && (req.path.includes('_clerk.browser_') || req.path.includes('.clerk.browser.')))
      )
    ) {
      return clerkHandler(req, res, next);
    }
    next();
  });

  // Serve static uploads
  app.use('/uploads', express.static(uploadsDir));
  app.use(express.static(publicDir));

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

  // Development vs Production static routing
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[The Folded Page] Server running on http://0.0.0.0:${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

export default { startServer };
