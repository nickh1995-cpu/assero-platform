-- Sample Assets for ASSERO Valuation System
-- Insert sample categories and assets for testing comparables feature
-- Run this in Supabase SQL Editor

-- First, ensure we have the asset categories
INSERT INTO public.asset_categories (name, slug, description, icon, sort_order, is_active)
VALUES 
  ('Real Estate', 'real-estate', 'Premium Immobilien und Gewerbeimmobilien', '🏠', 1, true),
  ('Luxusuhren', 'luxusuhren', 'Premium Uhren von Rolex, Patek Philippe, Audemars Piguet', '⌚', 2, true),
  ('Fahrzeuge', 'fahrzeuge', 'Sportwagen, Luxuslimousinen und SUVs', '🚗', 3, true)
ON CONFLICT (slug) DO NOTHING;

-- Get category IDs for reference
DO $$
DECLARE
  real_estate_id UUID;
  luxusuhren_id UUID;
  fahrzeuge_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO real_estate_id FROM public.asset_categories WHERE slug = 'real-estate';
  SELECT id INTO luxusuhren_id FROM public.asset_categories WHERE slug = 'luxusuhren';
  SELECT id INTO fahrzeuge_id FROM public.asset_categories WHERE slug = 'fahrzeuge';

  -- Insert Real Estate Assets
  INSERT INTO public.assets (
    title, 
    description, 
    category_id, 
    price, 
    currency, 
    location, 
    status,
    featured,
    metadata
  ) VALUES
  (
    '3-Zimmer Wohnung in München Altstadt',
    'Exklusive 3-Zimmer-Wohnung im Herzen der Münchner Altstadt. Hochwertige Ausstattung, Parkett, moderne Einbauküche.',
    real_estate_id,
    520000.00,
    'EUR',
    'München, Altstadt',
    'active',
    true,
    '{"area_sqm": 95, "rooms": 3, "condition": "renovated", "property_type": "wohnung", "features": ["Balkon", "Einbauküche", "Parkett"], "energy_rating": "B", "year_built": 1985}'::jsonb
  ),
  (
    '4-Zimmer Maisonette München Zentrum',
    'Traumhafte Maisonette-Wohnung über 2 Etagen mit Dachterrasse und herrlichem Ausblick.',
    real_estate_id,
    580000.00,
    'EUR',
    'München, Maxvorstadt',
    'active',
    true,
    '{"area_sqm": 110, "rooms": 4, "condition": "new", "property_type": "wohnung", "features": ["Dachterrasse", "Fußbodenheizung", "Smart Home"], "energy_rating": "A", "year_built": 2022}'::jsonb
  ),
  (
    '3.5-Zimmer Wohnung Schwabing',
    'Charmante Altbauwohnung in Schwabing mit hohen Decken und Stuck. Saniert und modernisiert.',
    real_estate_id,
    495000.00,
    'EUR',
    'München, Schwabing',
    'active',
    false,
    '{"area_sqm": 92, "rooms": 3.5, "condition": "renovated", "property_type": "wohnung", "features": ["Stuck", "Hohe Decken", "Gäste-WC"], "energy_rating": "C", "year_built": 1910}'::jsonb
  ),
  (
    '3-Zimmer Penthouse Lehel',
    'Exklusives Penthouse mit 360° Dachterrasse im begehrten Lehel-Viertel.',
    real_estate_id,
    615000.00,
    'EUR',
    'München, Lehel',
    'active',
    true,
    '{"area_sqm": 105, "rooms": 3, "condition": "new", "property_type": "wohnung", "features": ["Dachterrasse 360°", "Luxusausstattung", "Concierge"], "energy_rating": "A+", "year_built": 2023}'::jsonb
  ),
  (
    '2.5-Zimmer Wohnung Haidhausen',
    'Modern renovierte Wohnung in Haidhausen, ruhige Lage, dennoch zentral.',
    real_estate_id,
    445000.00,
    'EUR',
    'München, Haidhausen',
    'active',
    false,
    '{"area_sqm": 88, "rooms": 2.5, "condition": "renovated", "property_type": "wohnung", "features": ["Balkon", "Einbauküche", "Kellerabteil"], "energy_rating": "B", "year_built": 1995}'::jsonb
  ),
  (
    'Luxus-Villa am Starnberger See',
    'Herrschaftliche Villa direkt am Starnberger See mit privatem Seezugang und Bootsanleger.',
    real_estate_id,
    3500000.00,
    'EUR',
    'Starnberg, Seelage',
    'active',
    true,
    '{"area_sqm": 380, "rooms": 8, "condition": "new", "property_type": "haus", "features": ["Seezugang", "Pool", "Garage", "Garten 1200m²"], "energy_rating": "A", "year_built": 2021}'::jsonb
  );

  -- Insert Luxury Watches
  INSERT INTO public.assets (
    title,
    description,
    category_id,
    price,
    currency,
    location,
    status,
    featured,
    metadata
  ) VALUES
  (
    'Rolex Submariner Date 41mm Ref. 126610LN',
    'Rolex Submariner Date in Edelstahl mit schwarzem Zifferblatt. Fullset mit Box und Papieren.',
    luxusuhren_id,
    12500.00,
    'EUR',
    'München',
    'active',
    true,
    '{"condition": "excellent", "brand": "Rolex", "model": "Submariner Date", "reference": "126610LN", "year": 2022, "fullSet": true, "movement": "Automatik"}'::jsonb
  ),
  (
    'Omega Seamaster Diver 300M',
    'Omega Seamaster Professional 300M in blau. Wie neu, Full Set mit Garantiekarte.',
    luxusuhren_id,
    4800.00,
    'EUR',
    'Hamburg',
    'active',
    true,
    '{"condition": "excellent", "brand": "Omega", "model": "Seamaster Diver 300M", "reference": "210.30.42.20.03.001", "year": 2023, "fullSet": true, "movement": "Automatik"}'::jsonb
  ),
  (
    'Rolex Datejust 41 Ref. 126334',
    'Rolex Datejust 41 mit Jubilee-Band und Diamant-Zifferblatt.',
    luxusuhren_id,
    10200.00,
    'EUR',
    'Frankfurt',
    'active',
    false,
    '{"condition": "good", "brand": "Rolex", "model": "Datejust 41", "reference": "126334", "year": 2020, "fullSet": false, "movement": "Automatik"}'::jsonb
  ),
  (
    'IWC Portugieser Chronograph',
    'IWC Portugieser Chronograph in Edelstahl. Full Set, neuwertig.',
    luxusuhren_id,
    8900.00,
    'EUR',
    'Stuttgart',
    'active',
    true,
    '{"condition": "excellent", "brand": "IWC", "model": "Portugieser Chronograph", "reference": "IW371604", "year": 2023, "fullSet": true, "movement": "Automatik"}'::jsonb
  ),
  (
    'Rolex Explorer II 42mm Ref. 226570',
    'Rolex Explorer II in schwarzem Design. Robuste Sportuhr, Full Set.',
    luxusuhren_id,
    11800.00,
    'EUR',
    'Berlin',
    'active',
    false,
    '{"condition": "good", "brand": "Rolex", "model": "Explorer II", "reference": "226570", "year": 2021, "fullSet": true, "movement": "Automatik"}'::jsonb
  ),
  (
    'Patek Philippe Calatrava Ref. 5227',
    'Patek Philippe Calatrava in Weißgold. Zeitloser Klassiker mit Full Set.',
    luxusuhren_id,
    28500.00,
    'EUR',
    'München',
    'active',
    true,
    '{"condition": "excellent", "brand": "Patek Philippe", "model": "Calatrava", "reference": "5227G", "year": 2022, "fullSet": true, "movement": "Automatik"}'::jsonb
  );

  -- Insert Vehicles
  INSERT INTO public.assets (
    title,
    description,
    category_id,
    price,
    currency,
    location,
    status,
    featured,
    metadata
  ) VALUES
  (
    'Porsche 911 Carrera S (992)',
    'Porsche 911 Carrera S in Racing Gelb. Sportabgas, PASM, 18-Wege-Sportsitze.',
    fahrzeuge_id,
    95000.00,
    'EUR',
    'München',
    'active',
    true,
    '{"condition": "excellent", "brand": "Porsche", "model": "911 Carrera S", "year": 2021, "mileage": 25000, "fuel": "Benzin", "power": "450 PS", "transmission": "Automatik"}'::jsonb
  ),
  (
    'BMW M4 Competition',
    'BMW M4 Competition in Frozen Grey. Carbon-Paket, M-Driver-Paket, Head-Up Display.',
    fahrzeuge_id,
    78000.00,
    'EUR',
    'Stuttgart',
    'active',
    true,
    '{"condition": "excellent", "brand": "BMW", "model": "M4 Competition", "year": 2022, "mileage": 18000, "fuel": "Benzin", "power": "510 PS", "transmission": "Automatik"}'::jsonb
  ),
  (
    'Porsche Cayenne Turbo',
    'Porsche Cayenne Turbo in Schwarz. Luftfederung, Panoramadach, 22" Turbo-Felgen.',
    fahrzeuge_id,
    92000.00,
    'EUR',
    'Hamburg',
    'active',
    false,
    '{"condition": "good", "brand": "Porsche", "model": "Cayenne Turbo", "year": 2021, "mileage": 32000, "fuel": "Benzin", "power": "550 PS", "transmission": "Automatik"}'::jsonb
  ),
  (
    'Mercedes-AMG GT 63 S 4MATIC+',
    'Mercedes-AMG GT 63 S in Graphitgrau. AMG-Performance-Sitze, Burmester Sound.',
    fahrzeuge_id,
    105000.00,
    'EUR',
    'München',
    'active',
    true,
    '{"condition": "excellent", "brand": "Mercedes-AMG", "model": "GT 63 S", "year": 2022, "mileage": 15000, "fuel": "Benzin", "power": "639 PS", "transmission": "Automatik"}'::jsonb
  ),
  (
    'Audi RS6 Avant',
    'Audi RS6 Avant in Nardograu. Dynamic-Paket Plus, RS-Sportabgas, Keramikbremse.',
    fahrzeuge_id,
    89000.00,
    'EUR',
    'Frankfurt',
    'active',
    false,
    '{"condition": "good", "brand": "Audi", "model": "RS6 Avant", "year": 2021, "mileage": 28000, "fuel": "Benzin", "power": "600 PS", "transmission": "Automatik"}'::jsonb
  ),
  (
    'Lamborghini Huracán EVO',
    'Lamborghini Huracán EVO in Verde Mantis. Lifting-System, Sportabgas, Carbon-Paket.',
    fahrzeuge_id,
    235000.00,
    'EUR',
    'München',
    'active',
    true,
    '{"condition": "excellent", "brand": "Lamborghini", "model": "Huracán EVO", "year": 2023, "mileage": 5000, "fuel": "Benzin", "power": "640 PS", "transmission": "Automatik"}'::jsonb
  );

END $$;

-- Verify insertion
SELECT 
  ac.name as category,
  COUNT(a.id) as asset_count,
  MIN(a.price) as min_price,
  MAX(a.price) as max_price,
  AVG(a.price)::numeric(10,2) as avg_price
FROM public.assets a
JOIN public.asset_categories ac ON a.category_id = ac.id
WHERE a.status = 'active'
GROUP BY ac.id, ac.name, ac.sort_order
ORDER BY ac.sort_order;

