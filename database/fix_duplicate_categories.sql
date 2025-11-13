-- ===============================================
-- FIX: Remove duplicate "Immobilien" category
-- Keep only "Real Estate" for property assets
-- ===============================================

-- Step 1: Ensure "Real Estate" category exists with correct data
INSERT INTO public.asset_categories (name, slug, description, icon, sort_order, is_active)
VALUES 
  ('Real Estate', 'real-estate', 'Premium Immobilien und Gewerbeimmobilien', '🏠', 1, true)
ON CONFLICT (slug) 
DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- Step 2: Get IDs for both categories
DO $$
DECLARE
  real_estate_id UUID;
  immobilien_id UUID;
BEGIN
  -- Get Real Estate category ID
  SELECT id INTO real_estate_id FROM public.asset_categories WHERE slug = 'real-estate';
  
  -- Get Immobilien category ID (if it exists)
  SELECT id INTO immobilien_id FROM public.asset_categories WHERE slug = 'immobilien';
  
  -- If Immobilien category exists, migrate all assets to Real Estate
  IF immobilien_id IS NOT NULL AND real_estate_id IS NOT NULL AND immobilien_id != real_estate_id THEN
    
    RAISE NOTICE '🔄 Migrating assets from "Immobilien" to "Real Estate"...';
    
    -- Update all assets that reference "Immobilien" to use "Real Estate"
    UPDATE public.assets
    SET category_id = real_estate_id
    WHERE category_id = immobilien_id;
    
    RAISE NOTICE '✅ Assets migrated successfully';
    
    -- Delete the "Immobilien" category
    DELETE FROM public.asset_categories WHERE id = immobilien_id;
    
    RAISE NOTICE '✅ "Immobilien" category removed';
    RAISE NOTICE '✅ Only "Real Estate" category remains';
    
  ELSIF immobilien_id IS NULL THEN
    RAISE NOTICE 'ℹ️  "Immobilien" category does not exist - nothing to migrate';
  ELSE
    RAISE NOTICE 'ℹ️  Categories are identical - no action needed';
  END IF;
  
  -- Verify final state
  RAISE NOTICE '📊 Current asset categories:';
  
END $$;

-- Step 3: Verify final state
SELECT 
  id,
  name,
  slug,
  description,
  sort_order,
  is_active,
  (SELECT COUNT(*) FROM public.assets WHERE category_id = asset_categories.id) as asset_count
FROM public.asset_categories
WHERE is_active = true
ORDER BY sort_order;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ ============================================';
  RAISE NOTICE '✅ Fix completed successfully!';
  RAISE NOTICE '✅ "Immobilien" category removed';
  RAISE NOTICE '✅ All assets now use "Real Estate"';
  RAISE NOTICE '✅ ============================================';
  RAISE NOTICE '';
END $$;

