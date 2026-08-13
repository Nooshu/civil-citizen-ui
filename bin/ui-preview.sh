#!/usr/bin/env bash
# Rebuild UI Preview (webpack assets in Docker), free ports, start stack, print URL.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="${ROOT}/compose/ui-preview.yml"
PREVIEW_URL="http://localhost:3001/ui-preview"
APP_PORT=3001
WIREMOCK_PORT=1111

kill_port() {
  local port="$1"
  if ! command -v lsof >/dev/null 2>&1; then
    return 0
  fi
  local pids
  pids="$(lsof -tiTCP:"${port}" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -z "${pids}" ]]; then
    return 0
  fi
  echo "Stopping process(es) on port ${port}: ${pids}"
  # shellcheck disable=SC2086
  kill ${pids} 2>/dev/null || true
  sleep 1
  pids="$(lsof -tiTCP:"${port}" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "${pids}" ]]; then
    # shellcheck disable=SC2086
    kill -9 ${pids} 2>/dev/null || true
  fi
}

echo "→ Stopping previous UI Preview / local servers on ${APP_PORT} and ${WIREMOCK_PORT}…"
docker compose -f "${COMPOSE_FILE}" down --remove-orphans >/dev/null 2>&1 || true
# Orphaned nodemon/ts-node can keep retrying Redis after losing the port (ioredis AggregateError spam).
pkill -f 'nodemon.*nodemon\.json' 2>/dev/null || true
pkill -f 'ts-node.*src/main/server\.ts' 2>/dev/null || true
sleep 1
kill_port "${APP_PORT}"
kill_port "${WIREMOCK_PORT}"

echo "→ Rebuilding (install + webpack assets) and starting containers…"
docker compose -f "${COMPOSE_FILE}" up --build -d

echo "→ Waiting for ${PREVIEW_URL}…"
ready=0
for _ in $(seq 1 90); do
  if curl -sf "${PREVIEW_URL}" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 2
done

echo ""
if [[ "${ready}" -eq 1 ]]; then
  cat <<EOF
╔══════════════════════════════════════════╗
║  UI Preview ready                        ║
║  ${PREVIEW_URL}
║                                          ║
║  Stop: yarn start:ui-preview:down        ║
╚══════════════════════════════════════════╝
EOF
else
  echo "UI Preview did not become ready in time." >&2
  echo "Check: docker compose -f compose/ui-preview.yml logs" >&2
  echo "Expected URL: ${PREVIEW_URL}" >&2
  exit 1
fi
