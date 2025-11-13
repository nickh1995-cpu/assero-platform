# 📖 METADATA SCHEMA - Developer Guide

## Phase 1.2: Complete Metadata Type System

**Erstellt**: TypeScript Type Definitions für alle 3 Kategorien  
**Dateien**: 
- `platform/src/types/listing-metadata.ts` (500+ Zeilen)
- `platform/src/types/listing.ts` (300+ Zeilen)

---

## 🎯 ÜBERSICHT

### Was ist Metadata?

Metadata ist die kategorie-spezifische Datenstruktur, die im JSONB `metadata`-Feld der `assets` Tabelle gespeichert wird. Jede Asset-Kategorie hat ihre eigene Metadata-Struktur.

### 3 Kategorie-Spezifische Schemas:

1. **Real Estate** - 25+ Felder (Immobilien)
2. **Fahrzeuge** - 22+ Felder (Autos)
3. **Luxusuhren** - 20+ Felder (Uhren)

---

## 🏠 REAL ESTATE METADATA

### Vollständige Struktur:

```typescript
interface RealEstateMetadata {
  // Basisdaten
  property_type: 'wohnung' | 'haus' | 'gewerbe' | 'grundstueck' | ...
  area_sqm: number              // Wohnfläche
  land_area_sqm?: number        // Grundstücksfläche
  rooms: number                 // Gesamtzahl Zimmer
  bedrooms?: number             // Schlafzimmer
  bathrooms?: number            // Badezimmer
  
  // Zustand & Baujahr
  condition: 'new' | 'renovated' | 'good' | 'needs_renovation'
  year_built: number
  year_renovated?: number
  energy_rating?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  
  // Lage & Etage
  floor?: number                // -1 = Keller, 0 = EG
  total_floors?: number
  parking_spots?: number
  
  // Ausstattung
  features: string[]            // Array von Features
  heating?: HeatingType
  has_elevator?: boolean
  has_balcony?: boolean
  has_terrace?: boolean
  // ... + 10 weitere boolean flags
  
  // Finanzen (Investment)
  rental_income_monthly?: number
  operating_costs_monthly?: number
  yield_pct?: number           // Auto-calculated
}
```

### Features-Katalog:

**30+ vordefinierte Features** in 3 Kategorien:

```typescript
// Basic
- Balkon, Terrasse, Garten, Garage, Stellplatz, Keller, Aufzug, Barrierefreier Zugang

// Comfort
- Einbauküche, Fußbodenheizung, Klimaanlage, Smart Home, Alarmanlage, 
  Video-Gegensprechanlage, Rollläden, Doppelverglasung

// Premium
- Sauna, Pool, Kamin, Concierge, Fitnessraum, Wellnessbereich, 
  Dachterrasse, Gäste-WC
```

### Beispiel:

```json
{
  "property_type": "wohnung",
  "area_sqm": 95,
  "rooms": 3,
  "bedrooms": 2,
  "bathrooms": 1,
  "condition": "renovated",
  "year_built": 1985,
  "year_renovated": 2020,
  "energy_rating": "B",
  "floor": 3,
  "total_floors": 5,
  "parking_spots": 1,
  "features": ["Balkon", "Einbauküche", "Fußbodenheizung", "Smart Home"],
  "heating": "district_heating",
  "has_elevator": true,
  "has_balcony": true,
  "furnished": false
}
```

---

## 🚗 FAHRZEUGE METADATA

### Vollständige Struktur:

```typescript
interface VehicleMetadata {
  // Basisdaten
  brand: string                 // "Porsche"
  model: string                 // "911 Carrera S"
  year: number                  // 2021
  mileage: number               // 25000 km
  
  // Technische Daten
  fuel: 'benzin' | 'diesel' | 'elektro' | 'hybrid' | ...
  transmission: 'automatik' | 'manuell' | 'halbautomatik'
  power: string                 // "450 PS"
  engine_size?: string          // "3.0 L"
  cylinders?: number
  drive_type?: string           // "Allrad"
  
  // Farben
  color_exterior: string        // "Racing Gelb"
  color_interior?: string       // "Schwarz"
  interior_material?: string    // "Leder"
  
  // Ausstattung
  doors?: number
  seats?: number
  features: string[]
  
  // Zustand & Historie
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'needs_work'
  accident_free: boolean
  service_history: boolean
  owners_count?: number
  
  // Zulassung & TÜV
  registration_date?: string    // "2021-06-15"
  last_inspection?: string
  tuv_until?: string
  emission_class?: string       // "Euro 6"
  
  // Verbrauch
  fuel_consumption_combined?: number  // L/100km
  co2_emissions?: number              // g/km
  electric_range?: number             // km (für Elektro/Hybrid)
}
```

### Features-Katalog:

**40+ vordefinierte Features** in 4 Kategorien:

