#!/bin/sh
set -e

echo "Starting Laravel backend..."

if [ ! -f .env ]; then
  cp .env.example .env
fi

composer install --no-interaction --prefer-dist

php artisan key:generate --force

php artisan jwt:secret --force || true

php artisan migrate --seed --force || true

php artisan serve --host=0.0.0.0 --port=8000