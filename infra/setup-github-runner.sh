#!/bin/sh
# Registers a GitHub runner for 42cloudz/saubera on the Hetzner server, next to the one for
# mondaymustdie. It only runs .github/workflows/mirror-to-gitlab.yml (label mmd-mirror).
#
# Usage, on the server:  sudo sh setup-github-runner.sh
# The script asks for the registration token: GitHub > 42cloudz/saubera > Settings > Actions >
# Runners > New self-hosted runner, the value after --token (valid for one hour).
# Running it again is safe: an installed runner is only restarted.
set -eu

REPO="42cloudz/saubera"
LABEL="mmd-mirror"
NAME="hetzner-saubera-mirror"
RUNNER_USER="gh-runner"
DIR="/home/$RUNNER_USER/actions-runner-saubera"

[ "$(id -u)" -eq 0 ] || { echo "Bitte mit sudo starten: sudo sh $0"; exit 1; }
for cmd in curl tar git; do
  command -v "$cmd" >/dev/null || { echo "$cmd fehlt: sudo apt-get install -y $cmd"; exit 1; }
done

case "$(uname -m)" in
  x86_64) ARCH=x64 ;;
  aarch64 | arm64) ARCH=arm64 ;;
  *) echo "Unbekannte Architektur $(uname -m)"; exit 1 ;;
esac

if ! id "$RUNNER_USER" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "$RUNNER_USER"
  echo "Benutzer $RUNNER_USER angelegt."
fi

if [ -f "$DIR/.runner" ]; then
  echo "Runner ist schon eingerichtet ($DIR), starte den Dienst neu."
  cd "$DIR" && ./svc.sh stop >/dev/null 2>&1 || true
  ./svc.sh start
  exit 0
fi

TOKEN="${1:-}"
if [ -z "$TOKEN" ]; then
  printf 'Registrierungs-Token von GitHub: '
  stty -echo 2>/dev/null || true
  read -r TOKEN
  stty echo 2>/dev/null || true
  echo
fi
[ -n "$TOKEN" ] || { echo "Kein Token eingegeben."; exit 1; }

# Newest runner release and its checksum from the GitHub API.
release="$(curl -fsSL https://api.github.com/repos/actions/runner/releases/latest)"
VERSION="$(printf '%s' "$release" | grep -o '"tag_name": *"v[^"]*"' | head -1 | sed 's/.*"v\([^"]*\)"/\1/')"
[ -n "$VERSION" ] || { echo "Konnte die Runner-Version nicht lesen."; exit 1; }
FILE="actions-runner-linux-$ARCH-$VERSION.tar.gz"
SHA=""
if command -v python3 >/dev/null; then
  SHA="$(printf '%s' "$release" | python3 -c '
import json, sys
f = sys.argv[1]
for a in json.load(sys.stdin).get("assets", []):
    if a.get("name") == f and str(a.get("digest", "")).startswith("sha256:"):
        print(a["digest"][7:])
' "$FILE")"
fi
echo "Lade GitHub-Runner $VERSION ($ARCH) ..."

mkdir -p "$DIR"
cd "$DIR"
curl -fsSL -o "$FILE" "https://github.com/actions/runner/releases/download/v$VERSION/$FILE"
if [ -n "$SHA" ]; then
  echo "$SHA  $FILE" | sha256sum -c - >/dev/null || { echo "Prüfsumme stimmt nicht, Abbruch."; exit 1; }
  echo "Prüfsumme ok."
else
  echo "Keine Prüfsumme gefunden, weiter ohne Prüfung."
fi
tar xzf "$FILE"
rm -f "$FILE"
chown -R "$RUNNER_USER:$RUNNER_USER" "$DIR"

# Libraries the runner needs (only installs what is missing).
./bin/installdependencies.sh

su "$RUNNER_USER" -c "cd '$DIR' && ./config.sh --unattended --url 'https://github.com/$REPO' --token '$TOKEN' --name '$NAME' --labels '$LABEL' --work _work --replace"

./svc.sh install "$RUNNER_USER"
./svc.sh start

echo
echo "Fertig. In GitHub ($REPO > Settings > Actions > Runners) steht jetzt $NAME als Idle."
echo "Test: Actions > Mirror to GitLab > Run workflow."
