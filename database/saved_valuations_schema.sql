-- =====================================================
-- SAVED VALUATIONS SCHEMA
-- Phase 3.2: Personalized Experience
-- =====================================================

-- Create saved_valuations table
CREATE TABLE IF NOT EXISTS public.saved_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Asset Type
  asset_type TEXT NOT NULL CHECK (asset_type IN ('real-estate', 'luxusuhren', 'fahrzeuge')),
  
  -- Valuation Data (stored as JSONB for flexibility)
  form_data JSONB NOT NULL,
  
  -- Results
  estimated_value DECIMAL(15, 2) NOT NULL,
  value_min DECIMAL(15, 2) NOT NULL,
  value_max DECIMAL(15, 2) NOT NULL,
  
  -- Metadata
  title TEXT, -- User-defined title (e.g., "Meine Rolex Submariner")
  notes TEXT, -- Optional user notes
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Price Alert Settings
  price_alert_enabled BOOLEAN DEFAULT FALSE,
  price_alert_threshold DECIMAL(5, 2) DEFAULT 5.0, -- Alert when price changes by X%
  
  -- Tags for organization
  tags TEXT[], -- e.g., ['investment', 'verkauf geplant']
  
  -- View count
  view_count INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_valuations_user_id ON public.saved_valuations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_valuations_asset_type ON public.saved_valuations(asset_type);
CREATE INDEX IF NOT EXISTS idx_saved_valuations_created_at ON public.saved_valuations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_valuations_price_alert ON public.saved_valuations(price_alert_enabled) WHERE price_alert_enabled = TRUE;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_saved_valuations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_saved_valuations_updated_at
  BEFORE UPDATE ON public.saved_valuations
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_valuations_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.saved_valuations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own valuations
CREATE POLICY "Users can view own valuations"
  ON public.saved_valuations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own valuations
CREATE POLICY "Users can insert own valuations"
  ON public.saved_valuations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own valuations
CREATE POLICY "Users can update own valuations"
  ON public.saved_valuations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own valuations
CREATE POLICY "Users can delete own valuations"
  ON public.saved_valuations
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PORTFOLIO TRACKING (Value History)
-- =====================================================

-- Create valuation_history table for tracking value changes over time
CREATE TABLE IF NOT EXISTS public.valuation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_valuation_id UUID NOT NULL REFERENCES public.saved_valuations(id) ON DELETE CASCADE,
  
  -- Historical Values
  estimated_value DECIMAL(15, 2) NOT NULL,
  value_min DECIMAL(15, 2) NOT NULL,
  value_max DECIMAL(15, 2) NOT NULL,
  
  -- Market Context at time of valuation
  market_data JSONB, -- Store market stats snapshot
  
  -- Timestamp
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_valuation_history_saved_id ON public.valuation_history(saved_valuation_id);
CREATE INDEX IF NOT EXISTS idx_valuation_history_recorded_at ON public.valuation_history(recorded_at DESC);

-- Enable RLS
ALTER TABLE public.valuation_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view history of their own valuations
CREATE POLICY "Users can view own valuation history"
  ON public.valuation_history
  FOR SELECT
  USING (
    saved_valuation_id IN (
      SELECT id FROM public.saved_valuations WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert history for their own valuations
CREATE POLICY "Users can insert own valuation history"
  ON public.valuation_history
  FOR INSERT
  WITH CHECK (
    saved_valuation_id IN (
      SELECT id FROM public.saved_valuations WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to automatically create history entry when valuation is saved
CREATE OR REPLACE FUNCTION create_valuation_history_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.valuation_history (
    saved_valuation_id,
    estimated_value,
    value_min,
    value_max,
    recorded_at
  ) VALUES (
    NEW.id,
    NEW.estimated_value,
    NEW.value_min,
    NEW.value_max,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_valuation_history
  AFTER INSERT ON public.saved_valuations
  FOR EACH ROW
  EXECUTE FUNCTION create_valuation_history_entry();

-- Function to get portfolio summary for a user
CREATE OR REPLACE FUNCTION get_portfolio_summary(p_user_id UUID)
RETURNS TABLE (
  total_assets BIGINT,
  total_value DECIMAL(15, 2),
  avg_value DECIMAL(15, 2),
  real_estate_count BIGINT,
  real_estate_value DECIMAL(15, 2),
  watches_count BIGINT,
  watches_value DECIMAL(15, 2),
  vehicles_count BIGINT,
  vehicles_value DECIMAL(15, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_assets,
    SUM(estimated_value) AS total_value,
    AVG(estimated_value) AS avg_value,
    COUNT(*) FILTER (WHERE asset_type = 'real-estate') AS real_estate_count,
    COALESCE(SUM(estimated_value) FILTER (WHERE asset_type = 'real-estate'), 0) AS real_estate_value,
    COUNT(*) FILTER (WHERE asset_type = 'luxusuhren') AS watches_count,
    COALESCE(SUM(estimated_value) FILTER (WHERE asset_type = 'luxusuhren'), 0) AS watches_value,
    COUNT(*) FILTER (WHERE asset_type = 'fahrzeuge') AS vehicles_count,
    COALESCE(SUM(estimated_value) FILTER (WHERE asset_type = 'fahrzeuge'), 0) AS vehicles_value
  FROM public.saved_valuations
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

-- Note: This is just for reference. 
-- In production, users will create their own saved valuations.

/*
Example INSERT:

INSERT INTO public.saved_valuations (
  user_id,
  asset_type,
  form_data,
  estimated_value,
  value_min,
  value_max,
  title,
  notes,
  tags
) VALUES (
  'user-uuid-here',
  'luxusuhren',
  '{
    "watchBrand": "Rolex",
    "watchModel": "Submariner",
    "watchReference": "116610LN",
    "watchYear": 2018,
    "watchCondition": "very_good",
    "hasBox": true,
    "hasPapers": true
  }'::jsonb,
  12500.00,
  11000.00,
  14000.00,
  'Meine Rolex Submariner',
  'Gekauft 2018, sehr gut erhalten',
  ARRAY['investment', 'luxury']
);
*/

