// Richtpreis-Rechner: aus Leistung, Menge und Turnus eine Spanne netto. Grobe Marktwerte, damit
// Auftraggeber vor der Anfrage eine Größenordnung sehen. Die echten Angebote kommen von den Firmen.
import type { Leistung } from '../data/leistungen.ts';

/** Einsätze pro Monat je Turnus; 0 heißt einmalig. */
export const einsaetzeProMonat: Record<string, number> = {
  Einmalig: 0,
  'Täglich (Mo–Fr)': 21.7,
  '2–3× pro Woche': 10.8,
  Wöchentlich: 4.33,
  '14-täglich': 2.17,
  Monatlich: 1,
  Quartalsweise: 1 / 3,
  Jährlich: 1 / 12,
};

export interface Spanne { min: number; max: number; proMonat: boolean }

export function richtpreis(l: Pick<Leistung, 'preis'>, menge: number, turnus: string): Spanne | null {
  if (!Number.isFinite(menge) || menge <= 0) return null;
  const n = einsaetzeProMonat[turnus] ?? 0;
  const f = n === 0 ? 1 : n;
  return { min: l.preis.min * menge * f, max: l.preis.max * menge * f, proMonat: n > 0 };
}

const runden = (x: number) => (x < 100 ? Math.round(x) : x < 1000 ? Math.round(x / 10) * 10 : Math.round(x / 50) * 50);
export const euro = (x: number) => runden(x).toLocaleString('de-DE') + ' €';

export function spanneText(s: Spanne): string {
  return `${euro(s.min)} – ${euro(s.max)}${s.proMonat ? ' im Monat' : ' einmalig'}`;
}

export function einheitspreis(l: Pick<Leistung, 'preis'>): string {
  const fmt = (x: number) => x.toLocaleString('de-DE', { minimumFractionDigits: x < 10 ? 2 : 0, maximumFractionDigits: 2 });
  return `${fmt(l.preis.min)} – ${fmt(l.preis.max)} € je ${l.preis.einheit}`;
}
