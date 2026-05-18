#!/bin/sh
set -e

echo "Starting Laravel backend..."

composer install --no-interaction --prefer-dist --optimize-autoloader

php artisan optimize:clear

php artisan migrate --seed --force || true

php artisan config:cache

PORT=${PORT:-8000}

php artisan serve --host=0.0.0.0 --port=$PORT
