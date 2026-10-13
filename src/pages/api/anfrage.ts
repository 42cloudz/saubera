import type { APIRoute } from 'astro';
import { insertAnfrage } from '../../lib/db.ts';
import { parseAnfrage } from '../../lib/forms.ts';
import { notify } from '../../lib/notify.ts';
import { handleSubmit } from '../../lib/submit.ts';

export const prerender = false;

export const POST: APIRoute = (ctx) =>
  handleSubmit(ctx, {
    parse: parseAnfrage,
    save: (a) => {
      const id = insertAnfrage(a);
      void notify(`Neue Anfrage #${id}: ${a.firma} (${a.plz})`, { ...a });
    },
    back: '/anfrage',
    thanks: '/danke?typ=anfrage',
  });
