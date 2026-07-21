#!/usr/bin/env bash
set -euo pipefail

cd /app

if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
    if [ -f package-lock.json ]; then
        echo ">>> node_modules missing, running npm ci"
        npm ci --no-audit --no-fund --loglevel=error
    else
        echo ">>> node_modules missing, running npm install"
        npm install --no-audit --no-fund --loglevel=error
    fi
else
    echo ">>> node_modules present, skipping install"
fi

echo ">>> Starting: $*"
exec "$@"
