// Which registered cleaning companies fit a request. Without geodata the region is the postcode
// prefix: German postcodes sharing two leading digits are roughly one region (about 50 km), one digit
// a large area. A company's radius decides how far it is matched. Good enough to shortlist by hand.

export interface MatchRequest {
  plz: string;
  leistungen: string[];
}

export interface MatchProvider {
  id: number;
  plz: string;
  radius_km: number | null;
  leistungen: string[];
  premium: boolean;
}

export function reaches(p: MatchProvider, plz: string): boolean {
  const r = p.radius_km ?? 30;
  if (r >= 300) return true;
  if (r >= 100) return p.plz[0] === plz[0];
  if (r >= 25) return p.plz.slice(0, 2) === plz.slice(0, 2);
  return p.plz.slice(0, 3) === plz.slice(0, 3);
}

/** Matching providers, best first: more shared services first, premium listings ahead on a tie. */
export function match<P extends MatchProvider>(req: MatchRequest, providers: P[]): P[] {
  return providers
    .map((p) => ({ p, shared: p.leistungen.filter((l) => req.leistungen.includes(l)).length }))
    .filter(({ p, shared }) => shared > 0 && reaches(p, req.plz))
    .sort((a, b) => b.shared - a.shared || Number(b.p.premium) - Number(a.p.premium) || a.p.id - b.p.id)
    .map(({ p }) => p);
}
