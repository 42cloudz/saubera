import type { APIRoute } from 'astro';
import { checkAdmin } from '../../lib/auth.ts';
import { setStatus } from '../../lib/db.ts';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const denied = checkAdmin(request);
  if (denied) return denied;
  const f = await request.formData();
  const table = f.get('table') === 'dienstleister' ? 'dienstleister' : 'anfragen';
  setStatus(table, Number(f.get('id')), String(f.get('status') ?? ''));
  return new Response(null, { status: 303, headers: { Location: table === 'dienstleister' ? '/admin?t=dienstleister' : '/admin' } });
};
