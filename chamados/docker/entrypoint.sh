#!/bin/sh
set -e

cd /var/www/html
echo "═══ Chamados Backend - Inicialização ═══"

# ─── Create .env if missing ────────────────────────────────────────────────
if [ ! -f .env ]; then
  echo "[INFO] Criando arquivo .env..."
  cp .env.example .env
fi

# ─── Ensure APP_KEY exists in .env ─────────────────────────────────────────
if ! grep -q '^APP_KEY=base64:' .env; then
  echo "[INFO] Gerando APP_KEY..."
  php artisan key:generate --force
fi

# ─── Fix permissions ───────────────────────────────────────────────────────
echo "[INFO] Ajustando permissões..."
chown -R www-data:www-data storage bootstrap/cache database 2>/dev/null || true
chmod -R 775 storage bootstrap/cache database 2>/dev/null || true

# ─── Ensure SQLite DB exists ───────────────────────────────────────────────
if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
  DB_PATH="${DB_DATABASE:-/var/www/html/database/database.sqlite}"
  DB_DIR="$(dirname "$DB_PATH")"
  mkdir -p "$DB_DIR"
  if [ ! -f "$DB_PATH" ]; then
    echo "[INFO] Criando banco SQLite em $DB_PATH..."
    touch "$DB_PATH"
    chown www-data:www-data "$DB_PATH" 2>/dev/null || true
  fi
fi

# ─── Clear caches before caching ───────────────────────────────────────────
echo "[INFO] Limpando caches..."
php artisan optimize:clear || true

# ─── Cache (only in production) ────────────────────────────────────────────
if [ "${APP_ENV:-production}" = "production" ]; then
  echo "[INFO] Otimizando configurações..."
  php artisan config:cache
  php artisan route:cache || echo "[AVISO] route:cache falhou (possível rota com closure)."
  php artisan view:cache
fi

# ─── Run migrations ─────────────────────────────────────────────────────────
echo "[INFO] Executando migrations..."
php artisan migrate --force

# ─── Seed database safely (won't break container) ──────────────────────────
if [ "${DB_SEED:-false}" = "true" ]; then
  echo "[INFO] DB_SEED=true, checando se precisa semear..."
  # Só roda seed se a tabela users estiver vazia (ou nem existir ainda)
  USER_COUNT="$(php -r 'require "vendor/autoload.php"; $app=require "bootstrap/app.php"; $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    try { echo (int) \App\Models\User::count(); } catch (\Throwable $e) { echo -1; }' 2>/dev/null || echo -1)"

  if [ "$USER_COUNT" = "0" ] || [ "$USER_COUNT" = "-1" ]; then
    echo "[INFO] Rodando seed (users vazia ou ainda não disponível)..."
    php artisan db:seed --force || echo "[AVISO] Seed falhou, mas container continuará subindo."
  else
    echo "[INFO] Seed ignorado (já existem $USER_COUNT usuários)."
  fi
fi

echo "═══ Backend pronto! ═══"
exec "$@"
