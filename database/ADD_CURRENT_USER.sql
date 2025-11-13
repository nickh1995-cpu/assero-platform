-- ================================================
-- QUICK FIX: Aktuellen User für Dealroom vorbereiten
-- ================================================
-- Führe dieses Script aus NACHDEM du dich eingeloggt hast

-- 1. Finde deine User-ID (ersetze EMAIL)
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'DEINE@EMAIL.COM'; -- ← HIER DEINE EMAIL EINTRAGEN
BEGIN
  -- Hole User-ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ User nicht gefunden mit Email: %', v_email;
    RAISE NOTICE 'Bitte ersetze DEINE@EMAIL.COM mit deiner echten Email-Adresse!';
    RETURN;
  END IF;

  RAISE NOTICE '✅ User gefunden: % (ID: %)', v_email, v_user_id;

  -- 2. Email bestätigen (falls nicht bestätigt)
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{email_confirmed}',
        'true'::jsonb
      )
  WHERE id = v_user_id;

  RAISE NOTICE '✅ Email-Confirmation gesetzt';

  -- 3. User Role erstellen (falls nicht vorhanden)
  INSERT INTO public.user_roles (user_id, role_type, is_primary_role, created_at, updated_at)
  VALUES (v_user_id, 'buyer', true, NOW(), NOW())
  ON CONFLICT (user_id, role_type) 
  DO UPDATE SET 
    is_primary_role = true,
    updated_at = NOW();

  RAISE NOTICE '✅ User Role (buyer) erstellt/aktualisiert';

  -- 4. Buyer Profile erstellen (falls nicht vorhanden)
  INSERT INTO public.buyer_profiles (
    user_id, 
    contact_person, 
    verification_status,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    (SELECT COALESCE(
      (raw_user_meta_data->>'first_name')::text || ' ' || (raw_user_meta_data->>'last_name')::text,
      email
    ) FROM auth.users WHERE id = v_user_id),
    'verified',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    verification_status = 'verified',
    updated_at = NOW();

  RAISE NOTICE '✅ Buyer Profile erstellt/aktualisiert';

  -- 5. Profiles Eintrag erstellen (legacy compatibility)
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    is_verified,
    profile_complete,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    (SELECT (raw_user_meta_data->>'first_name')::text FROM auth.users WHERE id = v_user_id),
    (SELECT (raw_user_meta_data->>'last_name')::text FROM auth.users WHERE id = v_user_id),
    true,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) 
  DO UPDATE SET 
    is_verified = true,
    profile_complete = true,
    updated_at = NOW();

  RAISE NOTICE '✅ Profile erstellt/aktualisiert';

  -- 6. Verification Report
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ SETUP KOMPLETT FÜR USER: %', v_email;
  RAISE NOTICE '================================================';
  RAISE NOTICE 'User-ID: %', v_user_id;
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Überprüfe mit diesen Queries:';
  RAISE NOTICE '';
  RAISE NOTICE 'SELECT * FROM auth.users WHERE id = ''%'';', v_user_id;
  RAISE NOTICE 'SELECT * FROM user_roles WHERE user_id = ''%'';', v_user_id;
  RAISE NOTICE 'SELECT * FROM buyer_profiles WHERE user_id = ''%'';', v_user_id;
  RAISE NOTICE 'SELECT * FROM profiles WHERE id = ''%'';', v_user_id;

END $$;

