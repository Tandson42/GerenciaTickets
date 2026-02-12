#!/usr/bin/env bash
#
# start.sh — Script para configurar e iniciar o sistema Chamados completo
#             (Backend Laravel + Frontend React Native/Expo Web)
#
# Uso:
#   chmod +x start.sh
#   ./start.sh              # Sobe backend + frontend
#   ./start.sh --backend    # Sobe apenas o backend (API Laravel)
#   ./start.sh --frontend   # Sobe apenas o frontend (Expo Web)
#   ./start.sh --test       # Roda os testes do backend
#   ./start.sh --reset      # Reseta o banco e re-seed
#
set -e

# ─── Cores ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ─── Helpers ─────────────────────────────────────────────────────────────────
info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[AVISO]${NC} $1"; }
error()   { echo -e "${RED}[ERRO]${NC} $1"; exit 1; }
header()  { echo -e "\n${CYAN}${BOLD}═══ $1 ═══${NC}\n"; }

# ─── Diretório raiz do projeto ───────────────────────────────────────────────
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/chamados"
FRONTEND_DIR="$ROOT_DIR/chamados-app"

# ─── Detectar IP local ──────────────────────────────────────────────────────
get_local_ip() {
    local ip=""
    if command -v ip &> /dev/null; then
        ip=$(ip route get 1 2>/dev/null | awk '{print $7; exit}')
    fi
    if [ -z "$ip" ] && command -v ifconfig &> /dev/null; then
        ip=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1 | awk '{print $2}' | sed 's/addr://')
    fi
    if [ -z "$ip" ]; then
        ip="localhost"
    fi
    echo "$ip"
}

LOCAL_IP=$(get_local_ip)
BACKEND_PORT=8000
FRONTEND_PORT=8081

