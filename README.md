# Sistema de Gerenciamento de Tickets

API REST para gestão de chamados internos com interface React Native, desenvolvida com **Laravel 12** e **Sanctum**.

---

## 🚀 Início Rápido

### Requisitos

- **PHP** >= 8.2 com extensões: `pdo_sqlite`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`
- **Composer**
- **Node.js** >= 16 + npm (para frontend)
- **Git**

### Setup Automático (Recomendado)

**Escolha o comando para seu SO:**

#### 🐧 Linux / macOS
```bash
# Dar permissão de execução (primeira vez)
chmod +x start.sh

# Iniciar todo o sistema (backend + frontend)
./start.sh
```

#### 🪟 Windows (Command Prompt)
```cmd
# Abra o Command Prompt e execute:
start.bat
```

#### 🪟 Windows (PowerShell)
```powershell
# Abra o PowerShell como Administrador e execute:
.\start.ps1
```

> **Nota Windows:** Se receber erro de permissão no PowerShell, execute primeiro:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

O script faz automaticamente:
- Instala dependências (PHP/Node)
- Configura `.env` e chave da aplicação
- Cria banco SQLite e executa migrations + seeders
- Inicia Laravel (porta 8000) + Expo (porta 19000)
- Exibe credenciais de teste

---

## ⚙️ Setup Manual

```bash
# 1. Backend (Laravel)
cd chamados
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000

# 2. Frontend (React Native/Expo) - Em outro terminal
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

## 🧪 Comandos Importantes

### Migrations

```bash
cd chamados

# Executar todas as migrations
php artisan migrate

# Refazer tudo e popular com dados de exemplo
php artisan migrate:fresh --seed

# Desfazer última migration
php artisan migrate:rollback
```

### Seeders (Dados de Teste)

```bash
# Popular banco com usuários e tickets de exemplo
php artisan db:seed

# Ou junto com migrate:fresh
php artisan migrate:fresh --seed
```

### Testes

```bash
# Executar todos os testes
php artisan test

# Executar apenas testes de tickets
php artisan test --filter=TicketApiTest

# Com mais detalhes de saída
php artisan test --verbose
```

---

## 🔓 Credenciais de Teste

Após rodar `php artisan migrate:fresh --seed`, use:

| Usuário       | Email              | Senha       | Papel |
|---------------|--------------------|-------------|-------|
| Admin User    | admin@example.com  | password123 | admin |
| Usuário Comum | user@example.com   | password123 | user  |

---

## 📋 Endpoints Principais da API

### Autenticação
- `POST /api/login` — Login (sem auth)
- `POST /api/register` — Registrar novo usuário (sem auth)
- `POST /api/logout` — Logout (requer auth)
- `GET /api/me` — Dados do usuário logado (requer auth)

### Tickets
- `GET /api/tickets` — Listar todos (com filtros e paginação)
- `POST /api/tickets` — Criar novo ticket
- `GET /api/tickets/{id}` — Detalhar um ticket
- `PUT /api/tickets/{id}` — Atualizar um ticket
- `DELETE /api/tickets/{id}` — Deletar um ticket
- `PATCH /api/tickets/{id}/status` — Mudar status (com log de auditoria)

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
│   ├── .env.example
│   └── composer.json
│
├── chamados-app/             # Frontend React Native + Expo
│   ├── src/
│   │   ├── screens/          # Telas (Login, TicketList, etc)
│   │   ├── services/         # API client (axios)
│   │   ├── contexts/         # AuthContext
│   │   └── components/
│   ├── package.json
│   └── app.json
│
├── start.sh                  # Script de automação
└── README.md                 # Este arquivo
```

---

## 🛠️ Soluções de Problemas

### Erro: "SQLSTATE[HY000]: General error: 1 unable to open database file"
```bash
cd chamados
touch database/database.sqlite
php artisan migrate --seed
```

### Erro: "Class 'PDO' not found"
```bash
# Instalar extensão SQLite para PHP
# Ubuntu/Debian:
sudo apt-get install php-sqlite3

# macOS:
brew install php-sqlite3
```

### Frontend não consegue conectar à API
Edite `chamados-app/src/services/api.js` e atualize a `BASE_URL`:
```javascript
// Para Android emulator:
const BASE_URL = 'http://10.0.2.2:8000';

// Para iOS simulator:
const BASE_URL = 'http://localhost:8000';

// Para device na mesma rede:
const BASE_URL = 'http://<seu-ip-da-máquina>:8000';
```

---

## 📚 Documentação Detalhada

Para documentação específica de:
- **Backend**: Veja [chamados/README.md](./chamados/README.md)
- **Frontend**: Veja [chamados-app/README.md](./chamados-app/README.md) (se existir)
- **Instruções principais**: Veja [.github/copilot-instructions.md](./.github/copilot-instructions.md)

---

**Desenvolvido para teste técnico**