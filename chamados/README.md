# Sistema de Gestão de Chamados (Tickets)

API REST para gestão de chamados internos, desenvolvida com Laravel 12, SQLite e autenticação via Sanctum. A interface gráfica é consumida por um app React Native.

## Stack

- **Laravel 12** (PHP 8.3)
- **Banco de dados:** SQLite
- **Autenticação:** Laravel Sanctum (token-based, ideal para React Native)
- **Testes:** PHPUnit

## Requisitos

- PHP >= 8.2
- Composer
- Extensões PHP: `pdo_sqlite`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`

## Setup / Instalação

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd chamados

# 2. Instalar dependências
composer install

# 3. Configurar ambiente
cp .env.example .env
php artisan key:generate

# 4. Criar banco SQLite (já vem configurado no .env)
touch database/database.sqlite

# 5. Executar migrations e seeders
php artisan migrate --seed

# 6. Iniciar o servidor
php artisan serve
```

## Credenciais de Teste

| Usuário        | Email              | Senha        | Papel  |
|----------------|--------------------|--------------|--------|
| Admin User     | admin@example.com  | password123  | admin  |
| Usuário Comum  | user@example.com   | password123  | user   |

## Autenticação na API

A API utiliza **Laravel Sanctum** com tokens. Para autenticar:

### 1. Login
```http
POST /api/login
Content-Type: application/json

{
    "email": "admin@example.com",
    "password": "password123",
    "device_name": "react-native-app"
}
```

**Resposta:**
```json
{
    "message": "Login realizado com sucesso.",
    "user": { "id": 1, "name": "Admin User", "email": "admin@example.com", "role": "admin" },
    "token": "1|abc123..."
}
```

### 2. Usar o token nas requisições
Incluir o header `Authorization` em todas as requisições protegidas:
```
Authorization: Bearer 1|abc123...
```

## Endpoints da API

### Autenticação

| Método | Endpoint        | Descrição                | Auth |
|--------|-----------------|--------------------------|------|
| POST   | `/api/login`    | Login (retorna token)    | Não  |
| POST   | `/api/register` | Registro de novo usuário | Não  |
| POST   | `/api/logout`   | Logout (revoga token)    | Sim  |
| GET    | `/api/me`       | Dados do usuário logado  | Sim  |

### Chamados (Tickets)

| Método | Endpoint                     | Descrição                               | Auth |
|--------|------------------------------|-----------------------------------------|------|
| GET    | `/api/tickets`               | Listar chamados (com filtros)           | Sim  |
| POST   | `/api/tickets`               | Criar novo chamado                      | Sim  |
| GET    | `/api/tickets/{id}`          | Detalhar chamado                        | Sim  |
| PUT    | `/api/tickets/{id}`          | Atualizar chamado                       | Sim  |
| DELETE | `/api/tickets/{id}`          | Excluir chamado (soft delete)           | Sim  |
| PATCH  | `/api/tickets/{id}/status`   | Atualizar status (com log de auditoria) | Sim  |

### Filtros na Listagem (GET /api/tickets)

| Parâmetro    | Tipo   | Valores possíveis                     |
|--------------|--------|---------------------------------------|
| `status`     | string | `ABERTO`, `EM_ANDAMENTO`, `RESOLVIDO` |
| `prioridade` | string | `BAIXA`, `MEDIA`, `ALTA`              |
| `busca`      | string | Texto livre (busca em titulo e descricao) |
| `per_page`   | int    | Itens por página (padrão: 15)         |

**Exemplo:**
```
GET /api/tickets?status=ABERTO&prioridade=ALTA&busca=login
```

### Criar Chamado (POST /api/tickets)
```json
{
    "titulo": "Problema no sistema de login",
    "descricao": "O sistema de login não está funcionando corretamente quando tento acessar com meu email.",
    "prioridade": "ALTA",
    "responsavel_id": 2
}
```

### Atualizar Status (PATCH /api/tickets/{id}/status)
```json
{
    "status": "RESOLVIDO"
}
```
> Ao marcar como `RESOLVIDO`, o campo `resolved_at` é preenchido automaticamente e um log de auditoria é criado na tabela `ticket_logs`.

## Regras de Negócio

1. **Autenticação obrigatória** para todas as rotas (exceto login/registro).
2. **CRUD completo** de chamados com soft delete.
3. **Filtros** por status, prioridade e busca textual (título ou descrição).
4. **Resolução automática:** ao marcar como `RESOLVIDO`, `resolved_at` é preenchido automaticamente.
5. **Exclusão restrita:** apenas o solicitante (quem abriu) ou um admin pode excluir um chamado.
6. **Auditoria de status:** toda mudança de status é registrada em `ticket_logs` (ticket_id, de, para, user_id, created_at).
7. **Notificação (Bônus):** ao resolver um chamado, uma notificação por email é disparada via Queue para o solicitante.

## Estrutura do Projeto

```
app/
├── Enums/
│   ├── TicketStatus.php          # Enum: ABERTO, EM_ANDAMENTO, RESOLVIDO
│   └── TicketPrioridade.php      # Enum: BAIXA, MEDIA, ALTA
├── Http/
│   ├── Controllers/Api/
│   │   ├── AuthController.php    # Login, Register, Logout, Me
│   │   └── TicketController.php  # CRUD + updateStatus
│   ├── Requests/
│   │   ├── StoreTicketRequest.php
│   │   ├── UpdateTicketRequest.php
│   │   └── UpdateTicketStatusRequest.php
│   └── Resources/
│       ├── TicketResource.php
│       ├── TicketLogResource.php
│       └── UserResource.php
├── Models/
│   ├── User.php
│   ├── Ticket.php
│   └── TicketLog.php
├── Notifications/
│   └── TicketResolvedNotification.php
├── Policies/
│   └── TicketPolicy.php
└── Services/
    └── TicketService.php
```

## Testes

```bash
# Executar todos os testes
php artisan test

# Executar testes específicos dos tickets
php artisan test --filter=TicketApiTest
```

### Testes implementados:

1. **Usuário não autenticado** não acessa listagem de tickets → retorna 401
2. **Usuário autenticado** acessa listagem de tickets → retorna 200
3. **PATCH de status** cria registro de log e atualiza `resolved_at` quando status = RESOLVIDO
4. **Criação de ticket** com dados válidos
5. **Exclusão restrita** — apenas solicitante ou admin podem excluir
6. **Filtros** por status e prioridade funcionam corretamente
7. **Busca textual** por título ou descrição
8. **Validação** de campos obrigatórios e regras de tamanho

## Comandos Úteis

```bash
# Migrations
php artisan migrate

# Seed (dados de exemplo)
php artisan db:seed

# Reset completo (migrate + seed)
php artisan migrate:fresh --seed

# Testes
php artisan test

# Servidor de desenvolvimento
php artisan serve
```
