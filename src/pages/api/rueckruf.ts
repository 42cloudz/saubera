import type { APIRoute } from 'astro';
import { getDb, insertRueckruf } from '../../lib/db.ts';
import { parseRueckruf } from '../../lib/forms.ts';
import { notify } from '../../lib/notify.ts';
import { handleSubmit } from '../../lib/submit.ts';

export const prerender = false;

// Callback requests for premium partners. Saubera passes them on, so the team sees every one.
export const POST: APIRoute = (ctx) =>
  handleSubmit(ctx, {
    parse: parseRueckruf,
    save: (r) => {
      const firma = getDb().prepare("SELECT firma FROM dienstleister WHERE id = ? AND status = 'freigeschaltet'").get(r.dienstleister_id) as { firma: string } | undefined;
      if (!firma) return '/danke?typ=rueckruf';
      const id = insertRueckruf(r);
      void notify(`Rückrufwunsch #${id} für ${firma.firma}`, { ...r, fuer: firma.firma });
      return '/danke?typ=rueckruf';
    },
    back: '/firmen',
    thanks: '/danke?typ=rueckruf',
  });
