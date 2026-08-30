-- Focus NFe incremental fiscal integration.
-- Keeps existing data and preserves mock mode as the default.

ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS fiscal_origin INTEGER,
    ADD COLUMN IF NOT EXISTS taxable_unit TEXT,
    ADD COLUMN IF NOT EXISTS taxable_quantity_factor NUMERIC(12, 6) DEFAULT 1,
    ADD COLUMN IF NOT EXISTS fiscal_tax_profile_id UUID;

CREATE TABLE IF NOT EXISTS public.fiscal_tax_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    document_type TEXT NOT NULL DEFAULT 'NFCE' CHECK (document_type IN ('NFCE', 'NFE', 'NFSE')),
    cfop TEXT,
    cst TEXT,
    csosn TEXT,
    origin INTEGER,
    unit TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_products_fiscal_tax_profile'
    ) THEN
        ALTER TABLE public.products
            ADD CONSTRAINT fk_products_fiscal_tax_profile
            FOREIGN KEY (fiscal_tax_profile_id)
            REFERENCES public.fiscal_tax_profiles(id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.fiscal_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES public.orders(id) ON DELETE RESTRICT NOT NULL,
    operation_type TEXT NOT NULL DEFAULT 'issue' CHECK (operation_type IN ('issue', 'query', 'cancel')),
    document_type TEXT NOT NULL DEFAULT 'NFCE' CHECK (document_type IN ('NFCE', 'NFE', 'NFSE')),
    reference TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL DEFAULT 'mock' CHECK (provider IN ('mock', 'focusnfe')),
    environment TEXT NOT NULL DEFAULT 'mock' CHECK (environment IN ('mock', 'homologation', 'production')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'authorized', 'rejected', 'cancelled', 'contingency', 'error')),
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_fiscal_operations_sale_nfce_active
ON public.fiscal_operations (sale_id, operation_type, document_type)
WHERE status IN ('pending', 'processing', 'authorized', 'contingency');

ALTER TABLE public.fiscal_documents DROP CONSTRAINT IF EXISTS chk_fiscal_status;

ALTER TABLE public.fiscal_documents
    ADD COLUMN IF NOT EXISTS fiscal_operation_id UUID REFERENCES public.fiscal_operations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS sale_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'mock',
    ADD COLUMN IF NOT EXISTS reference TEXT,
    ADD COLUMN IF NOT EXISTS provider_document_id TEXT,
    ADD COLUMN IF NOT EXISTS provider_status TEXT,
    ADD COLUMN IF NOT EXISTS error_code TEXT,
    ADD COLUMN IF NOT EXISTS issuer_cnpj TEXT,
    ADD COLUMN IF NOT EXISTS recipient_cpf_cnpj TEXT,
    ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS qrcode_url TEXT,
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

ALTER TABLE public.fiscal_documents
    ADD CONSTRAINT chk_fiscal_status CHECK (
        status IN (
            'pending', 'processing', 'authorized', 'rejected', 'cancelled', 'contingency', 'error',
            'EMITTED', 'CANCELLED', 'ERROR'
        )
    );

CREATE UNIQUE INDEX IF NOT EXISTS uniq_fiscal_documents_reference
ON public.fiscal_documents (reference)
WHERE reference IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_fiscal_documents_operation
ON public.fiscal_documents (fiscal_operation_id)
WHERE fiscal_operation_id IS NOT NULL;

ALTER TABLE public.fiscal_events
    ADD COLUMN IF NOT EXISTS fiscal_document_id UUID REFERENCES public.fiscal_documents(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS status TEXT,
    ADD COLUMN IF NOT EXISTS provider TEXT,
    ADD COLUMN IF NOT EXISTS reference TEXT,
    ADD COLUMN IF NOT EXISTS message TEXT,
    ADD COLUMN IF NOT EXISTS provider_code TEXT,
    ADD COLUMN IF NOT EXISTS metadata JSONB;

CREATE TABLE IF NOT EXISTS public.fiscal_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL DEFAULT 'focusnfe',
    reference TEXT,
    payload_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'duplicate', 'error')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_fiscal_tax_profiles_modtime'
    ) THEN
        CREATE TRIGGER update_fiscal_tax_profiles_modtime
        BEFORE UPDATE ON public.fiscal_tax_profiles
        FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_fiscal_operations_modtime'
    ) THEN
        CREATE TRIGGER update_fiscal_operations_modtime
        BEFORE UPDATE ON public.fiscal_operations
        FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
    END IF;
END $$;

ALTER TABLE public.fiscal_tax_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_webhook_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fiscal_tax_profiles' AND policyname = 'select_fiscal_tax_profiles') THEN
        CREATE POLICY select_fiscal_tax_profiles ON public.fiscal_tax_profiles FOR SELECT USING (
            public.is_owner(auth.uid()) OR public.has_permission(auth.uid(), 'fiscal.view')
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fiscal_tax_profiles' AND policyname = 'modify_fiscal_tax_profiles') THEN
        CREATE POLICY modify_fiscal_tax_profiles ON public.fiscal_tax_profiles FOR ALL USING (
            public.is_owner(auth.uid())
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fiscal_operations' AND policyname = 'select_fiscal_operations') THEN
        CREATE POLICY select_fiscal_operations ON public.fiscal_operations FOR SELECT USING (
            public.is_owner(auth.uid()) OR public.has_permission(auth.uid(), 'fiscal.view')
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fiscal_operations' AND policyname = 'modify_fiscal_operations') THEN
        CREATE POLICY modify_fiscal_operations ON public.fiscal_operations FOR ALL USING (
            public.is_owner(auth.uid()) OR public.has_permission(auth.uid(), 'fiscal.create')
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fiscal_webhook_events' AND policyname = 'select_fiscal_webhook_events') THEN
        CREATE POLICY select_fiscal_webhook_events ON public.fiscal_webhook_events FOR SELECT USING (
            public.is_owner(auth.uid()) OR public.has_permission(auth.uid(), 'fiscal.view')
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fiscal_webhook_events' AND policyname = 'modify_fiscal_webhook_events') THEN
        CREATE POLICY modify_fiscal_webhook_events ON public.fiscal_webhook_events FOR ALL USING (
            public.is_owner(auth.uid()) OR public.has_permission(auth.uid(), 'fiscal.create')
        );
    END IF;
END $$;
