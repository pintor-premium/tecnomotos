-- Manual cash flow transactions
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CONSTRAINT chk_financial_type CHECK (type IN ('INCOME', 'EXPENSE')),
    status TEXT NOT NULL DEFAULT 'PENDING' CONSTRAINT chk_financial_status CHECK (status IN ('PENDING', 'PAID', 'CANCELLED')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT,
    due_date DATE,
    paid_at TIMESTAMPTZ,
    source TEXT NOT NULL DEFAULT 'MANUAL' CONSTRAINT chk_financial_source CHECK (source IN ('MANUAL', 'ORDER', 'SERVICE_ORDER', 'INVENTORY', 'FISCAL')),
    source_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_financial_transactions_modtime
BEFORE UPDATE ON public.financial_transactions
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_financial_transactions ON public.financial_transactions FOR SELECT USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'financial.view')
);

CREATE POLICY insert_financial_transactions ON public.financial_transactions FOR INSERT WITH CHECK (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'financial.create')
);

CREATE POLICY update_financial_transactions ON public.financial_transactions FOR UPDATE USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'financial.update')
);

CREATE POLICY delete_financial_transactions ON public.financial_transactions FOR DELETE USING (
    public.is_owner(auth.uid())
);
