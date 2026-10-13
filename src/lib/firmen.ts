// Directory queries on top of db.ts: which approved companies serve a service in a place.
import { listFirmen, type Firma } from './db.ts';
import { reaches } from './matching.ts';
import { orte, ortBySlug, slugify, type Ort } from '../data/orte.ts';

export interface FirmenFilter { leistung?: string | null; plz?: string | null; name?: string | null }

export function findFirmen(f: FirmenFilter): Firma[] {
  const q = f.name?.trim().toLowerCase();
  return listFirmen().filter(
    (x) =>
      (!f.leistung || x.leistungen.includes(f.leistung)) &&
      (!f.plz || reaches({ ...x, premium: x.premium }, f.plz)) &&
      (!q || x.firma.toLowerCase().includes(q)),
  );
}

/** The services that at least one listed company offers, in catalogue order: the matrix columns. */
export function offeredColumns(firmen: Firma[], all: { slug: string; name: string }[]) {
  const used = new Set(firmen.flatMap((x) => x.leistungen));
  return all.filter((l) => used.has(l.slug));
}

/** "Wo?" as typed into the search: a five-digit postcode or the name of a place we know. */
export function resolveWo(q: string | null | undefined): { plz: string | null; ort: Ort | null } {
  const t = (q ?? '').trim();
  if (/^\d{5}$/.test(t)) return { plz: t, ort: orte.find((o) => o.plz === t) ?? null };
  const ort = ortBySlug.get(slugify(t)) ?? orte.find((o) => slugify(o.name).startsWith(slugify(t)) && t.length >= 3) ?? null;
  return { plz: ort?.plz ?? null, ort };
}

/** Two letters for the company's square, from the first two words of its name. */
export function monogram(firma: string): string {
  const words = firma.replace(/\(.*?\)/g, '').split(/[\s-]+/).filter((w) => /^[A-Za-zÄÖÜäöü0-9]/.test(w));
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
}
