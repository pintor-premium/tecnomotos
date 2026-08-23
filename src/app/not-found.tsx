import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-brand-black text-white flex flex-col items-center justify-center p-4 telemetry-grid">
      <div className="max-w-md w-full text-center space-y-8 bg-brand-card border border-brand-grey/20 p-8 relative overflow-hidden shadow-2xl skew-x-[-2deg]">
        <div className="skew-x-[2deg] flex flex-col items-center">
          {/* Logo */}
          <Logo className="mb-6" />

          {/* Question Icon */}
          <div className="w-16 h-16 bg-brand-darkgrey text-brand-grey border border-brand-grey/20 flex items-center justify-center rounded-full mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-black italic uppercase tracking-wider text-white mb-2">
            Página Não Encontrada
          </h1>

          <p className="text-xs font-mono text-brand-grey uppercase tracking-widest mb-6">
            Erro 404: Not Found
          </p>

          <p className="text-sm text-brand-silver mb-8 max-w-xs leading-relaxed">
            A rota selecionada não existe no mapa da plataforma. Retorne à pista principal.
          </p>

          <Button variant="secondary" href="/" className="w-full">
            Voltar ao Início
          </Button>
        </div>
      </div>
    </main>
  );
}
