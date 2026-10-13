import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db.ts';

export const prerender = false;

// Readiness: the database opens and answers.
export const GET: APIRoute = () => {
  try {
    getDb().prepare('SELECT 1').get();
    return new Response('ok\n', { headers: { 'Content-Type': 'text/plain' } });
  } catch (err) {
    return new Response(`db: ${(err as Error).message}\n`, { status: 503 });
  }
};
