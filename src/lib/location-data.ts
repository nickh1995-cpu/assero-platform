/**
 * German Premium Location Database
 * Maps cities and districts to location tiers for real estate valuation
 */

export type LocationTier = 1 | 2 | 3;

export interface LocationInfo {
  tier: LocationTier;
  label: string;
  priceMultiplier: number;
  description: string;
}

/**
 * Premium locations database
 * Tier 1 = Toplage (A-Städte, Premium-Viertel)
 * Tier 2 = Gute Lage (B-Städte, gute Viertel)
 * Tier 3 = Solide Lage (C-Städte, Standard)
 */
const LOCATION_DATABASE: Record<string, LocationInfo> = {
  // München - Toplage
  'münchen': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.6, description: 'München - A-Stadt' },
  'münchen schwabing': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.7, description: 'Schwabing - Premium-Viertel' },
  'münchen lehel': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.75, description: 'Lehel - Top-Viertel' },
  'münchen maxvorstadt': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.65, description: 'Maxvorstadt - Zentral' },
  'münchen bogenhausen': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.8, description: 'Bogenhausen - Exklusiv' },
  'münchen haidhausen': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.6, description: 'Haidhausen - Beliebt' },
  'starnberg': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.75, description: 'Starnberg - Seelage' },
  'grünwald': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.9, description: 'Grünwald - Exklusiv' },
  
  // Hamburg - Toplage
  'hamburg': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.5, description: 'Hamburg - A-Stadt' },
  'hamburg blankenese': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.8, description: 'Blankenese - Elbseite' },
  'hamburg rotherbaum': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.6, description: 'Rotherbaum - Zentral' },
  'hamburg winterhude': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.55, description: 'Winterhude - Beliebt' },
  'hamburg eppendorf': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.6, description: 'Eppendorf - Premium' },
  
  // Frankfurt - Toplage/Gute Lage
  'frankfurt': { tier: 2, label: '✓ Gute Lage', priceMultiplier: 1.4, description: 'Frankfurt - A-Stadt' },
  'frankfurt westend': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.65, description: 'Westend - Premium' },
  'frankfurt sachsenhausen': { tier: 2, label: '✓ Gute Lage', priceMultiplier: 1.45, description: 'Sachsenhausen - Beliebt' },
  
  // Stuttgart - Gute Lage
  'stuttgart': { tier: 2, label: '✓ Gute Lage', priceMultiplier: 1.35, description: 'Stuttgart - B-Stadt' },
  'stuttgart mitte': { tier: 2, label: '✓ Gute Lage', priceMultiplier: 1.4, description: 'Zentrum' },
  
  // Düsseldorf - Gute Lage
  'düsseldorf': { tier: 2, label: '✓ Gute Lage', priceMultiplier: 1.35, description: 'Düsseldorf - B-Stadt' },
  'düsseldorf oberkassel': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.6, description: 'Oberkassel - Rheinseite' },
  
  // Köln - Gute Lage
  'köln': { tier: 2, label: '✓ Gute Lage', priceMultiplier: 1.3, description: 'Köln - B-Stadt' },
  
  // Berlin - variiert stark
  'berlin': { tier: 2, label: '✓ Gute Lage', priceMultiplier: 1.3, description: 'Berlin - A-Stadt' },
  'berlin mitte': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.5, description: 'Mitte - Zentral' },
  'berlin charlottenburg': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.45, description: 'Charlottenburg - Beliebt' },
  'berlin prenzlauer berg': { tier: 1, label: '🏆 Toplage', priceMultiplier: 1.5, description: 'Prenzlauer Berg - Hip' },
  'berlin kreuzberg': { tier: 2, label: '✓ Gute Lage', priceMultiplier: 1.35, description: 'Kreuzberg - Urban' },
  
  // Leipzig, Dresden - Solide Lage
  'leipzig': { tier: 3, label: '○ Solide Lage', priceMultiplier: 1.0, description: 'Leipzig - C-Stadt' },
  'dresden': { tier: 3, label: '○ Solide Lage', priceMultiplier: 1.05, description: 'Dresden - C-Stadt' },
};

/**
 * Normalize location string for matching
 */
function normalizeLocation(location: string): string {
  return location
    .toLowerCase()
    .trim()
    .replace(/[,;]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace('ü', 'u')
    .replace('ö', 'o')
    .replace('ä', 'a')
    .replace('ß', 'ss');
}

/**
 * Detect location tier from address string
 */
export function detectLocationTier(address: string): LocationInfo {
  const normalized = normalizeLocation(address);
  
  // Try exact match first (city + district)
  for (const [key, info] of Object.entries(LOCATION_DATABASE)) {
    if (normalized.includes(key)) {
      return info;
    }
  }
  
  // Try city-only match
  const cityMatch = normalized.match(/\b(münchen|hamburg|frankfurt|berlin|stuttgart|düsseldorf|köln|leipzig|dresden|starnberg|grünwald)\b/);
  if (cityMatch) {
    const city = cityMatch[0];
    if (LOCATION_DATABASE[city]) {
      return LOCATION_DATABASE[city];
    }
  }
  
  // Default to Solide Lage
  return {
    tier: 3,
    label: '○ Solide Lage',
    priceMultiplier: 1.0,
    description: 'Standard-Lage'
  };
}

/**
 * Get location suggestions based on partial input
 */
export function getLocationSuggestions(partial: string): string[] {
  if (partial.length < 2) return [];
  
  const normalized = normalizeLocation(partial);
  const suggestions: string[] = [];
  
  for (const key of Object.keys(LOCATION_DATABASE)) {
    if (key.includes(normalized)) {
      // Format for display
      const formatted = key
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(', ');
      suggestions.push(formatted);
    }
  }
  
  return suggestions.slice(0, 5); // Top 5
}

/**
 * Validate German postal code
 */
export function isValidPostalCode(plz: string): boolean {
  return /^\d{5}$/.test(plz);
}

