// Mails the team about each new request or sign-up, when SMTP_URL and NOTIFY_EMAIL are set
// (e.g. SMTP_URL=smtps://user:pass@smtp.example.com:465). Without them nothing is sent and the
// entries only show up in /admin. A failed mail never fails the form: the entry is already saved.
import nodemailer from 'nodemailer';

export async function notify(subject: string, fields: Record<string, unknown>): Promise<void> {
  const url = process.env.SMTP_URL;
  const to = process.env.NOTIFY_EMAIL;
  if (!url || !to) return;
  const body = Object.entries(fields)
    .filter(([, v]) => v !== null && v !== '' && v !== undefined)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
    .join('\n');
  try {
    await nodemailer.createTransport(url).sendMail({
      from: process.env.MAIL_FROM ?? to,
      to,
      subject,
      text: `${body}\n\nAlle Einträge: ${process.env.SITE_URL ?? ''}/admin`,
    });
  } catch (err) {
    console.error('notify failed:', (err as Error).message);
  }
}
