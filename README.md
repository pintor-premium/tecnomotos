# TECNOMOTOS - Plataforma SaaS & E-commerce (Fundação)

Esta é a fundação completa, profissional e segura da plataforma **TECNOMOTOS**, projetada para alta performance com Next.js, Tailwind CSS, TypeScript e integração robusta com o Supabase.

A estrutura do projeto está preparada para receber módulos comerciais futuros, como loja online, ordens de serviço de oficina mecânica, controle financeiro, controle de estoque, integração com Stripe e emissão de notas fiscais NFC-e.

---

## 🚀 Tecnologias e Stack Utilizada

* **Frontend**: Next.js 16 (App Router, Server & Client Components)
* **Estilização**: Tailwind CSS v4 (Identidade visual inspirada em MotoGP/Superbikes: preto profundo, grafite, prata metálico e vermelho racing)
* **Linguagem**: TypeScript (Tipagem estática estrita)
* **Validação**: Zod (Validação rígida de schemas de input)
* **Banco de Dados**: Supabase PostgreSQL
* **Autenticação**: Supabase Auth (Sessões seguras via cookies no Middleware)
* **Segurança e Autorização**: Row Level Security (RLS) e Role-Based Access Control (RBAC) granular

---

## 📂 Arquitetura de Pastas

```text
src/
├── app/                           # Rotas e páginas (App Router)
│   ├── (admin)/                   # Painel administrativo (/admin/*)
│   ├── (cliente)/                 # Área exclusiva do cliente (/cliente/*)
│   ├── api/                       # Rotas de API e Webhooks (Bootstrap e Stripe Webhook)
│   ├── layout.tsx                 # Root layout com configuração do Geist Font e tema escuro
│   └── providers.tsx              # Contextos globais (Toast, etc.)
├── components/                    # Componentes React
│   ├── ui/                        # Design System (Button, Card, Badge, Modal, Input, etc.)
│   └── layout/                    # Componentes estruturais (Sidebar, Topbar, Navbar, Footer)
├── lib/                           # Serviços de lógica e negócios
│   ├── supabase/                  # Instanciação dos clientes Supabase (Client, Server, Admin)
│   ├── permissions/               # Validadores de RBAC no servidor
│   ├── services/                  # Mocks de Stripe e NFC-e
│   └── utils/                     # Utilitários (como "cn" para Tailwind classes merge)
supabase/
├── migrations/                    # Scripts organizados e versionados de migração SQL
└── seed/                          # Scripts de seed para carregar roles, permissões e configurações
docs/                              # Documentação aprofundada da fundação
```

---

## 🛠️ Configuração Inicial e Conexão com o Supabase

### 1. Criar Projeto no Supabase
1. Acesse o [Console do Supabase](https://supabase.com/) e crie um novo projeto.
2. Acesse o **SQL Editor** do projeto.

### 2. Rodar as Migrations SQL e Seed
Execute os scripts contidos em `supabase/migrations/` na ordem sequencial no SQL Editor do Supabase para criar as tabelas, funções auxiliares de segurança, triggers e políticas RLS:
1. `001_initial_schema.sql` (Perfis de usuários, funcionários e clientes)
2. `002_roles_permissions.sql` (Definição de roles e permissões)
3. `003_rbac_helpers.sql` (Funções seguras com SECURITY DEFINER e Triggers)
4. `004_rls_policies.sql` (Políticas de Row Level Security)
5. `005_audit_logs.sql` (Logs de auditoria do sistema e NFC-e)
6. `006_settings.sql` (Configurações dinâmicas do banco)
7. `007_user_role_trigger.sql` (Sincronização de Roles para o JWT de Sessão)

Depois, execute o conteúdo do arquivo `supabase/seed/seed.sql` para carregar as roles (`OWNER`, `EMPLOYEE`, `CUSTOMER`), a lista de permissões e as configurações iniciais de settings.

### 3. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env.local` e preencha as variáveis de acesso ao Supabase obtidas em **Settings > API**:
```bash
cp .env.example .env.local
```

Preencha os seguintes campos no seu `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Credenciais temporárias para o primeiro OWNER
OWNER_EMAIL=proprietario@tecnomotos.com.br
OWNER_PASSWORD=uma-senha-segura-e-forte
```

---

## 🔐 Bootstrap Seguro do Proprietário (OWNER)

A criação do primeiro usuário administrador é feita de forma segura sem expor senhas no repositório:
1. Garanta que as variáveis `OWNER_EMAIL` e `OWNER_PASSWORD` estão preenchidas no seu `.env.local`.
2. Certifique-se de que a aplicação está rodando localmente (`npm run dev`).
3. Envie uma requisição `POST` para a rota `/api/auth/bootstrap` utilizando uma ferramenta como Postman, cURL ou o navegador:
   ```bash
   curl -X POST http://localhost:3000/api/auth/bootstrap
   ```
4. O script criará a conta de autenticação no Supabase, associará a ela a role `OWNER` e removerá quaisquer dependências de cliente.
5. **Importante**: Por segurança, uma vez criado, apague as chaves `OWNER_EMAIL` e `OWNER_PASSWORD` do seu arquivo de ambiente local. O proprietário poderá alterar sua senha a qualquer momento através do sistema.

---

## 💻 Executando Localmente

Para rodar o projeto em ambiente de desenvolvimento local, execute:

```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Iniciar servidor local
npm run dev
```

Acesse o endereço [http://localhost:3000](http://localhost:3000) no seu navegador para testar a landing page pública, área do cliente e painel administrativo.

---

## ⚙️ Stripe Test & NFC-e Mock

* **Stripe**: Configurado para funcionar inicialmente em modo de teste (`STRIPE_MODE=test`). A classe abstrata `PaymentService` e sua implementação `StripePaymentService` estão preparadas para a próxima fase. O webhook de entrada está exposto em `/api/webhooks/stripe`.
* **NFC-e**: Configurado para funcionar sob o modo de simulação fiscal (`FISCAL_ENVIRONMENT=mock`), registrando parâmetros detalhados de faturamento no console (`MockFiscalService`) sem realizar emissões de nota reais junto à SEFAZ nesta etapa.

---

## 🌐 Publicando na Vercel

O projeto está totalmente configurado e preparado para deploy na Vercel:
1. Crie um novo projeto na Vercel e importe o seu repositório da TECNOMOTOS.
2. Em **Environment Variables**, adicione as mesmas chaves do seu arquivo `.env.local`:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `OWNER_EMAIL` (Temporariamente para o bootstrap inicial)
   * `OWNER_PASSWORD` (Temporariamente para o bootstrap inicial)
   * `STRIPE_SECRET_KEY`
   * `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   * `STRIPE_WEBHOOK_SECRET`
   * `STRIPE_MODE=test`
   * `FISCAL_ENVIRONMENT=mock`
3. A Vercel executará o `npm run build` automaticamente com validações de lint e typecheck.
4. Após o primeiro deploy bem-sucedido na Vercel, acesse `https://seu-dominio.vercel.app/api/auth/bootstrap` enviando um método `POST` para ativar o primeiro proprietário.
