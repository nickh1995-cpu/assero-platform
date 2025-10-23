-- =====================================================
-- ADD SHARE LINK COLUMNS TO SAVED_VALUATIONS
-- Phase 3.3: Export & Sharing
-- =====================================================

-- Add share_token column for public share links
ALTER TABLE public.saved_valuations
ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Add shareable_until column for expiry date
ALTER TABLE public.saved_valuations
ADD COLUMN IF NOT EXISTS shareable_until TIMESTAMP WITH TIME ZONE;

-- Create index for fast lookup by share_token
CREATE INDEX IF NOT EXISTS idx_saved_valuations_share_token 
ON public.saved_valuations(share_token) 
WHERE share_token IS NOT NULL;

-- Update RLS policies to allow public read access for shared valuations
-- (This creates a special policy for share tokens)

CREATE POLICY "Public can view shared valuations"
  ON public.saved_valuations
  FOR SELECT
  USING (
    share_token IS NOT NULL
    AND shareable_until > NOW()
  );

-- Note: This policy allows anyone with a valid share token to view the valuation,
-- but they still cannot modify or delete it (those policies require auth.uid() = user_id)

