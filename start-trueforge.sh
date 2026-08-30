#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd -- "$(dirname -- "$0")" && pwd)"
mkdir -p "$PROJECT_ROOT/.trueforge"

HOST=127.0.0.1 \
SQLITE_PATH="${SQLITE_PATH:-$PROJECT_ROOT/.trueforge/db.sqlite}" \
node /Users/manishikaagarwal/Documents/Codex/2026-08-25/hi/work/npm-cache/_npx/efcb13bb8fe8f852/node_modules/@truefoundry/trueforge/dist/cli.js
