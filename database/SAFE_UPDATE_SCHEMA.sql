-- ================================================
-- SAFE UPDATE: Auth Schema (nur fehlende Elemente)
-- ================================================
-- Dieses Script fügt nur hinzu, was fehlt - keine Fehler bei existierenden Elementen

-- ================================================
-- 1. TABELLEN ERSTELLEN (wenn nicht vorhanden)
-- ================================================

-- User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN ('buyer', 'seller', 'admin')),
  is_primary_role BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Buyer Profiles Table
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  contact_person TEXT,
  phone TEXT,
  website TEXT,
  investment_focus TEXT[],
  min_investment_amount DECIMAL(15,2),
  max_investment_amount DECIMAL(15,2),
  preferred_asset_types TEXT[],
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Seller Profiles Table
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  website TEXT,
  business_license TEXT,
  tax_id TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_email BOOLEAN DEFAULT true,
  notification_sms BOOLEAN DEFAULT false,
  notification_push BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'de',
  timezone TEXT DEFAULT 'Europe/Berlin',
  currency TEXT DEFAULT 'EUR',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Profiles Table (if needed - legacy compatibility)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT false,
  profile_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 2. INDEXES ERSTELLEN (wenn nicht vorhanden)
-- ================================================

-- User Roles Indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_type ON public.user_roles(role_type);

-- Primary role unique index (Partial index for WHERE clause)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_roles_primary_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_user_roles_primary_unique 
    ON public.user_roles(user_id) 
    WHERE is_primary_role = true;
  END IF;
END $$;

-- Buyer Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_buyer_profiles_user_id ON public.buyer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_buyer_profiles_verification ON public.buyer_profiles(verification_status);

-- Seller Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON public.seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_verification ON public.seller_profiles(verification_status);

-- User Preferences Index
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- ================================================
-- 3. RLS AKTIVIEREN
-- ================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 4. RLS POLICIES ERSTELLEN (nur wenn nicht vorhanden)
-- ================================================

-- User Roles Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view own roles'
  ) THEN
    CREATE POLICY "Users can view own roles"
      ON public.user_roles FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can insert own roles'
  ) THEN
    CREATE POLICY "Users can insert own roles"
      ON public.user_roles FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can update own roles'
  ) THEN
    CREATE POLICY "Users can update own roles"
      ON public.user_roles FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Buyer Profiles Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'buyer_profiles' AND policyname = 'Users can view own buyer profile'
  ) THEN
    CREATE POLICY "Users can view own buyer profile"
      ON public.buyer_profiles FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'buyer_profiles' AND policyname = 'Users can insert own buyer profile'
  ) THEN
    CREATE POLICY "Users can insert own buyer profile"
      ON public.buyer_profiles FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'buyer_profiles' AND policyname = 'Users can update own buyer profile'
  ) THEN
    CREATE POLICY "Users can update own buyer profile"
      ON public.buyer_profiles FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Seller Profiles Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'seller_profiles' AND policyname = 'Users can view own seller profile'
  ) THEN
    CREATE POLICY "Users can view own seller profile"
      ON public.seller_profiles FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'seller_profiles' AND policyname = 'Users can insert own seller profile'
  ) THEN
    CREATE POLICY "Users can insert own seller profile"
      ON public.seller_profiles FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'seller_profiles' AND policyname = 'Users can update own seller profile'
  ) THEN
    CREATE POLICY "Users can update own seller profile"
      ON public.seller_profiles FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- User Preferences Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can view own preferences'
  ) THEN
    CREATE POLICY "Users can view own preferences"
      ON public.user_preferences FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can insert own preferences'
  ) THEN
    CREATE POLICY "Users can insert own preferences"
      ON public.user_preferences FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can update own preferences'
  ) THEN
    CREATE POLICY "Users can update own preferences"
      ON public.user_preferences FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Profiles Policies (legacy compatibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

-- ================================================
-- 5. FUNKTIONEN & TRIGGER
-- ================================================

-- Updated_at Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers (safe - recreates if exists)
DROP TRIGGER IF EXISTS set_updated_at ON public.user_roles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.buyer_profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.buyer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.seller_profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.seller_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.user_preferences;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ================================================
-- ✅ FERTIG - SCHEMA IST JETZT AKTUELL
-- ================================================

-- Prüfe ob alles funktioniert hat:
SELECT 
  'user_roles' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'user_roles'
UNION ALL
SELECT 
  'buyer_profiles',
  COUNT(*)
FROM pg_policies 
WHERE tablename = 'buyer_profiles'
UNION ALL
SELECT 
  'seller_profiles',
  COUNT(*)
FROM pg_policies 
WHERE tablename = 'seller_profiles'
UNION ALL
SELECT 
  'profiles',
  COUNT(*)
FROM pg_policies 
WHERE tablename = 'profiles';

