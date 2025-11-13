# 💰 ASSERO WALLET - Produktions-Roadmap

## 🎯 Ziel: Vollständig funktionale, produktionsreife Wallet

**Status**: Phase 1 ✅ Abgeschlossen  
**Aktuell**: Phase 2 bereit für Implementierung  

---

# 📋 PHASEN-ÜBERSICHT

## ✅ **PHASE 1: Foundation & UI/UX** (ABGESCHLOSSEN)

**Status**: ✅ Deployed  
**Dauer**: Abgeschlossen  

### Deliverables:
- ✅ Datenbank-Schema (wallets, transactions, payment_methods, activity_log)
- ✅ Row Level Security (RLS) Policies
- ✅ Premium UI/UX Design
- ✅ Balance Dashboard (3 Währungen)
- ✅ Transaction History View
- ✅ Payment Methods View
- ✅ Responsive Design
- ✅ Comprehensive Documentation

---

## 🚀 **PHASE 2: Core Transaction Functionality** (EMPFOHLEN: ZUERST)

**Priorität**: 🔴 HOCH  
**Geschätzte Dauer**: 2-3 Stunden  
**Komplexität**: Mittel  

### Ziel:
Deposit/Withdrawal Modals mit vollständiger Funktionalität **OHNE** echte Payment-Integration.
User kann Transaktionen erstellen, die in der Datenbank gespeichert werden.

### 2.1 Deposit Modal ⏱️ 45 Min
**Datei**: `platform/src/components/DepositModal.tsx`

**Features**:
- ✅ Modal-Dialog mit Form
- ✅ Betrag-Eingabe mit Validierung
- ✅ Währungsauswahl (EUR, USD, GBP)
- ✅ Zahlungsmethoden-Auswahl
- ✅ Bestätigung & Review
- ✅ Transaction erstellen in DB
- ✅ Balance aktualisieren
- ✅ Success/Error Feedback
- ✅ Activity Log Entry

**Technische Details**:
```typescript
// 1. User gibt Betrag ein
// 2. Wählt Zahlungsmethode
// 3. Klickt "Bestätigen"
// 4. Transaction wird erstellt (Status: 'completed')
// 5. Wallet Balance wird erhöht
// 6. Activity Log wird geschrieben
// 7. Success Message + Seite wird neu geladen
```

**Validierung**:
- Min: €10.00
- Max: Daily Limit (€10,000)
- Format: 2 Dezimalstellen
- Payment Method muss verified sein

### 2.2 Withdrawal Modal ⏱️ 45 Min
**Datei**: `platform/src/components/WithdrawalModal.tsx`

**Features**:
- ✅ Modal-Dialog mit Form
- ✅ Betrag-Eingabe mit Validierung
- ✅ Verfügbares Guthaben Check
- ✅ Zahlungsmethoden-Auswahl
- ✅ Bank Details Review
- ✅ Transaction erstellen in DB
- ✅ Balance reduzieren
- ✅ Success/Error Feedback
- ✅ Activity Log Entry

**Technische Details**:
```typescript
// 1. User gibt Betrag ein
// 2. System prüft verfügbares Guthaben
// 3. Wählt Auszahlungs-Zahlungsmethode
// 4. Klickt "Auszahlen"
// 5. Transaction wird erstellt (Status: 'pending')
// 6. Balance wird NICHT sofort reduziert (reserved)
// 7. Nach "Admin-Freigabe" wird Balance reduziert
// 8. Success Message
```

**Validierung**:
- Min: €10.00
- Max: Verfügbares Guthaben
- Verfügbar = Balance - Reserved
- Payment Method muss verified sein
- KYC muss verified sein (optional)

### 2.3 Transfer Modal ⏱️ 30 Min
**Datei**: `platform/src/components/TransferModal.tsx`

**Features**:
- ✅ Modal-Dialog mit Form
- ✅ Betrag-Eingabe
- ✅ Empfänger-Auswahl (Email oder User-ID)
- ✅ Beschreibung (optional)
- ✅ 2 Transactions erstellen (transfer_out + transfer_in)
- ✅ Beide Wallets aktualisieren
- ✅ Success/Error Feedback

**Technische Details**:
```typescript
// 1. User gibt Betrag + Empfänger ein
// 2. System validiert Empfänger existiert
// 3. Klickt "Überweisung senden"
// 4. Transaction 1: transfer_out (Sender)
// 5. Transaction 2: transfer_in (Empfänger)
// 6. Beide Balances aktualisieren
// 7. Activity Log für beide User
```

**Validierung**:
- Min: €1.00
- Max: Verfügbares Guthaben
- Empfänger muss existieren
- Empfänger ≠ Sender

### 2.4 Transaction Processing Service ⏱️ 30 Min
**Datei**: `platform/src/lib/transactionService.ts`

