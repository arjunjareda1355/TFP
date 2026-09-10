import express from 'express';
import apiRouter from '../server/routes';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, X-API-KEY, x-auth-token, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const clerkChunkCache = new Map<string, { code: string; timestamp: number }>();

app.get(['/clerk-js/:file(*)', '/api/clerk-js/:file(*)'], async (req, res) => {
  try {
    const rawPath = req.params[0] || 'clerk.browser.js';
    const safeFilename = rawPath.replace(/[^a-zA-Z0-9._-]/g, '');
    const cached = clerkChunkCache.get(safeFilename);
    if (cached && Date.now() - cached.timestamp < 3600000 * 6) {
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

    const urls = [
      `https://${clerkHost}/npm/@clerk/clerk-js@5.127.2/dist/${safeFilename}`,
      `https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5.127.2/dist/${safeFilename}`,
      `https://unpkg.com/@clerk/clerk-js@5.127.2/dist/${safeFilename}`,
    ];

    let code = '';
    for (const url of urls) {
      try {
        const fetchRes = await fetch(url, { signal: AbortSignal.timeout(3500) });
        if (fetchRes.ok) {
          code = await fetchRes.text();
          if (code && code.length > 50) break;
        }
      } catch (e) {}
    }

    if (code) {
      clerkChunkCache.set(safeFilename, { code, timestamp: Date.now() });
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(code);
    }
    res.status(502).send(`// Upstream Clerk chunk ${safeFilename} unavailable`);
  } catch (err: any) {
    res.status(500).send('// ClerkJS proxy error');
  }
});

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    brand: 'The Folded Page',
    serverless: true,
    timestamp: new Date().toISOString(),
  });
});

// Support both /api/* and root mount
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global error handler for serverless runtime
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Serverless Error]:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    success: false,
  });
});

export default app;
