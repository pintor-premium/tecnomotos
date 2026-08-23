import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/states';
import { ShoppingBag, MapPin, Bike, User } from 'lucide-react';

export default async function CustomerDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const role =
    (user.app_metadata?.role as string) ||
    (user.user_metadata?.role as string) ||
    'CUSTOMER';

  // Double check RBAC restriction
  if (role !== 'CUSTOMER') {
    redirect('/admin/dashboard');
  }

  const name = profile?.full_name || user.email?.split('@')[0] || 'Cliente';

  return (
    <div className="flex flex-col min-h-screen bg-brand-black text-white">
      {/* Customer Header using Store Navbar but marked as logged in */}
      <Navbar isAuthenticated={true} userRole="CUSTOMER" />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Welcome Block */}
        <div className="border-b border-brand-grey/15 pb-6">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-red font-bold">
            ÁREA DO CLIENTE
          </span>
          <h1 className="text-3xl font-black italic uppercase tracking-tight text-white mt-1">
            Olá, {name}!
          </h1>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Quick Menu Options */}
          <div className="md:col-span-1 space-y-4">
            <Card className="p-4" withStripe>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-grey border-b border-brand-grey/15 pb-2 mb-3">
                Menu de Acesso
              </h3>
              <ul className="space-y-1 font-mono text-xs">
                <li>
                  <div className="flex items-center gap-2.5 px-3 py-2 text-white bg-white/5 font-bold skew-x-[-6deg]">
                    <span className="skew-x-[6deg] flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-brand-red" />
                      Meus Pedidos
                    </span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center gap-2.5 px-3 py-2 text-brand-grey hover:text-white hover:bg-white/2 cursor-pointer skew-x-[-6deg]">
                    <span className="skew-x-[6deg] flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Minha Conta
                    </span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center gap-2.5 px-3 py-2 text-brand-grey hover:text-white hover:bg-white/2 cursor-pointer skew-x-[-6deg]">
                    <span className="skew-x-[6deg] flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Meus Endereços
                    </span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center gap-2.5 px-3 py-2 text-brand-grey hover:text-white hover:bg-white/2 cursor-pointer skew-x-[-6deg]">
                    <span className="skew-x-[6deg] flex items-center gap-2">
                      <Bike className="w-4 h-4" />
                      Minhas Motos
                    </span>
                  </div>
                </li>
              </ul>
            </Card>
          </div>

          {/* Detailed Sections (Structured with Mocks / Empty states) */}
          <div className="md:col-span-3 space-y-6 text-left">
            {/* Orders Summary */}
            <Card className="space-y-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white border-b border-brand-grey/15 pb-2">
                Histórico Recente de Pedidos
              </h3>
              {/* Empty state is clean and professional */}
              <EmptyState
                title="Nenhum pedido realizado"
                description="Você ainda não possui pedidos em nossa loja online. Peças esportivas e acessórios premium estarão disponíveis em breve!"
              />
            </Card>

            {/* Vehicles Summary */}
            <Card className="space-y-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white border-b border-brand-grey/15 pb-2">
                Minhas Motocicletas
              </h3>
              {/* Empty state is clean and professional */}
              <EmptyState
                title="Nenhuma moto cadastrada"
                description="Cadastre suas motos para agilizar a compatibilidade de peças na loja e acompanhar os planos de manutenção da oficina."
                icon={<Bike className="w-10 h-10 text-brand-grey/40" />}
              />
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
