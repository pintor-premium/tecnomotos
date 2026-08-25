-- Add image_url column to products table to save Storage links
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
