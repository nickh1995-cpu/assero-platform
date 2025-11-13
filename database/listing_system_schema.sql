-- ===============================================
-- ASSERO LISTING SYSTEM - Database Schema
-- Phase 1: User-Generated Listings Extension
-- Production-Ready Schema für Multi-Kategorie Listings
-- ===============================================

-- ===============================================
-- 1.1 ASSETS TABLE EXTENSION
-- ===============================================

-- Add new columns for user-generated listings
ALTER TABLE public.assets 
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'inactive', 'rejected')),
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS favorites_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS images TEXT[], -- Array of image URLs
  ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_created_by ON public.assets(created_by);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_status_category ON public.assets(status, category_id);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON public.assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_views ON public.assets(views_count DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_assets_favorites ON public.assets(favorites_count DESC) WHERE status = 'active';

-- Add comments for documentation
COMMENT ON COLUMN public.assets.status IS 'Listing status: draft (editing), pending_review (submitted), active (published), inactive (temporarily disabled), rejected (not approved)';
COMMENT ON COLUMN public.assets.created_by IS 'User who created this listing (NULL for admin-created assets)';
COMMENT ON COLUMN public.assets.images IS 'Array of image URLs from Supabase Storage';
COMMENT ON COLUMN public.assets.views_count IS 'Number of times this listing was viewed';
COMMENT ON COLUMN public.assets.favorites_count IS 'Number of users who favorited this listing';

-- ===============================================
-- 1.2 LISTING DRAFTS TABLE (for auto-save)
-- ===============================================

CREATE TABLE IF NOT EXISTS public.listing_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE, -- NULL for new listings
  
  -- Wizard State
  current_step INTEGER DEFAULT 1 CHECK (current_step BETWEEN 1 AND 4),
  
  -- Category Selection (Step 1)
  category_id UUID REFERENCES public.asset_categories(id) ON DELETE SET NULL,
  
  -- Basic Info (Step 2)
  title VARCHAR(255),
  description TEXT,
  price DECIMAL(15, 2),
  currency VARCHAR(3) DEFAULT 'EUR',
  location VARCHAR(255),
  
  -- Metadata (Category-specific, Step 2)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Images (Step 3)
  images TEXT[],
  
  -- Contact Info
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_name VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  is_complete BOOLEAN DEFAULT FALSE,
  
  UNIQUE(user_id, asset_id)
);

-- Index for user's drafts
CREATE INDEX IF NOT EXISTS idx_listing_drafts_user_id ON public.listing_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_drafts_updated_at ON public.listing_drafts(updated_at DESC);

COMMENT ON TABLE public.listing_drafts IS 'Auto-saved listing drafts for seamless editing experience';

-- ===============================================
-- 1.3 USER FAVORITES TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, asset_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_asset_id ON public.user_favorites(asset_id);

COMMENT ON TABLE public.user_favorites IS 'User favorite/watchlist for listings';

-- ===============================================
-- 1.4 LISTING VIEWS TRACKING
-- ===============================================

CREATE TABLE IF NOT EXISTS public.listing_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_views_asset_id ON public.listing_views(asset_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_user_id ON public.listing_views(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listing_views_created_at ON public.listing_views(created_at DESC);

COMMENT ON TABLE public.listing_views IS 'Track listing views for analytics';

-- ===============================================
-- 1.5 ROW LEVEL SECURITY (RLS) POLICIES
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;

-- ===== ASSETS POLICIES =====

-- Public can view active listings
DROP POLICY IF EXISTS "Public can view active listings" ON public.assets;
CREATE POLICY "Public can view active listings"
  ON public.assets FOR SELECT
  USING (status = 'active');

-- Users can view own listings (any status)
DROP POLICY IF EXISTS "Users can view own listings" ON public.assets;
CREATE POLICY "Users can view own listings"
  ON public.assets FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Users can create listings
DROP POLICY IF EXISTS "Users can create listings" ON public.assets;
CREATE POLICY "Users can create listings"
  ON public.assets FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Users can update own drafts and rejected listings
DROP POLICY IF EXISTS "Users can update own listings" ON public.assets;
CREATE POLICY "Users can update own listings"
  ON public.assets FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() 
    AND status IN ('draft', 'rejected', 'inactive')
  );

-- Users can delete own drafts only
DROP POLICY IF EXISTS "Users can delete own drafts" ON public.assets;
CREATE POLICY "Users can delete own drafts"
  ON public.assets FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() 
    AND status = 'draft'
  );

-- ===== LISTING DRAFTS POLICIES =====

-- Users can view own drafts
DROP POLICY IF EXISTS "Users can view own drafts" ON public.listing_drafts;
CREATE POLICY "Users can view own drafts"
  ON public.listing_drafts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create drafts
DROP POLICY IF EXISTS "Users can create drafts" ON public.listing_drafts;
CREATE POLICY "Users can create drafts"
  ON public.listing_drafts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update own drafts
DROP POLICY IF EXISTS "Users can update own drafts" ON public.listing_drafts;
CREATE POLICY "Users can update own drafts"
  ON public.listing_drafts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can delete own drafts
