import type { APIRoute } from 'astro';
import { listFirmen } from '../../lib/db.ts';

export const prerender = false;

// Names and links for the bookmark list (/merkliste), which lives in the visitor's browser.
export const GET: APIRoute = ({ url }) => {
  const want = new Set((url.searchParams.get('slugs') ?? '').split(',').filter(Boolean).slice(0, 50));
  const rows = listFirmen()
    .filter((f) => want.has(f.slug))
    .map((f) => ({ slug: f.slug, firma: f.firma, ort: f.ort, telefon: f.telefon, premium: f.premium, demo: f.demo, leistungen: f.leistungen }));
  return Response.json(rows, { headers: { 'Cache-Control': 'no-store' } });
};
