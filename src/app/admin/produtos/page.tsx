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
import { ShieldAlert, X, Check, Image as ImageIcon } from 'lucide-react';

interface Product {
  id?: string;
  sku: string;
  location: string;
  name: string;
  brand: string;
  price: number;
  stock_quantity: number;
  category: string;
  image_url?: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { success, error, info } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [sku, setSku] = useState('');
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showInStore, setShowInStore] = useState(false);

  // Fallback mock catalog items
  const mockProducts: Product[] = [
    { sku: 'ESC-GP-01', location: 'Corredor A', name: 'Escapamento Esportivo Carbon GP', brand: 'Akrapovic', price: 2450.00, stock_quantity: 12, category: 'Escapamentos' },
    { sku: 'PST-RC-02', location: 'Gaveta B', name: 'Pastilha de Freio Sinterizada Racing', brand: 'Brembo', price: 280.00, stock_quantity: 45, category: 'Freios' },
    { sku: 'AMR-PR-03', location: 'Corredor C', name: 'Amortecedor Traseiro Regulável PRO', brand: 'Öhlins', price: 1890.00, stock_quantity: 4, category: 'Suspensão' },
  ];

  const fetchProducts = async () => {
    try {
      const { data, error: fetchErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      if (data && data.length > 0) {
        setProducts(data as Product[]);
      } else {
        setProducts(mockProducts);
      }
    } catch (e: unknown) {
      console.warn('[Products] DB query failed, showing mock fallback: ', e);
      setProducts(mockProducts);
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

      // Check view permission
      const { data: hasView } = await supabase.rpc('has_permission', {
        user_uuid: user.id,
        required_permission: 'products.view'
      });

      if (!hasView) {
        router.push('/403');
        return;
      }

      // Check create permission
      const { data: hasCreate } = await supabase.rpc('has_permission', {
        user_uuid: user.id,
        required_permission: 'products.price.update'
      });

      setIsOwner(!!hasCreate);
      await fetchProducts();
    }

    checkAuthAndLoad();
  }, []);

  const resetForm = () => {
    setSku('');
    setLocation('');
    setName('');
    setBrand('');
    setCategory('');
    setPrice('');
    setStockQuantity('');
    setImageFile(null);
    setShowInStore(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleConfirmCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Resolve optional default fields
      const finalSku = sku.trim() || `SKU-${Math.floor(100000 + Math.random() * 900000)}`;
      const finalName = name.trim() || 'Produto Sem Nome';
      const finalPrice = parseFloat(price) || 0;
      const finalStock = parseInt(stockQuantity) || 0;

      // 2. Upload file to Supabase Storage if present
      let uploadedImageUrl = '';
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${finalSku}_${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedImageUrl = urlData.publicUrl;
      }

      // 3. Save product to Supabase DB products table
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          sku: finalSku,
          location: location.trim() || null,
          name: finalName,
          brand: brand.trim() || null,
          price: finalPrice,
          stock_quantity: finalStock,
          category: category.trim() || null,
          image_url: uploadedImageUrl || null,
          show_in_store: showInStore
        });

      if (insertError) throw insertError;

      // Reset form fields
      resetForm();

      // Show success overlay in the center of the screen
      setShowSuccessOverlay(true);

      // Auto close success overlay after 2.5 seconds, keeping modal open
      setTimeout(() => {
        setShowSuccessOverlay(false);
      }, 2500);

      // Refresh product list
      await fetchProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar produto.';
      error('Erro de Cadastro', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelarCadastro = () => {
    // If any field is filled, reset them
    if (sku || location || name || brand || category || price || stockQuantity || imageFile || showInStore) {
      resetForm();
      info('Campos Limpos', 'O formulário foi resetado para o próximo produto.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      p.sku.toLowerCase().includes(query) ||
      p.name.toLowerCase().includes(query) ||
      (p.brand && p.brand.toLowerCase().includes(query)) ||
      (p.location && p.location.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6 text-left relative">
      <div>
        <Breadcrumb items={[{ label: 'Catálogo' }, { label: 'Produtos' }]} />
        <div className="flex justify-between items-center mt-2 border-b border-brand-grey/15 pb-4">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Catálogo de Produtos
            </h1>
            <p className="text-xs text-brand-grey uppercase tracking-widest font-mono mt-1">
              Gerencie as peças, marcas e preços do estoque
            </p>
          </div>
          <Badge variant="neutral">Visualização de Catálogo</Badge>
        </div>
      </div>

      <Card className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-grey/15 pb-4">
          <div>
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
              Lista de Itens cadastrados
            </h4>
            <p className="text-[11px] text-brand-grey mt-0.5">Módulo estruturado integrado ao banco de dados.</p>
          </div>
          {isOwner ? (
            <Button size="sm" onClick={() => setIsModalOpen(true)}>Novo Produto</Button>
          ) : (
            <div className="flex items-center gap-2 text-brand-grey text-xs font-mono bg-brand-darkgrey p-2 border border-brand-grey/10">
              <ShieldAlert className="w-4 h-4 text-brand-red" />
              <span>Apenas OWNER pode criar produtos / gerenciar preços.</span>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="w-full max-w-sm">
          <Input
            placeholder="Pesquisar por código, nome, marca ou locação..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs font-mono"
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Locação</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Preço Venda</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono text-brand-red flex items-center gap-1.5">
                    {p.image_url ? <ImageIcon className="w-3.5 h-3.5 text-emerald-500" /> : null}
                    {p.sku}
                  </TableCell>
                  <TableCell className="font-mono text-brand-grey">{p.location || 'Sem Locação'}</TableCell>
                  <TableCell className="font-bold text-white">{p.name}</TableCell>
                  <TableCell>{p.brand || 'Genérico'}</TableCell>
                  <TableCell className="font-mono text-white">
                    R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="font-mono">{p.stock_quantity} un</TableCell>
                  <TableCell className="text-right">
                    {isOwner ? (
                      <Button variant="secondary" size="sm">Editar Preço</Button>
                    ) : (
                      <span className="text-[11px] font-mono text-brand-grey uppercase">Somente Leitura</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* REGISTRATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-xs">
          <Card className="w-full max-w-xl mx-4 relative p-6 space-y-6 max-h-[90vh] overflow-y-auto" withStripe>
            {/* Close Button (X) */}
            <button
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="absolute top-4 right-4 text-brand-grey hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-black italic uppercase tracking-tight text-white">
                Cadastrar Novo Produto
              </h3>
              <p className="text-[10px] text-brand-grey font-mono uppercase tracking-widest mt-1">
                Adicione peças ou componentes ao catálogo da TECNOMOTOS
              </p>
            </div>

            <form onSubmit={handleConfirmCadastro} className="space-y-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Código (SKU) (Opcional)</label>
                  <Input
                    placeholder="Auto-gerado se vazio"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Locação de Estoque</label>
                  <Input
                    placeholder="Ex: Corredor D"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Nome do Produto (Opcional)</label>
                  <Input
                    placeholder="Ex: Pneu Pirelli Superbike Diablo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Marca</label>
                  <Input
                    placeholder="Ex: Pirelli"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Categoria</label>
                  <Input
                    placeholder="Ex: Pneus"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Preço de Venda (R$) (Opcional)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Estoque Inicial (Qtd) (Opcional)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                  />
                </div>
                {/* Checkbox for show_in_store */}
                <div className="flex items-center gap-2 md:col-span-2 pt-2 pb-1">
                  <input
                    type="checkbox"
                    id="showInStore"
                    checked={showInStore}
                    onChange={(e) => setShowInStore(e.target.checked)}
                    className="w-4 h-4 rounded border-brand-grey/25 bg-brand-input text-brand-red focus:ring-brand-red focus:ring-offset-brand-black"
                  />
                  <label htmlFor="showInStore" className="text-xs font-mono text-white cursor-pointer select-none uppercase tracking-wider">
                    Disponibilizar este produto na Loja Online
                  </label>
                </div>
                {/* Product Photo Upload Field */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-mono text-brand-grey uppercase">Foto do Produto</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs font-mono bg-brand-input border border-brand-grey/25 text-brand-grey rounded px-3 py-2 focus:outline-none focus:border-brand-red cursor-pointer file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-mono file:font-bold file:uppercase file:bg-brand-red file:text-white file:hover:bg-brand-darkred file:cursor-pointer"
                  />
                  {imageFile && (
                    <p className="text-[10px] text-emerald-500 font-mono mt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Imagem selecionada: {imageFile.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-brand-grey/10">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelarCadastro}
                >
                  Cancelar Cadastro
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Salvando...' : 'Confirmar Cadastro'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* CENTER SCREEN SUCCESS BANNER */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-brand-card border border-emerald-500/35 p-8 rounded shadow-2xl flex flex-col items-center gap-4 text-center max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-500">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black tracking-wider uppercase text-emerald-500 leading-tight">
              PRODUTO CADASTRADO COM SUCESSO!
            </h3>
            <p className="text-[11px] text-brand-grey leading-normal">
              O formulário foi resetado. Você pode continuar cadastrando produtos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
