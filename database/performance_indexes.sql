-- Performance indexes for faster queries
-- Run these in Supabase SQL Editor for better performance

-- Assets table indexes
CREATE INDEX IF NOT EXISTS idx_assets_category_status ON assets(category_id, status);
CREATE INDEX IF NOT EXISTS idx_assets_price ON assets(price) WHERE price IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assets_updated_at ON assets(updated_at);
CREATE INDEX IF NOT EXISTS idx_assets_featured ON assets(featured) WHERE featured = true;

-- Metadata indexes for real estate filtering
CREATE INDEX IF NOT EXISTS idx_assets_metadata_location ON assets USING GIN ((metadata->>'location'));
CREATE INDEX IF NOT EXISTS idx_assets_metadata_area ON assets ((metadata->>'area_sqm')::numeric) WHERE metadata->>'area_sqm' IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assets_metadata_rooms ON assets ((metadata->>'rooms')::numeric) WHERE metadata->>'rooms' IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assets_metadata_yield ON assets ((metadata->>'yield_pct')::numeric) WHERE metadata->>'yield_pct' IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assets_metadata_condition ON assets (metadata->>'condition') WHERE metadata->>'condition' IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assets_metadata_property_type ON assets (metadata->>'property_type') WHERE metadata->>'property_type' IS NOT NULL;

-- Asset categories index
CREATE INDEX IF NOT EXISTS idx_asset_categories_slug ON asset_categories(slug) WHERE is_active = true;

-- Profiles index for user lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Dealroom indexes
CREATE INDEX IF NOT EXISTS idx_dealroom_user_id ON dealroom(user_id);
CREATE INDEX IF NOT EXISTS idx_dealroom_asset_id ON dealroom(asset_id);
CREATE INDEX IF NOT EXISTS idx_dealroom_status ON dealroom(status);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
