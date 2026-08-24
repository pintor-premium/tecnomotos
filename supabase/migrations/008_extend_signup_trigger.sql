-- Extend trigger handle_new_user to capture phone and address from metadata on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    customer_role_id UUID;
    full_name_val TEXT;
    phone_val TEXT;
    street_val TEXT;
    number_val TEXT;
    complement_val TEXT;
    neighborhood_val TEXT;
    city_val TEXT;
    state_val TEXT;
    postal_code_val TEXT;
BEGIN
    -- Extract values from metadata
    full_name_val := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1));
    phone_val := NEW.raw_user_meta_data->>'phone';
    
    street_val := NEW.raw_user_meta_data->>'address_street';
    number_val := NEW.raw_user_meta_data->>'address_number';
    complement_val := NEW.raw_user_meta_data->>'address_complement';
    neighborhood_val := NEW.raw_user_meta_data->>'address_neighborhood';
    city_val := NEW.raw_user_meta_data->>'address_city';
    state_val := NEW.raw_user_meta_data->>'address_state';
    postal_code_val := NEW.raw_user_meta_data->>'address_postal_code';

    -- 1. Create public profile
    INSERT INTO public.profiles (id, full_name, email, avatar_url, phone, status)
    VALUES (
        NEW.id,
        full_name_val,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        phone_val,
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

    -- 5. Create primary address if provided
    IF street_val IS NOT NULL AND postal_code_val IS NOT NULL THEN
        INSERT INTO public.customer_addresses (customer_id, street, number, complement, neighborhood, city, state, postal_code, is_default)
        VALUES (
            NEW.id,
            street_val,
            number_val,
            COALESCE(complement_val, ''),
            neighborhood_val,
            city_val,
            state_val,
            postal_code_val,
            true
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
