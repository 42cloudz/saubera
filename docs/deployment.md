# Deployment

Wie bei mondaymustdie: Der Code liegt auf GitHub, gebaut wird auf GitLab, deployt Argo CD.

```
GitHub main ──(Action: mirror-to-gitlab.yml)──▶ GitLab 42cloudz/saubera
                                                   │  .gitlab-ci.yml auf dem Runner "hetzner"
                                                   ├─ build-web:   docker build (Unit-Tests, Typecheck, Build)
                                                   │               + infra/smoke-test.sh, Push nach
                                                   │               registry.gitlab.com/42cloudz/saubera/web:<sha>
                                                   └─ deploy-test: Branch `deploy` = main + neuer Image-Tag
                                                                   (force-push, gehört nur der CI)
Argo CD (k3s) ◀── beobachtet Branch `deploy`, Pfad infra/k8s/overlays/test  →  saubera.42cloudz.com
```

Ein Container (Node 24): Astro rendert die Seiten beim Build vor, `server.mjs` liefert sie aus, nimmt die Formulare an und setzt die Sicherheits-Header. Anfragen und Registrierungen liegen in SQLite unter `/data` (PersistentVolumeClaim `saubera-data`). Deshalb läuft genau ein Pod mit `Recreate`.

## Einmalige Einrichtung

| Schritt | Stand |
|---|---|
| GitHub-Repo `42cloudz/saubera`, privat | offen |
| GitLab-Projekt `42cloudz/saubera`, privat, Runner `hetzner` zugewiesen | offen |
| GitHub-Secret `GITLAB_MIRROR_TOKEN` (GitLab Project Access Token, Maintainer, `write_repository`) | offen |
| GitHub-Runner `mmd-mirror` für dieses Repo: `sudo sh infra/setup-github-runner.sh` auf dem Server, fragt nur nach dem Registrierungs-Token | offen |
| GitLab-Variable `DEPLOY_TOKEN` (Project Access Token `ci-deploy`, Maintainer, `write_repository`, masked, protected) | offen |
| Pull-Secret und Argo-CD-Repo (Deploy-Token mit `read_repository`, `read_registry`) | offen, siehe 1 |
| Secret `saubera-secrets` (Admin-Passwort, Mail) | offen, siehe 2 |
| Argo CD Application anlegen | offen, siehe 3 |
| DNS `saubera.42cloudz.com` | offen, siehe 4 |

### 1. Zugang für den Cluster

GitLab → Settings → Repository → Deploy tokens → Name `k3s`, Scopes `read_repository` und `read_registry`.

```sh
kubectl create namespace saubera

kubectl -n saubera create secret docker-registry gitlab-regcred \
  --docker-server=registry.gitlab.com \
  --docker-username='gitlab+deploy-token-…' \
  --docker-password='<Token>'

argocd repo add https://gitlab.com/42cloudz/saubera.git \
  --username 'gitlab+deploy-token-…' --password '<Token>'
```

Hat Argo CD schon eine Credential-Vorlage für `https://gitlab.com/42cloudz`, entfällt `argocd repo add`.

### 2. Admin und Mail

`/admin` zeigt alle Anfragen, Registrierungen und Rückrufwünsche, passende Reinigungsfirmen pro Anfrage, Status, Premium-Schalter und CSV-Export. Eine Firma erscheint im Verzeichnis, sobald ihr Status „freigeschaltet“ ist. Ohne `ADMIN_PASSWORD` antwortet `/admin` mit 404. Mit `SMTP_URL` und `NOTIFY_EMAIL` kommt zu jedem Eingang eine Mail. Alle Werte sind optional.

```sh
kubectl -n saubera create secret generic saubera-secrets \
  --from-literal=ADMIN_PASSWORD='<langes Passwort>' \
  --from-literal=SMTP_URL='smtps://user:pass@smtp.example.com:465' \
  --from-literal=NOTIFY_EMAIL='team@example.com' \
  --from-literal=MAIL_FROM='Saubera <noreply@example.com>'
```

Der Pod liest das Secret nur beim Start: danach `kubectl -n saubera rollout restart deployment/web`.

### 3. Argo CD Application

Erst anlegen, wenn die erste Pipeline durch ist, vorher gibt es den Branch `deploy` nicht.

```sh
kubectl apply -f infra/argo/project.yaml -f infra/argo/saubera-test.yaml
```

### 4. DNS

```
saubera.42cloudz.com.  A  91.98.5.65
```

Dieselbe IP wie mondaymustdie und gewerbejobs24 (Stand 2026-10). Sobald DNS zeigt, holt cert-manager das Zertifikat `saubera-tls` (ClusterIssuer `letsencrypt-prod`), `http` leitet auf `https` um.

## Später: eigene Domain

Für die echte Domain ein Overlay `infra/k8s/overlays/prod` aus `test` kopieren, Host und Zertifikat ändern, `NOINDEX`, `SEED_DEMO` und den `SITE_URL`-Patch anpassen (auf der echten Seite kein `SEED_DEMO` und kein `DEMO_LOGIN`), eine zweite Application anlegen und in `.gitlab-ci.yml` den sed-Schritt auch auf das neue Overlay anwenden. `SITE_URL` steuert Canonical-Links und Sitemap; die Sitemap-URL in `public/robots.txt` mit anpassen.

## Lokal

```sh
npm ci
npm run dev                         # http://localhost:4321
npm test && npx astro check         # Unit-Tests, Typen
npm run build && ADMIN_PASSWORD=x npm start   # http://localhost:8080, /admin mit admin / x

docker build -t saubera:local .
sh infra/smoke-test.sh saubera:local
```
