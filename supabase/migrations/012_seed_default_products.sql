-- 1. Add brand and category columns if not present
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. Seed initial catalog items to populate the database
INSERT INTO public.products (sku, name, brand, price, stock_quantity, location, category)
VALUES 
('ESC-GP-01', 'Escapamento Esportivo Carbon GP', 'Akrapovic', 2450.00, 12, 'Corredor A', 'Escapamentos'),
('PST-RC-02', 'Pastilha de Freio Sinterizada Racing', 'Brembo', 280.00, 45, 'Gaveta B', 'Freios'),
('AMR-PR-03', 'Amortecedor Traseiro Regulável PRO', 'Öhlins', 1890.00, 4, 'Corredor C', 'Suspensão'),
('PNE-SB-04', 'Pneu Superbike Slick Radial', 'Pirelli', 1200.00, 15, 'Corredor D', 'Pneus')
ON CONFLICT (sku) DO UPDATE 
SET name = EXCLUDED.name,
    brand = EXCLUDED.brand,
    price = EXCLUDED.price,
    stock_quantity = EXCLUDED.stock_quantity,
    location = EXCLUDED.location,
    category = EXCLUDED.category;
