// Requests from companies, cleaning companies (sign-ups and the public directory) and callback
// requests, in one SQLite file. The file lives in DATA_DIR (in the cluster a persistent volume at
// /data). node:sqlite ships with Node, so the image needs no native modules.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { slugify } from '../data/orte.ts';
import { demoFirmen } from '../data/demo.ts';

let db: DatabaseSync | undefined;

/** Adds columns that older databases lack. SQLite has no ADD COLUMN IF NOT EXISTS. */
function ensureColumns(d: DatabaseSync, table: string, cols: Record<string, string>) {
  const have = new Set((d.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((c) => c.name));
  for (const [name, type] of Object.entries(cols)) if (!have.has(name)) d.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`);
}

export function getDb(): DatabaseSync {
  if (db) return db;
  const dir = process.env.DATA_DIR ?? join(process.cwd(), 'data');
  mkdirSync(dir, { recursive: true });
  const d = new DatabaseSync(join(dir, 'saubera.db'));
  d.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS anfragen (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL DEFAULT 'neu',
      firma TEXT NOT NULL,
      ansprechpartner TEXT NOT NULL,
      email TEXT NOT NULL,
      telefon TEXT,
      plz TEXT NOT NULL,
      ort TEXT,
      objektart TEXT,
      leistungen TEXT NOT NULL,
      flaeche_m2 INTEGER,
      turnus TEXT,
      start TEXT,
      nachricht TEXT
    );
    CREATE TABLE IF NOT EXISTS dienstleister (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL DEFAULT 'neu',
      firma TEXT NOT NULL,
      ansprechpartner TEXT NOT NULL,
      email TEXT NOT NULL,
      telefon TEXT,
      plz TEXT NOT NULL,
      ort TEXT,
      radius_km INTEGER,
      leistungen TEXT NOT NULL,
      mitarbeitende TEXT,
      website TEXT,
      premium INTEGER NOT NULL DEFAULT 0,
      nachricht TEXT
    );
    CREATE TABLE IF NOT EXISTS rueckrufe (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL DEFAULT 'neu',
      dienstleister_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      firma TEXT,
      telefon TEXT NOT NULL,
      anliegen TEXT
    );
  `);
  ensureColumns(d, 'anfragen', { ref: 'TEXT', adresse: 'TEXT', hygiene: 'TEXT', dauer: 'TEXT', wunschfirmen: 'TEXT' });
  ensureColumns(d, 'dienstleister', {
    slug: 'TEXT', beschreibung: 'TEXT', strasse: 'TEXT', rechtsform: 'TEXT', inhaber: 'TEXT',
    register: 'TEXT', ust_id: 'TEXT', demo: 'INTEGER NOT NULL DEFAULT 0',
  });
  d.exec('CREATE UNIQUE INDEX IF NOT EXISTS dienstleister_slug ON dienstleister(slug)');
  db = d;
  backfillSlugs();
  if (process.env.SEED_DEMO === '1') seedDemo();
  return d;
}

export interface AnfrageInput {
  firma: string;
  ansprechpartner: string;
  email: string;
  telefon: string | null;
  plz: string;
  ort: string | null;
  adresse: string | null;
  objektart: string | null;
  leistungen: string[];
  flaeche_m2: number | null;
  turnus: string | null;
  start: string | null;
  dauer: string | null;
  hygiene: string | null;
  wunschfirmen: string[];
  nachricht: string | null;
}

export interface DienstleisterInput {
  firma: string;
  ansprechpartner: string;
  email: string;
  telefon: string | null;
  plz: string;
  ort: string | null;
  strasse: string | null;
  radius_km: number | null;
  leistungen: string[];
  mitarbeitende: string | null;
  website: string | null;
  premium: boolean;
  beschreibung: string | null;
  rechtsform: string | null;
  inhaber: string | null;
  register: string | null;
  ust_id: string | null;
  nachricht: string | null;
}

export interface RueckrufInput { dienstleister_id: number; name: string; firma: string | null; telefon: string; anliegen: string | null }

/** Request number shown to the customer, e.g. A-2026-10-0042. */
export function anfrageRef(id: number, date = new Date()): string {
  return `A-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(id).padStart(4, '0')}`;
}

