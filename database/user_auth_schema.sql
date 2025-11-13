-- ==============================================
-- ASSERO USER AUTHENTICATION & ROLES SCHEMA
-- Professional user management for Dealroom platform
-- ==============================================

-- ==============================================
-- USER ROLES TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_type VARCHAR(50) NOT NULL CHECK (role_type IN ('buyer', 'seller', 'admin')),
    is_primary_role BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a partial unique index to ensure user can only have one primary role
-- This works on all PostgreSQL versions (including Supabase)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_primary_unique 
    ON user_roles(user_id) 
    WHERE is_primary_role = true;

-- ==============================================
-- BUYER PROFILES TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS buyer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(500),
    investment_budget DECIMAL(15,2),
    preferred_asset_types TEXT[], -- Array of asset types
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- SELLER PROFILES TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS seller_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    website VARCHAR(500),
    business_type VARCHAR(100),
    tax_id VARCHAR(100),
    bank_account_iban VARCHAR(100),
    commission_rate DECIMAL(5,2) DEFAULT 5.00, -- Default 5% commission
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- USER PREFERENCES TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'de',
    currency VARCHAR(3) DEFAULT 'EUR',
    timezone VARCHAR(50) DEFAULT 'Europe/Berlin',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    marketing_emails BOOLEAN DEFAULT false,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- SESSION TRACKING TABLE (for audit/security)
-- ==============================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT,
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_type ON user_roles(role_type);
CREATE INDEX IF NOT EXISTS idx_user_roles_primary ON user_roles(user_id, is_primary_role) WHERE is_primary_role = true;

-- Buyer profiles indexes
CREATE INDEX IF NOT EXISTS idx_buyer_profiles_user_id ON buyer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_buyer_profiles_verification ON buyer_profiles(verification_status);

-- Seller profiles indexes
CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_verification ON seller_profiles(verification_status);

-- User preferences index
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Session tracking indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_login_at ON user_sessions(login_at);

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view own roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roles" ON user_roles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roles" ON user_roles
    FOR UPDATE USING (auth.uid() = user_id);

-- Buyer profiles policies
CREATE POLICY "Users can view own buyer profile" ON buyer_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own buyer profile" ON buyer_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own buyer profile" ON buyer_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Seller profiles policies
CREATE POLICY "Users can view own seller profile" ON seller_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own seller profile" ON seller_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own seller profile" ON seller_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Session tracking policies (read-only for users, write handled by system)
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert sessions" ON user_sessions
    FOR INSERT WITH CHECK (true); -- Handled by triggers/functions

-- ==============================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_auth_tables()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at on auth tables
CREATE TRIGGER trigger_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_auth_tables();

CREATE TRIGGER trigger_buyer_profiles_updated_at
    BEFORE UPDATE ON buyer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_auth_tables();

CREATE TRIGGER trigger_seller_profiles_updated_at
    BEFORE UPDATE ON seller_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_auth_tables();

CREATE TRIGGER trigger_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_auth_tables();

-- Function to create default user preferences on user creation
CREATE OR REPLACE FUNCTION create_default_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default preferences when user_roles is created
CREATE TRIGGER trigger_create_default_preferences
    AFTER INSERT ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_user_preferences();

-- ==============================================
-- HELPER VIEWS
-- ==============================================

-- View for complete user profile (buyer or seller)
CREATE OR REPLACE VIEW user_complete_profiles AS
SELECT 
    ur.user_id,
    ur.role_type,
    ur.is_primary_role,
    COALESCE(bp.company_name, sp.company_name) as company_name,
    COALESCE(bp.contact_person, sp.contact_person) as contact_person,
    COALESCE(bp.phone, sp.phone) as phone,
    COALESCE(bp.website, sp.website) as website,
    COALESCE(bp.verification_status, sp.verification_status) as verification_status,
    up.language,
    up.currency,
    up.timezone,
    ur.created_at,
    ur.updated_at
FROM user_roles ur
LEFT JOIN buyer_profiles bp ON ur.user_id = bp.user_id AND ur.role_type = 'buyer'
LEFT JOIN seller_profiles sp ON ur.user_id = sp.user_id AND ur.role_type = 'seller'
LEFT JOIN user_preferences up ON ur.user_id = up.user_id
WHERE ur.is_primary_role = true;

-- ==============================================
-- INITIAL SETUP COMPLETE
-- ==============================================

-- Note: This schema provides:
-- 1. User role management (buyer/seller/admin)
-- 2. Separate profile tables for buyers and sellers
-- 3. User preferences for personalization
-- 4. Session tracking for security
-- 5. Proper RLS policies for data security
-- 6. Automatic triggers for data consistency

