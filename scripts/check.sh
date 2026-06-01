#!/usr/bin/env bash
set -euo pipefail

node --check src/data.js
node --check src/app.js
node scripts/static-check.mjs
if command -v tidy >/dev/null 2>&1; then
  tidy -errors -quiet index.html 2>&1 | sed -n '1,120p' || true
fi
