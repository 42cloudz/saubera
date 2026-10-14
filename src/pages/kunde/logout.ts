import type { APIRoute } from 'astro';
import { COOKIE } from '../../lib/kunde.ts';

export const prerender = false;

export const POST: APIRoute = ({ cookies, redirect }) => {
  cookies.delete(COOKIE, { path: '/kunde' });
  return redirect('/kunde/login', 303);
};
