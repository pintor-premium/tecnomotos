import React from 'react';
import { requireServerPermission, hasServerPermission } from '@/lib/permissions/rules';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ShieldAlert } from 'lucide-react';

export default async function AdminProductsPage() {
  // 1. Force server-side permission check
  await requireServerPermission('products.view');

  // 2. Check if user is owner to conditionally render actions
  const isOwner = await hasServerPermission('products.price.update');

  // Mock products list
  const mockProducts = [
    { code: 'ESC-GP-01', location: 'Corredor A', name: 'Escapamento Esportivo Carbon GP', brand: 'Akrapovic', price: 2450.00, stock: 12 },
    { code: 'PST-RC-02', location: 'Gaveta B', name: 'Pastilha de Freio Sinterizada Racing', brand: 'Brembo', price: 280.00, stock: 45 },
    { code: 'AMR-PR-03', location: 'Corredor C', name: 'Amortecedor Traseiro Regulável PRO', brand: 'Öhlins', price: 1890.00, stock: 4 },
  ];

  return (
    <div className="space-y-6 text-left">
      <div>
        <Breadcrumb items={[{ label: 'Catálogo' }, { label: 'Produtos' }]} />
        <div className="flex justify-between items-center mt-2 border-b border-brand-grey/15 pb-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Catálogo de Produtos
            </h1>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mt-1">
              Gerencie as peças, marcas e preços do estoque
            </p>
          </div>
          <Badge variant="neutral">Visualização de Catálogo</Badge>
        </div>
      </div>

      <Card className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-grey/15 pb-4">
          <div>
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
              Lista de Itens cadastrados
            </h4>
            <p className="text-[11px] text-brand-grey mt-0.5">Módulo estruturado com dados mockados.</p>
          </div>
          {isOwner ? (
            <Button size="sm">Novo Produto</Button>
          ) : (
            <div className="flex items-center gap-2 text-brand-grey text-xs font-mono bg-brand-darkgrey p-2 border border-brand-grey/10">
              <ShieldAlert className="w-4 h-4 text-brand-red" />
              <span>Apenas OWNER pode criar produtos / gerenciar preços.</span>
            </div>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Locação</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Preço Venda</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockProducts.map((p, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-mono text-brand-red">{p.code}</TableCell>
                <TableCell className="font-mono text-brand-grey">{p.location}</TableCell>
                <TableCell className="font-bold text-white">{p.name}</TableCell>
                <TableCell>{p.brand}</TableCell>
                <TableCell className="font-mono text-white">
                  R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="font-mono">{p.stock} un</TableCell>
                <TableCell className="text-right">
                  {isOwner ? (
                    <Button variant="secondary" size="sm">Editar Preço</Button>
                  ) : (
                    <span className="text-[11px] font-mono text-brand-grey uppercase">Somente Leitura</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
