-- Fix 1: Make chart-images bucket private and add user-scoped policies
UPDATE storage.buckets SET public = false WHERE id = 'chart-images';

-- Remove overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view chart images" ON storage.objects;

-- Add user-scoped SELECT policy - users can only view their own images
CREATE POLICY "Users can view own chart images" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'chart-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix 2: Remove direct table access to market_data_cache for authenticated users
-- Market data should only be served through the edge function which validates auth
DROP POLICY IF EXISTS "Authenticated users can read market data cache" ON public.market_data_cache;