# 🍕 API de Gerenciamento de Pedidos

API RESTful para gerenciamento de pedidos, produtos, categorias e usuários — com autenticação JWT e controle de acesso por roles. Desenvolvida com Node.js, Prisma e PostgreSQL, containerizada com Docker.

---

## 🛠 Stack

- **Node.js** + **Express**
- **PostgreSQL** — banco de dados relacional
- **Prisma ORM** — migrations e queries
- **JWT** — autenticação stateless
- **Docker** + **Docker Compose** — ambiente isolado
- **Swagger UI** — documentação interativa em `/api-docs`

---

## 🚀 Como rodar

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto. Todas as variáveis abaixo são obrigatórias:

```env
# ─── Banco de dados ───────────────────────────────────────────
# Não altere o host "db" — é o nome do serviço no docker-compose
DATABASE_URL="postgresql://pizzaria_user:1234@db:5432/pizzaria"

# ─── JWT ──────────────────────────────────────────────────────
# Gere uma chave segura com: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET="cole_sua_chave_gerada_aqui"
JWT_EXPIRES_IN=1h   # ex: 1h, 7d, 30d

# ─── Super Admin (usado apenas no seed) ───────────────────────
SUPER_ADMIN_EMAIL=admin@pizzaria.com
SUPER_ADMIN_PASSWORD=SuaSenhaForte123!
```

> **Dica:** o `DATABASE_URL` usa o host `db` porque é o nome do container no Docker Compose. Se rodar fora do Docker, troque por `localhost`.

### 3. Suba os containers

```bash
docker compose up -d
```

Isso irá:
- Subir o banco PostgreSQL
- Executar as migrations automaticamente via Prisma
- Iniciar a API em `http://localhost:4000`

### 4. Crie o Super Admin

Após os containers estarem rodando, execute o seed para criar o usuário administrador inicial:

```bash
docker compose exec backend npm run seed
```

> O Super Admin será criado com as credenciais definidas no `.env` (`SUPER_ADMIN_EMAIL` e `SUPER_ADMIN_PASSWORD`).

### 5. Acesse a documentação

```
http://localhost:4000/api-docs
```

---

## 🔐 Autenticação

Todas as rotas (exceto `/auth/login` e `/auth/register`) exigem um token JWT no header:

```
Authorization: Bearer <seu_token>
```

**Pelo Swagger UI:**
1. Faça login em `POST /auth/login`
2. Copie o token retornado
3. Clique em **Authorize** (canto superior direito)
4. Cole o token e confirme

---

## 👥 Roles e permissões

| Role | Permissões |
|------|-----------|
| `CUSTOMER` | Registrar-se, criar pedidos, ver seus próprios pedidos |
| `MANAGER` | Tudo do Customer + gerenciar produtos, categorias e status de pedidos |
| `SUPER_ADMIN` | Acesso total — incluindo gerenciamento de usuários |

---

## 📦 Endpoints

### 🔑 Auth
| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| POST | `/auth/login` | Login — retorna token JWT | Público |
| POST | `/auth/register` | Registro de novo cliente | Público |

### 👤 Users
| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/users` | Listar todos os usuários | SUPER_ADMIN |
| GET | `/users/active` | Listar usuários ativos | SUPER_ADMIN. MANAGER |
| GET | `/users/:id` | Buscar usuário por ID | Autenticado |
| POST | `/users` | Criar usuário (admin/manager) | SUPER_ADMIN |
| PATCH | `/users/:id` | Atualizar dados do usuário | SUPER_ADMIN |
| PATCH | `/users/:id/status` | Alterar status do usuário | SUPER_ADMIN |
| DELETE | `/users/:id` | Remover usuário | SUPER_ADMIN |

### 🗂 Categories
| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/categories` | Listar todas as categorias | Autenticado |
| GET | `/categories/:id` | Buscar categoria por ID | Autenticado |
| POST | `/categories` | Criar categoria | SUPER_ADMIN, MANAGER |
| PATCH | `/categories/:id` | Atualizar categoria | SUPER_ADMIN, MANAGER |
| DELETE | `/categories/:id` | Remover categoria | SUPER_ADMIN, MANAGER |

### 🍕 Products
| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/products` | Listar todos os produtos | SUPER_ADMIN |
| GET | `/products/available` | Listar produtos disponíveis | Autenticado |
| GET | `/products/category/:categoryId` | Produtos por categoria | Autenticado |
| GET | `/products/:id` | Buscar produto por ID | Autenticado |
| POST | `/products` | Criar produto | SUPER_ADMIN, MANAGER |
| PATCH | `/products/:id` | Atualizar produto | SUPER_ADMIN, MANAGER |
| DELETE | `/products/:id` | Remover produto | SUPER_ADMIN, MANAGER |

### 🧾 Orders
| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/orders` | Listar todos os pedidos | SUPER_ADMIN, MANAGER |
| GET | `/orders/status/:status` | Filtrar pedidos por status | SUPER_ADMIN, MANAGER |
| GET | `/orders/user/:userId` | Pedidos de um usuário | Autenticado |
| GET | `/orders/:id` | Buscar pedido por ID | Autenticado |
| POST | `/orders` | Criar pedido | Autenticado |
| PATCH | `/orders/:id/status` | Atualizar status do pedido | SUPER_ADMIN, MANAGER |
| PATCH | `/orders/:id` | Atualizar dados do pedido | Autenticado |
| DELETE | `/orders/:id` | Remover pedido | SUPER_ADMIN, MANAGER |

**Status disponíveis para pedidos:** `PENDING` → `PREPARING` → `OUT_FOR_DELIVERY` → `DELIVERED` / `CANCELLED`

---

## 🏥 Health Check

```
GET /health
```

Retorna o status do servidor e da conexão com o banco de dados.

---

## 📁 Estrutura do projeto

```
FullStack-Server/
├── .env
├── docker-compose.yml
└── backend/
    ├── Dockerfile
    ├── prisma/
    │   ├── schema.prisma
    │   ├── migrations/
    │   └── seed.js
    └── src/
        ├── server.js
        ├── database/
        ├── middleware/
        │   ├── auth.js
        │   ├── authorize.js
        │   └── errorHandle.js
        ├── models/
        └── routes/
```

---

## 🐳 Comandos úteis

```bash
# Subir os containers
docker compose up -d

# Ver logs da API
docker compose logs -f backend

# Rodar o seed (criar Super Admin)
docker compose exec backend npm run seed

# Acessar o container da API
docker compose exec backend sh

# Derrubar os containers
docker compose down
```
