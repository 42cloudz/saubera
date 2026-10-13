// /admin is protected by HTTP Basic auth with ADMIN_USER (default "admin") and ADMIN_PASSWORD.
// Without ADMIN_PASSWORD the admin area is switched off and answers 404.
import { timingSafeEqual } from 'node:crypto';

function same(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkAdmin(request: Request): Response | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return new Response('Not found', { status: 404 });
  const user = process.env.ADMIN_USER ?? 'admin';
  const header = request.headers.get('authorization') ?? '';
  if (header.startsWith('Basic ')) {
    const [u, ...rest] = Buffer.from(header.slice(6), 'base64').toString().split(':');
    if (same(u ?? '', user) && same(rest.join(':'), password)) return null;
  }
  return new Response('Anmeldung erforderlich', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Saubera Admin", charset="UTF-8"' },
  });
}
