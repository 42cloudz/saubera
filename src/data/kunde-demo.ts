// Fictional customer for the clickable demo of the customer area (DEMO_LOGIN=1). Everything here is
// made up and marked as an example. Changes (new Nacharbeiten, an accepted offer, a new tender) live
// in memory only, are shared by everyone testing and are gone after a restart.

export const kunde = {
  firma: 'Muster Verwaltung GmbH (Beispiel)',
  name: 'Test Nutzer',
  email: 'test@example.com',
};

export interface Position { nr: string; bereich: string; leistung: string; menge: string; turnus: string; preis: number }

export const objekt = {
  id: 'offenbach',
  name: 'Bürogebäude Offenbach',
  adresse: 'Musterstraße 12, 63065 Offenbach am Main',
  art: 'Büro, 3 Etagen',
  flaeche: 1290,
  zeiten: 'Mo–Fr ab 18:00 Uhr',
  zugang: 'Schlüsseltresor am Hintereingang, Alarmcode über Hausmeister',
  positionen: [
    { nr: '1.1', bereich: 'Büroflächen', leistung: 'Unterhaltsreinigung: Papierkörbe, Böden saugen, Tische feucht', menge: '640 m²', turnus: '5× pro Woche', preis: 1490 },
    { nr: '1.2', bereich: 'Sanitärräume', leistung: 'Reinigung und Desinfektion, Verbrauchsmaterial auffüllen', menge: '48 m²', turnus: 'täglich', preis: 610 },
    { nr: '1.3', bereich: 'Teeküchen', leistung: 'Arbeitsflächen, Spüle, Geräte außen, Boden', menge: '3 Stück', turnus: 'täglich', preis: 260 },
    { nr: '1.4', bereich: 'Besprechungsräume', leistung: 'Tische, Stühle, Boden, Whiteboards', menge: '90 m²', turnus: '3× pro Woche', preis: 170 },
    { nr: '1.5', bereich: 'Treppenhaus und Flure', leistung: 'Boden nass wischen, Handläufe', menge: '120 m²', turnus: '2× pro Woche', preis: 190 },
    { nr: '2.1', bereich: 'Glasflächen', leistung: 'Fenster innen und außen inkl. Rahmen', menge: '410 m²', turnus: '4× pro Jahr', preis: 320 },
    { nr: '2.2', bereich: 'Teppichböden', leistung: 'Grundreinigung Sprühextraktion', menge: '380 m²', turnus: '1× pro Jahr', preis: 95 },
  ] as Position[],
};

export const objekt2 = { id: 'hanau', name: 'Lager Hanau', adresse: 'Beispielweg 4, 63450 Hanau', art: 'Lagerhalle mit Büro', flaeche: 2400 };

export const vertrag = {
  firma: 'Mainblick Gebäudeservice (Beispiel)',
  beginn: '01.01.2026',
  laufzeit: '24 Monate, danach jährlich',
  kuendigung: '3 Monate zum Quartalsende',
  ansprechpartner: 'Objektleitung (Beispiel)',
  telefon: '069 000000',
};

export const monatlich = () => objekt.positionen.reduce((s, p) => s + p.preis, 0);

export interface Einsatz { datum: string; zeit: string; team: string; erledigt: number; fehlend: string[] }
export const einsaetze: Einsatz[] = [
  { datum: 'Di 13.10.2026', zeit: '18:05–20:40', team: 'Team A (3 Personen)', erledigt: 5, fehlend: [] },
  { datum: 'Mo 12.10.2026', zeit: '18:10–20:55', team: 'Team A (3 Personen)', erledigt: 5, fehlend: [] },
  { datum: 'Fr 09.10.2026', zeit: '18:00–20:30', team: 'Team A (2 Personen)', erledigt: 4, fehlend: ['1.4 Besprechungsräume'] },
  { datum: 'Do 08.10.2026', zeit: '18:02–20:45', team: 'Team A (3 Personen)', erledigt: 5, fehlend: [] },
  { datum: 'Mi 07.10.2026', zeit: '18:00–21:10', team: 'Team A (3 Personen) + Glasreinigung', erledigt: 6, fehlend: [] },
  { datum: 'Di 06.10.2026', zeit: '18:15–20:50', team: 'Vertretung Team C (3 Personen)', erledigt: 5, fehlend: [] },
  { datum: 'Mo 05.10.2026', zeit: '18:05–20:35', team: 'Team A (3 Personen)', erledigt: 5, fehlend: [] },
];
export const geplant = 5;

export type NStatus = 'offen' | 'in Arbeit' | 'erledigt';
export interface Nacharbeit { id: number; datum: string; raum: string; text: string; von: string; status: NStatus }
export const raeume = ['Empfang', '1. OG Büros', '2. OG Büros', 'Besprechungsraum Main', 'Teeküche 1. OG', 'Teeküche 2. OG', 'WC Damen 1. OG', 'WC Herren 1. OG', 'Treppenhaus'];
export const nacharbeiten: Nacharbeit[] = [
  { id: 3, datum: '13.10.2026', raum: 'Teeküche 2. OG', text: 'Kaffeeflecken auf der Arbeitsplatte, Spüle nicht gereinigt.', von: 'Empfang', status: 'offen' },
  { id: 2, datum: '09.10.2026', raum: 'Besprechungsraum Main', text: 'Raum wurde ausgelassen, Tische mit Flecken.', von: 'Test Nutzer', status: 'in Arbeit' },
  { id: 1, datum: '01.10.2026', raum: 'WC Herren 1. OG', text: 'Papierhandtücher leer.', von: 'Hausmeister', status: 'erledigt' },
];

export interface Angebot { firma: string; preise: number[]; hinweis: string }
export interface Ausschreibung {
  id: string; titel: string; objekt: string; status: string; frist: string;
  positionen: { nr: string; bereich: string; menge: string; turnus: string }[];
  angebote: Angebot[]; angenommen: string | null;
}
export const ausschreibungen: Ausschreibung[] = [
  {
    id: 'A-2026-10-0007',
    titel: 'Unterhaltsreinigung Lager Hanau',
    objekt: objekt2.name,
    status: 'Angebote liegen vor',
    frist: '23.10.2026',
    positionen: [
      { nr: '1.1', bereich: 'Hallenboden maschinell', menge: '2.100 m²', turnus: '1× pro Woche' },
      { nr: '1.2', bereich: 'Büro und Pausenraum', menge: '180 m²', turnus: '3× pro Woche' },
      { nr: '1.3', bereich: 'Sanitär und Umkleiden', menge: '60 m²', turnus: '3× pro Woche' },
      { nr: '2.1', bereich: 'Rolltore und Lichtbänder', menge: '12 Stück', turnus: '2× pro Jahr' },
    ],
    angebote: [
      { firma: 'Kinzig Hallen- und Industriereinigung (Beispiel)', preise: [820, 390, 210, 60], hinweis: 'Scheuersaugmaschine vor Ort, kein Aufpreis für Maschinenmiete.' },
      { firma: 'Mainblick Gebäudeservice (Beispiel)', preise: [940, 340, 190, 75], hinweis: 'Gleiches Team wie im Bürogebäude Offenbach möglich.' },
      { firma: 'Taunus Clean Service (Beispiel)', preise: [990, 360, 230, 55], hinweis: 'Start frühestens ab 01.12.2026.' },
    ],
    angenommen: null,
  },
];

export const summe = (a: Angebot) => a.preise.reduce((s, p) => s + p, 0);
export const eur = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
