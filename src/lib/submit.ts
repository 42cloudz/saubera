// Shared handling for the two form endpoints. The pages post with fetch and get JSON back
// (src/scripts/forms.ts); without JavaScript the browser posts normally and gets a redirect.
import type { APIContext } from 'astro';
import { isBot, type Result } from './forms.ts';
import { allow, clientAddress } from './ratelimit.ts';

export async function handleSubmit<T>(
  ctx: APIContext,
  opts: { parse: (f: FormData) => Result<T>; save: (v: T) => Promise<string | void> | string | void; back: string; thanks: string },
): Promise<Response> {
  const wantsJson = (ctx.request.headers.get('accept') ?? '').includes('application/json');
  const reply = (status: number, body: { ok: boolean; errors?: string[]; redirect?: string }) => {
    if (wantsJson) return Response.json(body, { status });
    const to = body.ok ? body.redirect! : `${opts.back}?fehler=${encodeURIComponent((body.errors ?? []).join(' '))}`;
    return new Response(null, { status: 303, headers: { Location: to } });
  };

  let form: FormData;
  try {
    form = await ctx.request.formData();
  } catch {
    return reply(400, { ok: false, errors: ['Das Formular konnte nicht gelesen werden.'] });
  }
  // Bots get the same answer as people, so they learn nothing.
  if (isBot(form)) return reply(200, { ok: true, redirect: opts.thanks });
  if (!allow(clientAddress(ctx.request, ctx.clientAddress))) {
    return reply(429, { ok: false, errors: ['Zu viele Anfragen in kurzer Zeit. Bitte versuchen Sie es später erneut.'] });
  }
  const parsed = opts.parse(form);
  if (!parsed.ok) return reply(422, { ok: false, errors: parsed.errors });
  // save may return a more specific thank-you URL, e.g. with the request number.
  const thanks = (await opts.save(parsed.value)) || opts.thanks;
  return reply(200, { ok: true, redirect: thanks });
}
