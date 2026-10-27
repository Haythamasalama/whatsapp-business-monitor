#!/bin/sh
# Installs WhatsApp Business Monitor with Docker, or updates an existing install.
#
#   curl -fsSL https://raw.githubusercontent.com/Haythamasalama/whatsapp-business-monitor/main/install.sh | sh
#   curl -fsSL …/install.sh | sh -s -- --server     # reachable from other computers, e.g. on a server
#
# Settings, all optional: WHATSAPP_MANAGER_DIR (default ~/whatsapp-business-monitor), WHATSAPP_MANAGER_PORT (3210)
# and WHATSAPP_MANAGER_VERSION (a release such as 0.2.2; default: always the latest).
set -eu

REPO="Haythamasalama/whatsapp-business-monitor"
DIR="${WHATSAPP_MANAGER_DIR:-$HOME/whatsapp-business-monitor}"
PORT="${WHATSAPP_MANAGER_PORT:-3210}"
BIND="127.0.0.1"

for arg in "$@"; do
  case "$arg" in
    --server) BIND="0.0.0.0" ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

command -v docker >/dev/null 2>&1 || { echo "Docker is needed: https://docs.docker.com/get-docker/" >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "Docker Compose v2 is needed: https://docs.docker.com/compose/install/" >&2; exit 1; }

# The compose file comes from the latest release, so it always matches the images published so far.
TAG="$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p' | head -n 1)"
TAG="${TAG:-main}"

mkdir -p "$DIR"
cd "$DIR"
curl -fsSL "https://raw.githubusercontent.com/$REPO/$TAG/compose.yaml" -o compose.yaml

# Keeps whatever an earlier install wrote, and only sets what is missing.
touch .env
set_default() {
  grep -q "^$1=" .env || printf '%s=%s\n' "$1" "$2" >> .env
}
set_default WHATSAPP_MANAGER_BIND "$BIND"
set_default WHATSAPP_MANAGER_PORT "$PORT"

# The secret the app's "Update now" button sends to the updater. Only this computer's Docker sees it.
set_default WHATSAPP_MANAGER_UPDATE_TOKEN "$(od -An -tx1 -N32 /dev/urandom | tr -d ' \n')"
chmod 600 .env

# The database lives next to this file.
set_default WHATSAPP_MANAGER_DATA "$DIR/data"
DATA="$(sed -n 's/^WHATSAPP_MANAGER_DATA=//p' .env | tail -n 1)"
mkdir -p "$DATA"

# The app writes its database as the folder's owner; as root, the folder goes to the image's own user.
if [ "$(id -u)" = "0" ]; then
  chown 1000:1000 "$DATA"
  set_default WHATSAPP_MANAGER_UID 1000
  set_default WHATSAPP_MANAGER_GID 1000
else
  set_default WHATSAPP_MANAGER_UID "$(id -u)"
  set_default WHATSAPP_MANAGER_GID "$(id -g)"
fi
[ -n "${WHATSAPP_MANAGER_VERSION:-}" ] && { sed -i.bak '/^WHATSAPP_MANAGER_VERSION=/d' .env && rm -f .env.bak; printf 'WHATSAPP_MANAGER_VERSION=%s\n' "$WHATSAPP_MANAGER_VERSION" >> .env; }

docker compose pull

docker compose up -d --remove-orphans
CONTAINER="$(sed -n 's/^ *container_name: *//p' compose.yaml | head -n 1)"

printf 'Waiting for the app'
for _ in $(seq 1 30); do
  state="$(docker inspect --format '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || true)"
  [ "$state" = "healthy" ] && break
  printf '.'
  sleep 2
done
echo

PORT_IN_USE="$(sed -n 's/^WHATSAPP_MANAGER_PORT=//p' .env | tail -n 1)"
echo "WhatsApp Business Monitor is running."
if grep -q '^WHATSAPP_MANAGER_BIND=0.0.0.0' .env; then
  echo "Open http://<this server's address>:$PORT_IN_USE to finish the setup."
  echo "Put it behind HTTPS (a reverse proxy) before you use it over the internet."
else
  echo "Open http://localhost:$PORT_IN_USE to finish the setup."
fi
# A fresh install asks for the code it printed to its log, so nobody else can claim it first.
CODE="$(docker logs "$CONTAINER" 2>&1 | sed -n 's/.*\[setup\] Setup code: \([0-9]*\).*/\1/p' | tail -n 1)"
[ -n "$CODE" ] && echo "Setup code: $CODE"
echo "Files: $DIR · updates install themselves · or press \"Update now\" in the app."
