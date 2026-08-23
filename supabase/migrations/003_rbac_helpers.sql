-- RBAC Helper Functions (SECURITY DEFINER)
-- These bypass RLS constraints for query resolution to prevent infinite recursion loop

-- Checks if a user is an OWNER
CREATE OR REPLACE FUNCTION public.is_owner(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_uuid AND r.name = 'OWNER'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Checks if a user has a specific permission key
CREATE OR REPLACE FUNCTION public.has_permission(user_uuid UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- First, check if the user is an OWNER. If so, they have all permissions.
    IF public.is_owner(user_uuid) THEN
        RETURN TRUE;
    END IF;

    -- Otherwise check explicit roles/permissions
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = user_uuid AND p.key = required_permission
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Retrieves the role name of a user
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    role_name TEXT;
BEGIN
    SELECT r.name INTO role_name
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid
    LIMIT 1;

    RETURN role_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to automatically create a profile and assign CUSTOMER role on auth sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    customer_role_id UUID;
BEGIN
    -- 1. Create public profile
    INSERT INTO public.profiles (id, full_name, email, avatar_url, status)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'ACTIVE'
    );

    -- 2. Fetch the CUSTOMER role ID
    SELECT id INTO customer_role_id FROM public.roles WHERE name = 'CUSTOMER';

    -- 3. Assign role to user_roles
    IF customer_role_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (NEW.id, customer_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;

    -- 4. Create customer profile details
    INSERT INTO public.customers (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Bind the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
