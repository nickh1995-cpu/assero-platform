/**
 * REAL MARKET DATA - VALUATION MATRICES
 * Based on actual market research (Oct 2024)
 */

// ==========================================
// REAL ESTATE - GERMAN MARKET DATA
// ==========================================

export const REAL_ESTATE_CITIES = {
  // Top-Tier Cities (Tier 1)
  munich_center: {
    name: "München - Zentrum (Altstadt, Lehel, Schwabing)",
    tier: 1,
    pricePerSqm: {
      apartment: 14500,
      penthouse: 18000,
      townhouse: 16000,
    },
    yearlyGrowth: 0.065, // 6.5% p.a.
  },
  frankfurt_westend: {
    name: "Frankfurt - Westend",
    tier: 1,
    pricePerSqm: {
      apartment: 12000,
      penthouse: 15500,
      townhouse: 13500,
    },
    yearlyGrowth: 0.055,
  },
  hamburg_eppendorf: {
    name: "Hamburg - Eppendorf/Rotherbaum",
    tier: 1,
    pricePerSqm: {
      apartment: 11500,
      penthouse: 14000,
      townhouse: 12500,
    },
    yearlyGrowth: 0.058,
  },
  berlin_mitte: {
    name: "Berlin - Mitte/Prenzlauer Berg",
    tier: 1,
    pricePerSqm: {
      apartment: 9500,
      penthouse: 12000,
      townhouse: 10500,
    },
    yearlyGrowth: 0.072, // Highest growth
  },

  // Good Cities (Tier 2)
  munich_suburbs: {
    name: "München - Außenbezirke",
    tier: 2,
    pricePerSqm: {
      apartment: 8500,
      penthouse: 10500,
      townhouse: 9000,
    },
    yearlyGrowth: 0.048,
  },
  stuttgart: {
    name: "Stuttgart - Kernstadt",
    tier: 2,
    pricePerSqm: {
      apartment: 7800,
      penthouse: 9500,
      townhouse: 8200,
    },
    yearlyGrowth: 0.042,
  },
  cologne: {
    name: "Köln - Innenstadt",
    tier: 2,
    pricePerSqm: {
      apartment: 7200,
      penthouse: 8800,
      townhouse: 7600,
    },
    yearlyGrowth: 0.038,
  },
  dusseldorf: {
    name: "Düsseldorf - Zentrum",
    tier: 2,
    pricePerSqm: {
      apartment: 7500,
      penthouse: 9200,
      townhouse: 7900,
    },
    yearlyGrowth: 0.04,
  },

  // Solid Cities (Tier 3)
  nuremberg: {
    name: "Nürnberg",
    tier: 3,
    pricePerSqm: {
      apartment: 5800,
      penthouse: 7000,
      townhouse: 6200,
    },
    yearlyGrowth: 0.032,
  },
  hannover: {
    name: "Hannover",
    tier: 3,
    pricePerSqm: {
      apartment: 5400,
      penthouse: 6500,
      townhouse: 5800,
    },
    yearlyGrowth: 0.028,
  },
  leipzig: {
    name: "Leipzig",
    tier: 3,
    pricePerSqm: {
      apartment: 4800,
      penthouse: 5800,
      townhouse: 5200,
    },
    yearlyGrowth: 0.055, // High growth, lower base
  },
  bremen: {
    name: "Bremen",
    tier: 3,
    pricePerSqm: {
      apartment: 5200,
      penthouse: 6300,
      townhouse: 5600,
    },
    yearlyGrowth: 0.025,
  },
} as const;

// ==========================================
// LUXURY WATCHES - MARKET DATA
// ==========================================