```typescript
// Comfort (9)
- Klimaanlage, Klimaautomatik, Sitzheizung, Ledersitze, 
  Elektrische Sitze, Panoramadach, Schiebedach, Tempomat, Parkassistent

// Technology (9)
- Navigationssystem, Rückfahrkamera, 360°-Kamera, Head-Up Display,
  Spurhalteassistent, Totwinkel-Assistent, Abstandstempomat, 
  Adaptives Fahrwerk, Keyless Entry

// Entertainment (7)
- Premium Sound System, Apple CarPlay, Android Auto, DAB+ Radio,
  Bluetooth, USB-Anschlüsse, Wireless Charging

// Safety (6)
- ABS, ESP, Airbags (Front + Seite), Notbremsassistent,
  Nachtsichtassistent, Reifendruckkontrolle
```

### Beispiel:

```json
{
  "brand": "Porsche",
  "model": "911 Carrera S",
  "year": 2021,
  "mileage": 25000,
  "fuel": "benzin",
  "transmission": "automatik",
  "power": "450 PS",
  "engine_size": "3.0 L",
  "cylinders": 6,
  "drive_type": "Heckantrieb",
  "color_exterior": "Racing Gelb",
  "color_interior": "Schwarz",
  "interior_material": "Leder",
  "doors": 2,
  "seats": 4,
  "features": ["Sportabgas", "PASM", "18-Wege-Sportsitze", "Bose Sound"],
  "condition": "excellent",
  "accident_free": true,
  "service_history": true,
  "owners_count": 1,
  "registration_date": "2021-06-15",
  "emission_class": "Euro 6",
  "fuel_consumption_combined": 9.2
}
```

---

## ⌚ LUXUSUHREN METADATA

### Vollständige Struktur:

```typescript
interface WatchMetadata {
  // Basisdaten
  brand: string                 // "Rolex"
  model: string                 // "Submariner Date"
  reference: string             // "126610LN"
  year: number                  // 2022
  
  // Zustand & Dokumentation
  condition: 'unworn' | 'excellent' | 'good' | 'fair'
  fullSet: boolean              // Box + Papers
  box: boolean
  papers: boolean
  warranty_card?: boolean
  original_receipt?: boolean
  
  // Technische Details
  movement: 'automatik' | 'quarz' | 'handaufzug' | 'spring_drive'
  caliber?: string              // "3235"
  case_material: CaseMaterial   // 'stainless_steel', 'yellow_gold', etc.
  case_diameter: string         // "40mm"
  case_thickness?: string       // "12mm"
  bracelet_material?: BraceletMaterial
  crystal?: string              // "Saphir"
  
  // Wasserdichtigkeit & Features
  water_resistance?: string     // "100m" oder "10 ATM"
  power_reserve?: string        // "70 Stunden"
  complications: string[]       // Array von Komplikationen
  
  // Service & Garantie
  service_history?: boolean
  last_service?: string         // "2023-01-15"
  warranty_remaining?: string   // "12 Monate"
  
  // Limitierung
  limited_edition?: boolean
  edition_number?: string       // "042/100"
  
  // Sonstiges
  serial_number?: string
  dial_color?: string           // "Schwarz"
}
```

### Komplikationen-Katalog:

**15 vordefinierte Komplikationen**:

```typescript
// Basic
- Datum, Tag, Tag-Datum, Kleine Sekunde

// Advanced
- Chronograph, GMT / Zweite Zeitzone, Weltzeit, Jahreskalender,
  Ewiger Kalender, Mondphase, Gangreserveanzeige

// High Complications
- Tourbillon, Minutenrepetition, Große Datumsanzeige, Rattrapante, Alarm
```

### Beispiel:

```json
{
  "brand": "Rolex",
  "model": "Submariner Date",
  "reference": "126610LN",
  "year": 2022,
  "condition": "excellent",
  "fullSet": true,
  "box": true,
  "papers": true,
  "warranty_card": true,
  "movement": "automatik",
  "caliber": "3235",
  "case_material": "stainless_steel",
  "case_diameter": "41mm",
  "case_thickness": "11.5mm",
  "bracelet_material": "stainless_steel",
  "crystal": "Saphir",
  "water_resistance": "300m",
  "power_reserve": "70 Stunden",
  "complications": ["Datum"],
  "service_history": true,
  "warranty_remaining": "24 Monate",
  "dial_color": "Schwarz"
}
```

---

## 🛠️ HELPER FUNCTIONS

### 1. Type Guards

```typescript
// Check metadata type
if (isRealEstateMetadata(metadata)) {
  // TypeScript knows this is RealEstateMetadata
  console.log(metadata.property_type);
}

if (isVehicleMetadata(metadata)) {
  // TypeScript knows this is VehicleMetadata
  console.log(metadata.brand, metadata.model);
}

if (isWatchMetadata(metadata)) {
  // TypeScript knows this is WatchMetadata
  console.log(metadata.brand, metadata.reference);
}
```

