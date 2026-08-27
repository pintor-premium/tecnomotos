-- 1. Add Stripe sync columns to products table
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
    ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
    ADD COLUMN IF NOT EXISTS stripe_sync_status TEXT DEFAULT 'pending' CONSTRAINT chk_stripe_sync_status CHECK (stripe_sync_status IN ('pending', 'syncing', 'synced', 'error')),
    ADD COLUMN IF NOT EXISTS stripe_sync_error TEXT,
    ADD COLUMN IF NOT EXISTS stripe_last_synced_at TIMESTAMPTZ;

-- 2. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_payment' CONSTRAINT chk_order_status CHECK (status IN ('pending_payment', 'paid', 'payment_failed', 'expired')),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stripe_checkout_session_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_orders_modtime 
BEFORE UPDATE ON public.orders 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 3. Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create stripe_processed_events table for idempotency
CREATE TABLE IF NOT EXISTS public.stripe_processed_events (
    event_id TEXT PRIMARY KEY,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_processed_events ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for orders
CREATE POLICY select_orders ON public.orders FOR SELECT USING (
    customer_id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'orders.view')
);

CREATE POLICY insert_orders ON public.orders FOR INSERT WITH CHECK (
    customer_id = auth.uid()
);

CREATE POLICY update_orders ON public.orders FOR UPDATE USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'orders.update')
);

CREATE POLICY delete_orders ON public.orders FOR DELETE USING (
    public.is_owner(auth.uid())
);

-- 7. RLS Policies for order_items
CREATE POLICY select_order_items ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id AND (
            o.customer_id = auth.uid() OR
            public.is_owner(auth.uid()) OR
            public.has_permission(auth.uid(), 'orders.view')
        )
    )
);

CREATE POLICY insert_order_items ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id AND o.customer_id = auth.uid()
    )
);

-- 8. RLS Policies for stripe_processed_events
CREATE POLICY select_stripe_events ON public.stripe_processed_events FOR SELECT USING (
    public.is_owner(auth.uid())
);

CREATE POLICY modify_stripe_events ON public.stripe_processed_events FOR ALL USING (
    public.is_owner(auth.uid())
);
