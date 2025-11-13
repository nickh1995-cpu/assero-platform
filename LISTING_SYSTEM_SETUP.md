# 🚀 LISTING SYSTEM - Quick Setup Guide

## ✅ Phase 1.1: Database Schema - FERTIG!

**Erstellt**: `platform/database/listing_system_schema.sql`

---

## 📦 Was wurde implementiert:

### 1. **Assets Table Extension**
Neue Spalten für User-Generated Listings:

```sql
✅ created_by          - User ID des Erstellers
✅ status              - draft | pending_review | active | inactive | rejected
✅ views_count         - Anzahl Aufrufe
✅ favorites_count     - Anzahl Favoriten
✅ images[]            - Array von Bild-URLs
✅ contact_email       - Kontakt E-Mail
✅ contact_phone       - Kontakt Telefon
✅ contact_name        - Kontaktperson
✅ is_featured         - Featured Listing
✅ submitted_at        - Zeitpunkt der Einreichung
✅ published_at        - Zeitpunkt der Veröffentlichung
✅ rejected_at         - Zeitpunkt der Ablehnung
✅ rejection_reason    - Grund für Ablehnung
```

### 2. **Neue Tabellen**

**`listing_drafts`** - Auto-Save Funktionalität
- Speichert Wizard-State (current_step)
- Alle Formular-Daten
- Auto-Save alle 30 Sekunden

**`user_favorites`** - Watchlist
- User kann Listings favorisieren
- Zähler wird automatisch aktualisiert

**`listing_views`** - Analytics
- Tracking von Aufrufen
- IP & User Agent
- Referrer tracking

### 3. **Row Level Security (RLS)**

```sql
✅ Public kann active listings sehen
✅ Users können eigene listings (alle Status) sehen
✅ Users können nur eigene drafts bearbeiten
✅ Users können nur drafts löschen
✅ Favorites nur für eigene User
✅ View tracking für alle
```

### 4. **Automatic Triggers**

```sql
✅ Auto-update: updated_at timestamps
✅ Auto-increment: views_count bei neuer View
✅ Auto-update: favorites_count bei Favorite add/remove
```

### 5. **Helper Views**

```sql
✅ user_listings_summary - Übersicht eigener Listings mit Stats
```

---

## 🚀 SETUP: In 3 Schritten

### SCHRITT 1: Schema deployen

```bash
# 1. Öffnen Sie Supabase Dashboard
https://app.supabase.com
→ Ihr Projekt
→ SQL Editor (linkes Menü)

# 2. Öffnen Sie das Schema-File
platform/database/listing_system_schema.sql

# 3. Kopieren Sie den GESAMTEN Inhalt

# 4. Fügen Sie ihn in den SQL Editor ein

# 5. Klicken Sie "Run" (oder Cmd/Ctrl+Enter)

# 6. Warten Sie auf Erfolgs-Meldung:
✅ LISTING SYSTEM SCHEMA CREATED SUCCESSFULLY
```

### SCHRITT 2: Verifizierung

Sie sollten folgende Ausgabe sehen:

```
✅ ============================================
✅ LISTING SYSTEM SCHEMA CREATED SUCCESSFULLY
✅ ============================================

Tables created:
  ✅ assets (extended with listing columns)
  ✅ listing_drafts (auto-save functionality)
  ✅ user_favorites (watchlist)
  ✅ listing_views (analytics)

Policies created:
  ✅ Public can view active listings
  ✅ Users can manage own listings
  ✅ Users can favorite listings
  ✅ View tracking enabled

Triggers created:
  ✅ Auto-update timestamps
  ✅ Auto-increment views_count
  ✅ Auto-update favorites_count

Ready for Phase 1.2: Metadata Schema Definition
```

### SCHRITT 3: Test-Query

Prüfen Sie die neue Schema-Struktur:

