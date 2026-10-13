# Saubera

Das B2B-Portal für Gebäude- und Objektreinigung: Unternehmen beschreiben ihr Objekt in einem strukturierten Leistungsverzeichnis und bekommen vergleichbare Angebote geprüfter Reinigungsfirmen. Reinigungsfirmen registrieren sich kostenlos.

- **Stack:** Astro 7 (vorgerenderte Seiten) + `@astrojs/node`, ein Node-24-Container, SQLite über `node:sqlite` in `/data`.
- **Seiten:** `src/pages`, Leistungen in `src/data/leistungen.ts`, Betreiberangaben für Impressum und Datenschutz in `src/data/site.ts`.
- **Formulare:** `POST /api/anfrage` und `POST /api/dienstleister` (`src/lib/forms.ts` prüft, `src/lib/db.ts` speichert, `src/lib/notify.ts` mailt).
- **Verzeichnis:** `/firmen` (Suche nach Leistung, PLZ oder Ort, Name), Profile `/firmen/<slug>`, Merkliste im Browser, Rückruf für Premiumpartner. Firmen erscheinen erst, wenn sie im Admin auf „freigeschaltet“ stehen.
- **Ortsseiten:** `/leistungen/<leistung>/<ort>` und `/leistungen/<leistung>/<objektart>/<ort>` (Orte in `src/data/orte.ts`, Objektarten in `src/data/objekte.ts`).
- **Admin:** `/admin` mit HTTP Basic Auth (`ADMIN_PASSWORD`), Matching nach PLZ-Region und Leistung in `src/lib/matching.ts`.
- **Deployment:** [docs/deployment.md](docs/deployment.md).

| Variable | Zweck |
|---|---|
| `PORT` | Port, Standard 8080 |
| `DATA_DIR` | Ordner für `saubera.db`, im Image `/data` |
| `ADMIN_PASSWORD`, `ADMIN_USER` | Login für `/admin` (User Standard `admin`); ohne Passwort ist `/admin` aus |
| `SMTP_URL`, `NOTIFY_EMAIL`, `MAIL_FROM` | Mail bei jedem Eingang, optional |
| `NOINDEX=1` | `X-Robots-Tag: noindex` für Testdomains |
| `SEED_DEMO=1` | Legt erfundene, als „Beispiel“ markierte Firmen im Verzeichnis an (nur Test) |
| `SITE_URL` | Basis-URL für Canonical und Sitemap (Build-Zeit) |
