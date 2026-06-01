#!/usr/bin/env bash
set -euo pipefail

node --check src/data.js
node --check src/app.js
node scripts/static-check.mjs
