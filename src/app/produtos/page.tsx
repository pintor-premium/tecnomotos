import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, HelpCircle } from 'lucide-react';

export default function PublicProductsPage() {
  // Publicly readable mock products (marked as mock in code)
  const mockProducts = [
    { code: 'ESC-GP-01', name: 'Escapamento Esportivo Carbon GP', brand: 'Akrapovic', price: 2450.00, category: 'Escapamentos' },
    { code: 'PST-RC-02', name: 'Pastilha de Freio Sinterizada Racing', brand: 'Brembo', price: 280.00, category: 'Freios' },
    { code: 'AMR-PR-03', name: 'Amortecedor Traseiro Regulável PRO', brand: 'Öhlins', price: 1890.00, category: 'Suspensão' },
    { code: 'PNE-SB-04', name: 'Pneu Superbike Slick Radial', brand: 'Pirelli', price: 1200.00, category: 'Pneus' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-black text-white">
      <Navbar isAuthenticated={false} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-left">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-red font-bold">
            CATÁLOGO PÚBLICO
          </span>
          <h1 className="text-3xl font-black italic uppercase tracking-tight text-white mt-1">
            Peças e Componentes
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Mock filters sidebar */}
          <div className="md:col-span-1">
            <Card className="p-4" withStripe>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white border-b border-brand-grey/15 pb-2 mb-3">
                Categorias [MOCK]
              </h3>
              <ul className="space-y-2 font-mono text-[11px] text-brand-grey">
                <li className="text-white font-bold cursor-pointer">Ver Todos</li>
                <li className="hover:text-white cursor-pointer">Escapamentos</li>
                <li className="hover:text-white cursor-pointer">Freios</li>
                <li className="hover:text-white cursor-pointer">Suspensão</li>
                <li className="hover:text-white cursor-pointer">Pneus</li>
              </ul>
            </Card>
          </div>

          {/* Product grid */}
          <div className="md:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProducts.map((p, idx) => (
                <Card key={idx} hoverEffect className="flex flex-col justify-between" withStripe>
                  <div>
                    <span className="text-[9px] font-mono text-brand-grey uppercase tracking-wider block mb-1">
                      {p.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mb-4 line-clamp-2">{p.name}</h3>
                  </div>
                  <div className="mt-auto pt-4 border-t border-brand-grey/10 flex flex-col gap-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[9px] font-mono text-brand-grey">Venda:</span>
                      <span className="text-base font-black text-white italic">
                        R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full" href="/login">
                      Comprar
                    </Button>
                  </div>
                  {/* Mock Indicator */}
                  <span className="absolute bottom-1 right-2 text-[8px] font-mono text-brand-grey/30">[MOCK]</span>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
