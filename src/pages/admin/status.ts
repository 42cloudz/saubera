import type { APIRoute } from 'astro';
import { checkAdmin } from '../../lib/auth.ts';
import { setPremium, setStatus } from '../../lib/db.ts';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const denied = checkAdmin(request);
  if (denied) return denied;
  const f = await request.formData();
  const t = String(f.get('table'));
  const id = Number(f.get('id'));
  if (t === 'premium') {
    setPremium(id, f.get('premium') === '1');
    return new Response(null, { status: 303, headers: { Location: '/admin?t=dienstleister' } });
  }
  const table = t === 'dienstleister' || t === 'rueckrufe' ? t : 'anfragen';
  setStatus(table, id, String(f.get('status') ?? ''));
  return new Response(null, { status: 303, headers: { Location: table === 'anfragen' ? '/admin' : `/admin?t=${table}` } });
};