**Functions**:
```typescript
- createDeposit(walletId, amount, currency, paymentMethodId)
- createWithdrawal(walletId, amount, currency, paymentMethodId)
- createTransfer(fromWalletId, toWalletId, amount, currency)
- updateBalance(walletId, amount, currency, type)
- logActivity(walletId, userId, activityType, description)
- validateTransaction(walletId, amount, type)
```

**Error Handling**:
- Insufficient Balance
- Invalid Payment Method
- Daily Limit Exceeded
- KYC Not Verified
- Database Errors

### 2.5 Integration in Wallet Page ⏱️ 20 Min

**Updates**:
```typescript
// platform/src/app/wallet/page.tsx

// 1. Import Modals
import { DepositModal } from "@/components/DepositModal";
import { WithdrawalModal } from "@/components/WithdrawalModal";
import { TransferModal } from "@/components/TransferModal";

// 2. State für Modals
const [showDepositModal, setShowDepositModal] = useState(false);
const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
const [showTransferModal, setShowTransferModal] = useState(false);

// 3. Button Actions
<button onClick={() => setShowDepositModal(true)}>
  Einzahlen
</button>
```

### ✅ Phase 2 Deliverables:
- ✅ 3 vollständige Modals (Deposit, Withdrawal, Transfer)
- ✅ Transaction Service mit allen Functions
- ✅ Balance Updates funktionieren
- ✅ Activity Logging funktioniert
- ✅ Error Handling & Validierung
- ✅ Success/Error Messages

**Test-Checkliste**:
- [ ] Deposit €100 → Balance erhöht sich
- [ ] Withdrawal €50 → Balance reduziert sich
- [ ] Transfer €25 → Beide Wallets aktualisiert
- [ ] Invalid Amount → Error Message
- [ ] Insufficient Balance → Error Message
- [ ] Transaction erscheint in History

---

## 🔐 **PHASE 3: Payment Methods Management** (EMPFOHLEN: ZWEITENS)

**Priorität**: 🟡 MITTEL  
**Geschätzte Dauer**: 1.5-2 Stunden  
**Komplexität**: Mittel  

### Ziel:
User kann Zahlungsmethoden hinzufügen, bearbeiten, löschen und verifizieren.

### 3.1 Add Payment Method Modal ⏱️ 40 Min
**Datei**: `platform/src/components/AddPaymentMethodModal.tsx`

**Features**:
- ✅ Modal mit Form
- ✅ Type-Auswahl (Bank Account, Credit Card, SEPA)
- ✅ Dynamische Form-Felder je nach Type
- ✅ Validierung (IBAN, Card Number)
- ✅ Create in DB
- ✅ Optional: Set as Default

**Form-Felder Bank Account**:
```typescript
- Bank Name
- Account Holder
- IBAN (mit Validierung)
- BIC (optional)
```

**Form-Felder Credit Card**:
```typescript
- Card Number (wird tokenisiert gespeichert)
- Card Holder
- Expiry Month/Year
- CVV (wird NICHT gespeichert)
```

**Validierung**:
- IBAN: DE + 20 Zeichen
- Card: Luhn-Algorithmus
- Expiry: Nicht abgelaufen
- Holder: Min 3 Zeichen

### 3.2 Edit Payment Method Modal ⏱️ 20 Min
**Datei**: `platform/src/components/EditPaymentMethodModal.tsx`

**Features**:
- ✅ Pre-filled Form
- ✅ Update in DB
- ✅ Set/Unset Default
- ✅ Verification Status anzeigen

### 3.3 Delete Payment Method ⏱️ 15 Min

**Features**:
- ✅ Confirmation Dialog
- ✅ Soft Delete (Status = 'inactive')
- ✅ Can't delete if it's the only method
- ✅ Can't delete if Default (muss erst ein anderer Default werden)

### 3.4 Verify Payment Method ⏱️ 30 Min

**Simulated Verification**:
```typescript
// 1. User klickt "Verifizieren"
// 2. Modal erscheint
// 3. User gibt "Verification Code" ein (Fake: "123456")
// 4. Status → 'verified'
// 5. is_verified → true
// 6. verified_at → NOW()
```

**Real Verification (Phase 4)**:
- Micro-Deposit (Bank)
- 3D Secure (Card)

### 3.5 Integration in Wallet Page ⏱️ 15 Min

**Updates**:
```typescript
// Actions für Payment Methods
<button onClick={() => setShowAddPaymentModal(true)}>
  + Hinzufügen
</button>

<button onClick={() => handleEdit(method.id)}>
  ✏️ Bearbeiten
</button>

<button onClick={() => handleDelete(method.id)}>
  🗑️ Löschen
</button>
```

