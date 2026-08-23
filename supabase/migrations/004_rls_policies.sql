-- Enable Row Level Security (RLS) on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_vehicles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 1. PROFILES POLICIES
-- ==========================================
CREATE POLICY select_profiles ON public.profiles FOR SELECT USING (
    id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'customers.view') OR
    public.has_permission(auth.uid(), 'employees.view')
);

CREATE POLICY insert_profiles ON public.profiles FOR INSERT WITH CHECK (
    public.is_owner(auth.uid())
    -- Trigger handles signups as security definer, bypassing RLS
);

CREATE POLICY update_profiles ON public.profiles FOR UPDATE USING (
    id = auth.uid() OR
    public.is_owner(auth.uid())
);

CREATE POLICY delete_profiles ON public.profiles FOR DELETE USING (
    public.is_owner(auth.uid())
);

-- ==========================================
-- 2. ROLES / PERMISSIONS / ROLE_PERMISSIONS POLICIES
-- ==========================================
-- Read access for authenticated users
CREATE POLICY select_roles ON public.roles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY select_permissions ON public.permissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY select_role_permissions ON public.role_permissions FOR SELECT USING (auth.uid() IS NOT NULL);

-- Write access only for OWNER
CREATE POLICY modify_roles ON public.roles FOR ALL USING (public.is_owner(auth.uid()));
CREATE POLICY modify_permissions ON public.permissions FOR ALL USING (public.is_owner(auth.uid()));
CREATE POLICY modify_role_permissions ON public.role_permissions FOR ALL USING (public.is_owner(auth.uid()));

-- ==========================================
-- 3. USER_ROLES POLICIES
-- ==========================================
CREATE POLICY select_user_roles ON public.user_roles FOR SELECT USING (
    user_id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'employees.view')
);

CREATE POLICY modify_user_roles ON public.user_roles FOR ALL USING (public.is_owner(auth.uid()));

-- ==========================================
-- 4. EMPLOYEES POLICIES
-- ==========================================
CREATE POLICY select_employees ON public.employees FOR SELECT USING (
    id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'employees.view')
);

CREATE POLICY modify_employees ON public.employees FOR ALL USING (public.is_owner(auth.uid()));

-- ==========================================
-- 5. CUSTOMERS POLICIES
-- ==========================================
CREATE POLICY select_customers ON public.customers FOR SELECT USING (
    id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'customers.view')
);

CREATE POLICY insert_customers ON public.customers FOR INSERT WITH CHECK (
    id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'customers.create')
);

CREATE POLICY update_customers ON public.customers FOR UPDATE USING (
    id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'customers.update')
);

CREATE POLICY delete_customers ON public.customers FOR DELETE USING (
    public.is_owner(auth.uid())
);

-- ==========================================
-- 6. CUSTOMER_ADDRESSES POLICIES
-- ==========================================
CREATE POLICY select_addresses ON public.customer_addresses FOR SELECT USING (
    customer_id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'customers.view')
);

CREATE POLICY insert_addresses ON public.customer_addresses FOR INSERT WITH CHECK (
    customer_id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'customers.update')
);

CREATE POLICY update_addresses ON public.customer_addresses FOR UPDATE USING (
    customer_id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'customers.update')
);

CREATE POLICY delete_addresses ON public.customer_addresses FOR DELETE USING (
    customer_id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'customers.update')
);

-- ==========================================
-- 7. CUSTOMER_VEHICLES POLICIES
-- ==========================================
CREATE POLICY select_vehicles ON public.customer_vehicles FOR SELECT USING (
    customer_id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'customers.view') OR
    public.has_permission(auth.uid(), 'service_orders.view')
);

CREATE POLICY insert_vehicles ON public.customer_vehicles FOR INSERT WITH CHECK (
    customer_id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'customers.update') OR
    public.has_permission(auth.uid(), 'service_orders.create')
);

CREATE POLICY update_vehicles ON public.customer_vehicles FOR UPDATE USING (
    customer_id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'customers.update') OR
    public.has_permission(auth.uid(), 'service_orders.update')
);

CREATE POLICY delete_vehicles ON public.customer_vehicles FOR DELETE USING (
    customer_id = auth.uid() OR
    public.is_owner(auth.uid()) OR
    public.has_permission(auth.uid(), 'customers.update')
);
