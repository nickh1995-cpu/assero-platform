/**
 * ASSERO LISTING SYSTEM - Metadata Type Definitions
 * Phase 1.2: Category-Specific Metadata Schemas
 * 
 * Diese Types definieren die Metadata-Struktur für jede Asset-Kategorie.
 * Sie werden im JSONB metadata-Feld der assets Tabelle gespeichert.
 */

// ===============================================
// BASE TYPES
// ===============================================

export type AssetStatus = 
  | 'draft'           // User bearbeitet
  | 'pending_review'  // Eingereicht, wartet auf Admin
  | 'active'          // Veröffentlicht und sichtbar
  | 'inactive'        // Temporär deaktiviert
  | 'rejected';       // Abgelehnt

export type Currency = 'EUR' | 'USD' | 'GBP';

// ===============================================
// REAL ESTATE METADATA
// ===============================================

export type PropertyType = 
  | 'wohnung'       // Apartment
  | 'haus'          // House
  | 'gewerbe'       // Commercial
  | 'grundstueck'   // Land
  | 'villa'         // Villa
  | 'penthouse'     // Penthouse
  | 'maisonette'    // Maisonette
  | 'loft';         // Loft

export type PropertyCondition = 
  | 'new'                 // Neubau
  | 'renovated'           // Renoviert
  | 'good'                // Guter Zustand
  | 'needs_renovation';   // Sanierungsbedürftig

export type EnergyRating = 
  | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export type HeatingType =
  | 'gas'                  // Gasheizung
  | 'oil'                  // Ölheizung
  | 'electric'             // Elektroheizung
  | 'district_heating'     // Fernwärme
  | 'heat_pump'            // Wärmepumpe
  | 'underfloor'           // Fußbodenheizung
  | 'solar';               // Solar

export interface RealEstateMetadata {
  // === Basisdaten ===
  property_type: PropertyType;
  area_sqm: number;                    // Wohnfläche in m²
  land_area_sqm?: number;              // Grundstücksfläche
  rooms: number;                       // Gesamtzahl Zimmer (inkl. Küche)
  bedrooms?: number;                   // Anzahl Schlafzimmer
  bathrooms?: number;                  // Anzahl Badezimmer
  
  // === Zustand & Baujahr ===
  condition: PropertyCondition;
  year_built: number;
  year_renovated?: number;
  energy_rating?: EnergyRating;
  
  // === Lage & Etage ===
  floor?: number;                      // Etage (0 = EG, -1 = Keller)
  total_floors?: number;               // Gesamtanzahl Etagen im Gebäude
  parking_spots?: number;              // Anzahl Stellplätze
  
  // === Ausstattung ===
  features: string[];                  // Array von Features
  heating?: HeatingType;
  has_elevator?: boolean;
  has_balcony?: boolean;
  has_terrace?: boolean;
  has_garden?: boolean;
  has_garage?: boolean;
  has_basement?: boolean;
  has_fitted_kitchen?: boolean;
  
  // === Finanzen (für Investment-Immobilien) ===
  rental_income_monthly?: number;      // Mieteinnahmen/Monat
  operating_costs_monthly?: number;    // Nebenkosten/Monat
  yield_pct?: number;                  // Rendite in %
  
  // === Sonstiges ===
  furnished?: boolean;                 // Möbliert
  pets_allowed?: boolean;              // Haustiere erlaubt
  commission?: number;                 // Provision in %
}

// Standard-Features für Real Estate (für Checkboxes im UI)
export const REAL_ESTATE_FEATURES = {
  basic: [
    'Balkon',
    'Terrasse',
    'Garten',
    'Garage',
    'Stellplatz',
    'Keller',
    'Aufzug',
    'Barrierefreier Zugang',
  ],
  comfort: [
    'Einbauküche',
    'Fußbodenheizung',
    'Klimaanlage',
    'Smart Home',
    'Alarmanlage',
    'Video-Gegensprechanlage',
    'Rollläden',
    'Doppelverglasung',
  ],
  premium: [
    'Sauna',
    'Pool',
    'Kamin',
    'Concierge',
    'Fitnessraum',
    'Wellnessbereich',
    'Dachterrasse',
    'Gäste-WC',
  ],
} as const;

