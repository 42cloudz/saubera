// Collapsible navigation pane of the customer area. Wide screens: the pane shrinks to an icon rail
// and the choice is kept in a cookie. Small screens: the pane slides in over the page.
const app = document.querySelector<HTMLElement>('.app');
const toggle = document.querySelector<HTMLButtonElement>('.pane-toggle');
const backdrop = document.querySelector<HTMLElement>('.pane-backdrop');
const small = window.matchMedia('(max-width: 900px)');

function setOpen(open: boolean) {
  app?.classList.toggle('is-open', open);
  if (backdrop) backdrop.hidden = !open;
  toggle?.setAttribute('aria-expanded', String(open));
}

toggle?.addEventListener('click', () => {
  if (!app) return;
  if (small.matches) {
    setOpen(!app.classList.contains('is-open'));
    return;
  }
  const collapsed = app.classList.toggle('is-collapsed');
  toggle.setAttribute('aria-expanded', String(!collapsed));
  document.cookie = `sb_pane=${collapsed ? 'c' : 'o'}; path=/kunde; max-age=31536000; samesite=lax`;
});
backdrop?.addEventListener('click', () => setOpen(false));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
small.addEventListener('change', () => setOpen(false));
if (small.matches) toggle?.setAttribute('aria-expanded', 'false');