DROP POLICY IF EXISTS "Users can delete own drafts" ON public.listing_drafts;
CREATE POLICY "Users can delete own drafts"
  ON public.listing_drafts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ===== USER FAVORITES POLICIES =====

-- Users can view own favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
CREATE POLICY "Users can view own favorites"
  ON public.user_favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can add favorites
DROP POLICY IF EXISTS "Users can add favorites" ON public.user_favorites;
CREATE POLICY "Users can add favorites"
  ON public.user_favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can remove own favorites
DROP POLICY IF EXISTS "Users can remove favorites" ON public.user_favorites;
CREATE POLICY "Users can remove favorites"
  ON public.user_favorites FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ===== LISTING VIEWS POLICIES =====

-- Anyone can insert views (for tracking)
DROP POLICY IF EXISTS "Anyone can track views" ON public.listing_views;
CREATE POLICY "Anyone can track views"
  ON public.listing_views FOR INSERT
  WITH CHECK (true);

-- Only owner can view their listing's views
DROP POLICY IF EXISTS "Owners can view listing views" ON public.listing_views;
CREATE POLICY "Owners can view listing views"
  ON public.listing_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assets
      WHERE assets.id = listing_views.asset_id
      AND assets.created_by = auth.uid()
    )
  );

-- ===============================================
-- 1.6 TRIGGERS & FUNCTIONS
-- ===============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for assets
DROP TRIGGER IF EXISTS update_assets_updated_at ON public.assets;
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for listing_drafts
DROP TRIGGER IF EXISTS update_listing_drafts_updated_at ON public.listing_drafts;
CREATE TRIGGER update_listing_drafts_updated_at
  BEFORE UPDATE ON public.listing_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update views_count when new view is added
CREATE OR REPLACE FUNCTION increment_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.assets
  SET views_count = views_count + 1
  WHERE id = NEW.asset_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment views
DROP TRIGGER IF EXISTS increment_asset_views ON public.listing_views;
CREATE TRIGGER increment_asset_views
  AFTER INSERT ON public.listing_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_views_count();

-- Function to update favorites_count
CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.assets
    SET favorites_count = favorites_count + 1
    WHERE id = NEW.asset_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.assets
    SET favorites_count = GREATEST(favorites_count - 1, 0)
    WHERE id = OLD.asset_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update favorites count
DROP TRIGGER IF EXISTS update_asset_favorites_count ON public.user_favorites;
CREATE TRIGGER update_asset_favorites_count
  AFTER INSERT OR DELETE ON public.user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_favorites_count();

-- ===============================================
-- 1.7 HELPER VIEWS
-- ===============================================

-- View for user's listings with stats
CREATE OR REPLACE VIEW user_listings_summary AS
SELECT 
  a.id,
  a.title,
  a.category_id,
  ac.name as category_name,
  ac.slug as category_slug,
  a.price,
  a.currency,
  a.location,
  a.status,
  a.created_by,
  a.views_count,
  a.favorites_count,
  a.created_at,
  a.updated_at,
  a.submitted_at,
  a.published_at,
  COALESCE(array_length(a.images, 1), 0) as images_count,
  CASE 
    WHEN a.status = 'draft' THEN 'Entwurf'
    WHEN a.status = 'pending_review' THEN 'In Prüfung'
    WHEN a.status = 'active' THEN 'Aktiv'
    WHEN a.status = 'inactive' THEN 'Inaktiv'
    WHEN a.status = 'rejected' THEN 'Abgelehnt'
  END as status_label
FROM public.assets a
LEFT JOIN public.asset_categories ac ON a.category_id = ac.id
WHERE a.created_by IS NOT NULL;

-- Grant access to view
GRANT SELECT ON user_listings_summary TO authenticated;

-- ===============================================
-- VERIFICATION & DOCUMENTATION
-- ===============================================

-- Verify schema
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ ============================================';
  RAISE NOTICE '✅ LISTING SYSTEM SCHEMA CREATED SUCCESSFULLY';
  RAISE NOTICE '✅ ============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✅ assets (extended with listing columns)';
  RAISE NOTICE '  ✅ listing_drafts (auto-save functionality)';
  RAISE NOTICE '  ✅ user_favorites (watchlist)';
  RAISE NOTICE '  ✅ listing_views (analytics)';
  RAISE NOTICE '';
  RAISE NOTICE 'Policies created:';
  RAISE NOTICE '  ✅ Public can view active listings';
  RAISE NOTICE '  ✅ Users can manage own listings';
  RAISE NOTICE '  ✅ Users can favorite listings';
  RAISE NOTICE '  ✅ View tracking enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'Triggers created:';
  RAISE NOTICE '  ✅ Auto-update timestamps';
  RAISE NOTICE '  ✅ Auto-increment views_count';
  RAISE NOTICE '  ✅ Auto-update favorites_count';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for Phase 1.2: Metadata Schema Definition';
  RAISE NOTICE '';
END $$;

-- Show current assets table schema
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'assets'
ORDER BY ordinal_position;

