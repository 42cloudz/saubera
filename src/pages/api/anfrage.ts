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
      const { ref } = insertAnfrage(a);
      void notify(`Neue Anfrage ${ref}: ${a.firma} (${a.plz})`, { ...a });
      return `/danke?typ=anfrage&ref=${ref}`;
    },
    back: '/anfrage',
    thanks: '/danke?typ=anfrage',
  });
