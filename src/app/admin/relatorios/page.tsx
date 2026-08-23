import React from 'react';
import { requireServerPermission } from '@/lib/permissions/rules';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/states';

export default async function AdminReportsPage() {
  await requireServerPermission('reports.view');

  return (
    <div className="space-y-6 text-left">
      <div>
        <Breadcrumb items={[{ label: 'Relatórios' }]} />
        <div className="flex justify-between items-center mt-2 border-b border-brand-grey/15 pb-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Relatórios & Auditoria
            </h1>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mt-1">
              Consulte logs de auditoria e relatórios de fechamento de caixa
            </p>
          </div>
          <Badge variant="neutral">Estatísticas</Badge>
        </div>
      </div>

      <Card>
        <EmptyState
          title="Nenhum relatório disponível"
          description="Os relatórios comerciais, estatísticas de oficina e logs de auditoria detalhados serão listados aqui."
        />
      </Card>
    </div>
  );
}
