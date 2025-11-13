-- Update Category Icons for Better Display
-- Phase 2.3: UI Enhancement

-- Update Luxusuhren icon
UPDATE public.asset_categories
SET icon = '⌚️'
WHERE slug = 'luxusuhren';

-- Update Fahrzeuge icon (racing car instead of regular car)
UPDATE public.asset_categories
SET icon = '🏎️'
WHERE slug = 'fahrzeuge';

-- Verify changes
SELECT slug, name, icon 
FROM public.asset_categories 
WHERE slug IN ('luxusuhren', 'fahrzeuge')
ORDER BY sort_order;

