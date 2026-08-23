import React from 'react';
import { requireServerPermission } from '@/lib/permissions/rules';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/states';

export default async function AdminCustomersPage() {
  await requireServerPermission('customers.view');

  return (
    <div className="space-y-6 text-left">
      <div>
        <Breadcrumb items={[{ label: 'Clientes' }, { label: 'Lista' }]} />
        <div className="flex justify-between items-center mt-2 border-b border-brand-grey/15 pb-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Lista de Clientes
            </h1>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mt-1">
              Visualize perfis de compradores, endereços e motocicletas associadas
            </p>
          </div>
          <Badge variant="neutral">Clientes</Badge>
        </div>
      </div>

      <Card>
        <EmptyState
          title="Nenhum cliente cadastrado"
          description="Os cadastros de clientes realizados na loja online ou criados pelo admin aparecerão listados aqui."
        />
      </Card>
    </div>
  );
}
