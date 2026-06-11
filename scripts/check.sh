#!/usr/bin/env bash
set -euo pipefail

node --check src/data.js
node --check src/app.js
node --check scripts/static-check.mjs
node --check scripts/build-static.mjs
node --check scripts/browser-smoke.mjs
node scripts/static-check.mjs
if command -v tidy >/dev/null 2>&1; then
  if tidy -v 2>/dev/null | grep -q '31 October 2006'; then
    echo "tidy: skipped; Apple 2006 build does not support HTML5 validation"
  else
    tidy -errors -quiet -utf8 index.html 2>&1 | sed -n '1,120p' || true
  fi
fi
