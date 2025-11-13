# 📧 E-Mail-Bestätigung Setup - Quick Guide

## Problem: Keine Bestätigungs-E-Mail erhalten

**Ursache:** Supabase Email-Confirmation ist standardmäßig aktiviert, aber keine E-Mail wird verschickt (lokale Entwicklung oder fehlende SMTP-Config).

---

## ✅ Lösung 1: Email-Confirmation DEAKTIVIEREN (für lokale Entwicklung)

**Empfohlen für schnelles Testing!**

### Schritt 1: Supabase Dashboard öffnen
1. Gehe zu [supabase.com/dashboard](https://supabase.com/dashboard)
2. Wähle dein Projekt
3. Navigiere zu **Authentication** → **Providers** (linkes Menü)

### Schritt 2: Email-Confirmation deaktivieren
1. Scrolle zu **"Email"** Provider
2. Finde **"Confirm email"**
3. ✅ **Deaktiviere** "Confirm email"
4. Klicke **"Save"**

### Schritt 3: Testen
```
1. Registriere dich neu: http://localhost:3000/dealroom
2. ✅ User wird SOFORT erstellt (keine E-Mail nötig)
3. ✅ Direkt eingeloggt
4. ✅ Dealroom öffnet sich
```

---

## ✅ Lösung 2: SMTP-Email konfigurieren (für Production)

### Schritt 1: SMTP-Server einrichten

**Option A: SendGrid (empfohlen, kostenlos bis 100 E-Mails/Tag)**
1. Registriere dich bei [sendgrid.com](https://sendgrid.com)
2. Erstelle API-Key
3. SMTP-Credentials:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - User: `apikey`
   - Password: `[dein API-Key]`

**Option B: Gmail (für Testing)**
1. Erstelle App-Passwort: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. SMTP-Credentials:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - User: `deine@gmail.com`
   - Password: `[App-Passwort]`

**Option C: Mailgun, Postmark, AWS SES** (alle unterstützt)

### Schritt 2: Supabase SMTP konfigurieren
1. Gehe zu **Project Settings** → **Auth**
2. Scrolle zu **"SMTP Settings"**
3. Fülle aus:
   - **Sender email:** `noreply@deine-domain.com`
   - **Sender name:** `ASSERO Platform`
   - **Host:** `smtp.sendgrid.net` (oder dein SMTP)
   - **Port:** `587`
   - **Username:** `apikey` (oder dein User)
   - **Password:** `[dein API-Key]`
4. Klicke **"Save"**

### Schritt 3: E-Mail-Template anpassen (optional)
1. Gehe zu **Authentication** → **Email Templates**
2. Wähle **"Confirm signup"**
3. Passe Template an (mit deinem Branding)
4. Klicke **"Save"**

---

## 🔍 E-Mail-Logs prüfen (Debugging)

### Methode 1: Supabase Dashboard
```
1. Gehe zu: Logs → Logs Explorer
2. Filtere nach: "email"
3. Sieh nach E-Mail-Send-Events
```

### Methode 2: SQL Query
```sql
-- Check users waiting for confirmation
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;
```

---

## 🚀 Schnellster Weg: Email-Confirmation MANUELL bestätigen

**Für lokale Entwicklung - User sofort freischalten:**

### SQL im Supabase SQL Editor:
```sql
-- User manuell bestätigen (ersetze EMAIL mit deiner E-Mail)
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'deine@email.com';
```

### Dann Profile erstellen:
```sql
-- User-ID ermitteln
SELECT id, email FROM auth.users WHERE email = 'deine@email.com';

-- Role erstellen (ersetze USER_ID)
INSERT INTO user_roles (user_id, role_type, is_primary_role)
VALUES ('USER_ID_HIER', 'buyer', true)
ON CONFLICT DO NOTHING;

-- Buyer-Profile erstellen
INSERT INTO buyer_profiles (user_id, contact_person, verification_status)
VALUES ('USER_ID_HIER', 'Dein Name', 'verified')
ON CONFLICT (user_id) DO NOTHING;
```

### Login testen:
```
1. Öffne: http://localhost:3000/sign-in
2. Melde dich an mit deiner E-Mail
3. ✅ Sollte jetzt funktionieren!
```

---

## 📋 Recommended Flow für lokale Entwicklung

### Option A: Ohne E-Mail (schnellstes Setup)
1. ✅ Email-Confirmation deaktivieren (siehe Lösung 1)
2. Registriere dich
3. Fertig!

### Option B: Mit E-Mail (realistischer, aber komplexer)
1. SMTP konfigurieren (siehe Lösung 2)
2. Registriere dich
3. Check Postfach
4. Klick auf Link

### Option C: Manuelles Testing (für Entwickler)
1. Registriere dich
2. Bestätige User manuell via SQL (siehe oben)
3. Login

---

## ✅ Verifikation

### Test 1: Email-Confirmation Status prüfen
```sql
SELECT 
    setting_name, 
    setting_value 
FROM pg_settings 
WHERE setting_name LIKE '%email%';
```

### Test 2: User-Status prüfen
```sql
SELECT 
    email, 
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
        ELSE '⏳ Waiting for confirmation'
    END as status
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

### Test 3: Profile prüfen
```sql
SELECT 
    u.email,
    ur.role_type,
    bp.contact_person as buyer_name,
    sp.contact_person as seller_name
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN buyer_profiles bp ON u.id = bp.user_id
LEFT JOIN seller_profiles sp ON u.id = sp.user_id
ORDER BY u.created_at DESC
LIMIT 5;
```

---

## 🎯 Empfehlung für dich JETZT:

**Schnellste Lösung (2 Minuten):**

1. **Supabase Dashboard** → **Authentication** → **Providers** → **Email**
2. **Deaktiviere "Confirm email"**
3. **Save**
4. **Lösche alten Test-User:**
   ```sql
   DELETE FROM auth.users WHERE email = 'deine@email.com';
   ```
5. **Registriere dich neu:** `http://localhost:3000/dealroom`
6. ✅ **Funktioniert sofort!**

---

## 📞 Weitere Infos

- **Supabase Email-Docs:** [supabase.com/docs/guides/auth/auth-email](https://supabase.com/docs/guides/auth/auth-email)
- **SMTP-Setup:** [supabase.com/docs/guides/auth/auth-smtp](https://supabase.com/docs/guides/auth/auth-smtp)
- **Custom Email Templates:** [supabase.com/docs/guides/auth/auth-email-templates](https://supabase.com/docs/guides/auth/auth-email-templates)

---

**Status:** ✅ Du hast jetzt 3 Optionen zur Auswahl – wähle die schnellste für deine Situation!

