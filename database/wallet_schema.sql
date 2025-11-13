-- ===============================================
-- ASSERO WALLET SCHEMA
-- Production-Ready Database Structure
-- ===============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================
-- 1. WALLETS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Balance Information
  balance_eur DECIMAL(15, 2) DEFAULT 0.00 NOT NULL CHECK (balance_eur >= 0),
  balance_usd DECIMAL(15, 2) DEFAULT 0.00 NOT NULL CHECK (balance_usd >= 0),
  balance_gbp DECIMAL(15, 2) DEFAULT 0.00 NOT NULL CHECK (balance_gbp >= 0),
  
  -- Reserved amounts (pending transactions)
  reserved_eur DECIMAL(15, 2) DEFAULT 0.00 NOT NULL CHECK (reserved_eur >= 0),
  reserved_usd DECIMAL(15, 2) DEFAULT 0.00 NOT NULL CHECK (reserved_usd >= 0),
  reserved_gbp DECIMAL(15, 2) DEFAULT 0.00 NOT NULL CHECK (reserved_gbp >= 0),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  
  -- Verification
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Limits
  daily_limit_eur DECIMAL(15, 2) DEFAULT 10000.00,
  monthly_limit_eur DECIMAL(15, 2) DEFAULT 50000.00,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_status ON public.wallets(status);

-- ===============================================
-- 2. TRANSACTIONS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction Details
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'payment', 'refund', 'fee')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'GBP')),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Description & Metadata
  description TEXT,
  reference_number VARCHAR(50) UNIQUE,
  external_reference VARCHAR(100),
  
  -- Related Entities
  payment_method_id UUID,
  deal_id UUID,
  counterparty_wallet_id UUID,
  
  -- Balance Impact
  balance_before DECIMAL(15, 2),
  balance_after DECIMAL(15, 2),
  
  -- Timestamps
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional Info
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.wallet_transactions(reference_number);

-- ===============================================
-- 3. PAYMENT METHODS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  
  -- Method Type
  type VARCHAR(20) NOT NULL CHECK (type IN ('bank_account', 'credit_card', 'debit_card', 'sepa', 'paypal')),
  
  -- Bank Details (encrypted in production!)
  bank_name VARCHAR(100),
  account_holder VARCHAR(100),
  iban VARCHAR(34),
  bic VARCHAR(11),
  
  -- Card Details (tokenized in production!)
  card_last4 VARCHAR(4),
  card_brand VARCHAR(20),
  card_expiry_month INTEGER CHECK (card_expiry_month BETWEEN 1 AND 12),
  card_expiry_year INTEGER CHECK (card_expiry_year >= EXTRACT(YEAR FROM NOW())),
  
  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'expired')),
  
  -- Verification
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_method VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional Info
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_wallet_id ON public.payment_methods(wallet_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON public.payment_methods(is_default) WHERE is_default = TRUE;

-- ===============================================
-- 4. WALLET ACTIVITY LOG (Audit Trail)
-- ===============================================

CREATE TABLE IF NOT EXISTS public.wallet_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Activity Details
  activity_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  -- Related Entities
  related_transaction_id UUID,
  related_payment_method_id UUID,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional Info
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index
CREATE INDEX IF NOT EXISTS idx_activity_log_wallet_id ON public.wallet_activity_log(wallet_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.wallet_activity_log(created_at DESC);

-- ===============================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ===============================================

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_activity_log ENABLE ROW LEVEL SECURITY;

-- WALLETS Policies
CREATE POLICY "Users can view own wallet"
  ON public.wallets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own wallet"
  ON public.wallets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- TRANSACTIONS Policies
CREATE POLICY "Users can view own transactions"
  ON public.wallet_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own transactions"
  ON public.wallet_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- PAYMENT METHODS Policies
CREATE POLICY "Users can view own payment methods"
  ON public.payment_methods FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own payment methods"
  ON public.payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own payment methods"
  ON public.payment_methods FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own payment methods"
  ON public.payment_methods FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ACTIVITY LOG Policies
CREATE POLICY "Users can view own activity log"
  ON public.wallet_activity_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ===============================================
-- 6. FUNCTIONS & TRIGGERS
-- ===============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique reference number
CREATE OR REPLACE FUNCTION generate_transaction_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number := 'TXN-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 12));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reference number
CREATE TRIGGER generate_transaction_reference_trigger
  BEFORE INSERT ON public.wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION generate_transaction_reference();

-- ===============================================
-- 7. INITIAL DATA & HELPER VIEWS
-- ===============================================

-- View for wallet summary
CREATE OR REPLACE VIEW wallet_summary AS
SELECT 
  w.id,
  w.user_id,
  w.balance_eur,
  w.balance_usd,
  w.balance_gbp,
  w.reserved_eur,
  w.reserved_usd,
  w.reserved_gbp,
  (w.balance_eur - w.reserved_eur) as available_eur,
  (w.balance_usd - w.reserved_usd) as available_usd,
  (w.balance_gbp - w.reserved_gbp) as available_gbp,
  w.status,
  w.kyc_verified,
  COUNT(DISTINCT pm.id) as payment_methods_count,
  COUNT(DISTINCT CASE WHEN wt.status = 'pending' THEN wt.id END) as pending_transactions_count
FROM public.wallets w
LEFT JOIN public.payment_methods pm ON pm.wallet_id = w.id AND pm.status = 'verified'
LEFT JOIN public.wallet_transactions wt ON wt.wallet_id = w.id
GROUP BY w.id;

-- Grant access to view
GRANT SELECT ON wallet_summary TO authenticated;

-- ===============================================
-- DONE: Schema Created Successfully
-- ===============================================

-- To verify schema:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'wallet%';

