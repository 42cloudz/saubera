// Branchen und typische Leistungen, übernommen von saubera.de (Quelltext von Markus, 2026-10-14).
// `leistung` verlinkt auf die passende Leistungsseite.
export interface Branche { name: string; punkte: string[]; leistung: string }

export const branchen: Branche[] = [
  { name: 'Apotheke', punkte: ['Sanitärreinigung', 'Arbeitsplätze', 'Desinfektion'], leistung: 'praxisreinigung' },
  { name: 'Arztpraxis', punkte: ['Sanitärreinigung', 'Behandlungsräume', 'Desinfektion'], leistung: 'praxisreinigung' },
  { name: 'Bahnhof und Flughafen', punkte: ['Grundreinigung', 'Glasflächen', 'Sanitär'], leistung: 'sonderreinigung' },
  { name: 'Bank und Finanzinstitut', punkte: ['Arbeitsplätze', 'Bodenreinigung', 'Sicherheitsbereich'], leistung: 'bueroreinigung' },
  { name: 'Baustelle', punkte: ['Baugrobreinigung', 'Bauendreinigung', 'Containerreinigung'], leistung: 'baureinigung' },
  { name: 'Behörde und Rathaus', punkte: ['Treppenhaus', 'Fenster', 'Gemeinschaftsbereiche'], leistung: 'bueroreinigung' },
  { name: 'Bibliothek', punkte: ['Regalpflege', 'Arbeitsflächen', 'Sanitär'], leistung: 'bueroreinigung' },
  { name: 'Büro', punkte: ['Arbeitsplätze', 'Teppich und Boden', 'Küche und Sanitär'], leistung: 'bueroreinigung' },
  { name: 'Callcenter', punkte: ['Telefonarbeitsplätze', 'Oberflächen', 'Sanitärbereiche'], leistung: 'bueroreinigung' },
  { name: 'Einzelhandel', punkte: ['Schaufenster', 'Regalpflege', 'Bodenreinigung'], leistung: 'glasreinigung' },
  { name: 'Fitnessstudio', punkte: ['Geräte', 'Duschen', 'Desinfektion'], leistung: 'sonderreinigung' },
  { name: 'Gesundheitswesen', punkte: ['Bodenreinigung', 'Sanitärreinigung', 'Desinfektion'], leistung: 'praxisreinigung' },
  { name: 'Hotel und Pension', punkte: ['Zimmer', 'Lobby', 'Sanitärreinigung'], leistung: 'gastro-hotelreinigung' },
  { name: 'Industriebetrieb', punkte: ['Maschinenreinigung', 'Produktionsflächen', 'Gefahrstoffzonen'], leistung: 'industriereinigung' },
  { name: 'Kindergarten und Schule', punkte: ['Spielbereiche', 'Toiletten', 'Klassenzimmer'], leistung: 'bueroreinigung' },
  { name: 'Klinik und Pflege', punkte: ['Patientenzimmer', 'OP-Reinigung', 'Flure'], leistung: 'praxisreinigung' },
  { name: 'Logistikzentrum', punkte: ['Fahrwege', 'Lagerflächen', 'Verladebereiche'], leistung: 'industriereinigung' },
  { name: 'Restaurant und Gastronomie', punkte: ['Küche', 'Gastraum', 'Sanitärreinigung'], leistung: 'gastro-hotelreinigung' },
  { name: 'Tankstelle', punkte: ['Shop', 'Zapfsäulenbereich', 'Sanitärreinigung'], leistung: 'sonderreinigung' },
  { name: 'Wohnanlage', punkte: ['Treppenhaus', 'Keller', 'Gemeinschaftsbereiche'], leistung: 'treppenhausreinigung' },
];
