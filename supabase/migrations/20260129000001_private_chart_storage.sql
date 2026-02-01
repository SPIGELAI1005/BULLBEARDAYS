-- Migration: Make chart-images storage private with RLS
-- Date: 2026-01-29
-- Purpose: Security hardening - Phase 1 Task 1.3

-- Make chart-images bucket private
UPDATE storage.buckets
SET public = false
WHERE name = 'chart-images';

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can upload their own charts" ON storage.objects;
DROP POLICY IF EXISTS "Users can access their own charts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own charts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own charts" ON storage.objects;

-- Create RLS policies for chart-images bucket

-- Allow users to upload charts to their own folder
CREATE POLICY "Users can upload their own charts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chart-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to select/view their own charts
CREATE POLICY "Users can access their own charts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chart-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own charts
CREATE POLICY "Users can update their own charts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'chart-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'chart-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own charts
CREATE POLICY "Users can delete their own charts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chart-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add comment for documentation
COMMENT ON TABLE storage.objects IS 'Storage objects with RLS policies. chart-images bucket is private and requires signed URLs.';
