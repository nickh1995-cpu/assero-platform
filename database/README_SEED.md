# 🌱 Sample Assets für Valuation System

## 📋 Übersicht

Dieses SQL-Script fügt **Sample-Assets** in die Supabase-Datenbank ein, um das Comparables-Feature zu testen.

## 📊 Was wird eingefügt:

### **🏠 Immobilien (6 Assets)**
- 3-Zimmer Wohnung München Altstadt - €520.000
- 4-Zimmer Maisonette München Zentrum - €580.000
- 3.5-Zimmer Wohnung Schwabing - €495.000
- 3-Zimmer Penthouse Lehel - €615.000
- 2.5-Zimmer Wohnung Haidhausen - €445.000
- Luxus-Villa Starnberger See - €3.500.000

### **⌚ Luxusuhren (6 Assets)**
- Rolex Submariner Date 41mm - €12.500
- Omega Seamaster Diver 300M - €4.800
- Rolex Datejust 41 - €10.200
- IWC Portugieser Chronograph - €8.900
- Rolex Explorer II 42mm - €11.800
- Patek Philippe Calatrava - €28.500

### **🚗 Fahrzeuge (6 Assets)**
- Porsche 911 Carrera S - €95.000
- BMW M4 Competition - €78.000
- Porsche Cayenne Turbo - €92.000
- Mercedes-AMG GT 63 S - €105.000
- Audi RS6 Avant - €89.000
- Lamborghini Huracán EVO - €235.000

---

## 🚀 Installation

### **Option 1: Supabase SQL Editor (Empfohlen)**

1. Gehe zu [Supabase Dashboard](https://supabase.com/dashboard)
2. Wähle dein Projekt
3. Klick auf **SQL Editor** (linke Sidebar)
4. Erstelle **New Query**
5. Kopiere den Inhalt von `seed_sample_assets.sql`
6. Klick auf **Run** (oder Cmd/Ctrl + Enter)

### **Option 2: Lokales psql**

```bash
# Mit Supabase Connection String
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f seed_sample_assets.sql
```

---

## ✅ Verifizierung

Nach dem Ausführen solltest du folgende Ausgabe sehen:

```
 category    | asset_count | min_price | max_price  | avg_price
-------------+-------------+-----------+------------+------------
 Immobilien  |           6 |    445000 |    3500000 |  859166.67
 Luxusuhren  |           6 |      4800 |      28500 |    12783.33
 Fahrzeuge   |           6 |     78000 |     235000 |   115666.67
```

---

## 🧪 Testen

1. Gehe zu `/valuation` auf deiner Website
2. Wähle einen Asset-Typ (z.B. Immobilien)
3. Fülle das Formular aus
4. Gehe zu Step 4 (Bewertung)
5. **Du solltest jetzt echte Comparables sehen!**

Öffne die **Browser DevTools** → **Network Tab** → Check Response von `/api/comparables/`:
```json
{
  "success": true,
  "data": {
    "source": "database",  // ✅ Echte Daten!
    "count": 5
  }
}
```

---

## 🗑️ Daten löschen (falls nötig)

```sql
-- Nur die Sample-Assets löschen (nicht alle!)
DELETE FROM public.assets 
WHERE title LIKE '%München%' 
   OR title LIKE '%Rolex%' 
   OR title LIKE '%Porsche%';
```

---

## 📝 Hinweise

- Alle Assets haben `status = 'active'`
- Featured Assets sind hervorgehoben
- Metadata enthält detaillierte Specs
- Preise sind realistisch für 2024
- IDs werden automatisch generiert (UUID)

---

**Viel Erfolg! 🚀**

