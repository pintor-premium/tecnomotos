import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

export default function PublicStorePage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-black text-white">
      <Navbar isAuthenticated={false} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-20 flex items-center justify-center telemetry-grid">
        <Card className="max-w-md w-full text-center p-8 space-y-6 skew-x-[-2deg]" withStripe>
          <div className="skew-x-[2deg] flex flex-col items-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-brand-red/10 text-brand-red border border-brand-red/25 flex items-center justify-center rounded-full mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>

            <Badge variant="danger" className="mb-2 animate-pulse">
              Fase de Desenvolvimento
            </Badge>

            <h1 className="text-xl font-black italic uppercase tracking-wider text-white mb-2">
              Loja Online TECNOMOTOS
            </h1>

            <p className="text-sm text-brand-silver leading-relaxed mb-6">
              A venda online de peças de alta performance, carrinhos de compras e checkout seguro via Stripe estará operacional na próxima etapa comercial.
            </p>

            <Button variant="secondary" className="w-full" href="/">
              Voltar ao Início
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
