import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

export default function AccessDeniedPage() {
  return (
    <main className="min-h-screen bg-brand-black text-white flex flex-col items-center justify-center p-4 telemetry-grid">
      <div className="max-w-md w-full text-center space-y-8 bg-brand-card border border-brand-red/25 p-8 relative overflow-hidden shadow-2xl skew-x-[-2deg]">
        <div className="skew-x-[2deg] flex flex-col items-center">
          {/* Logo */}
          <Link href="/" className="cursor-pointer hover:opacity-90 transition-opacity">
            <Logo className="mb-6" />
          </Link>

          {/* Alert icon */}
          <div className="w-16 h-16 bg-brand-red/10 text-brand-red border border-brand-red/25 flex items-center justify-center rounded-full mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-black italic uppercase tracking-wider text-white mb-2">
            Acesso Restrito
          </h1>
          
          <p className="text-xs font-mono text-brand-grey uppercase tracking-widest mb-6">
            Erro 403: Acesso proibido
          </p>

          <p className="text-sm text-brand-silver mb-8 max-w-xs leading-relaxed">
            Você não possui permissão de telemetria suficiente para acessar este módulo de controle.
          </p>

          <Button variant="primary" href="/admin/dashboard" className="w-full">
            Voltar ao Painel
          </Button>
        </div>
        
        {/* Aerodynamic background stripes */}
        <div className="absolute top-0 right-0 w-24 h-1 bg-brand-red" />
        <div className="absolute bottom-0 left-0 w-24 h-1 bg-brand-red" />
      </div>
    </main>
  );
}
