# Sistema de Autorização (RBAC & RLS) - TECNOMOTOS

A segurança de dados da TECNOMOTOS baseia-se em dois pilares: **RBAC** (Role-Based Access Control) no lado da aplicação e **RLS** (Row Level Security) diretamente nas tabelas do banco de dados PostgreSQL.

---

## 👥 Tipos de Usuários (Roles)

1. **OWNER** (Proprietário Administrador):
   - Acesso irrestrito a todas as tabelas e rotas.
   - Único perfil autorizado a cadastrar funcionários, alterar preços de produtos, criar cupons de desconto e visualizar relatórios financeiros.
2. **EMPLOYEE** (Funcionário):
   - Acesso restrito a módulos autorizados através de permissões granulares associadas.
   - Por padrão (definido no `seed.sql`), funcionários podem visualizar o dashboard, gerenciar o estoque, ler o catálogo de produtos e abrir ordens de serviço.
3. **CUSTOMER** (Cliente):
   - Acesso exclusivo às suas próprias informações de compras, endereços e veículos.
   - Bloqueado de qualquer rota ou recurso dentro do painel `/admin`.

---

## 🔒 Row Level Security (RLS) no PostgreSQL

A RLS está ativada em todas as tabelas. As políticas de acesso utilizam funções auxiliares com a propriedade `SECURITY DEFINER` para evitar loops de recursão.

### Funções Auxiliares:
- **`public.is_owner(user_uuid uuid)`**: Verifica se a role associada ao UUID do usuário na tabela `user_roles` é `OWNER`.
- **`public.has_permission(user_uuid uuid, required_permission text)`**: Verifica se o usuário tem a permissão solicitada associada a alguma de suas roles. Se o usuário for um `OWNER`, a função sempre retorna `TRUE`.

### Exemplos de Políticas Aplicadas:
* **Tabela `profiles`**:
  ```sql
  CREATE POLICY select_profiles ON public.profiles FOR SELECT USING (
      id = auth.uid() OR 
      public.is_owner(auth.uid()) OR 
      public.has_permission(auth.uid(), 'customers.view') OR 
      public.has_permission(auth.uid(), 'employees.view')
  );
  ```
  *Permite que usuários leiam seu próprio perfil, owners acessem tudo, e funcionários visualizem dados autorizados.*

* **Tabela `employees`**:
  ```sql
  CREATE POLICY modify_employees ON public.employees FOR ALL USING (
      public.is_owner(auth.uid())
  );
  ```
  *Apenas o OWNER tem direitos de gravação/edição de funcionários.*

---

## 🛡️ Proteção no Backend (Server Components / Actions)

Para evitar que o usuário tente burlar o front-end escondendo botões, as rotas administrativas realizam verificações rígidas no servidor antes de renderizar qualquer conteúdo:

```typescript
import { requireServerPermission } from '@/lib/permissions/rules';

export default async function AdminPage() {
  // Dispara uma exceção imediata se o usuário não possuir a permissão requerida
  await requireServerPermission('financial.view');

  return (
    // Renderização segura do painel financeiro...
  );
}
```
Se o usuário logado não possuir a permissão `financial.view` (e não for um `OWNER`), o servidor Next.js joga uma exceção que renderizará o componente elegante de erro da aplicação, mantendo os dados totalmente blindados contra acessos indevidos.
