'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-black text-white">
      <Navbar isAuthenticated={true} />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="w-full text-center p-8 space-y-6" withStripe>
          <div className="flex flex-col items-center">
            {/* Failure Cancel Icon */}
            <div className="w-16 h-16 bg-brand-red/10 text-brand-red border border-brand-red/25 flex items-center justify-center rounded-full mb-4">
              <XCircle className="w-8 h-8" />
            </div>

            <Badge variant="danger" className="mb-2">
              Pagamento não concluído
            </Badge>

            <h1 className="text-xl font-black italic uppercase tracking-wider text-white mb-2">
              Checkout Cancelado
            </h1>

            <p className="text-xs text-brand-grey leading-relaxed mb-6 font-mono">
              Sua transação não pôde ser processada. O pedido não foi fechado e nenhum valor foi cobrado do seu cartão.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button variant="primary" className="w-full flex items-center justify-center gap-1 font-bold" href="/carrinho">
              <ArrowLeft className="w-4 h-4" /> Voltar ao Carrinho
            </Button>
            <Button variant="secondary" className="w-full" href="/produtos">
              Voltar ao Catálogo
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
