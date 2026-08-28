-- Customer CRM interactions and follow-ups
CREATE TABLE IF NOT EXISTS public.customer_crm_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    interaction_type TEXT NOT NULL DEFAULT 'NOTE' CONSTRAINT chk_crm_interaction_type CHECK (interaction_type IN ('CALL', 'WHATSAPP', 'EMAIL', 'VISIT', 'NOTE')),
    subject TEXT NOT NULL,
    description TEXT,
    outcome TEXT,
    priority TEXT NOT NULL DEFAULT 'NORMAL' CONSTRAINT chk_crm_priority CHECK (priority IN ('LOW', 'NORMAL', 'HIGH')),
    status TEXT NOT NULL DEFAULT 'OPEN' CONSTRAINT chk_crm_status CHECK (status IN ('OPEN', 'FOLLOW_UP', 'DONE', 'CANCELLED')),
    follow_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_customer_crm_interactions_modtime
BEFORE UPDATE ON public.customer_crm_interactions
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

ALTER TABLE public.customer_crm_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_customer_crm_interactions ON public.customer_crm_interactions FOR SELECT USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'crm.view')
);

CREATE POLICY insert_customer_crm_interactions ON public.customer_crm_interactions FOR INSERT WITH CHECK (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'customers.update')
);

CREATE POLICY update_customer_crm_interactions ON public.customer_crm_interactions FOR UPDATE USING (
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'customers.update')
);

CREATE POLICY delete_customer_crm_interactions ON public.customer_crm_interactions FOR DELETE USING (
    public.is_owner(auth.uid())
);
