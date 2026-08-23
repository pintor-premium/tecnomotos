import React from 'react';
import { requireServerPermission } from '@/lib/permissions/rules';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/states';

export default async function AdminOrdersPage() {
  await requireServerPermission('orders.view');

  return (
    <div className="space-y-6 text-left">
      <div>
        <Breadcrumb items={[{ label: 'Comercial' }, { label: 'Pedidos' }]} />
        <div className="flex justify-between items-center mt-2 border-b border-brand-grey/15 pb-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Gestão de Pedidos
            </h1>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mt-1">
              Monitore e processe os pedidos do e-commerce e balcão
            </p>
          </div>
          <Badge variant="neutral">Controle Comercial</Badge>
        </div>
      </div>

      <Card>
        <EmptyState
          title="Nenhum pedido registrado"
          description="Os pedidos realizados no e-commerce ou integrados com o Stripe serão exibidos aqui na próxima etapa."
        />
      </Card>
    </div>
  );
}