### ✅ Phase 3 Deliverables:
- ✅ Add Payment Method Modal
- ✅ Edit Payment Method Modal
- ✅ Delete Payment Method mit Confirmation
- ✅ Verify Payment Method (Simulated)
- ✅ Set/Unset Default
- ✅ IBAN/Card Validierung

**Test-Checkliste**:
- [ ] Add Bank Account → Erscheint in Liste
- [ ] Add Credit Card → Erscheint in Liste
- [ ] Edit Bank Name → Update funktioniert
- [ ] Set as Default → Badge erscheint
- [ ] Delete Method → Verschwindet aus Liste
- [ ] Verify Method → Badge ändert sich

---

## 📊 **PHASE 4: Transaction Filtering & Export** (EMPFOHLEN: DRITTENS)

**Priorität**: 🟢 NIEDRIG-MITTEL  
**Geschätzte Dauer**: 1-1.5 Stunden  
**Komplexität**: Niedrig  

### Ziel:
User kann Transaktionen filtern und exportieren.

### 4.1 Transaction Filters ⏱️ 30 Min
**Datei**: `platform/src/components/TransactionFilters.tsx`

**Features**:
- ✅ Date Range Picker
- ✅ Type Filter (Dropdown: All, Deposit, Withdrawal, etc.)
- ✅ Status Filter (Dropdown: All, Pending, Completed, etc.)
- ✅ Currency Filter (Dropdown: All, EUR, USD, GBP)
- ✅ Amount Range (Min/Max)
- ✅ Search by Reference Number

**UI**:
```typescript
<div className={styles.filtersBar}>
  <DateRangePicker 
    from={dateFrom} 
    to={dateTo} 
    onChange={handleDateChange}
  />
  <Select 
    options={transactionTypes} 
    onChange={handleTypeChange}
  />
  <Select 
    options={statuses} 
    onChange={handleStatusChange}
  />
  <Input 
    placeholder="Reference #" 
    onChange={handleSearchChange}
  />
  <button onClick={handleReset}>Reset</button>
</div>
```

**Query Building**:
```typescript
let query = supabase
  .from('wallet_transactions')
  .select('*')
  .eq('wallet_id', walletId);

if (dateFrom) query = query.gte('created_at', dateFrom);
if (dateTo) query = query.lte('created_at', dateTo);
if (type !== 'all') query = query.eq('type', type);
if (status !== 'all') query = query.eq('status', status);
if (searchTerm) query = query.ilike('reference_number', `%${searchTerm}%`);
```

### 4.2 Export to CSV ⏱️ 20 Min
**Datei**: `platform/src/lib/exportService.ts`

**Function**:
```typescript
export function exportToCSV(transactions: Transaction[]) {
  // 1. Convert to CSV format
  const headers = ['Date', 'Type', 'Amount', 'Currency', 'Status', 'Reference'];
  const rows = transactions.map(t => [
    formatDate(t.created_at),
    t.type,
    t.amount,
    t.currency,
    t.status,
    t.reference_number
  ]);
  
  // 2. Create CSV string
  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
  
  // 3. Download file
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions_${Date.now()}.csv`;
  a.click();
}
```

### 4.3 Export to PDF ⏱️ 20 Min
**Library**: `jsPDF` oder `react-pdf`

**Function**:
```typescript
export function exportToPDF(transactions: Transaction[], wallet: Wallet) {
  // 1. Create PDF document
  // 2. Add Header (Logo, Wallet Info)
  // 3. Add Transaction Table
  // 4. Add Footer (Page Numbers)
  // 5. Download
}
```

### 4.4 Integration ⏱️ 10 Min

**Export Button**:
```typescript
<button onClick={() => exportToCSV(filteredTransactions)}>
  📄 Export CSV
</button>
<button onClick={() => exportToPDF(filteredTransactions, wallet)}>
  📄 Export PDF
