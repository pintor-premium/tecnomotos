-- SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for updated_at
CREATE TRIGGER update_settings_modtime BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Select: Authenticated users can view settings
CREATE POLICY select_settings ON public.settings FOR SELECT USING (auth.uid() IS NOT NULL);

-- Modify: Only OWNER can manage system settings
CREATE POLICY modify_settings ON public.settings FOR ALL USING (public.is_owner(auth.uid()));
