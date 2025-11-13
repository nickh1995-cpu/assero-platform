# 🚀 ASSERO Database Setup Instructions

## Problem behoben: Foreign Key Constraint Error

**Fehler:** `Insert or update on table "user_roles" violates foreign key constraint "user_roles_user_id_fkey"`

**Ursache:** Fehlende Datenbank-Tabellen für User-Management (`user_roles`, `buyer_profiles`, `seller_profiles`)

**Lösung:** Neues komplett User-Auth-Schema erstellt mit allen notwendigen Tabellen und RLS-Policies.

---

## 📋 Schritt-für-Schritt Anleitung

### 1. Supabase Dashboard öffnen

1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Melden Sie sich an und öffnen Sie Ihr Projekt
3. Navigieren Sie zu **SQL Editor** (linkes Menü)

### 2. User Auth Schema installieren

1. Klicken Sie auf **"New Query"**
2. Öffnen Sie die Datei `user_auth_schema.sql` aus diesem Verzeichnis
3. Kopieren Sie den gesamten Inhalt
4. Fügen Sie ihn in den SQL Editor ein
5. Klicken Sie auf **"Run"** (oder Strg+Enter)
6. ✅ Prüfen Sie, dass alle Queries erfolgreich ausgeführt wurden

### 3. Dealroom Schema installieren (falls noch nicht vorhanden)

1. Öffnen Sie **"New Query"**
2. Öffnen Sie die Datei `dealroom_schema.sql`
3. Kopieren Sie den gesamten Inhalt
4. Fügen Sie ihn in den SQL Editor ein
5. Klicken Sie auf **"Run"**
6. ✅ Prüfen Sie, dass alle Queries erfolgreich ausgeführt wurden

### 4. Tabellen verifizieren

Führen Sie diese Query aus, um zu prüfen, ob alle Tabellen erstellt wurden:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Erwartete Tabellen:**
- ✅ `user_roles`
- ✅ `buyer_profiles`
- ✅ `seller_profiles`
- ✅ `user_preferences`
- ✅ `user_sessions`
- ✅ `portfolios`
- ✅ `deals`
- ✅ `deal_participants`
- ✅ `deal_documents`
- ✅ `deal_comments`
- ✅ `deal_tasks`
- ✅ `portfolio_performance`
- ✅ `asset_allocations`
- ✅ `market_prices`
- ✅ `market_trends`

### 5. RLS Policies verifizieren

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

**Erwartete Policies:** Mindestens 4 Policies pro Tabelle (SELECT, INSERT, UPDATE, DELETE)

### 6. Test-User erstellen (Optional)

Führen Sie diese Query aus, um einen Test-Benutzer anzulegen:

```sql
-- Note: In production, users are created via the signup flow
-- This is only for testing purposes

-- Insert test user into auth.users (normally done by Supabase Auth)
-- Then create associated profile:

-- Example: Create a buyer profile for existing user
INSERT INTO user_roles (user_id, role_type, is_primary_role)
VALUES ('YOUR_USER_ID_HERE', 'buyer', true)
ON CONFLICT DO NOTHING;

INSERT INTO buyer_profiles (user_id, company_name, contact_person, phone, verification_status)
VALUES ('YOUR_USER_ID_HERE', 'Test Company', 'Max Mustermann', '+49 123 456789', 'verified')
ON CONFLICT (user_id) DO NOTHING;
```

---

## 🔧 Troubleshooting

### Problem: "relation already exists"

**Lösung:** Tabellen existieren bereits. Das ist OK - führen Sie einfach das nächste Schema aus.

### Problem: "permission denied for table"

**Lösung:** 
1. Stellen Sie sicher, dass Sie als **Owner** oder **Admin** angemeldet sind
2. Prüfen Sie die RLS-Policies
3. Fügen Sie bei Bedarf zusätzliche Policies hinzu

### Problem: "duplicate key value violates unique constraint"

**Lösung:** Daten existieren bereits - das ist OK. Ignorieren Sie den Fehler oder löschen Sie bestehende Test-Daten:

```sql
-- WARNING: Only for development - deletes all user profiles
TRUNCATE user_roles, buyer_profiles, seller_profiles CASCADE;
```

### Problem: FK Constraint Error bleibt bestehen

**Lösung:**
1. Prüfen Sie, ob `user_auth_schema.sql` erfolgreich ausgeführt wurde
2. Prüfen Sie, ob Tabellen existieren: `\dt` in psql oder via SQL Editor
3. Prüfen Sie Foreign Keys:

```sql
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('user_roles', 'buyer_profiles', 'seller_profiles');
```

---

## ✅ Verifikation nach Installation

### 1. Registrierung testen

1. Öffnen Sie die Dealroom-Seite: `http://localhost:3000/dealroom`
2. Klicken Sie auf "Registrieren"
3. Füllen Sie das Formular aus
4. ✅ Keine Fehlermeldung sollte erscheinen
5. ✅ E-Mail-Bestätigungsnachricht wird angezeigt

### 2. Login testen

1. Bestätigen Sie die E-Mail (Check Postfach)
2. Melden Sie sich an: `http://localhost:3000/sign-in`
3. ✅ Erfolgreich eingeloggt
4. ✅ Dealroom öffnet sich ohne Fehler

### 3. Dealroom funktioniert

1. Portfolios werden angezeigt (oder "Keine Portfolios")
2. "Neues Portfolio" Button funktioniert
3. Keine Foreign Key Errors in der Console

---

## 🎯 Was wurde verbessert

### Datenbank-Schema
- ✅ Komplettes User-Auth-Schema mit allen Tabellen
- ✅ Korrekte Foreign Key Constraints
- ✅ Row Level Security (RLS) Policies
- ✅ Automatische Triggers für Timestamps
- ✅ Default User Preferences beim Signup

### Registrierungs-Flow
- ✅ Robuste Fehlerbehandlung
- ✅ User-freundliche Fehlermeldungen
- ✅ Duplicate-Key-Handling (kein Crash bei Re-Registrierung)
- ✅ Klare E-Mail-Verifizierungs-Anweisungen
- ✅ Automatische Weiterleitung nach Registrierung

### UX-Verbesserungen
- ✅ Persistent Login (Session bleibt erhalten)
- ✅ Keine wiederholte Registrierung nötig
- ✅ Klare Schrittanzeige im Registrierungs-Wizard
- ✅ Premium-Design mit Corporate Identity

---

## 📞 Support

Bei weiteren Problemen:

1. **Console Logs prüfen:** Browser DevTools → Console
2. **Supabase Logs prüfen:** Supabase Dashboard → Logs
3. **SQL Errors analysieren:** SQL Editor → Run Query → Error Message

**Häufigste Fehlerquellen:**
- Fehlende `.env` Variablen (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- RLS Policies verhindern Zugriff
- User nicht authentifiziert
- Netzwerkprobleme (Firewall, VPN)

---

## 🚀 Ready to go!

Nach erfolgreicher Installation können Sie:

1. ✅ Benutzer registrieren ohne FK-Errors
2. ✅ Persistent einloggen
3. ✅ Dealroom verwenden
4. ✅ Portfolios & Deals verwalten

**Status:** ✅ Production-ready

