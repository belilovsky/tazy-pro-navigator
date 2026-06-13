#!/usr/bin/env bash
set -euo pipefail

URL="${TAZY_NAVIGATOR_URL:-https://tazy.pro/}"
PLAYWRIGHT_MODULE="${PLAYWRIGHT_MODULE:-}"

curl -fsSI "$URL" | grep -E '^HTTP/|^content-security-policy:|^x-frame-options:|^x-content-type-options:|^referrer-policy:' -i
curl -fsSL "$URL" | grep -q 'TAZY.PRO — навигатор проекта'
curl -fsSL "$URL" | grep -q 'https://tazy.pro/assets/generated/overview-og.jpg'
if curl -fsSL "$URL" | grep -q 'https://tazy.pro/assets/generated/overview-hero.png'; then
  echo "verify-live: stale Open Graph image points to overview-hero.png" >&2
  exit 1
fi
manifest_body="$(curl -fsSL "${URL%/}/manifest.webmanifest")"
printf '%s\n' "$manifest_body" | grep -q '"id": "https://tazy.pro/"'
printf '%s\n' "$manifest_body" | grep -q '"/assets/icons/icon-192.png"'
printf '%s\n' "$manifest_body" | grep -q '"/assets/icons/icon-512.png"'
curl -fsSL "${URL%/}/robots.txt" | grep -q 'Disallow: /'

og_headers="$(curl -fsSI "${URL%/}/assets/generated/overview-og.jpg")"
printf '%s\n' "$og_headers" | grep -E '^HTTP/|^content-type:|^content-length:' -i
printf '%s\n' "$og_headers" | grep -qi '^content-type: image/jpeg'
og_size="$(printf '%s\n' "$og_headers" | awk 'BEGIN { IGNORECASE = 1 } /^content-length:/ { gsub("\r", "", $2); print $2; exit }')"
if [[ -z "$og_size" || "$og_size" -gt $((350 * 1024)) ]]; then
  echo "verify-live: overview-og.jpg is missing content-length or exceeds 350 KB (${og_size:-unknown})" >&2
  exit 1
fi

for icon_path in assets/icons/apple-touch-icon.png assets/icons/icon-192.png assets/icons/icon-512.png; do
  icon_headers="$(curl -fsSI "${URL%/}/${icon_path}")"
  printf '%s\n' "$icon_headers" | grep -E '^HTTP/|^content-type:' -i
  printf '%s\n' "$icon_headers" | grep -qi '^content-type: image/png'
done

if [[ -n "$PLAYWRIGHT_MODULE" ]]; then
  TAZY_NAVIGATOR_URL="$URL" PLAYWRIGHT_MODULE="$PLAYWRIGHT_MODULE" node scripts/browser-smoke.mjs
fi

echo "verify-live: ok ${URL}"