// ===============================================
// FAHRZEUGE METADATA
// ===============================================

export type FuelType = 
  | 'benzin'      // Benzin/Gasoline
  | 'diesel'      // Diesel
  | 'elektro'     // Electric
  | 'hybrid'      // Hybrid
  | 'plugin'      // Plugin-Hybrid
  | 'gas';        // Gas (LPG/CNG)

export type TransmissionType = 
  | 'automatik'   // Automatic
  | 'manuell'     // Manual
  | 'halbautomatik'; // Semi-automatic

export type VehicleCondition = 
  | 'new'         // Neuwagen
  | 'excellent'   // Neuwertig
  | 'good'        // Sehr gut
  | 'fair'        // Gut
  | 'needs_work'; // Durchschnittlich/Reparaturbedürftig

export interface VehicleMetadata {
  // === Basisdaten ===
  brand: string;                       // Marke (z.B. "Porsche")
  model: string;                       // Modell (z.B. "911 Carrera S")
  year: number;                        // Baujahr
  mileage: number;                     // Kilometerstand
  
  // === Technische Daten ===
  fuel: FuelType;
  transmission: TransmissionType;
  power: string;                       // Leistung (z.B. "450 PS")
  engine_size?: string;                // Hubraum (z.B. "3.0 L")
  cylinders?: number;                  // Anzahl Zylinder
  drive_type?: string;                 // Antrieb (Allrad, Heckantrieb, etc.)
  
  // === Farben ===
  color_exterior: string;              // Außenfarbe
  color_interior?: string;             // Innenfarbe
  interior_material?: string;          // Innenausstattung (Leder, Stoff, etc.)
  
  // === Ausstattung ===
  doors?: number;                      // Anzahl Türen
  seats?: number;                      // Anzahl Sitze
  features: string[];                  // Array von Features
  
  // === Zustand & Historie ===
  condition: VehicleCondition;
  accident_free: boolean;              // Unfallfrei
  service_history: boolean;            // Scheckheftgepflegt
  owners_count?: number;               // Anzahl Vorbesitzer
  
  // === Zulassung & TÜV ===
  registration_date?: string;          // Erstzulassung (ISO date)
  last_inspection?: string;            // Letzte HU/AU (ISO date)
  tuv_until?: string;                  // TÜV bis (ISO date)
  emission_class?: string;             // Schadstoffklasse (Euro 6, etc.)
  
  // === Verbrauch ===
  fuel_consumption_combined?: number;  // L/100km oder kWh/100km
  co2_emissions?: number;              // CO2-Ausstoß g/km
  electric_range?: number;             // Elektrische Reichweite (km)
}

// Standard-Features für Fahrzeuge
export const VEHICLE_FEATURES = {
  comfort: [
    'Klimaanlage',
    'Klimaautomatik',
    'Sitzheizung',
    'Ledersitze',
    'Elektrische Sitze',
    'Panoramadach',
    'Schiebedach',
    'Tempomat',
    'Parkassistent',
  ],
  technology: [
    'Navigationssystem',
    'Rückfahrkamera',
    '360°-Kamera',
    'Head-Up Display',
    'Spurhalteassistent',
    'Totwinkel-Assistent',
    'Abstandstempomat',
    'Adaptives Fahrwerk',
    'Keyless Entry',
  ],
  entertainment: [
    'Premium Sound System',
    'Apple CarPlay',
    'Android Auto',
    'DAB+ Radio',
    'Bluetooth',
    'USB-Anschlüsse',
    'Wireless Charging',
  ],
  safety: [
    'ABS',
    'ESP',
    'Airbags (Front + Seite)',
    'Notbremsassistent',
    'Nachtsichtassistent',
    'Reifendruckkontrolle',
  ],
} as const;

