import React from 'react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingCart, Users, Warehouse, Wrench, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  // Mock metrics data for visual demonstration
  const metrics = [
    {
      title: 'Faturamento',
      value: 'R$ 48.950,00',
      description: 'Mês corrente',
      icon: DollarSign,
      color: 'text-green-400',
    },
    {
      title: 'Pedidos',
      value: '124',
      description: 'Vendas online e presenciais',
      icon: ShoppingCart,
      color: 'text-brand-red',
    },
    {
      title: 'Clientes',
      value: '312',
      description: 'Cadastros ativos',
      icon: Users,
      color: 'text-blue-400',
    },
    {
      title: 'Estoque',
      value: '840 itens',
      description: '45 categorias de peças',
      icon: Warehouse,
      color: 'text-yellow-500',
    },
    {
      title: 'Ordens de Serviço',
      value: '18 ativas',
      description: 'Diagnósticos em andamento',
      icon: Wrench,
      color: 'text-red-500',
    },
    {
      title: 'Financeiro',
      value: 'R$ 12.300,00',
      description: 'Contas a pagar esta semana',
      icon: Activity,
      color: 'text-brand-silver',
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header and Breadcrumbs */}
      <div>
        <Breadcrumb items={[{ label: 'Dashboard' }]} />
        <div className="flex justify-between items-center mt-2 border-b border-brand-grey/15 pb-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Painel de Telemetria Geral
            </h1>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mt-1">
              Indicadores de performance comercial e operacional
            </p>
          </div>
          <Badge variant="danger" className="animate-pulse">
            Dados de Demonstração (MOCK)
          </Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} hoverEffect withStripe telemetryBg>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-brand-grey">
                    {m.title}
                  </p>
                  <p className="text-2xl font-black text-white italic tracking-tight">{m.value}</p>
                  <p className="text-[10px] text-brand-grey/70 font-sans">{m.description}</p>
                </div>
                <div className={`p-2.5 bg-brand-darkgrey border border-brand-grey/10 ${m.color}`}>
                  <Icon className="w-5 h-5 shrink-0" />
                </div>
              </div>
              {/* Mock Label inside Card */}
              <div className="absolute bottom-2 right-3 text-[8px] font-mono text-brand-red/60 uppercase">
                [MOCK]
              </div>
            </Card>
          );
        })}
      </div>

      {/* Operational updates visual placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workshop status */}
        <Card className="space-y-4">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white border-b border-brand-grey/15 pb-2">
            Status da Oficina Mecânica [MOCK]
          </h3>
          <ul className="space-y-3 font-mono text-[11px]">
            <li className="flex justify-between items-center p-2 bg-brand-darkgrey/50 border-l-2 border-brand-red">
              <span>Ducati Panigale V4 - Troca de escape</span>
              <Badge variant="danger">Em progresso</Badge>
            </li>
            <li className="flex justify-between items-center p-2 bg-brand-darkgrey/50 border-l-2 border-yellow-500">
              <span>Honda CBR 1000RR-R - Calibração ECU</span>
              <Badge variant="warning">Aguardando Peça</Badge>
            </li>
            <li className="flex justify-between items-center p-2 bg-brand-darkgrey/50 border-l-2 border-green-500">
              <span>Yamaha YZF-R1 - Revisão 20k</span>
              <Badge variant="success">Finalizado</Badge>
            </li>
          </ul>
        </Card>

        {/* E-commerce status */}
        <Card className="space-y-4">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white border-b border-brand-grey/15 pb-2">
            Pedidos Recentes de Peças [MOCK]
          </h3>
          <ul className="space-y-3 font-mono text-[11px]">
            <li className="flex justify-between items-center p-2 bg-brand-darkgrey/50">
              <span>#1084 - Filtro de Óleo Racing K&N</span>
              <span className="text-white font-bold">R$ 145,00</span>
            </li>
            <li className="flex justify-between items-center p-2 bg-brand-darkgrey/50">
              <span>#1083 - Kit Relação DID 520 ZVM-X</span>
              <span className="text-white font-bold">R$ 1.250,00</span>
            </li>
            <li className="flex justify-between items-center p-2 bg-brand-darkgrey/50">
              <span>#1082 - Aditivo de Radiador Motul</span>
              <span className="text-white font-bold">R$ 98,00</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
