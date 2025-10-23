import {
  REAL_ESTATE_CITIES,
  WATCH_BRANDS,
  VEHICLE_SEGMENTS,
  getDepreciationFactor,
  getMileageAdjustment,
} from "./valuation-data";

export type AssetCategory = "real-estate" | "luxusuhren" | "fahrzeuge";

export type CurrencyCode = "EUR" | "USD" | "CHF" | "GBP";

export type RealEstateInput = {
  category: "real-estate";
  locationTier: 1 | 2 | 3; // 1=Toplage A, 2=Gute B, 3=Solide C
  areaSqm: number; // Wohnfläche
  rooms: number;
  bathrooms?: number;
  yearBuilt?: number;
  condition: "new" | "renovated" | "needs_renovation";
  energyClass?: "A+" | "A" | "B" | "C" | "D" | "E" | "F" | "G";
  premiumFeatures?: Array<
    | "terrace"
    | "balcony"
    | "parking"
    | "concierge"
    | "elevator"
    | "view"
  >;
};

export type WatchInput = {
  category: "luxusuhren";
  brandTier: 1 | 2 | 3; // 1=Rolex/AP/Patek, 2=Omega/IWC/Cartier, 3=Longines/Tudor etc.
  modelGrade: 1 | 2 | 3; // 1=Top-Icon, 2=Core, 3=Entry
  year?: number;
  condition: "mint" | "very_good" | "good" | "fair";
  fullSet: boolean; // Box & Papers
  limited?: boolean; // Limited Edition
};

export type VehicleInput = {
  category: "fahrzeuge";
  segment: "sports" | "luxury" | "suv" | "sedan";
  brandTier: 1 | 2 | 3; // 1=Ferrari/Lambo/Porsche 911 Turbo S; 2=AMG/M etc.; 3=Premium Serien
  year: number;
  mileageKm: number;
  condition: "excellent" | "good" | "used";
  features?: Array<"carbon" | "ceramic_brakes" | "awd" | "rare_color">;
};

export type ValuationInput = RealEstateInput | WatchInput | VehicleInput;

export type Comparable = {
  title: string;
  price: number;
  currency: CurrencyCode;
  source?: string;
};

export type ValuationResult = {
  estimated: number; // Mid estimate
  low: number;
  high: number;
  currency: CurrencyCode;
  confidence: number; // 0..1
  comparables: Comparable[];
  rationale: string[]; // key drivers
};

