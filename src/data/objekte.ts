// Kinds of property for the landing pages "<Leistung> für <Objektart> in <Ort>". Only commercial and
// private institutions: public buildings and spaces are out of Saubera's scope.

export interface Objekt { slug: string; name: string; fuer: string }

const list: [string, string][] = [
  ['Arztpraxen', 'Arztpraxen'], ['Autohäuser', 'Autohäuser'], ['Banken', 'Banken'], ['Bürogebäude', 'Bürogebäude'],
  ['Einkaufszentren', 'Einkaufszentren'], ['Einzelhandel', 'den Einzelhandel'], ['Fitnessstudios', 'Fitnessstudios'],
  ['Hotels', 'Hotels'], ['Industriehallen', 'Industriehallen'], ['Kanzleien', 'Kanzleien'], ['Kliniken', 'Kliniken'],
  ['Logistikzentren', 'Logistikzentren'], ['Messehallen', 'Messehallen'], ['Pflegeeinrichtungen', 'Pflegeeinrichtungen'],
  ['Restaurants', 'Restaurants'], ['Showrooms', 'Showrooms'], ['Wohnanlagen', 'Wohnanlagen'], ['Zahnarztpraxen', 'Zahnarztpraxen'],
];

const slug = (s: string) => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-');
export const objekte: Objekt[] = list.map(([name, fuer]) => ({ slug: slug(name), name, fuer }));
export const objektBySlug = new Map(objekte.map((o) => [o.slug, o]));
