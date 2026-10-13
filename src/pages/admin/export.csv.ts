import type { APIRoute } from 'astro';
import { checkAdmin } from '../../lib/auth.ts';
import { listAnfragen, listDienstleister, listRueckrufe } from '../../lib/db.ts';

export const prerender = false;

// Semicolon-separated with BOM, so Excel in German opens it with umlauts and columns intact.
const cell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[";\n\r]/.test(s) || /^[=+\-@]/.test(s) ? `"${s.replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"` : s;
};

export const GET: APIRoute = ({ request, url }) => {
  const denied = checkAdmin(request);
  if (denied) return denied;
  const p = url.searchParams.get('t');
  const t = p === 'dienstleister' || p === 'rueckrufe' ? p : 'anfragen';
  const rows = t === 'dienstleister' ? listDienstleister() : t === 'rueckrufe' ? listRueckrufe() : listAnfragen();
  const cols = rows[0] ? Object.keys(rows[0]) : [];
  const csv = '﻿' + [cols.join(';'), ...rows.map((r) => cols.map((c) => cell(r[c])).join(';'))].join('\r\n');
  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="saubera-${t}.csv"`, 'Cache-Control': 'no-store' },
  });
};
