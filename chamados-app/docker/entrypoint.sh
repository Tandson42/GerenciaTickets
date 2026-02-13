#!/bin/sh
set -e

echo "═══ Chamados Frontend - Inicialização ═══"

# ─── Dynamic API URL injection ──────────────────────────────────────────────
# Replace the default API URL with the one provided via environment variable
# This allows configuring the API endpoint at container runtime
API_URL="${API_BASE_URL:-http://localhost:8000/api}"
BACKEND_URL="${BACKEND_BASE_URL:-http://localhost:8000}"

echo "[INFO] Configurando API URL: ${API_URL}"

# Replace API URLs in all JS files
find /usr/share/nginx/html -name '*.js' -exec sed -i \
    "s|http://localhost:8000/api|${API_URL}|g" {} +
find /usr/share/nginx/html -name '*.js' -exec sed -i \
    "s|http://localhost:8000|${BACKEND_URL}|g" {} +

echo "═══ Frontend pronto! ═══"

exec "$@"
