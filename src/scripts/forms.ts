// Progressive enhancement for the forms: post with fetch, show errors inline and keep the input.
// Without JavaScript the forms post normally and the endpoint redirects (src/lib/submit.ts).
// Also preselects a service from ?leistung=… and shows errors passed back in ?fehler=….

for (const form of document.querySelectorAll<HTMLFormElement>('form[data-enhance]')) {
  const box = form.querySelector<HTMLElement>('.form-errors');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const params = new URLSearchParams(location.search);

  const showErrors = (errors: string[]) => {
    if (!box) return;
    box.textContent = errors.join(' ');
    box.classList.toggle('show', errors.length > 0);
    if (errors.length) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const preset = params.get('leistung');
  if (preset) {
    const input = form.querySelector<HTMLInputElement>(`input[name="leistungen"][value="${CSS.escape(preset)}"]`);
    if (input) input.checked = true;
  }
  const fehler = params.get('fehler');
  if (fehler) showErrors([fehler]);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.querySelector('input[name="leistungen"]:checked')) {
      showErrors(['Bitte wählen Sie mindestens eine Leistung.']);
      return;
    }
    const label = button?.textContent;
    if (button) {
      button.disabled = true;
      button.textContent = 'Wird gesendet …';
    }
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      const data = (await res.json()) as { ok: boolean; errors?: string[]; redirect?: string };
      if (data.ok && data.redirect) {
        location.href = data.redirect;
        return;
      }
      showErrors(data.errors ?? ['Das hat nicht geklappt. Bitte versuchen Sie es erneut.']);
    } catch {
      showErrors(['Keine Verbindung zum Server. Bitte versuchen Sie es erneut.']);
    }
    if (button) {
      button.disabled = false;
      button.textContent = label ?? 'Absenden';
    }
  });
}
