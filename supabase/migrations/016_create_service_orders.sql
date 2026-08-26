-- Create service_orders table
CREATE TABLE IF NOT EXISTS public.service_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.customer_vehicles(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL, -- Mechanic allocated
    service_type TEXT NOT NULL, -- Type of service (e.g. "Troca de Óleo", "Revisão Geral")
    description TEXT, -- Problem description
    status TEXT NOT NULL DEFAULT 'PENDING' CONSTRAINT chk_so_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT, -- Observations
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_service_orders_modtime 
BEFORE UPDATE ON public.service_orders 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Enable RLS
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

-- 1. SELECT POLICY
CREATE POLICY select_service_orders ON public.service_orders FOR SELECT USING (
    customer_id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'service_orders.view')
);

-- 2. INSERT POLICY
CREATE POLICY insert_service_orders ON public.service_orders FOR INSERT WITH CHECK (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'service_orders.create')
);

-- 3. UPDATE POLICY
CREATE POLICY update_service_orders ON public.service_orders FOR UPDATE USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'service_orders.update')
);

-- 4. DELETE POLICY
CREATE POLICY delete_service_orders ON public.service_orders FOR DELETE USING (
    public.is_owner(auth.uid())
);
