# Saved Valuations Schema Setup

Dieses Dokument beschreibt, wie Sie das Schema für gespeicherte Bewertungen in Ihrer Supabase-Datenbank einrichten.

## 📋 Übersicht

Das Schema ermöglicht:
- ✅ Speichern von Bewertungen für angemeldete Benutzer
- ✅ Portfolio-Tracking über mehrere Assets hinweg
- ✅ Verlaufs-Tracking (Wertverlauf über Zeit)
- ✅ Preisalarme für gespeicherte Assets
- ✅ Row Level Security (RLS) für Datensicherheit

## 🚀 Installation

### Schritt 1: SQL-Script ausführen

1. **Öffnen Sie Ihr Supabase-Dashboard**: https://supabase.com/dashboard
2. **Navigieren Sie zu Ihrem Projekt**
3. **Öffnen Sie den SQL Editor**: `SQL Editor` im Seitenmenü
4. **Kopieren Sie den Inhalt** von `saved_valuations_schema.sql`
5. **Fügen Sie ihn ein** und klicken Sie auf `Run`

### Schritt 2: Überprüfung

Nach dem Ausführen sollten folgende Tabellen existieren:

1. **`saved_valuations`**
   - Haupt-Tabelle für gespeicherte Bewertungen
   - Felder: `id`, `user_id`, `asset_type`, `form_data`, `estimated_value`, etc.

2. **`valuation_history`**
   - Tracking des Wertverlaufs über Zeit
   - Felder: `id`, `saved_valuation_id`, `estimated_value`, `recorded_at`, etc.

### Schritt 3: RLS Policies überprüfen

Das Script erstellt automatisch Row Level Security (RLS) Policies:

```sql
-- Überprüfen Sie, ob RLS aktiviert ist
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('saved_valuations', 'valuation_history');
```

Beide Tabellen sollten `rowsecurity = true` haben.

## 📊 Verwendung

### Bewertung speichern (über API)

```typescript
const response = await fetch('/api/valuations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    asset_type: 'real-estate',
    form_data: { /* ... */ },
    estimated_value: 500000,
    value_min: 450000,
    value_max: 550000,
    title: 'Meine Wohnung',
    notes: 'Erstbewertung',
    tags: ['investment'],
    price_alert_enabled: true
  })
});
```

### Portfolio-Übersicht abrufen

```typescript
const response = await fetch('/api/valuations/portfolio');
const { summary, recent } = await response.json();

console.log(summary.total_value); // Gesamtwert aller Assets
console.log(summary.total_assets); // Anzahl Assets
```

### Bewertungen auflisten

```typescript
const response = await fetch('/api/valuations');
const { valuations } = await response.json();
```

### Einzelne Bewertung abrufen

```typescript
const response = await fetch(`/api/valuations/${id}`);
const { valuation } = await response.json();
```

### Bewertung aktualisieren

```typescript
const response = await fetch(`/api/valuations/${id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Neuer Titel',
    notes: 'Aktualisierte Notizen',
    price_alert_enabled: false
  })
});
```

### Bewertung löschen

```typescript
const response = await fetch(`/api/valuations/${id}`, {
  method: 'DELETE'
});
```

## 🔒 Sicherheit

### Row Level Security (RLS)

Alle Tabellen sind mit RLS geschützt:

- ✅ Benutzer können **nur ihre eigenen** Bewertungen sehen
- ✅ Benutzer können **nur ihre eigenen** Bewertungen erstellen
- ✅ Benutzer können **nur ihre eigenen** Bewertungen ändern
- ✅ Benutzer können **nur ihre eigenen** Bewertungen löschen

### Authentifizierung

Alle API-Routes erfordern einen authentifizierten Benutzer:

```typescript
const { data: { user }, error } = await supabase.auth.getUser();

if (error || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## 📈 Features

### 1. Automatische History-Erstellung

Wenn eine Bewertung gespeichert wird, wird automatisch ein History-Eintrag erstellt:

```sql
CREATE TRIGGER trigger_create_valuation_history
  AFTER INSERT ON public.saved_valuations
  FOR EACH ROW
  EXECUTE FUNCTION create_valuation_history_entry();
```

### 2. Portfolio-Summary Funktion

Ruft eine Zusammenfassung aller Assets eines Benutzers ab:

```sql
SELECT * FROM get_portfolio_summary('user-uuid-here');
```

Gibt zurück:
- `total_assets`: Anzahl aller Assets
- `total_value`: Gesamtwert
- `avg_value`: Durchschnittswert
- `real_estate_count`, `real_estate_value`
- `watches_count`, `watches_value`
- `vehicles_count`, `vehicles_value`

### 3. Preisalarme

Bewertungen können mit Preisalarmen versehen werden:

```sql
UPDATE saved_valuations
SET price_alert_enabled = true,
    price_alert_threshold = 5.0  -- Alert bei ±5% Wertänderung
WHERE id = 'valuation-uuid';
```

### 4. Tags & Kategorisierung

Organisieren Sie Ihre Bewertungen mit Tags:

```sql
UPDATE saved_valuations
SET tags = ARRAY['investment', 'verkauf geplant', 'vermietung']
WHERE id = 'valuation-uuid';
```

## 🛠 Troubleshooting

### Problem: "permission denied for table saved_valuations"

**Lösung**: Überprüfen Sie, ob RLS aktiviert ist und die Policies korrekt erstellt wurden:

```sql
-- RLS Status prüfen
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'saved_valuations';

-- Policies prüfen
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'saved_valuations';
```

### Problem: "function get_portfolio_summary does not exist"

**Lösung**: Führen Sie das Schema-Script erneut aus, um die Funktion zu erstellen.

### Problem: Keine Daten sichtbar

**Lösung**: Stellen Sie sicher, dass:
1. Der Benutzer angemeldet ist
2. RLS Policies korrekt sind
3. Die `user_id` mit der authentifizierten User-ID übereinstimmt

## 📚 Weitere Informationen

- **API Routes**: `platform/src/app/api/valuations/`
- **Dashboard**: `platform/src/app/(dashboard)/valuations/page.tsx`
- **Integration**: `platform/src/app/valuation/page.tsx` (Save Button in Step 4)

---

**Status**: ✅ Ready for Production

**Version**: 1.0 (Phase 3.2)

**Last Updated**: Oktober 2025

