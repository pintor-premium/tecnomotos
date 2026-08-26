'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Wrench,
  Plus,
  Search,
  X,
  Check,
  User,
  Bike,
  ClipboardList,
  Calendar,
  AlertTriangle,
  Play,
  CheckSquare,
  Slash
} from 'lucide-react';

interface ServiceOrder {
  id: string;
  customer_id: string;
  vehicle_id: string;
  employee_id: string | null;
  service_type: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  total_price: number;
  notes: string | null;
  created_at: string;
  customer?: {
    full_name: string;
  };
  vehicle?: {
    brand: string;
    model: string;
    plate: string;
  };
  mechanic?: {
    full_name: string;
  };
}

interface CustomerOption {
  id: string;
  full_name: string;
}

interface VehicleOption {
  id: string;
  brand: string;
  model: string;
  plate: string;
}

interface MechanicOption {
  id: string;
  full_name: string;
}

export default function AdminWorkshopPage() {
  const router = useRouter();
  const supabase = createClient();
  const { success, error, info } = useToast();

  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [mechanics, setMechanics] = useState<MechanicOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Create Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const [selectedCustId, setSelectedCustId] = useState('');
  const [selectedVehId, setSelectedVehId] = useState('');
  const [selectedMechId, setSelectedMechId] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [notes, setNotes] = useState('');

  // Edit / Details Modal States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSO, setSelectedSO] = useState<ServiceOrder | null>(null);
  const [showEditSuccessOverlay, setShowEditSuccessOverlay] = useState(false);
  const [eMechId, setEMechId] = useState('');
  const [eServiceType, setEServiceType] = useState('');
  const [eDescription, setEDescription] = useState('');
  const [eTotalPrice, setETotalPrice] = useState('');
  const [eNotes, setENotes] = useState('');

  const fetchServiceOrders = async () => {
    try {
      const { data, error: fetchErr } = await supabase
        .from('service_orders')
        .select(`
          id,
          customer_id,
          vehicle_id,
          employee_id,
          service_type,
          description,
          status,
          total_price,
          notes,
          created_at,
          customer: customer_id (
            id,
            profiles: id (
              full_name
            )
          ),
          vehicle: vehicle_id (
            brand,
            model,
            plate
          ),
          employee: employee_id (
            id,
            profiles: id (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      const formatted = (data || []).map((so: any) => {
        // Resolve customer profile
        const custProfile = so.customer?.profiles;
        const custName = Array.isArray(custProfile) 
          ? custProfile[0]?.full_name 
          : custProfile?.full_name || 'Desconhecido';

        // Resolve mechanic profile
        const mechProfile = so.employee?.profiles;
        const mechName = Array.isArray(mechProfile)
          ? mechProfile[0]?.full_name
          : mechProfile?.full_name || 'Não alocado';

        return {
          id: so.id,
          customer_id: so.customer_id,
          vehicle_id: so.vehicle_id,
          employee_id: so.employee_id,
          service_type: so.service_type,
          description: so.description,
          status: so.status,
          total_price: parseFloat(so.total_price) || 0,
          notes: so.notes,
          created_at: so.created_at,
          customer: { full_name: custName },
          vehicle: so.vehicle ? {
            brand: so.vehicle.brand,
            model: so.vehicle.model,
            plate: so.vehicle.plate
          } : undefined,
          mechanic: { full_name: mechName }
        };
      });

      setServiceOrders(formatted as ServiceOrder[]);
    } catch (e: unknown) {
      console.warn('[Workshop] Fetch orders failed: ', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFormOptions = async () => {
    try {
      // Fetch customers
      const { data: custs } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          customers ( id )
        `)
        .order('full_name');

      const formattedCusts = (custs || [])
        .filter((item: any) => item.customers)
        .map((item: any) => ({
          id: item.id,
          full_name: item.full_name
        }));
      setCustomers(formattedCusts);

      // Fetch mechanics/employees
      const { data: emps } = await supabase
        .from('employees')
        .select(`
          id,
          profiles: id (
            full_name
          )
        `);

      const formattedEmps = (emps || []).map((item: any) => {
        const p = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
        return {
          id: item.id,
          full_name: p?.full_name || 'Funcionário'
        };
      });
      setMechanics(formattedEmps);
    } catch (e) {
      console.warn('[Workshop] Error fetching form options:', e);
    }
  };

  useEffect(() => {
    async function checkAuthAndLoad() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: hasView } = await supabase.rpc('has_permission', {
        user_uuid: user.id,
        required_permission: 'service_orders.view'
      });

      if (!hasView) {
        router.push('/403');
        return;
      }

      const { data: hasCreate } = await supabase.rpc('has_permission', {
        user_uuid: user.id,
        required_permission: 'service_orders.create'
      });

      setIsOwner(!!hasCreate);
      await fetchServiceOrders();
      await fetchFormOptions();
    }

    checkAuthAndLoad();
  }, []);

  // Fetch vehicles dynamic filter
  useEffect(() => {
    async function fetchCustomerVehicles() {
      if (!selectedCustId) {
        setVehicles([]);
        return;
      }

      const { data: vehs } = await supabase
        .from('customer_vehicles')
        .select('id, brand, model, plate')
        .eq('customer_id', selectedCustId)
        .order('brand');

      setVehicles(vehs || []);
    }

    fetchCustomerVehicles();
  }, [selectedCustId]);

  const resetCreateForm = () => {
    setSelectedCustId('');
    setSelectedVehId('');
    setSelectedMechId('');
    setServiceType('');
    setDescription('');
    setTotalPrice('');
    setNotes('');
  };

  const handleConfirmCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustId || !selectedVehId || !serviceType) {
      error('Campos Obrigatórios', 'Cliente, Veículo e Tipo de Serviço são necessários.');
      return;
    }

    setIsSaving(true);
    try {
      const { error: insErr } = await supabase
        .from('service_orders')
        .insert({
          customer_id: selectedCustId,
          vehicle_id: selectedVehId,
          employee_id: selectedMechId || null,
          service_type: serviceType,
          description: description || null,
          total_price: parseFloat(totalPrice) || 0.00,
          notes: notes || null,
          status: 'PENDING'
        });

      if (insErr) throw insErr;

      resetCreateForm();
      setIsCreateModalOpen(false);
      setShowSuccessOverlay(true);
      setTimeout(() => {
        setShowSuccessOverlay(false);
      }, 2500);

      await fetchServiceOrders();
    } catch (err: any) {
      error('Erro ao salvar', err.message || 'Falha ao criar OS.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelarCadastro = () => {
    if (selectedCustId || serviceType || description) {
      resetCreateForm();
      info('Campos Limpos', 'O formulário foi resetado.');
    }
  };

  // Details & Status Actions
  const handleOpenDetails = (so: ServiceOrder) => {
    setSelectedSO(so);
    setEMechId(so.employee_id || '');
    setEServiceType(so.service_type);
    setEDescription(so.description || '');
    setETotalPrice(so.total_price.toString());
    setENotes(so.notes || '');
    setIsDetailModalOpen(true);
  };

  const handleUpdateSO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSO) return;

    try {
      const { error: err } = await supabase
        .from('service_orders')
        .update({
          employee_id: eMechId || null,
          service_type: eServiceType,
          description: eDescription || null,
          total_price: parseFloat(eTotalPrice) || 0.00,
          notes: eNotes || null
        })
        .eq('id', selectedSO.id);

      if (err) throw err;

      setIsDetailModalOpen(false);
      setShowEditSuccessOverlay(true);
      setTimeout(() => {
        setShowEditSuccessOverlay(false);
      }, 2500);

      await fetchServiceOrders();
    } catch (err: any) {
      error('Erro de Atualização', err.message);
    }
  };

  const updateStatus = async (status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => {
    if (!selectedSO) return;

    try {
      const { error: err } = await supabase
        .from('service_orders')
        .update({ status })
        .eq('id', selectedSO.id);

      if (err) throw err;

      success('Status Atualizado', `Ordem de serviço movida para ${status}.`);
      setIsDetailModalOpen(false);
      await fetchServiceOrders();
    } catch (err: any) {
      error('Erro ao atualizar status', err.message);
    }
  };

  const filteredOrders = serviceOrders.filter((so) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || (
      so.customer?.full_name.toLowerCase().includes(query) ||
      so.service_type.toLowerCase().includes(query) ||
      (so.vehicle && so.vehicle.plate.toLowerCase().includes(query)) ||
      (so.vehicle && so.vehicle.model.toLowerCase().includes(query))
    );

    const matchesStatus = statusFilter === 'ALL' || so.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      <div>
        <Breadcrumb items={[{ label: 'Oficina' }, { label: 'Ordens de Serviço' }]} />
        <div className="flex justify-between items-center mt-2 border-b border-brand-grey/15 pb-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Oficina Mecânica
            </h1>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mt-1">
              Controle ordens de serviço, checklist de entrada e mecânicos alocados
            </p>
          </div>
          {isOwner && (
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Nova Ordem de Serviço
            </Button>
          )}
        </div>
      </div>

      <Card>
        {/* Search & Status Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative w-full max-w-sm">
            <Input
              placeholder="Buscar por cliente, serviço, placa ou modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs font-mono bg-brand-input"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-grey/60 pointer-events-none z-10" />
          </div>

          {/* Status Tabs */}
          <div className="flex bg-brand-black p-1 border border-brand-grey/10 rounded font-mono text-[10px] uppercase">
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'PENDING', label: 'Pendente' },
              { id: 'IN_PROGRESS', label: 'Em Andamento' },
              { id: 'COMPLETED', label: 'Concluído' },
              { id: 'CANCELLED', label: 'Cancelado' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded transition-colors ${statusFilter === tab.id ? 'bg-brand-red text-white font-bold' : 'text-brand-grey hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-brand-grey font-mono text-xs">
            Nenhuma ordem de serviço correspondente encontrada.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>OS / Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Motocicleta</TableHead>
                <TableHead>Serviço Solicitado</TableHead>
                <TableHead>Mecânico Alocado</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((so) => (
                <TableRow key={so.id}>
                  <TableCell className="font-mono text-xs text-brand-red">
                    <div>#{so.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-[10px] text-brand-grey mt-0.5">
                      {new Date(so.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-white">{so.customer?.full_name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {so.vehicle ? (
                      <div>
                        <div className="text-white">{so.vehicle.brand} {so.vehicle.model}</div>
                        <div className="text-brand-grey text-[10px] mt-0.5">{so.vehicle.plate}</div>
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-white font-bold">{so.service_type}</TableCell>
                  <TableCell>{so.mechanic?.full_name || '-'}</TableCell>
                  <TableCell className="font-mono text-white">
                    R$ {so.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {so.status === 'PENDING' && (
                      <Badge variant="neutral" className="text-[9px] bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">PENDENTE</Badge>
                    )}
                    {so.status === 'IN_PROGRESS' && (
                      <Badge variant="neutral" className="text-[9px] bg-sky-500/15 text-sky-400 border border-sky-500/25">EM ANDAMENTO</Badge>
                    )}
                    {so.status === 'COMPLETED' && (
                      <Badge variant="success" className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">REALIZADO</Badge>
                    )}
                    {so.status === 'CANCELLED' && (
                      <Badge variant="danger" className="text-[9px] bg-red-500/15 text-red-400 border border-red-500/25">CANCELADO</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="secondary" size="sm" onClick={() => handleOpenDetails(so)}>
                      Gerenciar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-xs">
          <Card className="w-full max-w-2xl mx-4 relative p-6 space-y-6 max-h-[90vh] overflow-y-auto" withStripe>
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                resetCreateForm();
              }}
              className="absolute top-4 right-4 text-brand-grey hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-brand-red" />
                Nova Ordem de Serviço
              </h3>
              <p className="text-[10px] text-brand-grey font-mono uppercase tracking-widest mt-1">
                Gere check-ins de oficina e associe mecânicos especialistas
              </p>
            </div>

            <form onSubmit={handleConfirmCreate} className="space-y-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Cliente</label>
                  <select
                    value={selectedCustId}
                    onChange={(e) => { setSelectedCustId(e.target.value); setSelectedVehId(''); }}
                    className="w-full text-xs font-mono bg-brand-input border border-brand-grey/25 text-white rounded px-3 py-2 focus:outline-none focus:border-brand-red"
                    required
                  >
                    <option value="">Selecione o Cliente</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Moto do Cliente</label>
                  <select
                    value={selectedVehId}
                    onChange={(e) => setSelectedVehId(e.target.value)}
                    className="w-full text-xs font-mono bg-brand-input border border-brand-grey/25 text-white rounded px-3 py-2 focus:outline-none focus:border-brand-red"
                    disabled={!selectedCustId}
                    required
                  >
                    <option value="">
                      {!selectedCustId ? 'Selecione o cliente primeiro' : 'Selecione a Moto'}
                    </option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Tipo de Serviço</label>
                  <Input
                    placeholder="Ex: Revisão Geral ou Troca de Relação"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Mecânico Alocado</label>
                  <select
                    value={selectedMechId}
                    onChange={(e) => setSelectedMechId(e.target.value)}
                    className="w-full text-xs font-mono bg-brand-input border border-brand-grey/25 text-white rounded px-3 py-2 focus:outline-none focus:border-brand-red"
                  >
                    <option value="">Nenhum Alocado (Deixar pendente)</option>
                    {mechanics.map((m) => (
                      <option key={m.id} value={m.id}>{m.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Preço Estimado (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Descrição do Problema</label>
                  <textarea
                    rows={3}
                    placeholder="Sintomas relatados pelo proprietário..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs font-mono bg-brand-input border border-brand-grey/25 text-white rounded px-3 py-2 focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Observações Internas</label>
                  <textarea
                    rows={2}
                    placeholder="Ferramentas especiais, peças a requerer do estoque..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs font-mono bg-brand-input border border-brand-grey/25 text-white rounded px-3 py-2 focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-brand-grey/10">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelarCadastro}
                >
                  CANCELAR CADASTRO
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Salvando...' : 'CONFIRMAR CADASTRO'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* CREATE SUCCESS OVERLAY */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-brand-card border border-emerald-500/35 p-8 rounded shadow-2xl flex flex-col items-center gap-4 text-center max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-500">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black tracking-wider uppercase text-emerald-500 leading-tight">
              ORDEM DE SERVIÇO CADASTRADA COM SUCESSO!
            </h3>
            <p className="text-[11px] text-brand-grey leading-normal">
              A ordem de serviço foi registrada com o status PENDENTE no sistema.
            </p>
          </div>
        </div>
      )}

      {/* DETAILS & ACTIONS MODAL */}
      {isDetailModalOpen && selectedSO && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-xs">
          <Card className="w-full max-w-2xl mx-4 relative p-6 space-y-6 max-h-[90vh] overflow-y-auto" withStripe>
            <button
              onClick={() => {
                setIsDetailModalOpen(false);
                setSelectedSO(null);
              }}
              className="absolute top-4 right-4 text-brand-grey hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                  OS #{selectedSO.id.slice(0, 8).toUpperCase()}
                </h3>
                <p className="text-[10px] text-brand-grey font-mono uppercase tracking-widest mt-1">
                  Gerencie o status e atualize o checklist de manutenção
                </p>
              </div>
              <div className="text-right">
                {selectedSO.status === 'PENDING' && (
                  <Badge variant="neutral" className="bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 font-mono">PENDENTE</Badge>
                )}
                {selectedSO.status === 'IN_PROGRESS' && (
                  <Badge variant="neutral" className="bg-sky-500/15 text-sky-400 border border-sky-500/25 font-mono">EM ANDAMENTO</Badge>
                )}
                {selectedSO.status === 'COMPLETED' && (
                  <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">SERVIÇO REALIZADO</Badge>
                )}
                {selectedSO.status === 'CANCELLED' && (
                  <Badge variant="danger" className="bg-red-500/15 text-red-400 border border-red-500/25 font-mono">CANCELADO</Badge>
                )}
              </div>
            </div>

            {/* QUICK STATUS TRANSITIONS */}
            <div className="bg-brand-black p-4 border border-brand-grey/10 rounded space-y-3">
              <h4 className="text-[10px] font-mono font-bold uppercase text-brand-grey tracking-wider">
                Ações Rápidas de Status:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedSO.status === 'PENDING' && (
                  <Button
                    onClick={() => updateStatus('IN_PROGRESS')}
                    size="sm"
                    className="bg-sky-600 hover:bg-sky-500 text-white font-mono text-[10px] flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" /> INICIAR SERVIÇO
                  </Button>
                )}
                {selectedSO.status === 'IN_PROGRESS' && (
                  <Button
                    onClick={() => updateStatus('COMPLETED')}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-3.5 h-3.5" /> FINALIZAR E CONCLUIR
                  </Button>
                )}
                {selectedSO.status !== 'COMPLETED' && selectedSO.status !== 'CANCELLED' && (
                  <Button
                    onClick={() => updateStatus('CANCELLED')}
                    variant="secondary"
                    size="sm"
                    className="text-red-400 hover:text-red-300 font-mono text-[10px] flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> CANCELAR OS
                  </Button>
                )}
                {(selectedSO.status === 'COMPLETED' || selectedSO.status === 'CANCELLED') && (
                  <Button
                    onClick={() => updateStatus('PENDING')}
                    variant="secondary"
                    size="sm"
                    className="text-yellow-400 hover:text-yellow-300 font-mono text-[10px] flex items-center gap-1.5"
                  >
                    REABRIR CHAMADO
                  </Button>
                )}
              </div>
            </div>

            {/* EDITABLE FORM */}
            <form onSubmit={handleUpdateSO} className="space-y-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Cliente (Fixo)</label>
                  <Input value={selectedSO.customer?.full_name || ''} disabled className="opacity-60" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Veículo / Placa (Fixo)</label>
                  <Input value={selectedSO.vehicle ? `${selectedSO.vehicle.brand} ${selectedSO.vehicle.model} (${selectedSO.vehicle.plate})` : ''} disabled className="opacity-60" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Tipo de Serviço</label>
                  <Input
                    value={eServiceType}
                    onChange={(e) => setEServiceType(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Mecânico Alocado</label>
                  <select
                    value={eMechId}
                    onChange={(e) => setEMechId(e.target.value)}
                    className="w-full text-xs font-mono bg-brand-input border border-brand-grey/25 text-white rounded px-3 py-2 focus:outline-none focus:border-brand-red"
                  >
                    <option value="">Nenhum Alocado</option>
                    {mechanics.map((m) => (
                      <option key={m.id} value={m.id}>{m.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Preço Estimado / Final (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={eTotalPrice}
                    onChange={(e) => setETotalPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Descrição do Problema</label>
                  <textarea
                    rows={3}
                    value={eDescription}
                    onChange={(e) => setEDescription(e.target.value)}
                    className="w-full text-xs font-mono bg-brand-input border border-brand-grey/25 text-white rounded px-3 py-2 focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Observações Internas</label>
                  <textarea
                    rows={2}
                    value={eNotes}
                    onChange={(e) => setENotes(e.target.value)}
                    className="w-full text-xs font-mono bg-brand-input border border-brand-grey/25 text-white rounded px-3 py-2 focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-brand-grey/10">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setSelectedSO(null);
                  }}
                >
                  CANCELAR
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  SALVAR ALTERAÇÕES
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* EDIT SUCCESS OVERLAY */}
      {showEditSuccessOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-brand-card border border-emerald-500/35 p-8 rounded shadow-2xl flex flex-col items-center gap-4 text-center max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-500">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black tracking-wider uppercase text-emerald-500 leading-tight">
              ORDEM DE SERVIÇO ATUALIZADA COM SUCESSO!
            </h3>
            <p className="text-[11px] text-brand-grey leading-normal">
              As modificações do chamado da oficina foram gravadas no banco de dados.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
