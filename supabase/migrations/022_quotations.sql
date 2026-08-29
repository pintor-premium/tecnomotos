CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    title TEXT NOT NULL,
    vehicle_info TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT' CONSTRAINT chk_quotation_status CHECK (status IN ('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED')),
    valid_until DATE,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    item_type TEXT NOT NULL DEFAULT 'SERVICE' CONSTRAINT chk_quotation_item_type CHECK (item_type IN ('PRODUCT', 'SERVICE')),
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_quotations_modtime
BEFORE UPDATE ON public.quotations
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_quotations ON public.quotations FOR SELECT USING (
    customer_id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'orders.view')
);

CREATE POLICY insert_quotations ON public.quotations FOR INSERT WITH CHECK (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'orders.create')
);

CREATE POLICY update_quotations ON public.quotations FOR UPDATE USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'orders.update')
);

CREATE POLICY delete_quotations ON public.quotations FOR DELETE USING (
    public.is_owner(auth.uid())
);

CREATE POLICY select_quotation_items ON public.quotation_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.quotations q
        WHERE q.id = quotation_items.quotation_id AND (
            q.customer_id = auth.uid() OR
            public.is_owner(auth.uid()) OR
            public.has_permission(auth.uid(), 'orders.view')
        )
    )
);

CREATE POLICY insert_quotation_items ON public.quotation_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.quotations q
        WHERE q.id = quotation_items.quotation_id AND (
            public.is_owner(auth.uid()) OR
            public.has_permission(auth.uid(), 'orders.create')
        )
    )
);

CREATE POLICY update_quotation_items ON public.quotation_items FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.quotations q
        WHERE q.id = quotation_items.quotation_id AND (
            public.is_owner(auth.uid()) OR
            public.has_permission(auth.uid(), 'orders.update')
        )
    )
);

CREATE POLICY delete_quotation_items ON public.quotation_items FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.quotations q
        WHERE q.id = quotation_items.quotation_id AND public.is_owner(auth.uid())
    )
);