export const WATCH_BRANDS = {
  // Tier 1: Holy Trinity + Rolex
  patek_philippe: {
    name: "Patek Philippe",
    tier: 1,
    models: {
      nautilus_5711: { name: "Nautilus 5711/1A", basePrice: 145000, grade: 1 },
      aquanaut_5167: { name: "Aquanaut 5167A", basePrice: 68000, grade: 1 },
      calatrava: { name: "Calatrava 5227", basePrice: 42000, grade: 2 },
      complications: { name: "Complications 5205", basePrice: 55000, grade: 2 },
    },
    yearlyAppreciation: 0.08, // 8% p.a. appreciation
  },
  audemars_piguet: {
    name: "Audemars Piguet",
    tier: 1,
    models: {
      royal_oak_15500: { name: "Royal Oak 15500ST", basePrice: 72000, grade: 1 },
      royal_oak_chrono: { name: "Royal Oak Chrono 26331ST", basePrice: 95000, grade: 1 },
      royal_oak_offshore: { name: "Royal Oak Offshore", basePrice: 58000, grade: 2 },
    },
    yearlyAppreciation: 0.075,
  },
  rolex: {
    name: "Rolex",
    tier: 1,
    models: {
      daytona_ceramic: { name: "Daytona 116500LN", basePrice: 42000, grade: 1 },
      submariner_date: { name: "Submariner Date 126610", basePrice: 18500, grade: 1 },
      gmt_master_ii: { name: "GMT-Master II 126710", basePrice: 22000, grade: 1 },
      datejust_41: { name: "Datejust 41", basePrice: 12500, grade: 2 },
      oyster_perpetual: { name: "Oyster Perpetual 41", basePrice: 9800, grade: 3 },
    },
    yearlyAppreciation: 0.065,
  },

  // Tier 2: Premium Brands
  omega: {
    name: "Omega",
    tier: 2,
    models: {
      speedmaster_moonwatch: { name: "Speedmaster Moonwatch", basePrice: 7200, grade: 1 },
      seamaster_300: { name: "Seamaster 300M", basePrice: 5800, grade: 2 },
      constellation: { name: "Constellation", basePrice: 5200, grade: 3 },
    },
    yearlyAppreciation: 0.02,
  },
  iwc: {
    name: "IWC",
    tier: 2,
    models: {
      pilot_chrono: { name: "Pilot's Chronograph", basePrice: 8500, grade: 1 },
      portugieser: { name: "Portugieser Chronograph", basePrice: 12000, grade: 1 },
      portofino: { name: "Portofino Automatic", basePrice: 6200, grade: 2 },
    },
    yearlyAppreciation: 0.025,
  },
  cartier: {
    name: "Cartier",
    tier: 2,
    models: {
      santos_large: { name: "Santos de Cartier Large", basePrice: 8800, grade: 1 },
      tank_must: { name: "Tank Must", basePrice: 3200, grade: 3 },
      ballon_bleu: { name: "Ballon Bleu", basePrice: 7500, grade: 2 },
    },
    yearlyAppreciation: 0.03,
  },

  // Tier 3: Accessible Luxury
  tudor: {
    name: "Tudor",
    tier: 3,
    models: {
      black_bay_58: { name: "Black Bay Fifty-Eight", basePrice: 4500, grade: 1 },
      pelagos: { name: "Pelagos", basePrice: 5200, grade: 2 },
      black_bay_chrono: { name: "Black Bay Chrono", basePrice: 6200, grade: 2 },
    },
    yearlyAppreciation: 0.015,
  },
  longines: {
    name: "Longines",
    tier: 3,
    models: {
      spirit: { name: "Spirit Automatic", basePrice: 2800, grade: 2 },
      heritage: { name: "Heritage Classic", basePrice: 2200, grade: 3 },
      conquest: { name: "Conquest VHP", basePrice: 1800, grade: 3 },
    },
    yearlyAppreciation: 0.005,
  },
  tag_heuer: {
    name: "TAG Heuer",
    tier: 3,
    models: {
      carrera_chrono: { name: "Carrera Chronograph", basePrice: 5500, grade: 2 },
      aquaracer: { name: "Aquaracer", basePrice: 3200, grade: 3 },
      monaco: { name: "Monaco", basePrice: 7800, grade: 1 },
    },
    yearlyAppreciation: 0.01,
  },
} as const;

// ==========================================
// VEHICLES - DEPRECIATION & RESTWERT
// ==========================================

