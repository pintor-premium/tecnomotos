-- 1. Create a public bucket for product images in Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public read access to download product images
CREATE POLICY "Allow public select on product-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 3. Allow OWNER to insert, update and delete product images in the bucket
CREATE POLICY "Allow OWNER to manage product-images"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'product-images' AND
    public.is_owner(auth.uid())
)
WITH CHECK (
    bucket_id = 'product-images' AND
    public.is_owner(auth.uid())
);
