# Guia de Configuração do Stripe - TECNOMOTOS

Este documento descreve os passos necessários para configurar a integração do Stripe no ambiente de desenvolvimento, preview e produção do sistema TECNOMOTOS.

---

## 1. Criação da Conta e Chaves de Teste

1. Acesse o site do [Stripe](https://stripe.com) e crie uma conta (ou faça login se já possuir uma).
2. Ative o modo de teste mudando a chave no menu para **"Test Mode"** (Modo de Teste) no topo direito do dashboard.
3. No menu lateral esquerdo, vá para **Developers** (Desenvolvedores) > **API Keys** (Chaves de API).
4. Copie as duas chaves disponibilizadas:
   * **Publishable key** (Chave Pública): Começa com `pk_test_...`
   * **Secret key** (Chave Secreta): Começa com `sk_test_...`

---

## 2. Configuração do Webhook

Para que o Stripe informe o sistema sobre os pagamentos concluídos com sucesso (e o sistema dê baixa automática no estoque e confirme o pedido), você precisa configurar um webhook.

### Em Ambiente de Desenvolvimento Local (Localhost)

1. Baixe e instale a [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Abra seu terminal local e faça o login na CLI:
   ```bash
   stripe login
   ```
3. Redirecione os webhooks do Stripe para o seu endpoint local:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. A CLI gerará uma chave secreta de assinatura no formato `whsec_...`. Copie essa chave para a variável `STRIPE_WEBHOOK_SECRET` no seu arquivo `.env`.

### Em Ambiente de Produção / Preview (Vercel)

1. Vá ao painel do Stripe em **Developers** > **Webhooks**.
2. Clique em **Add endpoint** (Adicionar Endpoint).
3. Preencha os campos:
   * **Endpoint URL**: `https://<SEU-DOMINIO-NA-VERCEL>/api/stripe/webhook`
   * **Select events**: Selecione `checkout.session.completed` e `payment_intent.payment_failed`.
4. Clique em **Add endpoint**.
5. Em **Signing secret**, clique para revelar e copie a chave que começa com `whsec_...` para configurar na Vercel.

---

## 3. Variáveis de Ambiente (.env / Vercel Settings)

Certifique-se de configurar as seguintes variáveis de ambiente no arquivo `.env` (local) e nas configurações da Vercel (produção):

```env
# Chaves Públicas e Privadas do Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Segredo de Validação de Assinatura do Webhook
STRIPE_WEBHOOK_SECRET=whsec_...

# Modo de Funcionamento ('test' ou 'live')
STRIPE_MODE=test
```

---

## 4. Testando o Fluxo Completo

### A. Sincronização de Produtos
1. Acesse o painel do administrador em `/admin/produtos`.
2. Cadastre um novo produto ou edite um produto existente.
3. O produto será criado automaticamente no catálogo do Stripe em segundo plano e seu status mudará para **Sincronizado** (selo verde) na listagem.
4. Para sincronizar itens pendentes ou tentar novamente falhas, clique no botão **"Sincronizar Pendentes"** no topo da tabela de itens.

### B. Venda e Checkout (E-commerce)
1. Acesse a loja ou o catálogo em `/produtos` logado como Cliente.
2. Adicione produtos de alta performance ao carrinho.
3. Clique em **Finalizar Compra** no topo direito da barra de navegação para acessar `/carrinho`.
4. Visualize o resumo e clique em **Finalizar e Pagar**. O sistema criará o pedido com status `pending_payment` e redirecionará para a página segura de Checkout do Stripe.
5. Utilize o número de cartão de testes da Stripe (`4242 4242 4242 4242`) com qualquer data de validade futura e CVC `123` para simular o pagamento.
6. Ao aprovar, o Stripe redirecionará de volta para `/checkout/sucesso?session_id=...`, exibindo a mensagem **"Pagamento Recebido ✓"** e o resumo descritivo do seu pedido.
7. Em segundo plano, o webhook atualizará o status do pedido para `paid`, subtrairá o estoque das peças compradas e registrará os logs de auditoria correspondentes.
