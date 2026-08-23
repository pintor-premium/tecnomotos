-- Trigger to automatically synchronize user roles to auth.users app_metadata
-- This allows roles to be decoded directly from the JWT/Session in Middleware without querying the database

CREATE OR REPLACE FUNCTION public.sync_user_role_to_auth()
RETURNS TRIGGER AS $$
DECLARE
    role_name TEXT;
    target_user_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_user_id := OLD.user_id;
    ELSE
        target_user_id := NEW.user_id;
    END IF;

    -- Fetch the role name for the user
    SELECT r.name INTO role_name
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = target_user_id
    LIMIT 1;

    -- Update auth.users raw_app_meta_data with the role
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || JSONB_BUILD_OBJECT('role', role_name)
    WHERE id = target_user_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Bind trigger
DROP TRIGGER IF EXISTS trigger_sync_user_role ON public.user_roles;
CREATE TRIGGER trigger_sync_user_role
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE PROCEDURE public.sync_user_role_to_auth();
