-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FISCAL DOCUMENTS (NFC-e Future)
CREATE TABLE IF NOT EXISTS public.fiscal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID, -- For future linkage to orders
    invoice_number TEXT,
    series TEXT,
    xml_url TEXT,
    danfe_url TEXT,
    status TEXT NOT NULL DEFAULT 'EMITTED' CONSTRAINT chk_fiscal_status CHECK (status IN ('EMITTED', 'CANCELLED', 'ERROR')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FISCAL EVENTS
CREATE TABLE IF NOT EXISTS public.fiscal_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.fiscal_documents(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL, -- SEND, CANCEL, RETRY
    payload JSONB,
    response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TRIGGERS for updated_at
CREATE TRIGGER update_fiscal_docs_modtime BEFORE UPDATE ON public.fiscal_documents FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_events ENABLE ROW LEVEL SECURITY;

-- Audit Logs select policy: Only Owner and reports-viewer can see logs
CREATE POLICY select_audit_logs ON public.audit_logs FOR SELECT USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'reports.view')
);

-- Block direct user modifications (system/triggers insert logs and bypass RLS)
CREATE POLICY block_audit_log_mods ON public.audit_logs FOR ALL USING (false);

-- Fiscal Documents policies
CREATE POLICY select_fiscal_docs ON public.fiscal_documents FOR SELECT USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'fiscal.view')
);

CREATE POLICY modify_fiscal_docs ON public.fiscal_documents FOR ALL USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'fiscal.create')
);

-- Fiscal Events policies
CREATE POLICY select_fiscal_events ON public.fiscal_events FOR SELECT USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'fiscal.view')
);

CREATE POLICY modify_fiscal_events ON public.fiscal_events FOR ALL USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'fiscal.create')
);
