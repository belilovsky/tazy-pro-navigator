#!/usr/bin/env bash
set -euo pipefail

URL="${TAZY_NAVIGATOR_URL:-https://tazy.pro/}"
PLAYWRIGHT_MODULE="${PLAYWRIGHT_MODULE:-}"

curl -fsSI "$URL" | grep -E '^HTTP/|^content-security-policy:|^x-frame-options:|^x-content-type-options:|^referrer-policy:' -i
curl -fsSL "$URL" | grep -q 'TAZY.PRO — навигатор проекта'
curl -fsSL "${URL%/}/manifest.webmanifest" | grep -q '"id": "https://tazy.pro/"'
curl -fsSL "${URL%/}/robots.txt" | grep -q 'Disallow: /'

if [[ -n "$PLAYWRIGHT_MODULE" ]]; then
  TAZY_NAVIGATOR_URL="$URL" PLAYWRIGHT_MODULE="$PLAYWRIGHT_MODULE" node scripts/browser-smoke.mjs
fi

echo "verify-live: ok ${URL}"