### 2. Get Empty Metadata

```typescript
// Get empty metadata for new listing
const emptyMetadata = getEmptyMetadata('real-estate');
// Returns RealEstateMetadata with default values

const vehicleMetadata = getEmptyMetadata('fahrzeuge');
// Returns VehicleMetadata with default values

const watchMetadata = getEmptyMetadata('luxusuhren');
// Returns WatchMetadata with default values
```

### 3. Validate Metadata

```typescript
// Validate before submission
const validation = validateMetadata(categorySlug, metadata);

if (validation.valid) {
  // Ready to submit
  submitListing(listing);
} else {
  // Show errors
  console.log(validation.errors);
  // ["Wohnfläche muss größer als 0 sein", "Baujahr ist erforderlich"]
}
```

---

## 📊 USAGE EXAMPLES

### Creating a Listing

```typescript
import { getEmptyMetadata, RealEstateMetadata } from '@/types/listing-metadata';
import { ListingFormState } from '@/types/listing';

// Initialize form with empty metadata
const [formState, setFormState] = useState<ListingFormState>({
  currentStep: WizardStep.CATEGORY,
  category: null,
  title: '',
  description: '',
  price: null,
  currency: 'EUR',
  location: '',
  metadata: getEmptyMetadata('real-estate'),
  images: [],
  coverImageIndex: 0,
  contactEmail: user.email,
  contactPhone: '',
  contactName: '',
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  validationErrors: {},
});

// Update metadata
const updateMetadata = (key: keyof RealEstateMetadata, value: any) => {
  setFormState(prev => ({
    ...prev,
    metadata: {
      ...prev.metadata,
      [key]: value,
    },
    isDirty: true,
  }));
};
```

### Rendering Form Fields

```typescript
// Type-safe access to metadata
const metadata = formState.metadata as RealEstateMetadata;

<input
  type="number"
  value={metadata.area_sqm}
  onChange={(e) => updateMetadata('area_sqm', parseFloat(e.target.value))}
  placeholder="Wohnfläche in m²"
  required
/>

<select
  value={metadata.property_type}
  onChange={(e) => updateMetadata('property_type', e.target.value)}
  required
>
  <option value="wohnung">Wohnung</option>
  <option value="haus">Haus</option>
  <option value="gewerbe">Gewerbe</option>
  <option value="grundstueck">Grundstück</option>
</select>
```

### Saving to Database

```typescript
import { supabase } from '@/lib/supabase/client';

async function saveListing(formState: ListingFormState) {
  const { data, error } = await supabase
    .from('assets')
    .insert({
      title: formState.title,
      description: formState.description,
      category_id: formState.category?.id,
      price: formState.price,
      currency: formState.currency,
      location: formState.location,
      metadata: formState.metadata,  // ← JSONB
      images: formState.images,
      contact_email: formState.contactEmail,
      contact_phone: formState.contactPhone,
      contact_name: formState.contactName,
      created_by: user.id,
      status: 'draft',
    })
    .select()
    .single();
  
  return { data, error };
}
```

---

## ✅ VALIDATION RULES

### Real Estate

- `property_type` - Required
- `area_sqm` - Required, > 0
- `rooms` - Required, >= 1
- `year_built` - Required, 1800 ≤ year ≤ (current + 2)

### Fahrzeuge

- `brand` - Required
- `model` - Required
- `year` - Required
- `mileage` - Required, >= 0
- `power` - Required
- `color_exterior` - Required

### Luxusuhren

- `brand` - Required
- `model` - Required
- `reference` - Required
- `year` - Required
- `case_diameter` - Required

---

## 🎯 NEXT STEPS

### ✅ Fertig:
- [x] Phase 1.1: Database Schema
- [x] Phase 1.2: Metadata TypeScript Types

### 🚧 Als Nächstes:
- [ ] Phase 2: Multi-Step Wizard UI
- [ ] Phase 3: Real Estate Form Component
- [ ] Phase 4: Fahrzeuge Form Component
- [ ] Phase 5: Luxusuhren Form Component

---

## 📚 WEITERE RESSOURCEN

- **Roadmap**: `platform/LISTING_CREATION_ROADMAP.md`
- **Setup Guide**: `platform/LISTING_SYSTEM_SETUP.md`
- **SQL Schema**: `platform/database/listing_system_schema.sql`
- **Type Definitions**: 
  - `platform/src/types/listing-metadata.ts`
  - `platform/src/types/listing.ts`

---

**Status**: ✅ Phase 1.2 ABGESCHLOSSEN!  
**Bereit für**: Phase 2 - Multi-Step Wizard UI 🚀

