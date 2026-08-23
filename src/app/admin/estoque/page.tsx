import React from 'react';
import { requireServerPermission } from '@/lib/permissions/rules';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/states';

export default async function AdminInventoryPage() {
  await requireServerPermission('inventory.view');

  return (
    <div className="space-y-6 text-left">
      <div>
        <Breadcrumb items={[{ label: 'Catálogo' }, { label: 'Estoque' }]} />
        <div className="flex justify-between items-center mt-2 border-b border-brand-grey/15 pb-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Controle de Estoque
            </h1>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mt-1">
              Monitore níveis de estoque e lance movimentações
            </p>
          </div>
          <Badge variant="neutral">Logística</Badge>
        </div>
      </div>

      <Card>
        <EmptyState
          title="Nenhuma movimentação de estoque"
          description="O controle de entradas, saídas e movimentações de peças estará operacional na próxima etapa."
        />
      </Card>
    </div>
  );
}
