-- Add min_stock_quantity column to products table (default to 0)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS min_stock_quantity INTEGER DEFAULT 0;

-- Set a default minimum stock limit of 5 for default seeded products
UPDATE public.products 
SET min_stock_quantity = 5
WHERE sku IN ('ESC-GP-01', 'PST-RC-02', 'AMR-PR-03', 'PNE-SB-04');
