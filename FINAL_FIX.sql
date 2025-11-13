-- ==============================================
-- FINAL FIX - FOOLPROOF VERSION
-- Diese Version prüft ALLES bevor sie etwas macht
-- ==============================================

-- WICHTIG: Ersetze 'DEINE@EMAIL.COM' mit deiner tatsächlichen E-Mail!

-- ==============================================
-- SCHRITT 1: PRÜFEN OB USER EXISTIERT
-- ==============================================

SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Bestätigt'
        ELSE '⏳ Wartet auf Bestätigung'
    END as status
FROM auth.users
WHERE email = 'DEINE@EMAIL.COM';

-- ⚠️ WICHTIG: Wenn diese Query KEINE Zeile zurückgibt, existiert der User NICHT!
-- → Gehe zu OPTION A (User existiert nicht)
-- → Wenn User existiert, gehe zu OPTION B (User existiert)

-- ==============================================
-- OPTION A: USER EXISTIERT NICHT
-- ==============================================

-- Das bedeutet: Entweder wurde User gelöscht oder nie registriert

-- Lösung: Email-Confirmation deaktivieren und neu registrieren

-- 1. Supabase Dashboard → Authentication → Providers → Email
-- 2. Deaktiviere "Confirm email"
-- 3. Save
-- 4. Gehe zu: http://localhost:3000/dealroom
-- 5. Registriere dich NEU
-- 6. ✅ FERTIG - sofort eingeloggt!

-- ==============================================
-- OPTION B: USER EXISTIERT (hat Zeile zurückgegeben)
-- ==============================================

-- Kopiere die USER-ID aus SCHRITT 1 und füge sie unten ein!

-- Schritt B1: User bestätigen
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'DEINE@EMAIL.COM'
RETURNING id, email, email_confirmed_at;

-- Schritt B2: Prüfe ob Role bereits existiert
SELECT * FROM user_roles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'DEINE@EMAIL.COM');

-- Falls KEINE Zeile zurückkommt, führe aus:
INSERT INTO user_roles (user_id, role_type, is_primary_role)
SELECT id, 'buyer', true
FROM auth.users
WHERE email = 'DEINE@EMAIL.COM'
  AND EXISTS (SELECT 1 FROM auth.users WHERE email = 'DEINE@EMAIL.COM');

-- Schritt B3: Prüfe ob Profil bereits existiert
SELECT * FROM buyer_profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'DEINE@EMAIL.COM');

-- Falls KEINE Zeile zurückkommt, führe aus:
INSERT INTO buyer_profiles (user_id, contact_person, verification_status)
SELECT id, 'Dein Name', 'verified'
FROM auth.users
WHERE email = 'DEINE@EMAIL.COM'
  AND EXISTS (SELECT 1 FROM auth.users WHERE email = 'DEINE@EMAIL.COM');

-- ==============================================
-- FINALE VERIFIKATION
-- ==============================================

SELECT 
    u.email,
    u.email_confirmed_at,
    ur.role_type,
    bp.contact_person
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN buyer_profiles bp ON u.id = bp.user_id
WHERE u.email = 'DEINE@EMAIL.COM';

-- Erwartete Ausgabe:
-- email              | email_confirmed_at  | role_type | contact_person
-- -------------------|---------------------|-----------|---------------
-- deine@email.com    | 2025-11-06 ...      | buyer     | Dein Name

-- Falls role_type oder contact_person NULL ist, wurden Role/Profil nicht erstellt
-- → Wiederhole Schritt B2 und B3

-- ==============================================
-- DEBUGGING: ALLE USER ANZEIGEN
-- ==============================================

SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Siehst du deine E-Mail in der Liste?
-- JA → Gehe zu OPTION B
-- NEIN → Gehe zu OPTION A (User existiert nicht)

-- ==============================================
-- SCHNELLSTE LÖSUNG: KOMPLETT NEU STARTEN
-- ==============================================

-- 1. User löschen (falls existiert)
DELETE FROM auth.users WHERE email = 'DEINE@EMAIL.COM';

-- 2. Supabase: Email-Confirmation DEAKTIVIEREN
--    Dashboard → Authentication → Providers → Email → "Confirm email" AUS

-- 3. Neu registrieren
--    http://localhost:3000/dealroom

-- ✅ FERTIG - Sofort eingeloggt, kein SQL mehr nötig!

