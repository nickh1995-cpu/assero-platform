-- ==============================================
-- QUICK FIX: Aktuellen User manuell bestätigen
-- ==============================================
-- Nutze dieses Script, wenn du dich registriert hast
-- aber keine Bestätigungs-E-Mail erhalten hast

-- WICHTIG: Ersetze 'DEINE@EMAIL.COM' mit deiner tatsächlichen E-Mail!

-- ==============================================
-- SCHRITT 1: User-ID ermitteln
-- ==============================================

SELECT 
    id as user_id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Bereits bestätigt'
        ELSE '⏳ Wartet auf Bestätigung'
    END as status
FROM auth.users
WHERE email = 'DEINE@EMAIL.COM';

-- Kopiere die user_id aus dem Result für die nächsten Schritte!

-- ==============================================
-- SCHRITT 2: User manuell bestätigen
-- ==============================================

UPDATE auth.users
SET 
    email_confirmed_at = NOW()
    -- confirmed_at wird automatisch generiert
WHERE email = 'DEINE@EMAIL.COM'
RETURNING id, email, email_confirmed_at;

-- ==============================================
-- SCHRITT 3: User-Role erstellen
-- ==============================================

-- Option A: Für KÄUFER
INSERT INTO user_roles (user_id, role_type, is_primary_role)
SELECT id, 'buyer', true
FROM auth.users
WHERE email = 'DEINE@EMAIL.COM'
ON CONFLICT DO NOTHING
RETURNING *;

-- Option B: Für VERKÄUFER (stattdessen)
-- INSERT INTO user_roles (user_id, role_type, is_primary_role)
-- SELECT id, 'seller', true
-- FROM auth.users
-- WHERE email = 'DEINE@EMAIL.COM'
-- ON CONFLICT DO NOTHING
-- RETURNING *;

-- ==============================================
-- SCHRITT 4: Profil erstellen
-- ==============================================

-- Option A: Buyer-Profil erstellen
INSERT INTO buyer_profiles (user_id, contact_person, verification_status)
SELECT 
    id,
    COALESCE(
        (raw_user_meta_data->>'first_name')::text || ' ' || (raw_user_meta_data->>'last_name')::text, 
        'Unbekannt'
    ) as contact_person,
    'verified'
FROM auth.users
WHERE email = 'DEINE@EMAIL.COM'
ON CONFLICT (user_id) DO UPDATE
SET contact_person = EXCLUDED.contact_person
RETURNING *;

-- Option B: Seller-Profil erstellen (stattdessen)
-- INSERT INTO seller_profiles (user_id, company_name, contact_person, verification_status)
-- SELECT 
--     id,
--     'Meine Firma GmbH',
--     COALESCE(
--         (raw_user_meta_data->>'first_name')::text || ' ' || (raw_user_meta_data->>'last_name')::text, 
--         'Unbekannt'
--     ) as contact_person,
--     'verified'
-- FROM auth.users
-- WHERE email = 'DEINE@EMAIL.COM'
-- ON CONFLICT (user_id) DO UPDATE
-- SET contact_person = EXCLUDED.contact_person
-- RETURNING *;

-- ==============================================
-- SCHRITT 5: Verifikation
-- ==============================================

-- Prüfe, ob alles erstellt wurde
SELECT 
    u.email,
    u.email_confirmed_at as confirmed,
    ur.role_type,
    COALESCE(bp.contact_person, sp.contact_person) as name,
    COALESCE(bp.verification_status, sp.verification_status) as status
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_primary_role = true
LEFT JOIN buyer_profiles bp ON u.id = bp.user_id
LEFT JOIN seller_profiles sp ON u.id = sp.user_id
WHERE u.email = 'DEINE@EMAIL.COM';

-- Erwartete Ausgabe:
-- email             | confirmed           | role_type | name       | status
-- ----------------- | ------------------- | --------- | ---------- | --------
-- deine@email.com   | 2025-11-06 14:30:00 | buyer     | Dein Name  | verified

-- ==============================================
-- FERTIG! 🎉
-- ==============================================
-- Jetzt kannst du dich anmelden unter:
-- http://localhost:3000/sign-in
--
-- Danach öffne:
-- http://localhost:3000/dealroom
-- ==============================================

