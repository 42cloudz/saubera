#!/bin/sh
# Smoke test for the image. GitLab runs it before pushing to the registry.
# Usage: infra/smoke-test.sh <image> [container-name]
# Starts the image read-only like in the cluster (only /data and /tmp writable) and checks health,
# pages, the directory and local pages, the security headers, form posts, the admin login and 404.
set -eu

image="$1"
name="${2:-saubera-smoke-$$}"
docker run -d --name "$name" --read-only --tmpfs /tmp --tmpfs /data:uid=1000,gid=1000 \
  -e ADMIN_PASSWORD=smoke -e NOINDEX=1 -e SEED_DEMO=1 "$image" >/dev/null
trap 'docker rm -f "$name" >/dev/null 2>&1 || true' EXIT

# The slim Node image has no curl or wget, so the checks use Node's fetch inside the container.
get() { docker exec "$name" node -e "
  const [path, opts] = [process.argv[1], JSON.parse(process.argv[2] || '{}')];
  fetch('http://127.0.0.1:8080' + path, { redirect: 'manual', ...opts }).then(async (r) => {
    console.log(r.status);
    for (const [k, v] of r.headers) console.log(k + ': ' + v);
    console.log(await r.text());
  }).catch((e) => { console.error(e.message); process.exit(1); });" "$1" "${2:-}"; }

check() {
  if out="$(get "$2" "${4:-}" 2>&1)" && printf '%s' "$out" | grep -q -- "$3"; then
    echo "ok   $1"
  else
    echo "FAIL $1"
    printf '%s\n' "$out" | head -20
    docker logs "$name" 2>&1 | tail -20
    exit 1
  fi
}

for _ in $(seq 1 30); do
  get /healthz >/dev/null 2>&1 && break
  sleep 0.5
done

check "health check" /healthz ok
check "database" /api/health ok
check "home page with price calculator" / "Was kostet die Reinigung"
check "service page" /leistungen/glasreinigung/ "Glas- und Fensterreinigung"
check "request form" /anfrage/ 'action="/api/anfrage"'
check "provider form" /dienstleister/registrieren/ 'action="/api/dienstleister"'
check "directory with example companies" /firmen "Beispiel"
check "company profile" /firmen/mainblick-gebaeudeservice-beispiel "Rückruf anfordern"
check "local page" /leistungen/bueroreinigung/frankfurt-am-main "Büroreinigung in Frankfurt am Main"
check "local page for a property type" /leistungen/bueroreinigung/arztpraxen/hamburg "für Arztpraxen in Hamburg"
check "unknown place is 404" /leistungen/bueroreinigung/atlantis "^404"
check "imprint" /impressum/ Impressum
check "privacy notice" /datenschutz/ Datenschutzhinweise
check "sitemap" /sitemap-index.xml sitemapindex
check "CSP header" / "content-security-policy: default-src 'self'"
check "noindex header" / "x-robots-tag: noindex"
check "404 page" /gibt-es-nicht "^404"
check "form post" /api/anfrage '"ok":true' '{"method":"POST","headers":{"Origin":"http://127.0.0.1:8080","Accept":"application/json","Content-Type":"application/x-www-form-urlencoded"},"body":"firma=Smoke&ansprechpartner=Test&email=smoke@example.com&plz=22767&leistungen=bueroreinigung&datenschutz=ja"}'
check "request number" /api/anfrage "A-20" '{"method":"POST","headers":{"Origin":"http://127.0.0.1:8080","Accept":"application/json","Content-Type":"application/x-www-form-urlencoded"},"body":"firma=Smoke&ansprechpartner=Test&email=smoke@example.com&plz=60311&leistungen=glasreinigung&wunschfirmen=mainblick-gebaeudeservice-beispiel&datenschutz=ja"}'
check "cross-site post refused" /api/anfrage "^403" '{"method":"POST","headers":{"Origin":"https://evil.example"},"body":"a=b"}'
check "admin needs login" /admin "^401"
check "admin lists the post" /admin "Smoke" '{"headers":{"Authorization":"Basic YWRtaW46c21va2U="}}'
