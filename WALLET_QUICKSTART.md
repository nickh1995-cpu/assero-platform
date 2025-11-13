# 🚀 WALLET QUICK START

## ✅ In 3 Schritten zur funktionierenden Wallet

---

## SCHRITT 1: Datenbank Setup (2 Minuten)

### 1. Öffnen Sie Supabase Dashboard

```
https://app.supabase.com
→ Ihr Projekt öffnen
→ "SQL Editor" (linkes Menü)
```

### 2. Schema deployen

```sql
-- Kopieren Sie den GESAMTEN Inhalt von:
platform/database/wallet_schema.sql

-- Fügen Sie ihn in den SQL Editor ein
-- Klicken Sie "Run" oder Cmd/Ctrl+Enter
```

### 3. Verifizieren

```sql
-- Prüfen Sie, ob Tabellen erstellt wurden:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'wallet%';

-- Sie sollten sehen:
-- ✅ wallets
-- ✅ wallet_transactions
-- ✅ payment_methods
-- ✅ wallet_activity_log
```

---

## SCHRITT 2: Test-Daten erstellen (Optional)

### Ihre Wallet wird automatisch beim ersten Besuch erstellt!

Aber wenn Sie Test-Transaktionen und Payment Methods sehen möchten:

```sql
-- 1. Ihre Wallet-ID finden
SELECT id FROM public.wallets WHERE user_id = auth.uid();

-- 2. Test-Transaktion erstellen
INSERT INTO public.wallet_transactions (
  wallet_id,
  user_id,
  type,
  amount,
  currency,
  status,
  description
) VALUES (
  'YOUR_WALLET_ID_HERE',  -- ← Ersetzen Sie dies!
  auth.uid(),
  'deposit',
  1000.00,
  'EUR',
  'completed',
  'Initial Test-Einzahlung'
);

-- 3. Test-Zahlungsmethode erstellen
INSERT INTO public.payment_methods (
  user_id,
  wallet_id,
  type,
  bank_name,
  account_holder,
  iban,
  is_verified,
  is_default,
  status
) VALUES (
  auth.uid(),
  'YOUR_WALLET_ID_HERE',  -- ← Ersetzen Sie dies!
  'bank_account',
  'Deutsche Bank',
  'Max Mustermann',
  'DE89370400440532013000',
  true,
  true,
  'verified'
);
```

---

## SCHRITT 3: Wallet aufrufen

```
http://localhost:3000/wallet/
```

### ✅ Was Sie sehen sollten:

1. **Balance Cards** (EUR, USD, GBP)
   - Guthaben: €0.00 (oder Test-Betrag)
   - Verfügbar: €0.00
   - Reserviert: €0.00
   - Tageslimit: €10,000.00

2. **KYC Banner** (gelb)
   - Verifizierung ausstehend

3. **Quick Actions**
   - Einzahlen
   - Auszahlen
   - Überweisung
   - Export

4. **Transaktionen**
   - Leer (oder Test-Transaktionen)

5. **Zahlungsmethoden**
   - Leer (oder Test-Methoden)

---

## 🐛 Troubleshooting

### Problem: "Wallet nicht gefunden"

**Lösung**: Wallet wird automatisch beim ersten Besuch erstellt. Seite neu laden.

### Problem: "Keine Berechtigung"

**Lösung**: RLS Policies prüfen:

```sql
-- Policies anzeigen
SELECT * FROM pg_policies WHERE tablename LIKE 'wallet%';

-- Falls fehlend, Schema erneut ausführen
```

### Problem: "Transaktionen werden nicht angezeigt"

**Lösung**: 
1. Prüfen Sie, ob Transaktionen existieren:

```sql
SELECT * FROM public.wallet_transactions WHERE user_id = auth.uid();
```

2. Prüfen Sie `wallet_id` in Transaktionen:

```sql
-- Muss mit Ihrer Wallet übereinstimmen
SELECT 
  w.id as wallet_id,
  t.wallet_id as transaction_wallet_id
FROM public.wallets w
LEFT JOIN public.wallet_transactions t ON t.wallet_id = w.id
WHERE w.user_id = auth.uid();
```

### Problem: "CSS wird nicht geladen"

**Lösung**:
```bash
# Server neu starten
npm run dev
```

---

## 📊 Erwartete Ergebnisse

### ✅ Erfolgreiche Implementierung

- [x] Seite lädt ohne Fehler
- [x] Balance Cards werden angezeigt
- [x] KYC Banner wird angezeigt (falls nicht verifiziert)
- [x] Transaktionen-Sektion vorhanden
- [x] Zahlungsmethoden-Sektion vorhanden
- [x] Responsive Design funktioniert
- [x] Zurück-Button zum Dealroom funktioniert

### ⚠️ Bekannte Einschränkungen (Aktuell)

- [ ] "Einzahlen" Button **noch nicht funktional** (nur UI)
- [ ] "Auszahlen" Button **noch nicht funktional** (nur UI)
- [ ] "Überweisung" Button **noch nicht funktional** (nur UI)
- [ ] "KYC Verifizieren" Button **noch nicht funktional** (nur UI)
- [ ] Zahlungsmethoden Hinzufügen **noch nicht funktional** (nur UI)

**Diese werden in Phase 2 implementiert!**

---

## 🎨 Design-Qualität prüfen

### Desktop (> 1024px)
- Balance Cards: 3 Spalten
- Content Grid: 2 Spalten (2:1 Ratio)
- Sidebar rechts

### Tablet (768px - 1024px)
- Balance Cards: 2-3 Spalten
- Content Grid: 1 Spalte (Stacked)

### Mobile (< 768px)
- Balance Cards: 1 Spalte
- Quick Actions: Vertical Stack
- Full Width Layout

---

## 🚀 Nächste Schritte

### Phase 2 (Nicht implementiert)

1. **Deposit Modal**
   - Betrag eingeben
   - Zahlungsmethode wählen
   - Bestätigung
   - Stripe Integration

2. **Withdrawal Modal**
   - Betrag eingeben
   - Zahlungsmethode wählen
   - Bank Details
   - SEPA Transfer

3. **Transaction Filtering**
   - Datum Range Picker
   - Typ Filter
   - Status Filter
   - Search

4. **Export**
   - PDF Generation
   - CSV Export
   - Email Report

---

## 📚 Weitere Dokumentation

- **Vollständige Docs**: `platform/WALLET_DOCUMENTATION.md`
- **Database Schema**: `platform/database/wallet_schema.sql`
- **Frontend Code**: `platform/src/app/wallet/page.tsx`
- **CSS Styles**: `platform/src/app/wallet/wallet.module.css`

---

## ✅ FERTIG!

Ihre Wallet-Seite ist jetzt **produktionsreif** (UI/UX) und bereit für die Payment-Integration!

🎉 **Herzlichen Glückwunsch!**

