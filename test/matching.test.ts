import assert from 'node:assert/strict';
import { test } from 'node:test';
import { match } from '../src/lib/matching.ts';

const p = (id: number, plz: string, radius_km: number, leistungen: string[], premium = false) => ({ id, plz, radius_km, leistungen, premium });

test('matches by region and service, best first', () => {
  const providers = [
    p(1, '22041', 30, ['bueroreinigung']),
    p(2, '22765', 30, ['bueroreinigung', 'glasreinigung']),
    p(3, '80331', 30, ['bueroreinigung']),
    p(4, '20095', 15, ['bueroreinigung']),
    p(5, '10115', 300, ['bueroreinigung'], true),
    p(6, '22767', 30, ['fahrzeugreinigung']),
  ];
  const ids = match({ plz: '22767', leistungen: ['bueroreinigung', 'glasreinigung'] }, providers).map((x) => x.id);
  assert.deepEqual(ids, [2, 5, 1]);
});

import { richtpreis, spanneText } from '../src/lib/preise.ts';

test('richtpreis: monthly range for recurring, one-time otherwise', () => {
  const l = { preis: { min: 0.1, max: 0.2, einheit: 'm²' as const } };
  const m = richtpreis(l, 400, 'Wöchentlich')!;
  assert.equal(m.proMonat, true);
  assert.equal(spanneText(m), '170 € – 350 € im Monat');
  assert.equal(spanneText(richtpreis(l, 400, 'Einmalig')!), '40 € – 80 € einmalig');
  assert.equal(richtpreis(l, 0, 'Wöchentlich'), null);
});
