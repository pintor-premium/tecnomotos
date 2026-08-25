-- Add show_in_store column to products table (default to false)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS show_in_store BOOLEAN DEFAULT FALSE;

-- Ensure seeded default products have show_in_store enabled
UPDATE public.products 
SET show_in_store = TRUE 
WHERE sku IN ('ESC-GP-01', 'PST-RC-02', 'AMR-PR-03', 'PNE-SB-04');
