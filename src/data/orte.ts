// Places for the local landing pages (/leistungen/<leistung>/<ort>). The postcode is a central one for
// the place; matching uses it like a request's postcode (src/lib/matching.ts).

export interface Ort { slug: string; name: string; plz: string; land: string }

const raw: Record<string, [string, string][]> = {
  'Baden-Württemberg': [['Stuttgart', '70173'], ['Mannheim', '68159'], ['Karlsruhe', '76133'], ['Freiburg im Breisgau', '79098'], ['Heidelberg', '69117'], ['Ulm', '89073']],
  Bayern: [['München', '80331'], ['Nürnberg', '90402'], ['Augsburg', '86150'], ['Regensburg', '93047'], ['Würzburg', '97070'], ['Ingolstadt', '85049']],
  Berlin: [['Berlin', '10115']],
  Brandenburg: [['Potsdam', '14467'], ['Cottbus', '03046']],
  Bremen: [['Bremen', '28195'], ['Bremerhaven', '27568']],
  Hamburg: [['Hamburg', '20095']],
  Hessen: [['Frankfurt am Main', '60311'], ['Wiesbaden', '65183'], ['Kassel', '34117'], ['Darmstadt', '64283'], ['Offenbach am Main', '63065'], ['Maintal', '63477'], ['Hanau', '63450']],
  'Mecklenburg-Vorpommern': [['Rostock', '18055'], ['Schwerin', '19053']],
  Niedersachsen: [['Hannover', '30159'], ['Braunschweig', '38100'], ['Osnabrück', '49074'], ['Oldenburg', '26122'], ['Göttingen', '37073']],
  'Nordrhein-Westfalen': [['Köln', '50667'], ['Düsseldorf', '40213'], ['Dortmund', '44135'], ['Essen', '45127'], ['Duisburg', '47051'], ['Bochum', '44787'], ['Bonn', '53111'], ['Münster', '48143'], ['Bielefeld', '33602'], ['Aachen', '52062']],
  'Rheinland-Pfalz': [['Mainz', '55116'], ['Ludwigshafen am Rhein', '67059'], ['Koblenz', '56068'], ['Trier', '54290']],
  Saarland: [['Saarbrücken', '66111']],
  Sachsen: [['Leipzig', '04109'], ['Dresden', '01067'], ['Chemnitz', '09111']],
  'Sachsen-Anhalt': [['Magdeburg', '39104'], ['Halle (Saale)', '06108']],
  'Schleswig-Holstein': [['Kiel', '24103'], ['Lübeck', '23552'], ['Flensburg', '24937']],
  Thüringen: [['Erfurt', '99084'], ['Jena', '07743']],
};

export const slugify = (s: string) =>
  s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const bundeslaender = Object.keys(raw);
export const orte: Ort[] = Object.entries(raw).flatMap(([land, list]) => list.map(([name, plz]) => ({ slug: slugify(name), name, plz, land })));
export const ortBySlug = new Map(orte.map((o) => [o.slug, o]));
export const orteImLand = (land: string) => orte.filter((o) => o.land === land);
