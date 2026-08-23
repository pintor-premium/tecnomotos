import React from 'react';
import { requireServerPermission } from '@/lib/permissions/rules';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/states';

export default async function AdminWorkshopPage() {
  await requireServerPermission('service_orders.view');

  return (
    <div className="space-y-6 text-left">
      <div>
        <Breadcrumb items={[{ label: 'Oficina' }, { label: 'Ordens de Serviço' }]} />
        <div className="flex justify-between items-center mt-2 border-b border-brand-grey/15 pb-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Oficina Mecânica
            </h1>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mt-1">
              Controle ordens de serviço, checklist de entrada e mecânicos alocados
            </p>
          </div>
          <Badge variant="neutral">Operacional Oficina</Badge>
        </div>
      </div>

      <Card>
        <EmptyState
          title="Nenhuma Ordem de Serviço cadastrada"
          description="O gerenciamento de serviços de manutenção de motocicletas e check-ins estará disponível em breve."
        />
      </Card>
    </div>
  );
}
