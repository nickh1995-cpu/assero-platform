-- ASSERO DEALROOM SAMPLE DATA
-- This script creates sample data for testing the Dealroom functionality
-- Run this AFTER the main dealroom_schema.sql has been executed

-- ==============================================
-- SAMPLE DATA CREATION
-- ==============================================

-- Note: This script creates sample data that can be used for testing
-- The actual data will be created through the API endpoints when users are authenticated

-- Sample Portfolio Data (for reference)
-- These would be created via POST /api/portfolios
/*
INSERT INTO portfolios (name, description, total_value, currency) VALUES
('Luxury Assets Portfolio', 'Premium investment portfolio focusing on luxury real estate, watches, and vehicles', 2500000.00, 'EUR'),
('Real Estate Focus', 'Specialized portfolio for high-end real estate investments', 1800000.00, 'EUR'),
('Collectibles Portfolio', 'Diverse collection of luxury watches, art, and rare items', 950000.00, 'EUR');
*/

-- Sample Deal Data (for reference)
-- These would be created via POST /api/deals
/*
INSERT INTO deals (portfolio_id, title, description, asset_type, status, deal_value, currency, expected_close_date) VALUES
('portfolio_id_1', 'Munich Penthouse Acquisition', 'Exclusive penthouse in Munich city center with panoramic views', 'real-estate', 'negotiation', 850000.00, 'EUR', '2024-03-15'),
('portfolio_id_1', 'Rolex Daytona Investment', 'Rare Rolex Daytona 116500LN with box and papers', 'luxury-watches', 'due-diligence', 45000.00, 'EUR', '2024-02-28'),
('portfolio_id_1', 'Porsche 911 GT3 RS', 'Limited edition Porsche 911 GT3 RS in Guards Red', 'vehicles', 'interest', 180000.00, 'EUR', '2024-04-30');
*/

-- Sample Asset Allocation Data (for reference)
-- These would be created via POST /api/portfolios/[id]/allocations
/*
INSERT INTO asset_allocations (portfolio_id, asset_type, allocation_percentage, target_allocation, actual_value) VALUES
('portfolio_id_1', 'real-estate', 65.0, 60.0, 1650000.00),
('portfolio_id_1', 'luxury-watches', 20.0, 25.0, 500000.00),
('portfolio_id_1', 'vehicles', 15.0, 15.0, 350000.00);
*/

