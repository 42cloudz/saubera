// Directory queries on top of db.ts: which approved companies serve a service in a place.
import { listFirmen, type Firma } from './db.ts';
import { reaches } from './matching.ts';

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
