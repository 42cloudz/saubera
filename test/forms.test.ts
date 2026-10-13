import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isBot, parseAnfrage, parseDienstleister } from '../src/lib/forms.ts';

const fd = (o: Record<string, string | string[]>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) for (const x of [v].flat()) f.append(k, x);
  return f;
};
const base = { firma: 'Kanzlei Berger', ansprechpartner: 'A. Berger', email: 'a@berger.de', plz: '22767', leistungen: ['bueroreinigung', 'gibtsnicht'], datenschutz: 'ja' };

test('valid request keeps known services only', () => {
  const r = parseAnfrage(fd({ ...base, flaeche_m2: '420 m²' }));
  assert.ok(r.ok);
  assert.deepEqual(r.value.leistungen, ['bueroreinigung']);
  assert.equal(r.value.flaeche_m2, 420);
});

test('missing fields and consent are reported', () => {
  const r = parseAnfrage(fd({ firma: '', email: 'kein', plz: '123', leistungen: 'x' }));
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.errors.length, 6);
});

test('provider website gets a scheme, premium flag is read', () => {
  const r = parseDienstleister(fd({ ...base, website: 'www.x.de', premium: 'ja', radius_km: '50' }));
  assert.ok(r.ok);
  assert.equal(r.value.website, 'https://www.x.de');
  assert.equal(r.value.premium, true);
  assert.equal(r.value.radius_km, 50);
});

test('honeypot detects bots', () => {
  assert.equal(isBot(fd({ website_url: 'spam' })), true);
  assert.equal(isBot(fd({})), false);
});
