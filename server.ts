/**
 * The Folded Page - Universal Server Entrypoint
 * Handles both local development (Vite middlewares) and production Cloud Run deployments.
 */
import fs from 'fs';
import path from 'path';

// Catch unhandled errors globally
process.on('uncaughtException', (err) => {
  console.error('[The Folded Page] Uncaught exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[The Folded Page] Unhandled rejection at:', promise, 'reason:', reason);
});

const distServer = path.join(process.cwd(), 'dist', 'server.cjs');

// In production or whenever bundled dist/server.cjs is present:
if (fs.existsSync(distServer) && !process.env.VITE_DEV_MODE) {
  try {
    const mod = await import(distServer);
    const start = mod.startServer || mod.default?.startServer || mod.default;
    if (typeof start === 'function') {
      await start();
    }
  } catch (err) {
    console.warn('[The Folded Page] Notice: loading server from source fallback:', (err as any)?.message || err);
    const { startServer } = await import('./server/serverApp.ts');
    await startServer();
  }
} else {
  // In development: run through TS / Vite middlewares
  const { startServer } = await import('./server/serverApp.ts');
  await startServer();
}
