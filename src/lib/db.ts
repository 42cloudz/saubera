// Requests from companies and sign-ups from cleaning companies, in one SQLite file.
// The file lives in DATA_DIR (in the cluster a persistent volume at /data). node:sqlite ships with
// Node, so the image needs no native modules.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

let db: DatabaseSync | undefined;

export function getDb(): DatabaseSync {
  if (db) return db;
  const dir = process.env.DATA_DIR ?? join(process.cwd(), 'data');
  mkdirSync(dir, { recursive: true });
  db = new DatabaseSync(join(dir, 'saubera.db'));
  db.exec(`
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
  `);
  return db;
}

export interface AnfrageInput {
  firma: string;
  ansprechpartner: string;
  email: string;
  telefon: string | null;
  plz: string;
  ort: string | null;
  objektart: string | null;
  leistungen: string[];
  flaeche_m2: number | null;
  turnus: string | null;
  start: string | null;
  nachricht: string | null;
}

export interface DienstleisterInput {
  firma: string;
  ansprechpartner: string;
  email: string;
  telefon: string | null;
  plz: string;
  ort: string | null;
  radius_km: number | null;
  leistungen: string[];
  mitarbeitende: string | null;
  website: string | null;
  premium: boolean;
  nachricht: string | null;
}

export function insertAnfrage(a: AnfrageInput): number {
  const r = getDb()
    .prepare(
      `INSERT INTO anfragen (firma, ansprechpartner, email, telefon, plz, ort, objektart, leistungen, flaeche_m2, turnus, start, nachricht)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(a.firma, a.ansprechpartner, a.email, a.telefon, a.plz, a.ort, a.objektart, a.leistungen.join(','), a.flaeche_m2, a.turnus, a.start, a.nachricht);
  return Number(r.lastInsertRowid);
}

export function insertDienstleister(d: DienstleisterInput): number {
  const r = getDb()
    .prepare(
      `INSERT INTO dienstleister (firma, ansprechpartner, email, telefon, plz, ort, radius_km, leistungen, mitarbeitende, website, premium, nachricht)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(d.firma, d.ansprechpartner, d.email, d.telefon, d.plz, d.ort, d.radius_km, d.leistungen.join(','), d.mitarbeitende, d.website, d.premium ? 1 : 0, d.nachricht);
  return Number(r.lastInsertRowid);
}

export type Row = Record<string, string | number | null>;

export function listAnfragen(): Row[] {
  return getDb().prepare('SELECT * FROM anfragen ORDER BY id DESC').all() as Row[];
}

export function listDienstleister(): Row[] {
  return getDb().prepare('SELECT * FROM dienstleister ORDER BY id DESC').all() as Row[];
}

export const STATUS = ['neu', 'in Bearbeitung', 'vermittelt', 'abgeschlossen', 'abgelehnt'] as const;

export function setStatus(table: 'anfragen' | 'dienstleister', id: number, status: string): void {
  if (!(STATUS as readonly string[]).includes(status)) return;
  getDb().prepare(`UPDATE ${table} SET status = ? WHERE id = ?`).run(status, id);
}