-- Sample Market Data (public data, no user restrictions)
INSERT INTO market_prices (asset_type, asset_id, price, currency, source, date)
VALUES 
('real-estate', 'munich-penthouse', 850000.00, 'EUR', 'ASSERO', CURRENT_DATE),
('real-estate', 'hamburg-villa', 1200000.00, 'EUR', 'ASSERO', CURRENT_DATE),
('real-estate', 'berlin-loft', 650000.00, 'EUR', 'ASSERO', CURRENT_DATE),
('luxury-watches', 'rolex-daytona-116500ln', 45000.00, 'EUR', 'Chrono24', CURRENT_DATE),
('luxury-watches', 'patek-philippe-nautilus', 85000.00, 'EUR', 'Chrono24', CURRENT_DATE),
('luxury-watches', 'audemars-piguet-royal-oak', 55000.00, 'EUR', 'Chrono24', CURRENT_DATE),
('vehicles', 'porsche-911-gt3-rs', 180000.00, 'EUR', 'AutoScout24', CURRENT_DATE),
('vehicles', 'ferrari-488-gtb', 280000.00, 'EUR', 'AutoScout24', CURRENT_DATE),
('vehicles', 'lamborghini-huracan', 220000.00, 'EUR', 'AutoScout24', CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- Sample Market Trends (public data)
INSERT INTO market_trends (asset_type, region, trend_direction, confidence_score, data_points)
VALUES 
('real-estate', 'Munich', 'up', 0.85, '{"price_change": 5.2, "volume_change": 12.3, "days_on_market": 45}'::jsonb),
('real-estate', 'Hamburg', 'stable', 0.72, '{"price_change": 1.8, "volume_change": 3.1, "days_on_market": 52}'::jsonb),
('real-estate', 'Berlin', 'up', 0.78, '{"price_change": 3.4, "volume_change": 8.7, "days_on_market": 38}'::jsonb),
('luxury-watches', 'Global', 'up', 0.92, '{"price_change": 8.5, "volume_change": 15.2, "rarity_index": 0.95}'::jsonb),
('vehicles', 'Germany', 'stable', 0.68, '{"price_change": 0.5, "volume_change": 2.1, "demand_index": 0.78}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- HELPER FUNCTIONS FOR SAMPLE DATA
-- ==============================================

-- Function to create sample portfolio for authenticated user
CREATE OR REPLACE FUNCTION create_sample_portfolio(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    portfolio_id UUID;
BEGIN
    -- Create sample portfolio
    INSERT INTO portfolios (user_id, name, description, total_value, currency)
    VALUES (
        user_uuid,
        'Luxury Assets Portfolio',
        'Premium investment portfolio focusing on luxury real estate, watches, and vehicles',
        2500000.00,
        'EUR'
    )
    RETURNING id INTO portfolio_id;
    
    -- Create sample deals
    INSERT INTO deals (portfolio_id, user_id, title, description, asset_type, status, deal_value, currency, expected_close_date)
    VALUES 
    (portfolio_id, user_uuid, 'Munich Penthouse Acquisition', 'Exclusive penthouse in Munich city center with panoramic views', 'real-estate', 'negotiation', 850000.00, 'EUR', '2024-03-15'),
    (portfolio_id, user_uuid, 'Rolex Daytona Investment', 'Rare Rolex Daytona 116500LN with box and papers', 'luxury-watches', 'due-diligence', 45000.00, 'EUR', '2024-02-28'),
    (portfolio_id, user_uuid, 'Porsche 911 GT3 RS', 'Limited edition Porsche 911 GT3 RS in Guards Red', 'vehicles', 'interest', 180000.00, 'EUR', '2024-04-30');
    
    -- Create sample asset allocations
    INSERT INTO asset_allocations (portfolio_id, asset_type, allocation_percentage, target_allocation, actual_value)
    VALUES 
    (portfolio_id, 'real-estate', 65.0, 60.0, 1650000.00),
    (portfolio_id, 'luxury-watches', 20.0, 25.0, 500000.00),
    (portfolio_id, 'vehicles', 15.0, 15.0, 350000.00);
    
    RETURN portfolio_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create sample performance data
CREATE OR REPLACE FUNCTION create_sample_performance_data(portfolio_uuid UUID)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
    base_value DECIMAL(15,2) := 2500000.00;
    daily_return DECIMAL(10,4);
    cumulative_return DECIMAL(10,4) := 0;
    current_value DECIMAL(15,2);
BEGIN
    -- Create 30 days of sample performance data
    FOR i IN 1..30 LOOP
        -- Generate random daily return between -2% and +3%
        daily_return := (RANDOM() * 5 - 2) / 100;
        cumulative_return := cumulative_return + daily_return;
        current_value := base_value * (1 + cumulative_return);
        
        INSERT INTO portfolio_performance (
            portfolio_id, 
            date, 
            total_value, 
            daily_return, 
            cumulative_return,
            volatility,
            sharpe_ratio
        )
        VALUES (
            portfolio_uuid,
            CURRENT_DATE - (30 - i),
            current_value,
            daily_return,
            cumulative_return,
            RANDOM() * 0.15 + 0.05, -- Volatility between 5% and 20%
            RANDOM() * 2 + 0.5 -- Sharpe ratio between 0.5 and 2.5
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- USAGE INSTRUCTIONS
-- ==============================================

/*
To create sample data for a user:

1. Get the user's UUID from auth.users
2. Call: SELECT create_sample_portfolio('user-uuid-here');
3. Call: SELECT create_sample_performance_data('portfolio-uuid-here');

Example:
SELECT create_sample_portfolio('123e4567-e89b-12d3-a456-426614174000');
SELECT create_sample_performance_data('550e8400-e29b-41d4-a716-446655440000');
*/