export function insertAnfrage(a: AnfrageInput): { id: number; ref: string } {
  const d = getDb();
  const r = d
    .prepare(
      `INSERT INTO anfragen (firma, ansprechpartner, email, telefon, plz, ort, adresse, objektart, leistungen, flaeche_m2, turnus, start, dauer, hygiene, wunschfirmen, nachricht)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(a.firma, a.ansprechpartner, a.email, a.telefon, a.plz, a.ort, a.adresse, a.objektart, a.leistungen.join(','), a.flaeche_m2, a.turnus, a.start, a.dauer, a.hygiene, a.wunschfirmen.join(','), a.nachricht);
  const id = Number(r.lastInsertRowid);
  const ref = anfrageRef(id);
  d.prepare('UPDATE anfragen SET ref = ? WHERE id = ?').run(ref, id);
  return { id, ref };
}

function uniqueSlug(firma: string): string {
  const base = slugify(firma) || 'firma';
  const taken = getDb().prepare('SELECT 1 FROM dienstleister WHERE slug = ?');
  for (let i = 1; ; i++) {
    const s = i === 1 ? base : `${base}-${i}`;
    if (!taken.get(s)) return s;
  }
}

export function insertDienstleister(x: DienstleisterInput, demo = false): number {
  const r = getDb()
    .prepare(
      `INSERT INTO dienstleister (slug, firma, ansprechpartner, email, telefon, plz, ort, strasse, radius_km, leistungen, mitarbeitende, website, premium, beschreibung, rechtsform, inhaber, register, ust_id, nachricht, demo, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(uniqueSlug(x.firma), x.firma, x.ansprechpartner, x.email, x.telefon, x.plz, x.ort, x.strasse, x.radius_km, x.leistungen.join(','), x.mitarbeitende, x.website, x.premium ? 1 : 0, x.beschreibung, x.rechtsform, x.inhaber, x.register, x.ust_id, x.nachricht, demo ? 1 : 0, demo ? 'freigeschaltet' : 'neu');
  return Number(r.lastInsertRowid);
}

export function insertRueckruf(x: RueckrufInput): number {
  const r = getDb()
    .prepare('INSERT INTO rueckrufe (dienstleister_id, name, firma, telefon, anliegen) VALUES (?, ?, ?, ?, ?)')
    .run(x.dienstleister_id, x.name, x.firma, x.telefon, x.anliegen);
  return Number(r.lastInsertRowid);
}

export type Row = Record<string, string | number | null>;

export function listAnfragen(): Row[] {
  return getDb().prepare('SELECT * FROM anfragen ORDER BY id DESC').all() as Row[];
}

export function listDienstleister(): Row[] {
  return getDb().prepare('SELECT * FROM dienstleister ORDER BY id DESC').all() as Row[];
}

export function listRueckrufe(): Row[] {
  return getDb()
    .prepare('SELECT r.*, d.firma AS dienstleister FROM rueckrufe r LEFT JOIN dienstleister d ON d.id = r.dienstleister_id ORDER BY r.id DESC')
    .all() as Row[];
}

/** A cleaning company as the public directory shows it. Only approved ones are public. */
export interface Firma {
  id: number;
  slug: string;
  firma: string;
  telefon: string | null;
  website: string | null;
  plz: string;
  ort: string | null;
  strasse: string | null;
  radius_km: number | null;
  leistungen: string[];
  mitarbeitende: string | null;
  premium: boolean;
  beschreibung: string | null;
  rechtsform: string | null;
  inhaber: string | null;
  register: string | null;
  ust_id: string | null;
  demo: boolean;
}

const toFirma = (r: Row): Firma => ({
  id: Number(r.id),
  slug: String(r.slug),
  firma: String(r.firma),
  telefon: (r.telefon as string) ?? null,
  website: (r.website as string) ?? null,
  plz: String(r.plz),
  ort: (r.ort as string) ?? null,
  strasse: (r.strasse as string) ?? null,
  radius_km: r.radius_km === null ? null : Number(r.radius_km),
  leistungen: typeof r.leistungen === 'string' && r.leistungen ? r.leistungen.split(',') : [],
  mitarbeitende: (r.mitarbeitende as string) ?? null,
  premium: r.premium === 1,
  beschreibung: (r.beschreibung as string) ?? null,
  rechtsform: (r.rechtsform as string) ?? null,
  inhaber: (r.inhaber as string) ?? null,
  register: (r.register as string) ?? null,
  ust_id: (r.ust_id as string) ?? null,
  demo: r.demo === 1,
});

export function listFirmen(): Firma[] {
  return (getDb().prepare("SELECT * FROM dienstleister WHERE status = 'freigeschaltet' ORDER BY premium DESC, firma COLLATE NOCASE").all() as Row[]).map(toFirma);
}

export function getFirma(slug: string): Firma | null {
  const r = getDb().prepare("SELECT * FROM dienstleister WHERE slug = ? AND status = 'freigeschaltet'").get(slug) as Row | undefined;
  return r ? toFirma(r) : null;
}

export const STATUS = ['neu', 'in Bearbeitung', 'freigeschaltet', 'vermittelt', 'abgeschlossen', 'abgelehnt'] as const;

export function setStatus(table: 'anfragen' | 'dienstleister' | 'rueckrufe', id: number, status: string): void {
  if (!(STATUS as readonly string[]).includes(status)) return;
  getDb().prepare(`UPDATE ${table} SET status = ? WHERE id = ?`).run(status, id);
}

export function setPremium(id: number, premium: boolean): void {
  getDb().prepare('UPDATE dienstleister SET premium = ? WHERE id = ?').run(premium ? 1 : 0, id);
}

/** Old sign-ups from before profiles had slugs get one, so they can be approved and listed. */
export function backfillSlugs(): void {
  const rows = getDb().prepare('SELECT id, firma FROM dienstleister WHERE slug IS NULL').all() as { id: number; firma: string }[];
  for (const r of rows) getDb().prepare('UPDATE dienstleister SET slug = ? WHERE id = ?').run(uniqueSlug(r.firma), r.id);
}

/** Fictional, clearly marked example companies for a test deployment (SEED_DEMO=1), so the directory
 *  is not empty. Never set on the real site. */
function seedDemo(): void {
  const n = getDb().prepare('SELECT COUNT(*) AS n FROM dienstleister WHERE demo = 1').get() as { n: number };
  if (n.n > 0) return;
  for (const f of demoFirmen) insertDienstleister(f, true);
}