export function formatCurrency(amount: number, currency: CurrencyCode = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Heuristics are intentionally simple and deterministic for initial MVP.
// They should be replaced with data-driven comps over time.

export function estimateValuation(
  input: ValuationInput,
  currency: CurrencyCode = "EUR"
): ValuationResult {
  if (input.category === "real-estate") {
    return estimateRealEstate(input as RealEstateInput, currency);
  }

  if (input.category === "luxusuhren") {
    return estimateWatch(input as WatchInput, currency);
  }

  // fahrzeuge
  return estimateVehicle(input as VehicleInput, currency);
}

// ==========================================
// REAL ESTATE VALUATION (MARKET DATA)
// ==========================================

function estimateRealEstate(input: RealEstateInput, currency: CurrencyCode): ValuationResult {
  // Get representative city data based on tier
  const citiesByTier = Object.values(REAL_ESTATE_CITIES).filter(
    (c) => c.tier === input.locationTier
  );
  const avgCity =
    citiesByTier.length > 0
      ? citiesByTier[Math.floor(citiesByTier.length / 2)]
      : REAL_ESTATE_CITIES.nuremberg;

  // Base price per sqm (apartment default)
  let pricePerSqm = avgCity.pricePerSqm.apartment;

  // Property type adjustment
  if (input.rooms && input.areaSqm) {
    const sqmPerRoom = input.areaSqm / input.rooms;
    if (sqmPerRoom > 50) {
      // Large rooms → likely penthouse/luxury
      pricePerSqm = avgCity.pricePerSqm.penthouse;
    } else if (input.rooms >= 5) {
      // Many rooms → likely townhouse
      pricePerSqm = avgCity.pricePerSqm.townhouse;
    }
  }

  // Condition modifiers (realistic)
  if (input.condition === "new") pricePerSqm *= 1.15;
  else if (input.condition === "renovated") pricePerSqm *= 1.08;
  else pricePerSqm *= 0.88; // needs_renovation

  // Energy class influence (real impact on market)
  const energyFactorMap: Record<string, number> = {
    "A+": 1.08,
    A: 1.05,
    B: 1.02,
    C: 1.0,
    D: 0.97,
    E: 0.93,
    F: 0.89,
    G: 0.85,
  };
  if (input.energyClass) pricePerSqm *= energyFactorMap[input.energyClass] ?? 1.0;

  // Premium features (cumulative)
  const feat = new Set(input.premiumFeatures ?? []);
  if (feat.has("view")) pricePerSqm *= 1.08;
  if (feat.has("terrace")) pricePerSqm *= 1.06;
  if (feat.has("concierge")) pricePerSqm *= 1.04;
  if (feat.has("parking")) pricePerSqm *= 1.03;
  if (feat.has("elevator")) pricePerSqm *= 1.02;
  if (feat.has("balcony")) pricePerSqm *= 1.02;

  // Year built adjustment
  let yearAdj = 1.0;
  if (input.yearBuilt) {
    if (input.yearBuilt >= 2020) yearAdj = 1.05; // New construction premium
    else if (input.yearBuilt >= 2010) yearAdj = 1.02;
    else if (input.yearBuilt >= 2000) yearAdj = 1.0;
    else if (input.yearBuilt >= 1990) yearAdj = 0.96;
    else if (input.yearBuilt >= 1970) yearAdj = 0.92;
    else if (input.yearBuilt >= 1950) yearAdj = input.condition === "renovated" ? 0.95 : 0.85; // Altbau
    else yearAdj = input.condition === "renovated" ? 0.92 : 0.78;
  }

  const base = Math.max(1, input.areaSqm) * pricePerSqm * yearAdj;
  const estimated = Math.round(base);

  // Spread based on data quality
  const spread = input.locationTier === 1 ? 0.10 : input.locationTier === 2 ? 0.13 : 0.16;
  const low = Math.round(estimated * (1 - spread));
  const high = Math.round(estimated * (1 + spread));

  // Confidence based on tier and data completeness
  let confidence = input.locationTier === 1 ? 0.82 : input.locationTier === 2 ? 0.75 : 0.68;
  if (!input.yearBuilt) confidence *= 0.92;
  if (!input.bathrooms) confidence *= 0.95;

  // Real comparables based on market
  const comparables: Comparable[] = [
    {
      title: `${avgCity.name} - Penthouse`,
      price: Math.round(avgCity.pricePerSqm.penthouse * input.areaSqm * 0.95),
      currency,
      source: "Marktdaten 2024",
    },
    {
      title: `${avgCity.name} - Apartment`,
      price: Math.round(avgCity.pricePerSqm.apartment * input.areaSqm),
      currency,
      source: "Marktdaten 2024",
    },
    {
      title: `${avgCity.name} - Stadthaus`,
      price: Math.round(avgCity.pricePerSqm.townhouse * input.areaSqm * 1.02),
      currency,
      source: "Marktdaten 2024",
    },
  ];

  return {
    estimated,
    low,
    high,
    currency,
    confidence,
    comparables,
    rationale: [
      `${avgCity.name}: ca. ${formatCurrency(Math.round(pricePerSqm), currency)}/m²`,
      `Zustand: ${input.condition === "new" ? "Neubau (+15%)" : input.condition === "renovated" ? "Saniert (+8%)" : "Renovierungsbedürftig (-12%)"}`,
      input.energyClass ? `Energieklasse ${input.energyClass}: ${energyFactorMap[input.energyClass] >= 1 ? "+" : ""}${Math.round((energyFactorMap[input.energyClass] - 1) * 100)}%` : "",
      feat.size
        ? `Premium-Features: ${Array.from(feat).join(", ")} (+${Math.round((Array.from(feat).length * 3))}%)`
        : "",
      input.yearBuilt ? `Baujahr ${input.yearBuilt}` : "",
    ].filter(Boolean) as string[],
  };
}

// ==========================================
// LUXURY WATCHES VALUATION (MARKET DATA)
// ==========================================

function estimateWatch(input: WatchInput, currency: CurrencyCode): ValuationResult {
  // Get brand data
  const brandsByTier = Object.values(WATCH_BRANDS).filter((b) => b.tier === input.brandTier);
  const brand = brandsByTier.length > 0 ? brandsByTier[0] : WATCH_BRANDS.omega;

  // Get model based on grade
  const models = Object.values(brand.models);
  const matchingModels = models.filter((m) => m.grade === input.modelGrade);
  const model = matchingModels.length > 0 ? matchingModels[0] : models[0];

  let base = model.basePrice;

  // Condition adjustment (realistic market impact)
  const condMap: Record<WatchInput["condition"], number> = {
    mint: 1.18, // Unworn premium
    very_good: 1.05,
    good: 0.92,
    fair: 0.78,
  };
  base *= condMap[input.condition];

  // Full set premium (box & papers significant)
  if (input.fullSet) base *= 1.12;

  // Limited edition premium
  if (input.limited) base *= 1.18;

  // Year/age effect (if provided)
  if (input.year) {
    const age = new Date().getFullYear() - input.year;
    if (age <= 1) base *= 1.08; // Recent = premium
    else if (age <= 3) base *= 1.02;
    else if (age <= 5) base *= 1.0;
    else if (age <= 10) base *= 0.95;
    else if (age <= 20) base *= 0.88;
    else {
      // Vintage potential
      base *= input.condition === "mint" || input.condition === "very_good" ? 1.15 : 0.75;
    }
  }

  // Brand appreciation over time (luxury watches can appreciate)
  const yearsHeld = input.year ? Math.min(5, new Date().getFullYear() - input.year) : 0;
  if (yearsHeld > 0 && input.brandTier === 1) {
    base *= Math.pow(1 + brand.yearlyAppreciation, yearsHeld);
  }

  const estimated = Math.round(base);
  const spread = input.brandTier === 1 && input.modelGrade === 1 ? 0.12 : 0.18;
  const low = Math.round(estimated * (1 - spread));
  const high = Math.round(estimated * (1 + spread));

  // Confidence based on brand/model clarity
  let confidence =
    input.brandTier === 1 && input.modelGrade === 1
      ? 0.78
      : input.brandTier === 1
      ? 0.72
      : input.brandTier === 2
      ? 0.68
      : 0.62;
  if (!input.fullSet) confidence *= 0.92;

  // Real market comps
  const otherModels = models.filter((m) => m !== model).slice(0, 2);
  const comparables: Comparable[] = [
    {
      title: `${brand.name} ${model.name}`,
      price: Math.round(model.basePrice * condMap[input.condition]),
      currency,
      source: "Chrono24 Durchschnitt",
    },
    ...otherModels.map((m) => ({
      title: `${brand.name} ${m.name}`,
      price: Math.round(m.basePrice * condMap[input.condition]),
      currency,
      source: "Chrono24 Durchschnitt",
    })),
  ];

  return {
    estimated,
    low,
    high,
    currency,
    confidence,
    comparables,
    rationale: [
      `${brand.name} - Brand-Tier ${input.brandTier}`,
      `Modell-Grade ${input.modelGrade}: ${model.name}`,
      `Zustand: ${input.condition}${input.fullSet ? " + Full Set (+12%)" : ""}${input.limited ? " + Limited Edition (+18%)" : ""}`,
      input.year
        ? `Baujahr ${input.year} (${new Date().getFullYear() - input.year} Jahre alt)`
        : "",
    ].filter(Boolean) as string[],
  };
}

// ==========================================
// VEHICLE VALUATION (SCHWACKE/DAT DATA)
// ==========================================

function estimateVehicle(input: VehicleInput, currency: CurrencyCode): ValuationResult {
  // Find matching segment
  const segments = Object.values(VEHICLE_SEGMENTS).filter(
    (s) => s.segment === input.segment && s.brandTier === input.brandTier
  );
  const segment = segments.length > 0 ? segments[0] : VEHICLE_SEGMENTS.sedan_3er_c_class;

  // Calculate age
  const currentYear = new Date().getFullYear();
  const ageYears = Math.max(0, currentYear - input.year);

  // Base price with depreciation
  const depreciationFactor = getDepreciationFactor(segment.depreciationCurve, ageYears);
  let estimatedValue = segment.basePrice * depreciationFactor;

  // Mileage adjustment
  const mileageAdj = getMileageAdjustment(input.mileageKm, ageYears);
  estimatedValue *= mileageAdj;

  // Condition adjustment
  const condMap: Record<VehicleInput["condition"], number> = {
    excellent: 1.12, // Show room condition
    good: 1.0, // Normal wear
    used: 0.86, // Visible wear
  };
  estimatedValue *= condMap[input.condition];

  // Features/options premium
  const feats = new Set(input.features ?? []);
  if (feats.has("ceramic_brakes")) estimatedValue *= 1.06;
  if (feats.has("carbon")) estimatedValue *= 1.05;
  if (feats.has("rare_color")) estimatedValue *= 1.03;
  if (feats.has("awd")) estimatedValue *= 1.02;

  const estimated = Math.round(estimatedValue);
  const spread = ageYears <= 2 ? 0.10 : ageYears <= 5 ? 0.14 : 0.18;
  const low = Math.round(estimated * (1 - spread));
  const high = Math.round(estimated * (1 + spread));

  // Confidence based on age and data
  let confidence = ageYears <= 3 ? 0.78 : ageYears <= 6 ? 0.72 : 0.65;
  if (Math.abs(input.mileageKm - ageYears * 15000) > 30000) confidence *= 0.90; // Unusual mileage

  // Comparables
  const comparables: Comparable[] = [
    {
      title: `${segment.name} (${input.year})`,
      price: Math.round(segment.basePrice * depreciationFactor),
      currency,
      source: "DAT/Schwacke",
    },
    {
      title: `${segment.name} (${input.year - 1})`,
      price: Math.round(
        segment.basePrice * getDepreciationFactor(segment.depreciationCurve, ageYears + 1)
      ),
      currency,
      source: "DAT/Schwacke",
    },
    {
      title: `${segment.name} (${input.year + 1})`,
      price: Math.round(
        segment.basePrice *
          getDepreciationFactor(segment.depreciationCurve, Math.max(0, ageYears - 1))
      ),
      currency,
      source: "DAT/Schwacke",
    },
  ];

  return {
    estimated,
    low,
    high,
    currency,
    confidence,
    comparables,
    rationale: [
      `${segment.name} - Restwert nach ${ageYears} Jahren: ${Math.round(depreciationFactor * 100)}%`,
      `Laufleistung ${input.mileageKm.toLocaleString("de-DE")} km: ${mileageAdj >= 1 ? "Unterdurchschnittlich" : mileageAdj >= 0.95 ? "Normal" : "Überdurchschnittlich"} (${mileageAdj >= 1 ? "+" : ""}${Math.round((mileageAdj - 1) * 100)}%)`,
      `Zustand: ${input.condition === "excellent" ? "Hervorragend (+12%)" : input.condition === "good" ? "Gut" : "Gebraucht (-14%)"}`,
      feats.size ? `Sonderausstattung: ${Array.from(feats).join(", ")}` : "",
    ].filter(Boolean) as string[],
  };
}


