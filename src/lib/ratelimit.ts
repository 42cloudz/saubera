// A small in-memory limit per client address for the form endpoints: at most LIMIT posts per
// WINDOW. Behind Traefik the client address is the first entry of X-Forwarded-For.
const WINDOW = 10 * 60 * 1000;
const LIMIT = 8;
const hits = new Map<string, number[]>();

export function clientAddress(request: Request, fallback: string): string {
  const xff = request.headers.get('x-forwarded-for');
  return xff?.split(',')[0]?.trim() || fallback;
}

export function allow(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW);
  if (recent.length >= LIMIT) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) {
    for (const [k, ts] of hits) if (ts.every((t) => now - t >= WINDOW)) hits.delete(k);
  }
  return true;
}
