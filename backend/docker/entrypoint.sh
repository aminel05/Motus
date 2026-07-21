#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

mkdir -p \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

if [ ! -f .env ]; then
    echo ">>> .env missing, copying from .env.example"
    cp .env.example .env
fi

if [ ! -f vendor/autoload.php ]; then
    echo ">>> vendor/ missing, running composer install"
    composer install --no-interaction --prefer-dist --no-progress
fi

if ! grep -qE '^APP_KEY=base64:.+' .env; then
    echo ">>> APP_KEY empty, generating"
    php artisan key:generate --force
fi

echo ">>> Linking storage and clearing caches"
php artisan storage:link >/dev/null 2>&1 || true
php artisan config:clear >/dev/null 2>&1 || true
php artisan route:clear >/dev/null 2>&1 || true
php artisan view:clear >/dev/null 2>&1 || true

echo ">>> Running database migrations and seeders"
php artisan migrate --seed --force

echo ">>> Starting: $*"
exec "$@"
