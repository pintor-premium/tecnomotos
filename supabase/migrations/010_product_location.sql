-- Add internal warehouse location column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS location TEXT;
