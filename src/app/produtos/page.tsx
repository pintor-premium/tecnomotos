'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

interface Product {
  sku: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  image_url?: string;
}

export default function PublicProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback mock items
  const mockProducts: Product[] = [
    { sku: 'ESC-GP-01', name: 'Escapamento Esportivo Carbon GP', brand: 'Akrapovic', price: 2450.00, category: 'Escapamentos' },
    { sku: 'PST-RC-02', name: 'Pastilha de Freio Sinterizada Racing', brand: 'Brembo', price: 280.00, category: 'Freios' },
    { sku: 'AMR-PR-03', name: 'Amortecedor Traseiro Regulável PRO', brand: 'Öhlins', price: 1890.00, category: 'Suspensão' },
    { sku: 'PNE-SB-04', name: 'Pneu Superbike Slick Radial', brand: 'Pirelli', price: 1200.00, category: 'Pneus' },
  ];

  const getProductImage = (sku: string, imageUrl?: string) => {
    if (imageUrl) return imageUrl;
    switch (sku) {
      case 'ESC-GP-01':
        return 'https://images.unsplash.com/photo-1615887023516-9b6bcd559e87?q=80&w=600&auto=format&fit=crop';
      case 'PST-RC-02':
        return 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=600&auto=format&fit=crop';
      case 'AMR-PR-03':
        return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop';
      case 'PNE-SB-04':
        return 'https://images.unsplash.com/photo-1591439657848-9f4b9ce436b9?q=80&w=600&auto=format&fit=crop';
      default:
        // Generic premium bike component placeholder
        return 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop';
    }
  };

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('sku, name, brand, price, category, image_url')
          .eq('show_in_store', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setProducts(data as Product[]);
        } else {
          setProducts(mockProducts);
        }
      } catch (err) {
        console.warn('[Products Catalog] DB fetch failed, using fallback catalog.', err);
        setProducts(mockProducts);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

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
          {/* Categories Sidebar */}
          <div className="md:col-span-1">
            <Card className="p-4" withStripe>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white border-b border-brand-grey/15 pb-2 mb-3">
                Categorias
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
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p, idx) => (
                  <Card key={idx} hoverEffect className="flex flex-col justify-between overflow-hidden" withStripe>
                    {/* Imagem do Produto */}
                    <div className="relative w-full h-40 bg-brand-darkgrey border-b border-brand-grey/10 mb-4 overflow-hidden rounded-t">
                      <Image
                        src={getProductImage(p.sku, p.image_url)}
                        alt={p.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300 select-none"
                        sizes="(max-w-7xl) 33vw, 100vw"
                      />
                    </div>

                    <div className="px-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-brand-grey uppercase tracking-wider block mb-1">
                          {p.category || 'Peças'}
                        </span>
                        <h3 className="text-sm font-bold text-white mb-4 line-clamp-2">{p.name}</h3>
                      </div>
                      <div className="mt-auto pt-4 border-t border-brand-grey/10 flex flex-col gap-3 pb-2">
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
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
