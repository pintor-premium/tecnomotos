# Manual de Deploy na Vercel - TECNOMOTOS

Este guia orienta o deploy em produção da fundação da plataforma **TECNOMOTOS** na nuvem da **Vercel**, mantendo as conexões com o Supabase e as variáveis de ambiente protegidas.

---

## 📋 Pré-requisitos de Produção

Antes de iniciar o deploy, garanta que:
1. O banco de dados do Supabase esteja com todas as migrations aplicadas (`supabase/migrations/`) e o seed de dados inserido (`supabase/seed/seed.sql`).
2. O repositório Git esteja atualizado com todos os arquivos da fundação.
3. As credenciais do Supabase (`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) e as de bootstrap estejam em mãos.

---

## 🚀 Passo a Passo do Deploy

### 1. Conectar Projeto na Vercel
1. Acesse o dashboard da [Vercel](https://vercel.com/) e clique em **Add New > Project**.
2. Importe o repositório da **TECNOMOTOS**.
3. Em **Framework Preset**, selecione **Next.js**.

### 2. Configurar Variáveis de Ambiente na Vercel
Insira as seguintes variáveis na seção **Environment Variables** antes de realizar o deploy:

| Nome da Variável | Valor Recomendado | Escopo |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do seu projeto Supabase | Público (Frontend & Backend) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon Key pública do Supabase | Público (Frontend & Backend) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key secreta | **Servidor Apenas** (Privado) |
| `OWNER_EMAIL` | e-mail inicial do proprietário (ex: admin@tecnomotos.com.br) | Servidor (Temporário) |
| `OWNER_PASSWORD` | senha inicial forte para o proprietário | Servidor (Temporário) |
| `STRIPE_SECRET_KEY` | sk_test_placeholder | Privado (Modo Teste) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`| pk_test_placeholder | Público (Modo Teste) |
| `STRIPE_WEBHOOK_SECRET` | whsec_placeholder | Privado (Modo Teste) |
| `STRIPE_MODE` | `test` | Modo Teste ativado |
| `FISCAL_ENVIRONMENT` | `mock` | Modo Simulação Fiscal |

### 3. Executar o Deploy
1. Clique em **Deploy**.
2. A Vercel executará as seguintes fases:
   - Resolução de dependências via `npm install`.
   - Execução do build de produção via `npm run build` (que realiza o typechecking do TypeScript e compila as rotas estáticas e dinâmicas).
3. Uma vez concluído, a Vercel gerará o link do domínio de produção (ex: `https://tecnomotos.vercel.app`).

### 4. Executar o Bootstrap em Produção
Para ativar a primeira conta `OWNER` de produção:
1. Envie uma requisição `POST` para o endpoint de bootstrap gerado:
   ```bash
   curl -X POST https://seu-projeto.vercel.app/api/auth/bootstrap
   ```
2. Após receber o retorno de sucesso, acesse o painel administrativo usando o email e senha configurados na Vercel.
3. Por segurança, **delete** as variáveis `OWNER_EMAIL` e `OWNER_PASSWORD` do painel de configurações da Vercel e promova um novo redeploy para limpar as variáveis da memória do servidor.