// ===============================================
// LUXUSUHREN METADATA
// ===============================================

export type WatchCondition = 
  | 'unworn'      // Unworn/Neu
  | 'excellent'   // Neuwertig
  | 'good'        // Sehr gut
  | 'fair';       // Gut

export type MovementType = 
  | 'automatik'   // Automatic
  | 'quarz'       // Quartz
  | 'handaufzug'  // Manual winding
  | 'spring_drive'; // Spring Drive (Seiko)

export type CaseMaterial = 
  | 'stainless_steel'  // Edelstahl
  | 'yellow_gold'      // Gelbgold
  | 'white_gold'       // Weißgold
  | 'rose_gold'        // Roségold
  | 'platinum'         // Platin
  | 'titanium'         // Titan
  | 'ceramic'          // Keramik
  | 'carbon';          // Carbon

export type BraceletMaterial = 
  | 'stainless_steel'  // Edelstahl
  | 'leather'          // Leder
  | 'rubber'           // Kautschuk
  | 'fabric'           // Textil
  | 'yellow_gold'      // Gelbgold
  | 'white_gold'       // Weißgold
  | 'rose_gold'        // Roségold
  | 'platinum';        // Platin

export interface WatchMetadata {
  // === Basisdaten ===
  brand: string;                       // Marke (z.B. "Rolex")
  model: string;                       // Modell (z.B. "Submariner Date")
  reference: string;                   // Referenznummer (z.B. "126610LN")
  year: number;                        // Baujahr
  
  // === Zustand & Dokumentation ===
  condition: WatchCondition;
  fullSet: boolean;                    // Box + Papiere
  box: boolean;                        // Box vorhanden
  papers: boolean;                     // Papiere vorhanden
  warranty_card?: boolean;             // Garantiekarte vorhanden
  original_receipt?: boolean;          // Originalrechnung vorhanden
  
  // === Technische Details ===
  movement: MovementType;
  caliber?: string;                    // Kaliber (z.B. "3235")
  case_material: CaseMaterial;
  case_diameter: string;               // Durchmesser (z.B. "40mm")
  case_thickness?: string;             // Höhe (z.B. "12mm")
  bracelet_material?: BraceletMaterial;
  crystal?: string;                    // Glas (Saphir, Mineral, etc.)
  
  // === Wasserdichtigkeit & Features ===
  water_resistance?: string;           // z.B. "100m" oder "10 ATM"
  power_reserve?: string;              // Gangreserve (z.B. "70 Stunden")
  complications: string[];             // Array von Komplikationen
  
  // === Service & Garantie ===
  service_history?: boolean;           // Service-Historie vorhanden
  last_service?: string;               // Letzter Service (ISO date)
  warranty_remaining?: string;         // Restgarantie (z.B. "12 Monate")
  
  // === Limitierung ===
  limited_edition?: boolean;           // Limitierte Auflage
  edition_number?: string;             // Edition Nummer (z.B. "042/100")
  
  // === Sonstiges ===
  serial_number?: string;              // Seriennummer (optional)
  dial_color?: string;                 // Zifferblattfarbe
}

// Standard-Komplikationen für Uhren
export const WATCH_COMPLICATIONS = [
  // Basic
  'Datum',
  'Tag',
  'Tag-Datum',
  'Kleine Sekunde',
  
  // Advanced
  'Chronograph',
  'GMT / Zweite Zeitzone',
  'Weltzeit',
  'Jahreskalender',
  'Ewiger Kalender',
  'Mondphase',
  'Gangreserveanzeige',
  
  // High Complications
  'Tourbillon',
  'Minutenrepetition',
  'Große Datums­anzeige',
  'Rattrapante',
  'Alarm',
] as const;

