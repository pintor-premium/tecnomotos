-- Employee registration details used by the team management screen
ALTER TABLE public.employees
    ADD COLUMN IF NOT EXISTS employee_function TEXT,
    ADD COLUMN IF NOT EXISTS address_street TEXT,
    ADD COLUMN IF NOT EXISTS address_number TEXT,
    ADD COLUMN IF NOT EXISTS address_complement TEXT,
    ADD COLUMN IF NOT EXISTS address_neighborhood TEXT,
    ADD COLUMN IF NOT EXISTS address_city TEXT,
    ADD COLUMN IF NOT EXISTS address_state TEXT,
    ADD COLUMN IF NOT EXISTS address_postal_code TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_employee_function'
          AND conrelid = 'public.employees'::regclass
    ) THEN
        ALTER TABLE public.employees
            ADD CONSTRAINT chk_employee_function
            CHECK (employee_function IN ('SELLER', 'MECHANIC', 'CASHIER', 'FINANCIAL'));
    END IF;
END $$;
