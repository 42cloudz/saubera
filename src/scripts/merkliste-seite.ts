import { read, sync } from './merkliste.ts';

const root = document.querySelector<HTMLElement>('[data-merkliste]');

async function render() {
  if (!root) return;
  const slugs = read();
  const items = root.querySelector('.merk-items')!;
  const actions = root.querySelector<HTMLElement>('.merk-actions')!;
  const empty = root.querySelector<HTMLElement>('.merk-empty')!;
  items.replaceChildren();
  let firmen: { slug: string; firma: string; ort: string | null; telefon: string | null; premium: boolean }[] = [];
  if (slugs.length) {
    try {
      firmen = await (await fetch(`/api/firmen?slugs=${encodeURIComponent(slugs.join(','))}`)).json();
    } catch {
      /* offline: show nothing */
    }
  }
  for (const f of firmen) {
    const li = document.createElement('li');
    if (f.premium) li.className = 'is-premium';
    const a = document.createElement('a');
    a.href = `/firmen/${f.slug}`;
    a.className = 'firma-name';
    a.textContent = f.firma;
    const meta = document.createElement('span');
    meta.className = 'firma-meta';
    meta.textContent = [f.ort, f.telefon].filter(Boolean).join(' · ');
    const rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'btn btn-ghost merk-remove';
    rm.dataset.merk = f.slug;
    rm.textContent = 'Entfernen';
    li.append(a, meta, rm);
    items.append(li);
  }
  empty.hidden = firmen.length > 0;
  actions.hidden = firmen.length === 0;
  root.querySelector<HTMLAnchorElement>('[data-merk-anfrage]')!.href = `/anfrage?firmen=${firmen.map((f) => f.slug).join(',')}`;
  sync();
}

// merkliste.ts toggles the entry on click; re-render after it has.
document.addEventListener('click', (e) => {
  if ((e.target as Element).closest('.merk-remove')) setTimeout(render, 0);
});
void render();
