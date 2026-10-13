// Production entry: the Astro node handler plus security headers on every response.
// TLS and redirects live in Traefik. NOINDEX=1 keeps search engines off a test domain.
import http from 'node:http';

process.env.ASTRO_NODE_AUTOSTART = 'disabled';
const { handler } = await import('./dist/server/entry.mjs');

const CSP = [
  "default-src 'self'",
  "img-src 'self' data:",
  "style-src 'self'",
  "script-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] ?? req.headers.host;
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === String(host).split(',')[0].trim();
  } catch {
    return false;
  }
}

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok\n');
    return;
  }
  // Posts only from our own pages: the Origin's host must be the host the request was sent to.
  if (req.method !== 'GET' && req.method !== 'HEAD' && !sameOrigin(req)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Cross-site POST form submissions are forbidden');
    return;
  }
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  if (req.url?.startsWith('/_astro/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  if (process.env.NOINDEX === '1') res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  handler(req, res);
});

const port = Number(process.env.PORT ?? 8080);
server.listen(port, process.env.HOST ?? '0.0.0.0', () => console.log(`saubera listening on :${port}`));
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => server.close(() => process.exit(0)));
