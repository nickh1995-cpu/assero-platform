/**
 * ASSERO LISTING IMAGES STORAGE SETUP
 * Phase 6.2: Supabase Storage Bucket & Policies
 * 
 * Run this in Supabase SQL Editor to create the listing-images bucket
 */

-- =====================================================
-- STEP 1: Create Storage Bucket
-- =====================================================

-- Create bucket for listing images (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,  -- Public read access
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 2: Storage Policies
-- =====================================================

-- Drop existing policies if they exist (safe re-run)
DROP POLICY IF EXISTS "Users can upload their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view listing images" ON storage.objects;

-- Policy 1: Allow authenticated users to upload their own listing images
CREATE POLICY "Users can upload their own listing images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'listing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 2: Allow users to update their own listing images
CREATE POLICY "Users can update their own listing images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'listing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 3: Allow users to delete their own listing images
CREATE POLICY "Users can delete their own listing images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'listing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 4: Allow public read access to all listing images
CREATE POLICY "Public can view listing images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'listing-images');

-- =====================================================
-- STEP 3: Verify Setup
-- =====================================================

-- Check bucket exists
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'listing-images';

-- Check policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND policyname LIKE '%listing images%';

-- =====================================================
-- NOTES
-- =====================================================

/**
 * Storage Path Structure:
 * 
 * listing-images/
 *   └── {user_id}/
 *       └── {draft_id or listing_id}/
 *           ├── 1730000000000.jpg  (timestamp-based unique names)
 *           ├── 1730000001000.png
 *           └── 1730000002000.webp
 * 
 * Example:
 * listing-images/abc123/draft-xyz/1730000000000.jpg
 * 
 * Public URL:
 * https://{project}.supabase.co/storage/v1/object/public/listing-images/abc123/draft-xyz/1730000000000.jpg
 */

/**
 * File Constraints:
 * - Max file size: 5MB (5242880 bytes)
 * - Allowed types: JPEG, JPG, PNG, WebP
 * - Max images per listing: 10 (enforced in frontend)
 */

/**
 * Security:
 * - Users can only upload to their own user_id folder
 * - Users can only modify/delete their own images
 * - Public can view all images (for browsing)
 * - RLS ensures data isolation
 */

