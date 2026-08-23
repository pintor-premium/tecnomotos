import React from 'react';
import { requireServerPermission } from '@/lib/permissions/rules';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/states';

export default async function AdminFiscalPage() {
  await requireServerPermission('fiscal.view');

  return (
    <div className="space-y-6 text-left">
      <div>
        <Breadcrumb items={[{ label: 'Fiscal' }, { label: 'NFC-e' }]} />
        <div className="flex justify-between items-center mt-2 border-b border-brand-grey/15 pb-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Emissão Fiscal NFC-e
            </h1>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mt-1">
              Monitore notas fiscais eletrônicas de vendas de peças e serviços
            </p>
          </div>
          <Badge variant="neutral">Fiscal</Badge>
        </div>
      </div>

      <Card>
        <EmptyState
          title="Nenhuma nota fiscal emitida"
          description="A listagem de NFC-e autorizadas pela Sefaz (ou no ambiente mockado) será exibida nesta seção."
        />
      </Card>
    </div>
  );
}
