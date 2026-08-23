import React from 'react';
import { requireServerPermission } from '@/lib/permissions/rules';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/states';

export default async function AdminFinancialPage() {
  await requireServerPermission('financial.view');

  return (
    <div className="space-y-6 text-left">
      <div>
        <Breadcrumb items={[{ label: 'Financeiro' }, { label: 'Fluxo de Caixa' }]} />
        <div className="flex justify-between items-center mt-2 border-b border-brand-grey/15 pb-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Controle Financeiro
            </h1>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mt-1">
              Gerencie fluxo de caixa, contas a pagar e contas a receber
            </p>
          </div>
          <Badge variant="neutral">Financeiro</Badge>
        </div>
      </div>

      <Card>
        <EmptyState
          title="Nenhum registro financeiro"
          description="Os lançamentos de contas a pagar, receber, custos de estoque e faturamento da oficina aparecerão aqui."
        />
      </Card>
    </div>
  );
}
