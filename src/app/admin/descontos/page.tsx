import React from 'react';
import { requireServerPermission, hasServerPermission } from '@/lib/permissions/rules';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/states';
import { ShieldAlert } from 'lucide-react';

export default async function AdminDiscountsPage() {
  await requireServerPermission('discounts.view');
  
  const isOwner = await hasServerPermission('discounts.create');

  return (
    <div className="space-y-6 text-left">
      <div>
        <Breadcrumb items={[{ label: 'Comercial' }, { label: 'Descontos' }]} />
        <div className="flex justify-between items-center mt-2 border-b border-brand-grey/15 pb-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Campanhas de Desconto
            </h1>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mt-1">
              Gerencie cupons e descontos promocionais
            </p>
          </div>
          <Badge variant="neutral">Promocional</Badge>
        </div>
      </div>

      <Card className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-grey/15 pb-4">
          <div>
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
              Campanhas Ativas
            </h4>
            <p className="text-[11px] text-brand-grey mt-0.5">Módulo estruturado com EmptyState.</p>
          </div>
          {isOwner ? (
            <Button size="sm">Novo Cupom</Button>
          ) : (
            <div className="flex items-center gap-2 text-brand-grey text-xs font-mono bg-brand-darkgrey p-2 border border-brand-grey/10">
              <ShieldAlert className="w-4 h-4 text-brand-red" />
              <span>Apenas o proprietário pode criar ou gerenciar descontos.</span>
            </div>
          )}
        </div>

        <EmptyState
          title="Nenhum cupom de desconto ativo"
          description="Os cupons e campanhas de desconto de produtos criadas pelo proprietário aparecerão aqui."
        />
      </Card>
    </div>
  );
}