</button>
```

### ✅ Phase 4 Deliverables:
- ✅ Transaction Filters (Date, Type, Status, Currency, Search)
- ✅ CSV Export
- ✅ PDF Export
- ✅ Reset Filters
- ✅ Filter State Persistence (optional)

**Test-Checkliste**:
- [ ] Filter by Date Range → Korrekte Transaktionen
- [ ] Filter by Type → Nur deposits
- [ ] Search by Reference → Findet Transaktion
- [ ] Export CSV → Download funktioniert
- [ ] Export PDF → Sieht professionell aus

---

## 🔔 **PHASE 5: Notifications & Alerts** (OPTIONAL)

**Priorität**: 🟢 NIEDRIG  
**Geschätzte Dauer**: 1-1.5 Stunden  
**Komplexität**: Mittel  

### Ziel:
User erhält Benachrichtigungen bei wichtigen Events.

### 5.1 In-App Notifications ⏱️ 30 Min
**Datei**: `platform/src/components/NotificationCenter.tsx`

**Features**:
- ✅ Notification Bell Icon (mit Badge für unread count)
- ✅ Dropdown mit Recent Notifications
- ✅ Mark as Read
- ✅ Clear All

**Types**:
- Transaction Completed
- Transaction Failed
- Payment Method Added
- Payment Method Verified
- KYC Status Changed
- Daily Limit Warning

### 5.2 Email Notifications ⏱️ 40 Min
**Service**: Supabase Edge Functions + Resend/SendGrid

**Templates**:
- Deposit Confirmation
- Withdrawal Confirmation
- Transfer Sent/Received
- Low Balance Warning
- Security Alert

**Implementation**:
```typescript
// Supabase Edge Function
// Triggered by Database Trigger
// Sends email via Resend API
```

### 5.3 Real-time Updates ⏱️ 20 Min
**Feature**: Supabase Realtime Subscriptions

**Implementation**:
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('wallet_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'wallet_transactions',
      filter: `wallet_id=eq.${walletId}`
    }, (payload) => {
      // Update transactions list
      // Show notification
    })
    .subscribe();
    
  return () => subscription.unsubscribe();
}, [walletId]);
```

### ✅ Phase 5 Deliverables:
- ✅ In-App Notification Center
- ✅ Email Notifications (optional)
- ✅ Real-time Transaction Updates
- ✅ Notification Preferences

---

## 💳 **PHASE 6: Payment Gateway Integration** (FUTURE)

**Priorität**: ⚪ FUTURE  
**Geschätzte Dauer**: 4-6 Stunden  
**Komplexität**: Hoch  

### Ziel:
Echte Zahlungen über Stripe/PayPal.

**HINWEIS**: Benötigt externe Services, Compliance, PCI-DSS, etc.
**Empfehlung**: Erst nach Phase 2-4 implementieren.

### 6.1 Stripe Integration
- ✅ Stripe Account Setup
- ✅ API Keys konfigurieren
- ✅ Payment Intents erstellen
- ✅ 3D Secure
- ✅ Webhooks für Status Updates

### 6.2 Bank Transfer (SEPA)
- ✅ IBAN Validation
- ✅ Transfer Instructions generieren
- ✅ Payment Tracking

### 6.3 PayPal Integration
- ✅ OAuth Flow
- ✅ Payment Creation
- ✅ Webhooks

---

## 🔐 **PHASE 7: KYC Integration** (FUTURE)

**Priorität**: ⚪ FUTURE  
**Geschätzte Dauer**: 3-4 Stunden  
**Komplexität**: Hoch  

### Ziel:
Identity Verification für Compliance.

**Services**: Stripe Identity, Jumio, Onfido

### 7.1 KYC Flow
- ✅ Document Upload (ID, Passport)
- ✅ Selfie Verification
- ✅ Address Verification
- ✅ Status Tracking

### 7.2 Compliance
- ✅ AML Checks
- ✅ Sanctions Screening
- ✅ PEP Checks

---

# 🎯 EMPFOHLENE REIHENFOLGE

## ✅ **Minimale Produktionsreife** (MVP):

```
Phase 1 ✅ (Abgeschlossen)
→ Phase 2 🚀 (Core Transactions)
→ Phase 3 🔐 (Payment Methods)
→ Phase 4 📊 (Filtering & Export)
```

**Ergebnis**: Vollständig funktionale Wallet ohne externe Payment-Integration.
**Dauer**: ~5-6 Stunden total
**Funktionalität**: 90% Production-Ready

## 🚀 **Vollständige Produktionsreife**:

```
MVP (oben)
→ Phase 5 🔔 (Notifications)
→ Phase 6 💳 (Payment Gateway)
→ Phase 7 🔐 (KYC)
```

**Ergebnis**: Enterprise-Grade Wallet mit echten Zahlungen
**Dauer**: ~15-20 Stunden total
**Funktionalität**: 100% Production-Ready

---

# 📋 NÄCHSTER SCHRITT

## **START MIT PHASE 2**: Core Transaction Functionality

**Ich empfehle, JETZT mit Phase 2 zu beginnen:**

### Was wir als nächstes implementieren:

1. ✅ **DepositModal.tsx** (45 Min)
2. ✅ **WithdrawalModal.tsx** (45 Min)
3. ✅ **TransferModal.tsx** (30 Min)
4. ✅ **transactionService.ts** (30 Min)
5. ✅ **Integration in Wallet Page** (20 Min)

**Total**: ~2.5 Stunden für vollständige Transaction-Funktionalität

**Soll ich mit Phase 2.1 (DepositModal) beginnen?** 🚀