# ─── Verificar dependências ─────────────────────────────────────────────────
check_dependencies() {
    header "Verificando dependências"

    local missing=()

    if ! command -v php &> /dev/null; then
        missing+=("php (>= 8.2)")
    else
        PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
        success "PHP $PHP_VERSION encontrado"
    fi

    if ! command -v composer &> /dev/null; then
        missing+=("composer")
    else
        success "Composer encontrado"
    fi

    if ! command -v node &> /dev/null; then
        missing+=("node (>= 18)")
    else
        NODE_VERSION=$(node -v)
        success "Node.js $NODE_VERSION encontrado"
    fi

    if ! command -v npm &> /dev/null; then
        missing+=("npm")
    else
        success "npm encontrado"
    fi

    # Verificar extensões PHP necessárias
    local extensions=("pdo_sqlite" "mbstring" "openssl" "tokenizer" "xml" "ctype")
    for ext in "${extensions[@]}"; do
        if ! php -m 2>/dev/null | grep -qi "^$ext$"; then
            warn "Extensão PHP '$ext' não encontrada (pode causar problemas)"
        fi
    done

    if [ ${#missing[@]} -gt 0 ]; then
        error "Dependências não encontradas: ${missing[*]}\nInstale-as antes de continuar."
    fi

    success "Todas as dependências encontradas!"
}

# ─── Setup Backend ──────────────────────────────────────────────────────────
setup_backend() {
    header "Configurando Backend (Laravel)"

    cd "$BACKEND_DIR"

    # Instalar dependências PHP
    if [ ! -d "vendor" ]; then
        info "Instalando dependências do Composer..."
        composer install --no-interaction --prefer-dist --quiet
        success "Dependências do Composer instaladas"
    else
        success "Dependências do Composer já instaladas"
    fi

    # Configurar .env
    if [ ! -f ".env" ]; then
        info "Criando arquivo .env..."
        cp .env.example .env
        php artisan key:generate --quiet
        success "Arquivo .env criado e chave gerada"
    else
        success "Arquivo .env já existe"
    fi

    # Criar banco SQLite
    if [ ! -f "database/database.sqlite" ]; then
        info "Criando banco de dados SQLite..."
        touch database/database.sqlite
        success "Banco de dados criado"
    else
        success "Banco de dados já existe"
    fi

    # Rodar migrations e seeds
    info "Executando migrations e seeders..."
    php artisan migrate --seed --force --quiet 2>/dev/null || {
        warn "Migrations já executadas ou banco já populado, tentando fresh..."
        php artisan migrate:fresh --seed --force --quiet
    }
    success "Migrations e seeders executados"

    cd "$ROOT_DIR"
}

# ─── Setup Frontend ─────────────────────────────────────────────────────────
setup_frontend() {
    header "Configurando Frontend (Expo/React Native)"

    cd "$FRONTEND_DIR"

    # Instalar dependências Node
    if [ ! -d "node_modules" ]; then
        info "Instalando dependências do npm..."
        npm install --silent 2>/dev/null
        success "Dependências do npm instaladas"
    else
        success "Dependências do npm já instaladas"
    fi

    # Configurar URL da API para apontar para o backend local
    info "Configurando URL da API para http://${LOCAL_IP}:${BACKEND_PORT}/api ..."
    sed -i.bak "s|const BASE_URL = .*|const BASE_URL = 'http://${LOCAL_IP}:${BACKEND_PORT}/api';|" src/services/api.js
    rm -f src/services/api.js.bak
    success "URL da API configurada"

    cd "$ROOT_DIR"
}

# ─── Iniciar Backend ────────────────────────────────────────────────────────
start_backend() {
    header "Iniciando Backend"

    cd "$BACKEND_DIR"

    info "Iniciando Laravel na porta ${BACKEND_PORT}..."
    php artisan serve --host=0.0.0.0 --port=$BACKEND_PORT &
    BACKEND_PID=$!

    # Iniciar queue worker em background
    php artisan queue:work --quiet --tries=3 --timeout=60 &
    QUEUE_PID=$!

    sleep 2

    if kill -0 $BACKEND_PID 2>/dev/null; then
        success "Backend rodando em http://${LOCAL_IP}:${BACKEND_PORT}"
        success "Queue worker rodando (PID: $QUEUE_PID)"
    else
        error "Falha ao iniciar o backend"
    fi

    cd "$ROOT_DIR"
}

# ─── Iniciar Frontend ───────────────────────────────────────────────────────
start_frontend() {
    header "Iniciando Frontend"

    cd "$FRONTEND_DIR"

    info "Iniciando Expo Web na porta ${FRONTEND_PORT}..."
    npx expo start --web --port=$FRONTEND_PORT &
    FRONTEND_PID=$!

    sleep 3

    if kill -0 $FRONTEND_PID 2>/dev/null; then
        success "Frontend rodando em http://localhost:${FRONTEND_PORT}"
    else
        warn "Frontend pode demorar para iniciar. Verifique o terminal."
    fi

    cd "$ROOT_DIR"
}

# ─── Rodar Testes ────────────────────────────────────────────────────────────
run_tests() {
    header "Executando Testes (Pest)"

    cd "$BACKEND_DIR"

    php artisan config:clear --quiet 2>/dev/null || true
    ./vendor/bin/pest

    cd "$ROOT_DIR"
}

# ─── Resetar Banco ──────────────────────────────────────────────────────────
reset_database() {
    header "Resetando Banco de Dados"

    cd "$BACKEND_DIR"

    info "Executando migrate:fresh --seed..."
    php artisan migrate:fresh --seed --force
    success "Banco resetado com sucesso!"

    cd "$ROOT_DIR"
}

# ─── Exibir informações finais ───────────────────────────────────────────────
show_info() {
    echo ""
    echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}${BOLD}║              🎫 Sistema de Chamados - Rodando!              ║${NC}"
    echo -e "${CYAN}${BOLD}╠══════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}${BOLD}║${NC}                                                              ${CYAN}${BOLD}║${NC}"
    echo -e "${CYAN}${BOLD}║${NC}  ${GREEN}Backend (API):${NC}  http://${LOCAL_IP}:${BACKEND_PORT}              ${CYAN}${BOLD}║${NC}"
    echo -e "${CYAN}${BOLD}║${NC}  ${GREEN}Frontend (Web):${NC} http://localhost:${FRONTEND_PORT}               ${CYAN}${BOLD}║${NC}"
    echo -e "${CYAN}${BOLD}║${NC}                                                              ${CYAN}${BOLD}║${NC}"
    echo -e "${CYAN}${BOLD}║${NC}  ${YELLOW}Credenciais de teste:${NC}                                       ${CYAN}${BOLD}║${NC}"
    echo -e "${CYAN}${BOLD}║${NC}  Admin:  admin@example.com / password123                     ${CYAN}${BOLD}║${NC}"
    echo -e "${CYAN}${BOLD}║${NC}  User:   user@example.com  / password123                     ${CYAN}${BOLD}║${NC}"
    echo -e "${CYAN}${BOLD}║${NC}                                                              ${CYAN}${BOLD}║${NC}"
    echo -e "${CYAN}${BOLD}║${NC}  ${RED}Pressione Ctrl+C para encerrar todos os serviços${NC}            ${CYAN}${BOLD}║${NC}"
    echo -e "${CYAN}${BOLD}║${NC}                                                              ${CYAN}${BOLD}║${NC}"
    echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# ─── Cleanup ao sair ─────────────────────────────────────────────────────────
cleanup() {
    echo ""
    info "Encerrando serviços..."

    [ -n "$BACKEND_PID" ]  && kill $BACKEND_PID  2>/dev/null && success "Backend encerrado"
    [ -n "$QUEUE_PID" ]    && kill $QUEUE_PID    2>/dev/null && success "Queue worker encerrado"
    [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null && success "Frontend encerrado"

    # Matar processos filhos remanescentes
    jobs -p | xargs -r kill 2>/dev/null

    success "Todos os serviços encerrados. Até logo! 👋"
    exit 0
}

trap cleanup SIGINT SIGTERM

# ─── Main ────────────────────────────────────────────────────────────────────
main() {
    echo -e "${CYAN}${BOLD}"
    echo "  ╔═══════════════════════════════════════════╗"
    echo "  ║   🎫  Sistema de Gestão de Chamados  🎫   ║"
    echo "  ╚═══════════════════════════════════════════╝"
    echo -e "${NC}"

    case "${1:-}" in
        --backend)
            check_dependencies
            setup_backend
            start_backend
            echo ""
            echo -e "  ${GREEN}Backend (API):${NC} http://${LOCAL_IP}:${BACKEND_PORT}"
            echo -e "  ${RED}Pressione Ctrl+C para encerrar${NC}"
            echo ""
            wait
            ;;
        --frontend)
            check_dependencies
            setup_frontend
            start_frontend
            echo ""
            echo -e "  ${GREEN}Frontend (Web):${NC} http://localhost:${FRONTEND_PORT}"
            echo -e "  ${RED}Pressione Ctrl+C para encerrar${NC}"
            echo ""
            wait
            ;;
        --test)
            check_dependencies
            setup_backend
            run_tests
            ;;
        --reset)
            check_dependencies
            reset_database
            ;;
        --help|-h)
            echo "Uso: ./start.sh [opção]"
            echo ""
            echo "Opções:"
            echo "  (sem opção)    Sobe o sistema completo (backend + frontend)"
            echo "  --backend      Sobe apenas o backend (API Laravel)"
            echo "  --frontend     Sobe apenas o frontend (Expo Web)"
            echo "  --test         Configura o backend e roda os testes"
            echo "  --reset        Reseta o banco de dados (migrate:fresh --seed)"
            echo "  --help, -h     Exibe esta ajuda"
            ;;
        *)
            check_dependencies
            setup_backend
            setup_frontend
            start_backend
            start_frontend
            show_info
            wait
            ;;
    esac
}

main "$@"
