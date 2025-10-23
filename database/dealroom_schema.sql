-- ASSERO DEALROOM DATABASE SCHEMA
-- Professional Investment Management Platform

-- ==============================================
-- DEALROOM CORE TABLES
-- ==============================================

-- Portfolio Table
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_value DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'EUR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Deals Table
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('real-estate', 'luxury-watches', 'vehicles', 'art', 'collectibles')),
    status VARCHAR(50) NOT NULL DEFAULT 'interest' CHECK (status IN ('interest', 'negotiation', 'due-diligence', 'contract', 'closed', 'cancelled')),
    deal_value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    expected_close_date DATE,
    actual_close_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Deal Participants Table
CREATE TABLE IF NOT EXISTS deal_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('buyer', 'seller', 'advisor', 'broker', 'lawyer', 'accountant')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deal Documents Table
CREATE TABLE IF NOT EXISTS deal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    category VARCHAR(50) CHECK (category IN ('contract', 'valuation', 'inspection', 'legal', 'financial', 'other')),
    is_confidential BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deal Comments Table
CREATE TABLE IF NOT EXISTS deal_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deal Tasks Table
CREATE TABLE IF NOT EXISTS deal_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- PORTFOLIO ANALYTICS TABLES
-- ==============================================

-- Portfolio Performance Table
CREATE TABLE IF NOT EXISTS portfolio_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    daily_return DECIMAL(10,4),
    cumulative_return DECIMAL(10,4),
    volatility DECIMAL(10,4),
    sharpe_ratio DECIMAL(10,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset Allocation Table
CREATE TABLE IF NOT EXISTS asset_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL,
    allocation_percentage DECIMAL(5,2) NOT NULL,
    target_allocation DECIMAL(5,2),
    actual_value DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- MARKET DATA TABLES
-- ==============================================

-- Market Prices Table
CREATE TABLE IF NOT EXISTS market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_type VARCHAR(50) NOT NULL,
    asset_id VARCHAR(255),
    price DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    source VARCHAR(100),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Trends Table
CREATE TABLE IF NOT EXISTS market_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_type VARCHAR(50) NOT NULL,
    region VARCHAR(100),
    trend_direction VARCHAR(20) CHECK (trend_direction IN ('up', 'down', 'stable')),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    data_points JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Portfolio indexes
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_active ON portfolios(is_active) WHERE is_active = true;

-- Deal indexes
CREATE INDEX IF NOT EXISTS idx_deals_portfolio_id ON deals(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_asset_type ON deals(asset_type);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at);

-- Deal participants indexes
CREATE INDEX IF NOT EXISTS idx_deal_participants_deal_id ON deal_participants(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_participants_user_id ON deal_participants(user_id);

-- Deal documents indexes
CREATE INDEX IF NOT EXISTS idx_deal_documents_deal_id ON deal_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_documents_category ON deal_documents(category);

-- Deal comments indexes
CREATE INDEX IF NOT EXISTS idx_deal_comments_deal_id ON deal_comments(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_comments_created_at ON deal_comments(created_at);

-- Deal tasks indexes
CREATE INDEX IF NOT EXISTS idx_deal_tasks_deal_id ON deal_tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_tasks_user_id ON deal_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_tasks_status ON deal_tasks(status);
CREATE INDEX IF NOT EXISTS idx_deal_tasks_due_date ON deal_tasks(due_date);

-- Portfolio performance indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_performance_portfolio_id ON portfolio_performance(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_performance_date ON portfolio_performance(date);

-- Market data indexes
CREATE INDEX IF NOT EXISTS idx_market_prices_asset_type ON market_prices(asset_type);
CREATE INDEX IF NOT EXISTS idx_market_prices_date ON market_prices(date);
CREATE INDEX IF NOT EXISTS idx_market_trends_asset_type ON market_trends(asset_type);

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_trends ENABLE ROW LEVEL SECURITY;

-- Portfolio policies
CREATE POLICY "Users can view own portfolios" ON portfolios
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolios" ON portfolios
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios" ON portfolios
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios" ON portfolios
    FOR DELETE USING (auth.uid() = user_id);

-- Deal policies
CREATE POLICY "Users can view own deals" ON deals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deals" ON deals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deals" ON deals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deals" ON deals
    FOR DELETE USING (auth.uid() = user_id);

-- Deal participants policies
CREATE POLICY "Users can view deal participants for own deals" ON deal_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_participants.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert deal participants for own deals" ON deal_participants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_participants.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

-- Deal documents policies
CREATE POLICY "Users can view deal documents for own deals" ON deal_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_documents.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert deal documents for own deals" ON deal_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_documents.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

-- Deal comments policies
CREATE POLICY "Users can view deal comments for own deals" ON deal_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_comments.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert deal comments for own deals" ON deal_comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_comments.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

-- Deal tasks policies
CREATE POLICY "Users can view deal tasks for own deals" ON deal_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_tasks.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert deal tasks for own deals" ON deal_tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_tasks.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

-- Portfolio performance policies
CREATE POLICY "Users can view portfolio performance for own portfolios" ON portfolio_performance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM portfolios 
            WHERE portfolios.id = portfolio_performance.portfolio_id 
            AND portfolios.user_id = auth.uid()
        )
    );

-- Asset allocations policies
CREATE POLICY "Users can view asset allocations for own portfolios" ON asset_allocations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM portfolios 
            WHERE portfolios.id = asset_allocations.portfolio_id 
            AND portfolios.user_id = auth.uid()
        )
    );

