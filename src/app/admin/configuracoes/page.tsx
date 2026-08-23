import React from 'react';
import { requireServerPermission } from '@/lib/permissions/rules';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/states';

export default async function AdminSettingsPage() {
  await requireServerPermission('settings.view');

  return (
    <div className="space-y-6 text-left">
      <div>
        <Breadcrumb items={[{ label: 'Configurações' }]} />
        <div className="flex justify-between items-center mt-2 border-b border-brand-grey/15 pb-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Configurações Gerais
            </h1>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mt-1">
              Ajuste as configurações globais da plataforma e integrações
            </p>
          </div>
          <Badge variant="neutral">Sistema</Badge>
        </div>
      </div>

      <Card>
        <EmptyState
          title="Nenhuma configuração modificável"
          description="Os parâmetros editáveis da empresa, chaves do Stripe e modos do NFC-e serão configurados nesta tela na próxima etapa."
        />
      </Card>
    </div>
  );
}
