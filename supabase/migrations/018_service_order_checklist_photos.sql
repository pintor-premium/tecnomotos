-- Service order entry checklist items
CREATE TABLE IF NOT EXISTS public.service_order_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
    label TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OK' CONSTRAINT chk_so_checklist_status CHECK (status IN ('OK', 'ATTENTION', 'DAMAGED', 'NOT_APPLICABLE')),
    notes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_service_order_checklist_items_modtime
BEFORE UPDATE ON public.service_order_checklist_items
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

ALTER TABLE public.service_order_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_service_order_checklist_items ON public.service_order_checklist_items FOR SELECT USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'service_orders.view')
);

CREATE POLICY insert_service_order_checklist_items ON public.service_order_checklist_items FOR INSERT WITH CHECK (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'service_orders.create') OR
    public.has_permission(auth.uid(), 'service_orders.update')
);

CREATE POLICY update_service_order_checklist_items ON public.service_order_checklist_items FOR UPDATE USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'service_orders.update')
);

CREATE POLICY delete_service_order_checklist_items ON public.service_order_checklist_items FOR DELETE USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'service_orders.update')
);

-- Service order intake photos
CREATE TABLE IF NOT EXISTS public.service_order_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_order_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_service_order_photos ON public.service_order_photos FOR SELECT USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'service_orders.view')
);

CREATE POLICY insert_service_order_photos ON public.service_order_photos FOR INSERT WITH CHECK (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'service_orders.create') OR
    public.has_permission(auth.uid(), 'service_orders.update')
);

CREATE POLICY delete_service_order_photos ON public.service_order_photos FOR DELETE USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'service_orders.update')
);

-- Public bucket for service order motorcycle photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-order-photos', 'service-order-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public select on service-order-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-order-photos');

CREATE POLICY "Allow workshop users to manage service-order-photos"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'service-order-photos' AND (
        public.is_owner(auth.uid()) OR
        public.has_permission(auth.uid(), 'service_orders.create') OR
        public.has_permission(auth.uid(), 'service_orders.update')
    )
)
WITH CHECK (
    bucket_id = 'service-order-photos' AND (
        public.is_owner(auth.uid()) OR
        public.has_permission(auth.uid(), 'service_orders.create') OR
        public.has_permission(auth.uid(), 'service_orders.update')
    )
);
