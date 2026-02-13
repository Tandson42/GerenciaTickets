# Sistema de Gerenciamento de Tickets

API REST para gestão de chamados internos com interface React Native, desenvolvida com **Laravel 12** e **Sanctum**.

---

## 🚀 Início Rápido (Docker)

A forma mais simples de rodar o sistema completo.

### Requisitos

- **Docker** >= 20.10
- **Docker Compose** >= 2.0

### Subir o sistema

```bash
# 1. Clone o repositório
git clone <url-do-repositório>
cd GerenciaTickets

# 2. Suba todos os serviços
docker compose up -d --build

# 3. Aguarde o container ficar healthy (~30s) e acesse:
#    Backend:  http://localhost:8000/api
#    Frontend: http://localhost:8081
```

O Docker Compose cuida de tudo automaticamente:
- Instala dependências (Composer / npm)
- Configura `.env` e gera a chave da aplicação
- Cria banco SQLite, executa migrations e seeders
- Inicia Backend (Laravel na porta 8000) e Frontend (Expo Web na porta 8081)

### Comandos úteis

```bash
# Ver logs em tempo real
docker compose logs -f

# Ver logs apenas do backend
docker compose logs -f backend

# Parar todos os serviços
docker compose down

# Parar e remover volumes (reseta o banco de dados)
docker compose down -v

# Rebuildar do zero (após alterações no código)
docker compose down -v
docker compose build --no-cache
docker compose up -d

# Executar comandos artisan dentro do container
docker exec chamados-backend php artisan migrate:status
docker exec chamados-backend php artisan db:seed --force
```

### Configuração

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp .env.docker .env
```

Variáveis disponíveis no `.env`:

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `BACKEND_PORT` | 8000 | Porta da API Laravel |
| `FRONTEND_PORT` | 8081 | Porta do Frontend Expo Web |
| `DB_SEED` | true | Semear banco com dados de exemplo |
| `APP_DEBUG` | false | Modo debug do Laravel |
| `API_BASE_URL` | http://localhost:8000/api | URL da API (acessada pelo navegador) |

---

## ⚙️ Setup Manual (Desenvolvimento)

Para desenvolvimento local sem Docker.

### Requisitos

- **PHP** >= 8.2 com extensões: `pdo_sqlite`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`
- **Composer**
- **Node.js** >= 16 + npm
- **Git**

### Backend (Laravel)

```bash
cd chamados
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

### Frontend (React Native / Expo) — em outro terminal

```bash
cd chamados-app
npm install
npx expo start
```

---

## 🔑 Autenticação na API

A API usa **Laravel Sanctum** com autenticação token-based.

### 1. Fazer Login

```http
POST http://localhost:8000/api/login
Content-Type: application/json

{
    "email": "admin@example.com",
    "password": "password123",
    "device_name": "my-app"
}
```

**Resposta:**
```json
{
    "message": "Login realizado com sucesso.",
    "user": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin"
    },
    "token": "1|abc123xyz..."
}
```

### 2. Usar o Token

Incluir em todas as requisições subsequentes:

```http
Authorization: Bearer 1|abc123xyz...
```

### 3. Testar Autenticação

```http
GET http://localhost:8000/api/me
Authorization: Bearer <seu-token>
```

---

## 🔓 Credenciais de Teste

Disponíveis após o seed do banco (automático via Docker ou `php artisan migrate --seed`):

| Usuário       | Email              | Senha       | Papel |
|---------------|--------------------|-------------|-------|
| Admin User    | admin@example.com  | password123 | admin |
| Usuário Comum | user@example.com   | password123 | user  |

---

## 🧪 Testes

```bash
# Via Docker
docker exec chamados-backend php artisan test

# Local
cd chamados
php artisan test

# Executar apenas testes de tickets
php artisan test --filter=TicketApiTest

# Com mais detalhes
php artisan test --verbose
```

---

## 📋 Endpoints da API

### Autenticação
| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| `POST` | `/api/login` | Não | Login |
| `POST` | `/api/register` | Não | Registrar novo usuário |
| `POST` | `/api/logout` | Sim | Logout |
| `GET` | `/api/me` | Sim | Dados do usuário logado |

### Tickets
| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| `GET` | `/api/tickets` | Sim | Listar todos (com filtros e paginação) |
| `POST` | `/api/tickets` | Sim | Criar novo ticket |
| `GET` | `/api/tickets/{id}` | Sim | Detalhar um ticket |
| `PUT` | `/api/tickets/{id}` | Sim | Atualizar um ticket |
| `DELETE` | `/api/tickets/{id}` | Sim | Deletar um ticket |
| `PATCH` | `/api/tickets/{id}/status` | Sim | Mudar status (com log de auditoria) |

**Exemplo de filtros:**
```
GET /api/tickets?status=ABERTO&prioridade=ALTA&busca=login&per_page=10
```

---

## 📁 Estrutura do Projeto

```
GerenciaTickets/
├── chamados/                 # Backend Laravel 12
│   ├── app/
│   │   ├── Http/Controllers/Api/   # TicketController, AuthController
│   │   ├── Models/                 # Ticket, TicketLog, User
│   │   ├── Services/               # TicketService (lógica de negócio)
│   │   ├── Policies/               # TicketPolicy (autorização)
│   │   ├── Enums/                  # TicketStatus, TicketPrioridade
│   │   └── Notifications/
│   ├── routes/api.php              # Definição de rotas
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   ├── tests/
│   │   └── Feature/TicketApiTest.php
│   ├── Dockerfile
│   └── docker/                     # Configs Docker (nginx, php, supervisor)
│
├── chamados-app/             # Frontend React Native + Expo
│   ├── src/
│   │   ├── screens/          # Telas (Login, TicketList, etc)
│   │   ├── services/         # API client (axios)
│   │   ├── contexts/         # AuthContext
│   │   └── components/
│   ├── Dockerfile
│   └── docker/               # Configs Docker (nginx, entrypoint)
│
├── docker-compose.yml        # Orquestração dos serviços
├── .env.docker               # Variáveis de ambiente para Docker
└── README.md                 # Este arquivo
```

---

## 🛠️ Solução de Problemas

### Docker: Credenciais não funcionam após rebuild
```bash
# Recrie os volumes para forçar novo seed
docker compose down -v
docker compose up -d --build
```

### Docker: Verificar se o seed rodou corretamente
```bash
docker logs chamados-backend 2>&1 | grep -E "seed|Seed|SEED|AVISO"
```

### Local: "SQLSTATE[HY000]: unable to open database file"
```bash
cd chamados
touch database/database.sqlite
php artisan migrate --seed
```

### Local: "Class 'PDO' not found"
```bash
# Ubuntu/Debian:
sudo apt-get install php-sqlite3

# macOS:
brew install php
```

### Frontend não conecta à API
Verifique se o backend está rodando e acessível na porta configurada. No Docker, ambos os serviços compartilham a mesma rede automaticamente.

---

**Desenvolvido para teste técnico**
