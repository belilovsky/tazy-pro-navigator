#!/usr/bin/env bash
set -euo pipefail

REMOTE_HOST="${TAZY_REMOTE_HOST:-root@62.72.32.112}"
REMOTE_BASE="${TAZY_REMOTE_BASE:-/var/www/tazy.pro}"
RELEASE_ID="$(date -u +%Y%m%dT%H%M%SZ)"
REMOTE_RELEASE="${REMOTE_BASE}/releases/${RELEASE_ID}"
LOCAL_DIST="dist/tazy-pro-navigator/"

cd "$(dirname "$0")/.."

./scripts/check.sh
node scripts/build-static.mjs

ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$REMOTE_HOST" \
  "set -e; mkdir -p '$REMOTE_RELEASE' '${REMOTE_BASE}/releases' '${REMOTE_BASE}/shared'"

rsync -az --delete \
  -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
  "$LOCAL_DIST" "$REMOTE_HOST:$REMOTE_RELEASE/"

ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$REMOTE_HOST" \
  "set -e; chown -R www-data:www-data '$REMOTE_RELEASE'; ln -sfn '$REMOTE_RELEASE' '${REMOTE_BASE}/current'; nginx -t; systemctl reload nginx"

echo "deployed https://tazy.pro/ -> ${REMOTE_RELEASE}"
