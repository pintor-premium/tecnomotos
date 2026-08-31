'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Bell } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface TopbarProps {
  userEmail?: string;
  userRole?: string;
}

export function Topbar({ userEmail = '', userRole = '' }: TopbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const { success, error } = useToast();
  const roleLabels: Record<string, string> = {
    OWNER: 'Proprietário',
    EMPLOYEE: 'Funcionário',
    CUSTOMER: 'Cliente'
  };

  const handleSignOut = async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        error('Erro ao sair', signOutError.message);
      } else {
        success('Sessão encerrada', 'Você saiu da sua conta com segurança.');
        router.push('/login');
        router.refresh();
      }
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Ocorreu um erro.';
      error('Erro ao sair', errMsg);
    }
  };

  return (
    <header className="h-16 bg-brand-black border-b border-brand-grey/15 px-6 flex items-center justify-between text-white shrink-0">
      {/* Telemetry Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-brand-grey">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          TELEMETRIA CONECTADA
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="text-brand-grey hover:text-brand-red transition-colors relative cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-red rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-red rounded-full" />
        </button>

        {/* User Info & LogOut */}
        <div className="flex items-center gap-3 pl-4 border-l border-brand-grey/15">
          <div className="text-right">
            <p className="text-xs font-bold leading-none font-sans">{userEmail}</p>
            <span className="text-[9px] font-mono uppercase tracking-widest text-brand-red font-bold mt-1 inline-block">
              {roleLabels[userRole] || userRole}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 bg-brand-darkgrey text-brand-grey hover:text-white hover:bg-brand-red/10 border border-brand-grey/10 hover:border-brand-red/30 transition-all cursor-pointer skew-x-[-6deg]"
            title="Sair do Sistema"
          >
            <span className="skew-x-[6deg] block">
              <LogOut className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
