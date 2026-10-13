// Live-Spanne für den Richtpreis-Rechner (src/components/PriceCalc.astro).
import { richtpreis, spanneText } from '../lib/preise.ts';

type Daten = Record<string, { preis: { min: number; max: number; einheit: 'm²' | 'Fahrzeug' }; turnus: string }>;

for (const form of document.querySelectorAll<HTMLFormElement>('form.calc')) {
  const daten = JSON.parse(form.dataset.preise ?? '{}') as Daten;
  const leistung = form.querySelector<HTMLSelectElement>('[name="leistung"]')!;
  const menge = form.querySelector<HTMLInputElement>('[name="flaeche_m2"]')!;
  const turnus = form.querySelector<HTMLSelectElement>('[name="turnus"]')!;
  const label = form.querySelector<HTMLLabelElement>('label[for="calc-menge"]')!;
  const out = form.querySelector<HTMLOutputElement>('output')!;
  let einheit = daten[leistung.value]?.preis.einheit;

  const update = () => {
    const d = daten[leistung.value];
    if (!d) return;
    const s = richtpreis(d, Number(menge.value), turnus.value);
    out.value = s ? spanneText(s) : '–';
  };

  leistung.addEventListener('change', () => {
    const d = daten[leistung.value];
    if (!d) return;
    turnus.value = d.turnus;
    if (d.preis.einheit !== einheit) {
      einheit = d.preis.einheit;
      label.textContent = einheit === 'Fahrzeug' ? label.dataset.labelFahrzeug! : label.dataset.labelM2!;
      menge.value = einheit === 'Fahrzeug' ? '10' : '400';
    }
    update();
  });
  menge.addEventListener('input', update);
  turnus.addEventListener('change', update);
}