```sql
-- Alle Spalten der assets Tabelle anzeigen
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'assets'
ORDER BY ordinal_position;

-- Sollte zeigen:
-- created_by, status, views_count, favorites_count, 
-- images, contact_email, contact_phone, etc.
```

---

## 📊 STATUS WORKFLOW

### Listing Lifecycle:

```
1. draft              User erstellt & bearbeitet
   ↓
2. pending_review     User reicht ein (Submit)
   ↓
3. active             Admin genehmigt (Publish)
   OR
3. rejected           Admin lehnt ab (mit Grund)
   ↓
4. inactive           User deaktiviert temporär
```

### Status-Rechte:

| Status          | User kann sehen | User kann bearbeiten | User kann löschen | Public kann sehen |
|-----------------|-----------------|----------------------|-------------------|-------------------|
| draft           | ✅              | ✅                   | ✅                | ❌                |
| pending_review  | ✅              | ❌                   | ❌                | ❌                |
| active          | ✅              | ❌                   | ❌                | ✅                |
| inactive        | ✅              | ✅                   | ❌                | ❌                |
| rejected        | ✅              | ✅                   | ❌                | ❌                |

---

## 🎯 NÄCHSTE SCHRITTE

### ✅ **Fertig:**
- [x] Phase 1.1: Assets Table Extension

### 🚧 **Als Nächstes:**
- [ ] Phase 1.2: Metadata Schema Definition (TypeScript Types)
- [ ] Phase 1.3: RLS Policies Testing
- [ ] Phase 2: Multi-Step Wizard UI

---

## 🔍 TROUBLESHOOTING

### Problem: "Table already has column 'status'"

**Lösung**: Das ist OK! Das Script verwendet `ADD COLUMN IF NOT EXISTS`, sodass es sicher mehrfach ausgeführt werden kann.

### Problem: "Policy already exists"

**Lösung**: Das Script verwendet `DROP POLICY IF EXISTS` vor dem Erstellen, sodass es sicher ist.

### Problem: Assets Tabelle existiert nicht

**Lösung**: Sie müssen zuerst das basic assets schema deployen:

```sql
-- Basic assets table (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID,
  price DECIMAL(15, 2),
  currency VARCHAR(3) DEFAULT 'EUR',
  location VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📚 DOKUMENTATION

### TypeScript Types (für Frontend):

```typescript
// Asset Status
type AssetStatus = 
  | 'draft' 
  | 'pending_review' 
  | 'active' 
  | 'inactive' 
  | 'rejected';

// Listing Draft
interface ListingDraft {
  id: string;
  user_id: string;
  asset_id?: string;
  current_step: 1 | 2 | 3 | 4;
  category_id?: string;
  title?: string;
  description?: string;
  price?: number;
  currency: string;
  location?: string;
  metadata: Record<string, any>;
  images?: string[];
  contact_email?: string;
  contact_phone?: string;
  contact_name?: string;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
  last_saved_at: string;
}

// User Favorite
interface UserFavorite {
  id: string;
  user_id: string;
  asset_id: string;
  created_at: string;
}

// Listing View
interface ListingView {
  id: string;
  asset_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  created_at: string;
}
```

---

## ✅ CHECKLISTE

Setup-Checkliste für Production:

- [ ] Schema in Supabase deployed
- [ ] Tabellen erstellt verifiziert
- [ ] RLS Policies aktiviert
- [ ] Triggers funktionieren
- [ ] Test-Listing erstellt (Draft)
- [ ] Test-Favorite hinzugefügt
- [ ] View-Tracking getestet
- [ ] Supabase Storage Bucket für Bilder erstellt (Phase 6)

---

## 🎉 SUCCESS!

**Phase 1.1 ist abgeschlossen!**

Sie haben jetzt:
✅ Ein professionelles, skalierbares Listing-System
✅ Auto-Save Funktionalität vorbereitet
✅ Analytics & Tracking bereit
✅ Sichere RLS Policies
✅ Production-Ready Schema

**Bereit für Phase 1.2: Metadata Schema Definition!** 🚀

