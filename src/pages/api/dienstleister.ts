import type { APIRoute } from 'astro';
import { insertDienstleister } from '../../lib/db.ts';
import { parseDienstleister } from '../../lib/forms.ts';
import { notify } from '../../lib/notify.ts';
import { handleSubmit } from '../../lib/submit.ts';

export const prerender = false;

export const POST: APIRoute = (ctx) =>
  handleSubmit(ctx, {
    parse: parseDienstleister,
    save: (d) => {
      const id = insertDienstleister(d);
      void notify(`Neuer Dienstleister #${id}: ${d.firma} (${d.plz})`, { ...d });
    },
    back: '/dienstleister/registrieren',
    thanks: '/danke?typ=dienstleister',
  });
