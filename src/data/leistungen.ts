// The services Saubera brokers. Scope: everything visible that gets dirty, except public spaces.
// The slugs are part of the URLs (/leistungen/<slug>) and are stored with each request, so keep them stable.

export interface Leistung {
  slug: string;
  name: string;
  kurz: string;
  text: string;
  objekte: string[];
  umfang: string[];
  turnus: string;
  icon: string;
  /** Richtpreis netto in Euro je Einheit und Einsatz (Stand 2026, grobe Marktwerte, ohne Gewähr). */
  preis: { min: number; max: number; einheit: 'm²' | 'Fahrzeug' };
  /** Turnus, mit dem der Preisrechner startet. */
  standardTurnus: string;
}

export const leistungen: Leistung[] = [
  {
    slug: 'bueroreinigung',
    name: 'Büroreinigung',
    kurz: 'Arbeitsplätze, Küchen, Sanitär und Besprechungsräume, täglich oder wöchentlich.',
    text: 'Wir vermitteln geprüfte Unterhaltsreinigung für Büros jeder Größe, vom Zehn-Personen-Team bis zur mehrstöckigen Verwaltung, mit festem Leistungsverzeichnis und klaren Intervallen.',
    objekte: ['Büros und Verwaltungen', 'Coworking-Flächen', 'Agenturen und Kanzleien', 'Showrooms'],
    umfang: ['Arbeitsplätze und Oberflächen', 'Böden saugen und wischen', 'Teeküchen und Sozialräume', 'Sanitärbereiche inkl. Verbrauchsmaterial', 'Papierkörbe und Mülltrennung'],
    turnus: 'täglich, 2–3× pro Woche oder wöchentlich',
    icon: 'building',
    preis: { min: 0.12, max: 0.22, einheit: 'm²' },
    standardTurnus: '2–3× pro Woche',
  },
  {
    slug: 'praxisreinigung',
    name: 'Praxisreinigung',
    kurz: 'Hygienegerechte Reinigung für Arzt-, Zahnarzt- und Therapiepraxen.',
    text: 'Unsere Partner arbeiten nach Hygieneplan, dokumentieren jeden Einsatz und kennen die Anforderungen an Behandlungs-, Warte- und Sanitärräume.',
    objekte: ['Arztpraxen', 'Zahnarztpraxen', 'Physiotherapie', 'Labore'],
    umfang: ['Desinfizierende Flächenreinigung', 'Behandlungsräume nach Hygieneplan', 'Wartebereiche und Empfang', 'Sanitär', 'Dokumentation pro Einsatz'],
    turnus: 'täglich nach Praxisschluss',
    icon: 'cross',
    preis: { min: 0.18, max: 0.32, einheit: 'm²' },
    standardTurnus: 'Täglich (Mo–Fr)',
  },
  {
    slug: 'glasreinigung',
    name: 'Glas- und Fensterreinigung',
    kurz: 'Fenster, Glasfassaden, Wintergärten und Trennwände, streifenfrei.',
    text: 'Wir vermitteln Fachbetriebe für Schaufenster, Fenster und Glasfassaden, mit Osmose-Teleskopstangen oder Hebebühne.',
    objekte: ['Bürogebäude', 'Ladenlokale', 'Glasfassaden', 'Wintergärten und Lichtkuppeln'],
    umfang: ['Fenster innen und außen', 'Rahmen und Falze', 'Glastrennwände', 'Schaufenster', 'Arbeiten mit Hebebühne'],
    turnus: 'monatlich, quartalsweise oder einmalig',
    icon: 'window',
    preis: { min: 1.8, max: 3.8, einheit: 'm²' },
    standardTurnus: 'Quartalsweise',
  },
  {
    slug: 'fassadenreinigung',
    name: 'Fassadenreinigung',
    kurz: 'Putz, Klinker, Metall und Naturstein, inklusive Graffiti-Entfernung.',
    text: 'Unsere Partner reinigen schonend je nach Material und schützen die Oberfläche auf Wunsch gegen neue Verschmutzung.',
    objekte: ['Firmengebäude', 'Hallen', 'Wohn- und Geschäftshäuser', 'Parkhäuser'],
    umfang: ['Algen- und Moosentfernung', 'Graffiti-Entfernung', 'Hydrophobierung', 'Metall- und Alufassaden'],
    turnus: 'einmalig oder jährlich',
    icon: 'facade',
    preis: { min: 4, max: 14, einheit: 'm²' },
    standardTurnus: 'Einmalig',
  },
  {
    slug: 'industriereinigung',
    name: 'Industrie- und Hallenreinigung',
    kurz: 'Produktionsflächen, Maschinen, Lager und Hallenböden.',
    text: 'In Produktion und Logistik muss die Reinigung zum Schichtbetrieb passen. Wir vermitteln Betriebe mit Industriesaugern, Scheuersaugmaschinen und Erfahrung mit Arbeitssicherheit.',
    objekte: ['Produktionshallen', 'Lager und Logistik', 'Werkstätten', 'Lebensmittelbetriebe'],
    umfang: ['Hallenböden maschinell', 'Maschinenreinigung', 'Hochregale und Stahlträger', 'Trockeneis- und Hochdruckreinigung'],
    turnus: 'nach Schichtplan, wöchentlich oder als Grundreinigung',
    icon: 'factory',
    preis: { min: 0.08, max: 0.2, einheit: 'm²' },
    standardTurnus: 'Wöchentlich',
  },
  {
    slug: 'baureinigung',
    name: 'Bauend- und Baugrobreinigung',
    kurz: 'Übergabefertig nach Neubau, Umbau oder Renovierung.',
    text: 'Bevor Mieter oder Kunden einziehen, muss der Baustaub raus. Unsere Partner übernehmen Grob-, Zwischen- und Endreinigung termingerecht zur Abnahme.',
    objekte: ['Neubauten', 'Umbau von Büro- und Gewerbeflächen', 'Ladenbau', 'Sanierung'],
    umfang: ['Bauschutt und Grobschmutz', 'Feinreinigung aller Flächen', 'Fenster inkl. Aufkleberentfernung', 'Sanitär und Küchen'],
    turnus: 'einmalig, terminiert zur Abnahme',
    icon: 'crane',
    preis: { min: 2, max: 5.5, einheit: 'm²' },
    standardTurnus: 'Einmalig',
  },
  {
    slug: 'gastro-hotelreinigung',
    name: 'Gastronomie- und Hotelreinigung',
    kurz: 'Küchen, Gasträume, Zimmer und Wellnessbereiche.',
    text: 'Wir vermitteln Teams für Küchen-Grundreinigung, Housekeeping und Spa-Bereiche, geplant nach Ruhetag und Belegung.',
    objekte: ['Restaurants', 'Hotels und Pensionen', 'Kantinen', 'Wellness und Fitness'],
    umfang: ['Küchen inkl. Abzugshauben', 'Gasträume', 'Housekeeping', 'Sauna und Duschen'],
    turnus: 'täglich oder als Grundreinigung',
    icon: 'cup',
    preis: { min: 0.2, max: 0.4, einheit: 'm²' },
    standardTurnus: 'Täglich (Mo–Fr)',
  },
  {
    slug: 'treppenhausreinigung',
    name: 'Treppenhaus- und Objektreinigung',
    kurz: 'Für Hausverwaltungen: Treppenhäuser, Keller, Außenanlagen.',
    text: 'Für Hausverwaltungen und Eigentümergemeinschaften: Reinigung von Gemeinschaftsflächen mit Nachweis pro Einsatz.',
    objekte: ['Mehrfamilienhäuser', 'Wohnanlagen', 'Geschäftshäuser', 'Tiefgaragen'],
    umfang: ['Treppenhäuser und Aufzüge', 'Keller und Dachböden', 'Mülltonnenplätze', 'Außenanlagen und Winterdienst'],
    turnus: 'wöchentlich oder 14-täglich',
    icon: 'stairs',
    preis: { min: 0.25, max: 0.5, einheit: 'm²' },
    standardTurnus: 'Wöchentlich',
  },
  {
    slug: 'teppich-polsterreinigung',
    name: 'Teppich- und Polsterreinigung',
    kurz: 'Teppichböden, Bürostühle und Polstermöbel.',
    text: 'Teppichböden und Bürostühle sammeln Staub, Flecken und Gerüche. Unsere Partner reinigen per Sprühextraktion oder Trockenverfahren, auch am Wochenende.',
    objekte: ['Büros', 'Hotels', 'Kinos und Veranstaltungsräume', 'Praxen'],
    umfang: ['Sprühextraktion', 'Fleckenentfernung', 'Bürostühle und Polster', 'Imprägnierung'],
    turnus: '1–2× jährlich',
    icon: 'carpet',
    preis: { min: 2.5, max: 6, einheit: 'm²' },
    standardTurnus: 'Jährlich',
  },
  {
    slug: 'photovoltaik-reinigung',
    name: 'Photovoltaik- und Dachreinigung',
    kurz: 'Dach- und Freiflächenanlagen, mit Osmosewasser.',
    text: 'Verschmutzte Solarmodule kosten Ertrag. Unsere Partner reinigen Dach- und Freiflächenanlagen mit entmineralisiertem Wasser und rotierenden Bürsten, ohne die Module zu beschädigen.',
    objekte: ['Gewerbedächer', 'Hallen', 'Agrarbetriebe', 'Freiflächenanlagen'],
    umfang: ['Modulreinigung', 'Dachrinnen', 'Lichtbänder', 'Sichtprüfung mit Bericht'],
    turnus: 'jährlich',
    icon: 'sun',
    preis: { min: 1, max: 2.8, einheit: 'm²' },
    standardTurnus: 'Jährlich',
  },
  {
    slug: 'fahrzeugreinigung',
    name: 'Fahrzeug- und Flottenreinigung',
    kurz: 'Firmenwagen, Transporter und Lkw, auf Ihrem Gelände.',
    text: 'Mobile Partner reinigen Firmenwagen, Transporter und Lkw direkt auf Ihrem Hof, innen wie außen.',
    objekte: ['Firmenflotten', 'Autohäuser', 'Speditionen', 'Carsharing'],
    umfang: ['Außenwäsche mobil', 'Innenraumaufbereitung', 'Planen und Aufbauten', 'Flottenpläne'],
    turnus: 'wöchentlich, monatlich oder nach Bedarf',
    icon: 'truck',
    preis: { min: 35, max: 90, einheit: 'Fahrzeug' },
    standardTurnus: 'Monatlich',
  },
  {
    slug: 'sonderreinigung',
    name: 'Sonder- und Grundreinigung',
    kurz: 'Nach Wasserschaden, Umzug, Event oder für Böden mit Einpflege.',
    text: 'Für Grundreinigung, Bodenbeschichtung, Reinigung nach Veranstaltungen oder Schäden finden wir kurzfristig den passenden Spezialisten.',
    objekte: ['Büros und Läden', 'Veranstaltungsflächen', 'Schulungsräume', 'Leerstand vor Neuvermietung'],
    umfang: ['Grundreinigung mit Einpflege', 'Reinigung nach Events', 'Entrümpelung', 'Reinigung nach Wasserschaden'],
    turnus: 'einmalig, auch kurzfristig',
    icon: 'sparkle',
    preis: { min: 1.5, max: 4.5, einheit: 'm²' },
    standardTurnus: 'Einmalig',
  },
];

export const leistungBySlug = new Map(leistungen.map((l) => [l.slug, l]));

export const objektarten = [
  'Büro / Verwaltung',
  'Arzt- oder Therapiepraxis',
  'Einzelhandel / Ladenlokal',
  'Gastronomie / Hotel',
  'Produktion / Lager / Halle',
  'Wohnanlage (Hausverwaltung)',
  'Bildung / Kita (privat)',
  'Fahrzeuge / Flotte',
  'Sonstiges',
];

export const turnusOptionen = [
  'Einmalig',
  'Täglich (Mo–Fr)',
  '2–3× pro Woche',
  'Wöchentlich',
  '14-täglich',
  'Monatlich',
  'Quartalsweise',
  'Jährlich',
];
