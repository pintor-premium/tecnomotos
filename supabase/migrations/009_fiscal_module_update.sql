-- 1. Create PRODUCTS table if not exists (or edit it)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    cost_price NUMERIC(10, 2),
    stock_quantity INTEGER DEFAULT 0,
    barcode TEXT,
    gtin TEXT,
    ncm TEXT,
    cest TEXT,
    cfop TEXT,
    cst TEXT,
    csosn TEXT,
    origin INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'UN',
    tax_rate NUMERIC(5, 2),
    tax_benefit TEXT,
    fiscal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Alter FISCAL_DOCUMENTS to support SEFAZ-MT layout
ALTER TABLE public.fiscal_documents 
    ADD COLUMN IF NOT EXISTS document_type TEXT CONSTRAINT chk_document_type CHECK (document_type IN ('NFCE', 'NFE', 'NFSE')),
    ADD COLUMN IF NOT EXISTS model TEXT DEFAULT '65',
    ADD COLUMN IF NOT EXISTS access_key TEXT,
    ADD COLUMN IF NOT EXISTS xml TEXT,
    ADD COLUMN IF NOT EXISTS signed_xml TEXT,
    ADD COLUMN IF NOT EXISTS authorized_xml TEXT,
    ADD COLUMN IF NOT EXISTS protocol TEXT,
    ADD COLUMN IF NOT EXISTS sefaz_code TEXT,
    ADD COLUMN IF NOT EXISTS sefaz_message TEXT,
    ADD COLUMN IF NOT EXISTS qr_code TEXT,
    ADD COLUMN IF NOT EXISTS issued_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS authorized_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS environment TEXT CONSTRAINT chk_environment CHECK (environment IN ('mock', 'homologation', 'production'));

-- 3. Alter FISCAL_EVENTS to support SEFAZ-MT response logs
ALTER TABLE public.fiscal_events
    ADD COLUMN IF NOT EXISTS sequence INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS xml TEXT,
    ADD COLUMN IF NOT EXISTS protocol TEXT,
    ADD COLUMN IF NOT EXISTS sefaz_code TEXT,
    ADD COLUMN IF NOT EXISTS sefaz_message TEXT;

-- 4. Create FISCAL_TRANSMISSIONS table
CREATE TABLE IF NOT EXISTS public.fiscal_transmissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fiscal_document_id UUID REFERENCES public.fiscal_documents(id) ON DELETE CASCADE,
    attempt INTEGER NOT NULL DEFAULT 1,
    environment TEXT NOT NULL,
    request_payload TEXT,
    response_payload TEXT,
    status TEXT NOT NULL,
    error_code TEXT,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create FISCAL_SETTINGS table
CREATE TABLE IF NOT EXISTS public.fiscal_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT,
    cnpj TEXT,
    state_registration TEXT,
    municipal_registration TEXT,
    uf TEXT NOT NULL DEFAULT 'MT',
    city TEXT,
    ibge_city_code TEXT,
    crt TEXT, -- Código de Regime Tributário
    tax_regime TEXT,
    nfe_series TEXT NOT NULL DEFAULT '1',
    nfce_series TEXT NOT NULL DEFAULT '1',
    nfce_next_number INTEGER NOT NULL DEFAULT 1,
    environment TEXT NOT NULL DEFAULT 'mock',
    certificate_provider TEXT NOT NULL DEFAULT 'A1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Trigger for updated_at in PRODUCTS and FISCAL_SETTINGS
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_fiscal_settings_modtime BEFORE UPDATE ON public.fiscal_settings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 7. Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_transmissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Products
CREATE POLICY select_products ON public.products FOR SELECT USING (true);
CREATE POLICY modify_products ON public.products FOR ALL USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'products.create') OR
    public.has_permission(auth.uid(), 'products.update') OR
    public.has_permission(auth.uid(), 'products.delete')
);

-- RLS Policies for Fiscal Transmissions
CREATE POLICY select_transmissions ON public.fiscal_transmissions FOR SELECT USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'fiscal.view')
);
CREATE POLICY modify_transmissions ON public.fiscal_transmissions FOR ALL USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'fiscal.create')
);

-- RLS Policies for Fiscal Settings
CREATE POLICY select_fiscal_settings ON public.fiscal_settings FOR SELECT USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'settings.view') OR
    public.has_permission(auth.uid(), 'fiscal.view')
);
CREATE POLICY modify_fiscal_settings ON public.fiscal_settings FOR ALL USING (
    public.is_owner(auth.uid())
);

-- 8. Atomic function for safe sequential number incrementing to prevent race conditions
CREATE OR REPLACE FUNCTION public.get_and_increment_nfce_number()
RETURNS INTEGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    -- Select with FOR UPDATE locks the row to prevent concurrent duplicate number fetches
    SELECT nfce_next_number INTO next_num
    FROM public.fiscal_settings
    LIMIT 1
    FOR UPDATE;
    
    UPDATE public.fiscal_settings
    SET nfce_next_number = nfce_next_number + 1;
    
    RETURN next_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Insert initial default setting row
INSERT INTO public.fiscal_settings (
    company_name, cnpj, state_registration, municipal_registration, uf, city, ibge_city_code, crt, tax_regime, nfe_series, nfce_series, nfce_next_number, environment
) VALUES (
    'TECNOMOTOS', NULL, NULL, NULL, 'MT', 'Tangará da Serra', '5107958', NULL, NULL, '1', '1', 1, 'mock'
) ON CONFLICT DO NOTHING;
