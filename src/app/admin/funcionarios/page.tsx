import React from 'react';
import { requireServerPermission, hasServerPermission } from '@/lib/permissions/rules';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ShieldAlert } from 'lucide-react';

export default async function AdminEmployeesPage() {
  // 1. Enforce server-side permissions
  await requireServerPermission('employees.view');

  // 2. Check if user is OWNER (only OWNER can create/edit employees)
  const isOwner = await hasServerPermission('employees.create');

  // Mock list of staff
  const mockEmployees = [
    { name: 'Ricardo Silva', email: 'ricardo@tecnomotos.com.br', role: 'Mecânico Chefe', status: 'ACTIVE' },
    { name: 'Ana Oliveira', email: 'ana@tecnomotos.com.br', role: 'Atendente CRM', status: 'ACTIVE' },
  ];

  return (
    <div className="space-y-6 text-left">
      <div>
        <Breadcrumb items={[{ label: 'Equipe' }, { label: 'Funcionários' }]} />
        <div className="flex justify-between items-center mt-2 border-b border-brand-grey/15 pb-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Gestão de Equipe
            </h1>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mt-1">
              Controle de acesso e funcionários da plataforma
            </p>
          </div>
          <Badge variant="neutral">Controle de Equipe</Badge>
        </div>
      </div>

      <Card className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-grey/15 pb-4">
          <div>
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
              Funcionários Cadastrados
            </h4>
            <p className="text-[11px] text-brand-grey mt-0.5">Gestão de operadores vinculados ao sistema.</p>
          </div>
          {isOwner ? (
            <Button size="sm">Registrar Funcionário</Button>
          ) : (
            <div className="flex items-center gap-2 text-brand-grey text-xs font-mono bg-brand-darkgrey p-2 border border-brand-grey/10">
              <ShieldAlert className="w-4 h-4 text-brand-red" />
              <span>Apenas OWNER pode gerenciar a equipe de funcionários.</span>
            </div>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockEmployees.map((emp, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-bold text-white">{emp.name}</TableCell>
                <TableCell className="font-mono">{emp.email}</TableCell>
                <TableCell>{emp.role}</TableCell>
                <TableCell>
                  <Badge variant={emp.status === 'ACTIVE' ? 'success' : 'danger'}>
                    {emp.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {isOwner ? (
                    <Button variant="secondary" size="sm">Gerenciar Permissões</Button>
                  ) : (
                    <span className="text-[11px] font-mono text-brand-grey uppercase">Bloqueado</span>
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
