import React from 'react';
import { requireServerPermission } from '@/lib/permissions/rules';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/states';

export default async function AdminCrmPage() {
  await requireServerPermission('crm.view');

  return (
    <div className="space-y-6 text-left">
      <div>
        <Breadcrumb items={[{ label: 'Clientes' }, { label: 'CRM' }]} />
        <div className="flex justify-between items-center mt-2 border-b border-brand-grey/15 pb-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Atendimento & CRM
            </h1>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mt-1">
              Gerencie o relacionamento e históricos de interações com os clientes
            </p>
          </div>
          <Badge variant="neutral">Relacionamento</Badge>
        </div>
      </div>

      <Card>
        <EmptyState
          title="Nenhuma interação de CRM registrada"
          description="O histórico de atendimentos e follow-ups de clientes aparecerá estruturado aqui."
        />
      </Card>
    </div>
  );
}
