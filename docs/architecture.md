# Arquitetura do Sistema - TECNOMOTOS

Este documento detalha as decisões de design de software e arquitetura adotadas para a fundação da plataforma **TECNOMOTOS**.

---

## 🛠️ Princípios de Design

A TECNOMOTOS foi estruturada seguindo preceitos modernos de arquitetura de software SaaS e e-commerce para garantir manutenibilidade, extensibilidade e segurança:

1. **Separação Rígida de Responsabilidades**:
   - **Camada de Apresentação (UI)**: Gerenciada pelo Next.js App Router, utilizando Server Components por padrão para melhor indexação e performance (SEO), e Client Components apenas para formulários e estados dinâmicos locais.
   - **Camada de Autenticação e Sessão**: Gerenciada pelo Supabase Auth integrado ao Middleware para garantir redirecionamentos e proteção de rotas no lado do servidor.
   - **Camada de Autorização (RBAC/RLS)**: Validada nativamente no banco de dados (PostgreSQL/Supabase) e complementada no servidor Next.js.
   - **Camada de Serviços (Integração)**: Abstraída por classes e interfaces de serviço (`PaymentService` e `FiscalService`) permitindo a substituição de provedores sem alterar o código do restante do sistema.

2. **Segurança Privilegiada no Backend**:
   - Componentes que rodam no navegador (client-side) nunca importam a chave administrativa do Supabase (`SUPABASE_SERVICE_ROLE_KEY`). Apenas as chaves públicas (`anon_key`) são expostas.
   - Operações sensíveis (como criação de usuários administrativos, logs de auditoria e configurações globais) rodam exclusivamente sob controle direto no servidor (`lib/supabase/admin.ts`).

---

## 🏎️ Identidade Visual e Design System

Inspirado em competições de automobilismo (MotoGP) e mecânica premium, o design system utiliza:
- **Tema Escuro Nativo**: Cores como `#080808` (Preto Profundo), `#121212` (Grafite) e `#161616` (Fundo de Cartões) reduzem a fadiga visual e transmitem robustez.
- **Destaque Racing**: Vermelho `#E10600` e Prata `#D9D9D9` são utilizados de forma cirúrgica para ressaltar ações importantes, status ativos e indicadores digitais.
- **Estilo Diagonal / Aerodinâmico**: Aplicação de inclinações em botões (`skew-x-[-6deg]`) e cantos em caixas de diálogo para mimetizar painéis de motocicletas de alta cilindrada.
- **Grids de Telemetria**: Fundos com linhas finas e discretas simulando grades de telemetria de sensores de pista.

---

## 🔌 Camadas de Serviços de Terceiros (Mocks)

Para possibilitar testes do fluxo de ponta a ponta sem incurção em custos reais:
- **PaymentService**: Interface comum implementada pela classe `StripePaymentService`. O fluxo de checkout simula a criação de sessões de pagamento em ambiente de testes (`STRIPE_MODE=test`).
- **FiscalService**: Encapsula todas as validações de tributação brasileiras necessárias para emissão futura de NFC-e (NCM, CEST, CFOP, CSOSN). O comportamento é simulado pela classe `MockFiscalService` (`FISCAL_ENVIRONMENT=mock`), imprimindo os logs detalhados do XML no console sem faturamento real na SEFAZ.