-- Market data policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view market prices" ON market_prices
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view market trends" ON market_trends
    FOR SELECT USING (auth.role() = 'authenticated');

-- ==============================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================

-- Function to update portfolio total value
CREATE OR REPLACE FUNCTION update_portfolio_total_value()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE portfolios 
    SET total_value = (
        SELECT COALESCE(SUM(deal_value), 0)
        FROM deals 
        WHERE portfolio_id = NEW.portfolio_id 
        AND status = 'closed'
    ),
    updated_at = NOW()
    WHERE id = NEW.portfolio_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update portfolio value when deal status changes
CREATE TRIGGER trigger_update_portfolio_value
    AFTER UPDATE OF status ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_portfolio_total_value();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_portfolios_updated_at
    BEFORE UPDATE ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_asset_allocations_updated_at
    BEFORE UPDATE ON asset_allocations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- SAMPLE DATA FOR TESTING
-- ==============================================

-- Note: Sample data will be inserted via API calls when users are authenticated
-- This ensures proper user_id references and RLS compliance

-- Sample data is now handled by the application layer
-- See: /api/portfolios and /api/deals endpoints for data creation

-- ==============================================
-- VIEWS FOR ANALYTICS
-- ==============================================

-- Portfolio overview view
CREATE OR REPLACE VIEW portfolio_overview AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.total_value,
    p.currency,
    COUNT(d.id) as total_deals,
    COUNT(CASE WHEN d.status = 'closed' THEN 1 END) as closed_deals,
    COUNT(CASE WHEN d.status = 'negotiation' THEN 1 END) as active_deals,
    p.created_at,
    p.updated_at
FROM portfolios p
LEFT JOIN deals d ON p.id = d.portfolio_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.description, p.total_value, p.currency, p.created_at, p.updated_at;

-- Deal pipeline view
CREATE OR REPLACE VIEW deal_pipeline AS
SELECT 
    d.id,
    d.title,
    d.asset_type,
    d.status,
    d.deal_value,
    d.currency,
    d.expected_close_date,
    p.name as portfolio_name,
    d.created_at,
    d.updated_at
FROM deals d
JOIN portfolios p ON d.portfolio_id = p.id
WHERE p.is_active = true
ORDER BY d.expected_close_date ASC;

-- Performance summary view
CREATE OR REPLACE VIEW performance_summary AS
SELECT 
    p.id as portfolio_id,
    p.name as portfolio_name,
    p.total_value,
    p.currency,
    COALESCE(pp.daily_return, 0) as daily_return,
    COALESCE(pp.cumulative_return, 0) as cumulative_return,
    COALESCE(pp.volatility, 0) as volatility,
    COALESCE(pp.sharpe_ratio, 0) as sharpe_ratio
FROM portfolios p
LEFT JOIN LATERAL (
    SELECT * FROM portfolio_performance 
    WHERE portfolio_id = p.id 
    ORDER BY date DESC 
    LIMIT 1
) pp ON true
WHERE p.is_active = true;
