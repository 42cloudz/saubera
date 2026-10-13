// The bookmark list ("Merkliste"): companies a visitor wants to ask for offers. It lives only in
// this browser (localStorage), needs no account, and is sent along with a request.
const KEY = 'saubera-merkliste';

export function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* private mode: the list just does not persist */
  }
  sync();
}

export function sync() {
  const list = read();
  for (const el of document.querySelectorAll<HTMLElement>('[data-merk-count]')) {
    el.textContent = String(list.length);
    el.hidden = list.length === 0;
  }
  for (const b of document.querySelectorAll<HTMLButtonElement>('button[data-merk]')) {
    const on = list.includes(b.dataset.merk!);
    b.setAttribute('aria-pressed', String(on));
    const label = b.querySelector('.merk-label');
    if (label) label.textContent = on ? 'Gemerkt' : 'Merken';
    b.title = on ? 'Von der Merkliste nehmen' : 'Auf die Merkliste';
  }
}

document.addEventListener('click', (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>('button[data-merk]');
  if (!b) return;
  const slug = b.dataset.merk!;
  const list = read();
  write(list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug]);
});

sync();
