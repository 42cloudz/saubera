// Demo login for the customer area. Only switched on with DEMO_LOGIN=1 (the test deployment);
// there the fixed account test / test1234 opens /kunde. On the real site the login accepts nobody.
// The session is a signed cookie with an expiry, so no session table is needed.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { AstroGlobal } from 'astro';

export const COOKIE = 'sb_kunde';
const DAY = 24 * 60 * 60 * 1000;
const secret = process.env.SESSION_SECRET || randomBytes(32).toString('hex');

export const demoLogin = () => process.env.DEMO_LOGIN === '1';

function same(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

const sign = (v: string) => createHmac('sha256', secret).update(v).digest('base64url');

export function checkLogin(user: string, password: string): boolean {
  return demoLogin() && same(user, 'test') && same(password, 'test1234');
}

export function sessionCookie(): string {
  const v = `test.${Date.now() + DAY}`;
  return `${v}.${sign(v)}`;
}

export function validSession(raw: string | undefined): boolean {
  if (!demoLogin() || !raw) return false;
  const i = raw.lastIndexOf('.');
  if (i < 0) return false;
  const v = raw.slice(0, i);
  if (!same(raw.slice(i + 1), sign(v))) return false;
  return Number(v.split('.')[1]) > Date.now();
}

export const cookieOpts = (secure: boolean) => ({ path: '/kunde', httpOnly: true, sameSite: 'lax' as const, secure, maxAge: DAY / 1000 });

export const isSecure = (Astro: AstroGlobal) =>
  Astro.url.protocol === 'https:' || Astro.request.headers.get('x-forwarded-proto') === 'https';

/** Redirect to the login unless the visitor has a valid session. */
export function requireKunde(Astro: AstroGlobal): Response | null {
  Astro.response.headers.set('Cache-Control', 'no-store');
  Astro.response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  if (validSession(Astro.cookies.get(COOKIE)?.value)) return null;
  return Astro.redirect(`/kunde/login?weiter=${encodeURIComponent(Astro.url.pathname)}`, 303);
}
