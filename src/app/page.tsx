import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Shield, Zap, Flame, Compass, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  // Mock data for highlighted products (clearly marked as MOCK)
  const mockFeaturedProducts = [
    { id: '1', name: 'Escapamento Esportivo Carbon GP', category: 'Escapamentos', price: 2450.00, speedAccent: 'Alta Vazão' },
    { id: '2', name: 'Pastilha de Freio Sinterizada Racing', category: 'Freios', price: 280.00, speedAccent: 'Fricção Máxima' },
    { id: '3', name: 'Amortecedor Traseiro Regulável PRO', category: 'Suspensão', price: 1890.00, speedAccent: 'Ajuste Fino' },
    { id: '4', name: 'Pneu Superbike Slick Radial', category: 'Pneus', price: 1200.00, speedAccent: 'Aderência Pista' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isAuthenticated={false} />

      {/* Hero Section */}
      <section className="relative bg-brand-black border-b border-brand-grey/15 pt-20 pb-24 overflow-hidden telemetry-grid">
        {/* Imagem de Fundo Dinâmica */}
        <div className="absolute inset-0 z-0 opacity-45">
          <Image
            src="/hero.jpg"
            alt="TECNOMOTOS Workshop & Parts"
            fill
            className="object-cover object-center select-none"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Text and Actions */}
          <div className="max-w-xl text-left space-y-6">
            <Badge variant="danger" className="animate-pulse">
              MotoGP Heritage & Performance
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none text-white">
              PERFORMANCE <br />
              PARA SUA <span className="text-brand-red">MOTO</span>
            </h1>
            
            <p className="text-sm sm:text-base text-brand-grey leading-relaxed max-w-md">
              Peças de precisão, acessórios homologados e serviços de alta engenharia para quem exige o máximo em desempenho e segurança.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button variant="primary" size="lg" href="/login">
                Comprar Agora
              </Button>
              <Button variant="secondary" size="lg" href="/login">
                Agendar Oficina
              </Button>
            </div>
          </div>

          {/* Telemetry panel visual mock */}
          <div className="w-full max-w-md bg-brand-card border border-brand-grey/20 p-6 shadow-2xl relative skew-x-[-4deg]">
            <div className="skew-x-[4deg] space-y-4">
              <div className="flex justify-between items-center border-b border-brand-grey/15 pb-2">
                <span className="text-[10px] font-mono text-brand-grey tracking-widest uppercase">DIAGNOSTICO DE DADOS</span>
                <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-black/40 p-3 border border-brand-grey/10 font-mono">
                  <p className="text-[9px] text-brand-grey">MAX VELOCIDADE</p>
                  <p className="text-2xl font-black text-white italic">312 km/h</p>
                </div>
                <div className="bg-brand-black/40 p-3 border border-brand-grey/10 font-mono">
                  <p className="text-[9px] text-brand-grey">MOTOR GIROS</p>
                  <p className="text-2xl font-black text-brand-red italic">14.500 RPM</p>
                </div>
                <div className="bg-brand-black/40 p-3 border border-brand-grey/10 font-mono col-span-2">
                  <p className="text-[9px] text-brand-grey">PRESSÃO PNEUS (DIANTEIRO / TRASEIRO)</p>
                  <p className="text-base font-bold text-white italic">32 PSI / 29 PSI</p>
                </div>
              </div>
              <div className="w-full bg-brand-darkgrey h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-red h-full w-[85%] animate-pulse" />
              </div>
            </div>
            {/* Corner decals */}
            <div className="absolute top-0 right-0 w-8 h-1 bg-brand-red" />
            <div className="absolute bottom-0 left-0 w-8 h-1 bg-brand-red" />
          </div>
        </div>

        {/* Faded background design lines */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-grey/10 to-transparent" />
      </section>

      {/* Destaques (Mock list) */}
      <section className="bg-brand-black py-20 border-b border-brand-grey/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-brand-red font-bold">
                ESTOQUE DE COMPONENTES
              </span>
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white mt-2">
                Produtos em Destaque
              </h2>
            </div>
            <Link href="/login" className="text-xs font-mono uppercase tracking-widest text-brand-grey hover:text-white flex items-center gap-1 transition-colors">
              Ver Todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockFeaturedProducts.map((product) => (
              <Card key={product.id} hoverEffect className="flex flex-col justify-between" withStripe>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-mono text-brand-grey uppercase tracking-wider">
                      {product.category}
                    </span>
                    <Badge variant="info">{product.speedAccent}</Badge>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-4 line-clamp-2">{product.name}</h3>
                </div>
                <div className="mt-auto pt-4 border-t border-brand-grey/10 flex items-center justify-between">
                  <span className="text-base font-black text-white italic">
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <Button variant="secondary" size="sm" href="/login">
                    Detalhes
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Oficina e Soluções */}
      <section className="bg-brand-black/95 py-20 border-b border-brand-grey/15 telemetry-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-brand-red font-bold">
              ENGENHARIA MECÂNICA PREMIUM
            </span>
            <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white leading-none">
              Centro de Serviços Avançados
            </h2>
            <p className="text-sm text-brand-grey leading-relaxed">
              Nossa oficina conta com maquinário de telemetria, diagnóstico computadorizado de injeção eletrônica e profissionais especializados em superbikes e motos de alta performance.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <Wrench className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Prevenção e Ajuste</h4>
                  <p className="text-[11px] text-brand-grey">Manutenções periódicas completas.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Zap className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Preparação de Motor</h4>
                  <p className="text-[11px] text-brand-grey">Ganho de cavalaria e calibração de mapas.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Freios e Segurança</h4>
                  <p className="text-[11px] text-brand-grey">Manutenção e pastilhas homologadas.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Compass className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Geometria e Alinhamento</h4>
                  <p className="text-[11px] text-brand-grey">Suspensão ativa e ajustes de pista.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Metallic block */}
          <div className="bg-[#0f0f0f] border border-brand-grey/20 p-8 shadow-2xl skew-x-[3deg]">
            <div className="skew-x-[-3deg] space-y-6 text-left">
              <Flame className="w-8 h-8 text-brand-red" />
              <h3 className="text-lg font-black italic uppercase tracking-wider text-white">Agende Seu Diagnóstico</h3>
              <p className="text-xs text-brand-grey leading-relaxed">
                Faça o login em nosso sistema para cadastrar suas motocicletas, acompanhar o andamento de ordens de serviço, verificar o histórico de diagnósticos e emitir suas notas fiscais de serviços.
              </p>
              <Button variant="primary" href="/login" className="w-full">
                Agendar Agora
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
