'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Plus, Eye, Download, CheckCircle, RefreshCw, AlertCircle, ShoppingCart, XCircle } from 'lucide-react';

interface FiscalDocument {
  id: string;
  order_id: string;
  invoice_number: string;
  series: string;
  xml_url: string;
  danfe_url: string;
  status: 'EMITTED' | 'CANCELLED' | 'ERROR';
  error_message?: string;
  created_at: string;
}

export default function AdminFiscalPage() {
  const router = useRouter();
  const supabase = createClient();
  const { success, error, info } = useToast();

  const [documents, setDocuments] = useState<FiscalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmitting, setIsEmitting] = useState<string | null>(null);

  // Mock orders available for invoice emission simulation
  const mockOrders = [
    {
      id: '3098',
      clientName: 'Sandro Müller',
      document: '123.456.789-00',
      description: 'Escapamento Akrapovic GP Carbon',
      paymentMethod: 'pix',
      total: 2450.00,
      items: [
        {
          id: 'p-1',
          name: 'Escapamento Akrapovic GP Carbon',
          price: 2450.00,
          quantity: 1,
          ncm: '8714.10.00',
          cfop: '5102',
          csosn: '102',
          origin: 0,
          unit: 'UN'
        }
      ]
    },
    {
      id: '3099',
      clientName: 'Mariana Souza',
      document: '987.654.321-11',
      description: 'Revisão Geral Superbike Setup',
      paymentMethod: 'card',
      total: 550.00,
      items: [
        {
          id: 's-1',
          name: 'Revisão Geral Superbike Setup',
          price: 550.00,
          quantity: 1,
          ncm: '9901.00.00',
          cfop: '5933',
          csosn: '400',
          origin: 0,
          unit: 'UN'
        }
      ]
    },
    {
      id: '3100',
      clientName: 'Carlos Ferreira',
      document: '444.555.666-77',
      description: 'Pneu Pirelli Slick + Balanceamento',
      paymentMethod: 'cash',
      total: 1320.00,
      items: [
        {
          id: 'p-2',
          name: 'Pneu Pirelli Slick Superbike',
          price: 1200.00,
          quantity: 1,
          ncm: '4011.40.00',
          cfop: '5102',
          csosn: '102',
          origin: 0,
          unit: 'UN'
        },
        {
          id: 's-2',
          name: 'Serviço de Balanceamento e Troca',
          price: 120.00,
          quantity: 1,
          ncm: '9901.00.00',
          cfop: '5933',
          csosn: '400',
          origin: 0,
          unit: 'UN'
        }
      ]
    }
  ];

  const fetchDocuments = async () => {
    try {
      const { data: docs, error: fetchErr } = await supabase
        .from('fiscal_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setDocuments(docs || []);
    } catch (e: unknown) {
      console.error(e);
      error('Erro ao Carregar', 'Não foi possível buscar as notas fiscais emitidas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function checkAuthAndLoad() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: hasPerm } = await supabase.rpc('has_permission', {
        user_uuid: user.id,
        required_permission: 'fiscal.view'
      });

      if (!hasPerm) {
        router.push('/403');
        return;
      }

      await fetchDocuments();
    }

    checkAuthAndLoad();
  }, []);

  const handleEmitInvoice = async (mockOrder: typeof mockOrders[0]) => {
    setIsEmitting(mockOrder.id);
    info('Conectando Sefaz', `Simulando emissão da NFC-e para o pedido #${mockOrder.id}...`);

    try {
      const response = await fetch('/api/fiscal/emit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: crypto.randomUUID(), // Simulated order UUID
          items: mockOrder.items,
          customerName: mockOrder.clientName,
          customerDocument: mockOrder.document,
          paymentMethod: mockOrder.paymentMethod,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro desconhecido na emissão.');
      }

      success(
        'NFC-e Autorizada',
        `Nota Nº ${result.document.invoice_number} (Série ${result.document.series}) emitida com sucesso!`
      );
      
      await fetchDocuments();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Falha na conexão.';
      error('Falha de Emissão', msg);
    } finally {
      setIsEmitting(null);
    }
  };

  const handleCheckStatus = (doc: FiscalDocument) => {
    success(
      'Sefaz OK',
      `Nota fiscal Nº ${doc.invoice_number} está AUTORIZADA e homologada em ambiente de teste.`
    );
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <Breadcrumb items={[{ label: 'Fiscal' }, { label: 'NFC-e' }]} />
        <div className="flex justify-between items-center mt-2 border-b border-brand-grey/15 pb-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Emissão Fiscal NFC-e
            </h1>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mt-1">
              Monitore e simule emissões de notas fiscais eletrônicas de vendas e serviços
            </p>
          </div>
          <Badge variant="danger" className="animate-pulse">Ambiente Mock</Badge>
        </div>
      </div>

      {/* Grid: Simulação de Pedidos Prontos para Emissão */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-grey border-b border-brand-grey/15 pb-2">
          Simular Emissão por Pedidos Pendentes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockOrders.map((order) => {
            const alreadyEmitted = documents.some(
              (doc) => doc.xml_url.includes(order.clientName.replace(' ', '%20')) || doc.invoice_number === order.id
            ); // Just a simple match representation for simulation UX

            return (
              <Card key={order.id} className="flex flex-col justify-between" withStripe>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-brand-grey">PEDIDO #{order.id}</span>
                    <Badge variant={order.paymentMethod === 'pix' ? 'success' : 'neutral'} className="text-[9px]">
                      {order.paymentMethod.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{order.description}</h3>
                    <p className="text-[11px] text-brand-grey mt-1 font-mono">Cliente: {order.clientName}</p>
                    <p className="text-[11px] text-brand-grey font-mono">CPF: {order.document}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-brand-grey/10 flex items-center justify-between">
                  <span className="text-sm font-black text-white italic">
                    R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isEmitting !== null}
                    onClick={() => handleEmitInvoice(order)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    {isEmitting === order.id ? 'Emitindo...' : 'Emitir NFC-e'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Listagem das Notas Fiscais Emitidas no Banco de Dados */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-grey border-b border-brand-grey/15 pb-2">
          Histórico de Documentos Fiscais
        </h2>

        {isLoading ? (
          <Card className="p-8 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </Card>
        ) : documents.length === 0 ? (
          <Card>
            <EmptyState
              title="Nenhuma nota fiscal emitida"
              description="Use os cards acima para simular o processo de geração e envio de uma NFC-e para a Sefaz."
            />
          </Card>
        ) : (
          <Card className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nota / Série</TableHead>
                  <TableHead>Status Sefaz</TableHead>
                  <TableHead>Data de Emissão</TableHead>
                  <TableHead>Documentos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-mono text-xs font-bold text-white">
                      Nº {doc.invoice_number} / S-{doc.series}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {doc.status === 'EMITTED' ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs text-emerald-500 font-bold">AUTORIZADA</span>
                          </>
                        ) : doc.status === 'ERROR' ? (
                          <>
                            <XCircle className="w-4 h-4 text-brand-red" />
                            <span className="text-xs text-brand-red font-bold">REJEITADA</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <span className="text-xs text-amber-500 font-bold">CANCELADA</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-brand-grey font-mono">
                      {new Date(doc.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <a
                          href={doc.danfe_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-mono text-brand-red hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          DANFE (PDF)
                        </a>
                        <a
                          href={doc.xml_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-mono text-brand-grey hover:text-white hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          XML
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCheckStatus(doc)}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
