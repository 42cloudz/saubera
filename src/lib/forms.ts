// Parsing and validation of the two public forms. Pure functions, so test/forms.test.ts can run them
// without a server. Every field is trimmed and capped; unknown services are dropped.
import { leistungBySlug } from '../data/leistungen.ts';
import type { AnfrageInput, DienstleisterInput, RueckrufInput } from './db.ts';

type Fields = { get(name: string): unknown; getAll(name: string): unknown[] };

export type Result<T> = { ok: true; value: T } | { ok: false; errors: string[] };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PLZ = /^\d{5}$/;

function text(f: Fields, name: string, max = 200): string | null {
  const v = f.get(name);
  if (typeof v !== 'string') return null;
  const t = v.trim().slice(0, max);
  return t === '' ? null : t;
}

function int(f: Fields, name: string, min: number, max: number): number | null {
  const t = text(f, name, 12);
  if (t === null) return null;
  const n = Number.parseInt(t.replace(/\D/g, ''), 10);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

function services(f: Fields): string[] {
  const all = f.getAll('leistungen').filter((v): v is string => typeof v === 'string');
  return [...new Set(all.filter((s) => leistungBySlug.has(s)))];
}

/** True when the hidden honeypot field was filled in, which only bots do. */
export function isBot(f: Fields): boolean {
  return text(f, 'website_url') !== null;
}

function common(f: Fields, errors: string[]) {
  const firma = text(f, 'firma');
  const ansprechpartner = text(f, 'ansprechpartner');
  const email = text(f, 'email', 254);
  const plz = text(f, 'plz', 5);
  const leistungen = services(f);
  if (!firma) errors.push('Bitte geben Sie den Firmennamen an.');
  if (!ansprechpartner) errors.push('Bitte nennen Sie eine Ansprechperson.');
  if (!email || !EMAIL.test(email)) errors.push('Bitte geben Sie eine gültige E-Mail-Adresse an.');
  if (!plz || !PLZ.test(plz)) errors.push('Bitte geben Sie eine fünfstellige Postleitzahl an.');
  if (leistungen.length === 0) errors.push('Bitte wählen Sie mindestens eine Leistung.');
  if (f.get('datenschutz') !== 'ja') errors.push('Bitte bestätigen Sie die Datenschutzhinweise.');
  return {
    firma: firma ?? '',
    ansprechpartner: ansprechpartner ?? '',
    email: email ?? '',
    telefon: text(f, 'telefon', 40),
    plz: plz ?? '',
    ort: text(f, 'ort', 80),
    leistungen,
    nachricht: text(f, 'nachricht', 3000),
  };
}

export function parseAnfrage(f: Fields): Result<AnfrageInput> {
  const errors: string[] = [];
  const c = common(f, errors);
  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      ...c,
      objektart: text(f, 'objektart', 80),
      flaeche_m2: int(f, 'flaeche_m2', 1, 1_000_000),
      turnus: text(f, 'turnus', 40),
      start: text(f, 'start', 80),
      adresse: text(f, 'adresse', 200),
      dauer: text(f, 'dauer', 80),
      hygiene: text(f, 'hygiene', 1000),
      wunschfirmen: [...new Set(f.getAll('wunschfirmen').filter((v): v is string => typeof v === 'string' && /^[a-z0-9-]{1,80}$/.test(v)))].slice(0, 20),
    },
  };
}

export function parseDienstleister(f: Fields): Result<DienstleisterInput> {
  const errors: string[] = [];
  const c = common(f, errors);
  if (errors.length) return { ok: false, errors };
  let website = text(f, 'website', 200);
  if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`;
  return {
    ok: true,
    value: {
      ...c,
      radius_km: int(f, 'radius_km', 1, 1000),
      mitarbeitende: text(f, 'mitarbeitende', 40),
      website,
      premium: f.get('premium') === 'ja',
      strasse: text(f, 'strasse', 120),
      beschreibung: text(f, 'beschreibung', 4000),
      rechtsform: text(f, 'rechtsform', 80),
      inhaber: text(f, 'inhaber', 120),
      register: text(f, 'register', 160),
      ust_id: text(f, 'ust_id', 40),
    },
  };
}

export function parseRueckruf(f: Fields): Result<RueckrufInput> {
  const errors: string[] = [];
  const name = text(f, 'name', 120);
  const telefon = text(f, 'telefon', 40);
  const id = int(f, 'dienstleister_id', 1, 1e9);
  if (!name) errors.push('Bitte geben Sie Ihren Namen an.');
  if (!telefon || telefon.replace(/\D/g, '').length < 6) errors.push('Bitte geben Sie eine Telefonnummer an.');
  if (!id) errors.push('Die Firma fehlt.');
  if (f.get('datenschutz') !== 'ja') errors.push('Bitte bestätigen Sie die Datenschutzhinweise.');
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { dienstleister_id: id!, name: name!, telefon: telefon!, firma: text(f, 'firma', 120), anliegen: text(f, 'anliegen', 1000) } };
}