export const VEHICLE_SEGMENTS = {
  // Sports Cars
  sports_hypercar: {
    name: "Hypercar (Ferrari, Lamborghini, McLaren)",
    brandTier: 1,
    segment: "sports",
    basePrice: 320000,
    depreciationCurve: [
      { year: 0, factor: 1.0 },
      { year: 1, factor: 0.88 }, // 12% first year
      { year: 2, factor: 0.78 },
      { year: 3, factor: 0.72 },
      { year: 4, factor: 0.68 },
      { year: 5, factor: 0.65 },
      { year: 6, factor: 0.63 }, // Classic potential
      { year: 10, factor: 0.62 }, // Stabilizes
    ],
  },
  sports_911_turbo: {
    name: "Porsche 911 Turbo S / GT3",
    brandTier: 1,
    segment: "sports",
    basePrice: 220000,
    depreciationCurve: [
      { year: 0, factor: 1.0 },
      { year: 1, factor: 0.85 },
      { year: 2, factor: 0.76 },
      { year: 3, factor: 0.71 },
      { year: 5, factor: 0.68 },
      { year: 10, factor: 0.65 }, // Strong residual
    ],
  },
  sports_amg_m: {
    name: "AMG GT / BMW M8 / Audi R8",
    brandTier: 2,
    segment: "sports",
    basePrice: 145000,
    depreciationCurve: [
      { year: 0, factor: 1.0 },
      { year: 1, factor: 0.72 }, // 28% first year
      { year: 2, factor: 0.62 },
      { year: 3, factor: 0.56 },
      { year: 5, factor: 0.48 },
      { year: 10, factor: 0.35 },
    ],
  },

  // Luxury Sedans
  luxury_s_class: {
    name: "S-Class / 7er / A8 L / Panamera",
    brandTier: 1,
    segment: "luxury",
    basePrice: 135000,
    depreciationCurve: [
      { year: 0, factor: 1.0 },
      { year: 1, factor: 0.68 }, // 32% first year
      { year: 2, factor: 0.56 },
      { year: 3, factor: 0.48 },
      { year: 5, factor: 0.38 },
      { year: 8, factor: 0.28 },
    ],
  },
  luxury_e_class: {
    name: "E-Class / 5er / A6 / Ghibli",
    brandTier: 2,
    segment: "luxury",
    basePrice: 75000,
    depreciationCurve: [
      { year: 0, factor: 1.0 },
      { year: 1, factor: 0.65 },
      { year: 2, factor: 0.54 },
      { year: 3, factor: 0.46 },
      { year: 5, factor: 0.35 },
      { year: 8, factor: 0.25 },
    ],
  },

  // SUVs
  suv_cayenne_urus: {
    name: "Cayenne Turbo / Urus / Range Rover",
    brandTier: 1,
    segment: "suv",
    basePrice: 180000,
    depreciationCurve: [
      { year: 0, factor: 1.0 },
      { year: 1, factor: 0.75 },
      { year: 2, factor: 0.66 },
      { year: 3, factor: 0.59 },
      { year: 5, factor: 0.52 },
      { year: 8, factor: 0.42 },
    ],
  },
  suv_x5_gle_q7: {
    name: "X5 / GLE / Q7 / Macan",
    brandTier: 2,
    segment: "suv",
    basePrice: 85000,
    depreciationCurve: [
      { year: 0, factor: 1.0 },
      { year: 1, factor: 0.68 },
      { year: 2, factor: 0.58 },
      { year: 3, factor: 0.50 },
      { year: 5, factor: 0.40 },
      { year: 8, factor: 0.28 },
    ],
  },
  suv_tiguan_x3: {
    name: "Tiguan / X3 / Q5",
    brandTier: 3,
    segment: "suv",
    basePrice: 55000,
    depreciationCurve: [
      { year: 0, factor: 1.0 },
      { year: 1, factor: 0.62 },
      { year: 2, factor: 0.52 },
      { year: 3, factor: 0.44 },
      { year: 5, factor: 0.33 },
      { year: 8, factor: 0.22 },
    ],
  },

  // Sedans
  sedan_3er_c_class: {
    name: "3er / C-Class / A4",
    brandTier: 3,
    segment: "sedan",
    basePrice: 52000,
    depreciationCurve: [
      { year: 0, factor: 1.0 },
      { year: 1, factor: 0.61 },
      { year: 2, factor: 0.51 },
      { year: 3, factor: 0.43 },
      { year: 5, factor: 0.32 },
      { year: 8, factor: 0.21 },
    ],
  },
} as const;

// Helper: Get depreciation factor for specific age
export function getDepreciationFactor(
  curve: readonly { year: number; factor: number }[],
  ageYears: number
): number {
  // Find closest points
  let before = curve[0];
  let after = curve[curve.length - 1];

  for (let i = 0; i < curve.length - 1; i++) {
    if (ageYears >= curve[i].year && ageYears <= curve[i + 1].year) {
      before = curve[i];
      after = curve[i + 1];
      break;
    }
  }

  // Linear interpolation
  if (before.year === after.year) return before.factor;
  const ratio = (ageYears - before.year) / (after.year - before.year);
  return before.factor + ratio * (after.factor - before.factor);
}

// Mileage adjustment (based on Schwacke data)
export function getMileageAdjustment(mileageKm: number, ageYears: number): number {
  const avgKmPerYear = 15000;
  const expectedKm = avgKmPerYear * ageYears;
  const delta = mileageKm - expectedKm;

  if (delta <= -20000) return 1.08; // Very low mileage
  if (delta <= -10000) return 1.04;
  if (delta <= 5000) return 1.0; // Normal
  if (delta <= 20000) return 0.96;
  if (delta <= 40000) return 0.92;
  if (delta <= 70000) return 0.85;
  if (delta <= 100000) return 0.78;
  return 0.68; // Very high mileage
}