// ===============================================
// UNION TYPE FOR ALL METADATA
// ===============================================

export type AssetMetadata = 
  | RealEstateMetadata 
  | VehicleMetadata 
  | WatchMetadata;

// ===============================================
// HELPER FUNCTIONS
// ===============================================

/**
 * Type Guard: Check if metadata is Real Estate
 */
export function isRealEstateMetadata(
  metadata: AssetMetadata
): metadata is RealEstateMetadata {
  return 'property_type' in metadata;
}

/**
 * Type Guard: Check if metadata is Vehicle
 */
export function isVehicleMetadata(
  metadata: AssetMetadata
): metadata is VehicleMetadata {
  return 'fuel' in metadata && 'transmission' in metadata;
}

/**
 * Type Guard: Check if metadata is Watch
 */
export function isWatchMetadata(
  metadata: AssetMetadata
): metadata is WatchMetadata {
  return 'movement' in metadata && 'case_material' in metadata;
}

/**
 * Get empty metadata object for category
 */
export function getEmptyMetadata(categorySlug: string): AssetMetadata {
  switch (categorySlug) {
    case 'real-estate':
      return {
        property_type: 'wohnung',
        area_sqm: 0,
        rooms: 0,
        condition: 'good',
        year_built: new Date().getFullYear(),
        features: [],
      } as RealEstateMetadata;
      
    case 'fahrzeuge':
      return {
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        mileage: 0,
        fuel: 'benzin',
        transmission: 'automatik',
        power: '',
        color_exterior: '',
        condition: 'good',
        accident_free: true,
        service_history: false,
        features: [],
      } as VehicleMetadata;
      
    case 'luxusuhren':
      return {
        brand: '',
        model: '',
        reference: '',
        year: new Date().getFullYear(),
        condition: 'excellent',
        fullSet: false,
        box: false,
        papers: false,
        movement: 'automatik',
        case_material: 'stainless_steel',
        case_diameter: '',
        complications: [],
      } as WatchMetadata;
      
    default:
      throw new Error(`Unknown category: ${categorySlug}`);
  }
}

/**
 * Validate metadata completeness (for submission)
 */
export function validateMetadata(
  categorySlug: string,
  metadata: AssetMetadata
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (categorySlug === 'real-estate' && isRealEstateMetadata(metadata)) {
    if (!metadata.property_type) errors.push('Property Type ist erforderlich');
    if (!metadata.area_sqm || metadata.area_sqm <= 0) errors.push('Wohnfläche muss größer als 0 sein');
    if (!metadata.rooms || metadata.rooms < 1) errors.push('Mindestens 1 Zimmer erforderlich');
    if (!metadata.year_built) errors.push('Baujahr ist erforderlich');
    if (metadata.year_built < 1800 || metadata.year_built > new Date().getFullYear() + 2) {
      errors.push('Ungültiges Baujahr');
    }
  }
  
  if (categorySlug === 'fahrzeuge' && isVehicleMetadata(metadata)) {
    if (!metadata.brand) errors.push('Marke ist erforderlich');
    if (!metadata.model) errors.push('Modell ist erforderlich');
    if (!metadata.year) errors.push('Baujahr ist erforderlich');
    if (metadata.mileage < 0) errors.push('Kilometerstand kann nicht negativ sein');
    if (!metadata.power) errors.push('Leistung ist erforderlich');
    if (!metadata.color_exterior) errors.push('Außenfarbe ist erforderlich');
  }
  
  if (categorySlug === 'luxusuhren' && isWatchMetadata(metadata)) {
    if (!metadata.brand) errors.push('Marke ist erforderlich');
    if (!metadata.model) errors.push('Modell ist erforderlich');
    if (!metadata.reference) errors.push('Referenznummer ist erforderlich');
    if (!metadata.year) errors.push('Baujahr ist erforderlich');
    if (!metadata.case_diameter) errors.push('Gehäusedurchmesser ist erforderlich');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

