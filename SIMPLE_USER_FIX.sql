-- ==============================================
-- EINFACHER USER-FIX
-- Kein komplizierter Code - nur das Nötigste
-- ==============================================

-- WICHTIG: Ersetze 'DEINE@EMAIL.COM' mit deiner tatsächlichen E-Mail!

-- ==============================================
-- OPTION 1: Komplett neu starten (EMPFOHLEN)
-- ==============================================

-- Schritt 1: Alten User löschen
DELETE FROM auth.users WHERE email = 'DEINE@EMAIL.COM';

-- Schritt 2: In Supabase Dashboard Email-Confirmation DEAKTIVIEREN:
-- Dashboard → Authentication → Providers → Email → "Confirm email" AUS

-- Schritt 3: Neu registrieren auf:
-- http://localhost:3000/dealroom

-- ✅ FERTIG! User wird sofort erstellt, keine E-Mail nötig.

-- ==============================================
-- OPTION 2: Aktuellen User manuell aktivieren
-- ==============================================

-- Schritt 1: Deine User-ID finden
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'DEINE@EMAIL.COM';

-- Schritt 2: E-Mail bestätigen
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'DEINE@EMAIL.COM';

-- Schritt 3: Role erstellen (für Käufer)
INSERT INTO user_roles (user_id, role_type, is_primary_role)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'DEINE@EMAIL.COM'),
    'buyer',
    true
);

-- Schritt 4: Profil erstellen (für Käufer)
INSERT INTO buyer_profiles (user_id, contact_person, verification_status)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'DEINE@EMAIL.COM'),
    'Dein Name',  -- ÄNDERE DIES zu deinem Namen
    'verified'
);

-- Schritt 5: Prüfen ob alles geklappt hat
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

-- ==============================================
-- FALLS DU VERKÄUFER SEIN WILLST (STATT KÄUFER)
-- ==============================================

-- Ersetze Schritt 3 & 4 mit:
/*
INSERT INTO user_roles (user_id, role_type, is_primary_role)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'DEINE@EMAIL.COM'),
    'seller',
    true
);

INSERT INTO seller_profiles (user_id, company_name, contact_person, verification_status)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'DEINE@EMAIL.COM'),
    'Deine Firma GmbH',  -- ÄNDERE DIES
    'Dein Name',         -- ÄNDERE DIES
    'verified'
);
*/

-- ==============================================
-- DANACH: LOGIN TESTEN
-- ==============================================

-- 1. Öffne: http://localhost:3000/sign-in
-- 2. Melde dich mit deiner E-Mail an
-- 3. Öffne: http://localhost:3000/dealroom
-- ✅ Sollte funktionieren!

-- ==============================================
-- FALLS ERRORS AUFTRETEN
-- ==============================================

-- Error: "duplicate key value violates unique constraint"
-- → User/Role/Profile existiert bereits - das ist OK!
-- → Einfach den entsprechenden Schritt überspringen

-- Error: "violates foreign key constraint"
-- → User existiert nicht in auth.users
-- → Gehe zurück zu Schritt 1 (User-ID finden)

-- Error: "relation does not exist"
-- → Tabellen wurden nicht erstellt
-- → Führe zuerst user_auth_schema.sql aus

-- ==============================================
-- DEBUGGING: Alle User anzeigen
-- ==============================================

SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    ur.role_type,
    COALESCE(bp.contact_person, sp.contact_person) as name
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN buyer_profiles bp ON u.id = bp.user_id
LEFT JOIN seller_profiles sp ON u.id = sp.user_id
ORDER BY u.created_at DESC
LIMIT 10;

