/**
 * Market Context Data Generator
 * Provides market trends, supply/demand indicators, and seasonal context
 */

export interface MarketContextData {
  trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: string;
    description: string;
  };
  supplyDemand: {
    status: 'high' | 'medium' | 'low';
    label: string;
    description: string;
  };
  seasonal?: {
    currentMonth: string;
    impact: 'positive' | 'neutral' | 'negative';
    description: string;
  };
}

/**
 * Get current month name in German
 */
function getCurrentMonth(): string {
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  return months[new Date().getMonth()];
}

/**
 * Get current quarter (1-4)
 */
function getCurrentQuarter(): number {
  return Math.floor(new Date().getMonth() / 3) + 1;
}

/**
 * Generate market context for Real Estate
 */
function getRealEstateContext(location?: string): MarketContextData {
  const month = getCurrentMonth();
  const quarter = getCurrentQuarter();
  
  // Munich premium location logic
  const isMunich = location?.toLowerCase().includes('münchen');
  const isPremiumLocation = isMunich || 
    location?.toLowerCase().includes('starnberg') ||
    location?.toLowerCase().includes('lehel') ||
    location?.toLowerCase().includes('schwabing');
  
  // Seasonal logic: Spring (Q2) is strong, Winter (Q1) is weaker
  const isSpring = quarter === 2;
  const isSummer = quarter === 3;
  const isAutumn = quarter === 4;
  const isWinter = quarter === 1;

  return {
    trend: {
      direction: isPremiumLocation ? 'up' : 'stable',
      percentage: isPremiumLocation ? 8.2 : 3.5,
      period: 'YoY (12 Monate)',
      description: isPremiumLocation
        ? 'Starke Nachfrage in Toplage'
        : 'Moderate Preissteigerung im Markt'
    },
    supplyDemand: {
      status: isPremiumLocation ? 'high' : 'medium',
      label: isPremiumLocation ? 'Hohe Nachfrage' : 'Stabiler Markt',
      description: isPremiumLocation
        ? 'Sehr begrenzte Verfügbarkeit in dieser Lage. Käufer übersteigen Angebot deutlich.'
        : 'Ausgeglichenes Verhältnis von Angebot und Nachfrage im Markt.'
    },
    seasonal: {
      currentMonth: month,
      impact: isSpring || isSummer ? 'positive' : isWinter ? 'negative' : 'neutral',
      description: isSpring
        ? 'Frühjahr ist traditionell die stärkste Kaufsaison für Immobilien.'
        : isSummer
        ? 'Sommerzeit zeigt anhaltend hohe Aktivität im Immobilienmarkt.'
        : isAutumn
        ? 'Herbst: Käufer wollen vor Jahresende abschließen.'
        : 'Winter: Traditionell ruhigere Phase im Immobilienmarkt.'
    }
  };
}

/**
 * Generate market context for Luxury Watches
 */
function getLuxuryWatchContext(): MarketContextData {
  const month = getCurrentMonth();
  const quarter = getCurrentQuarter();
  
  // Q4 (Oct-Dec) is strong due to holidays
  const isQ4 = quarter === 4;
  const isQ1 = quarter === 1;

  return {
    trend: {
      direction: 'up',
      percentage: 5.8,
      period: 'YoY (12 Monate)',
      description: 'Luxusuhren als Wertanlage weiter gefragt'
    },
    supplyDemand: {
      status: 'high',
      label: 'Hohe Nachfrage',
      description: 'Rolex und Patek Philippe Modelle erzielen Premiumpreise. Limitierte Verfügbarkeit treibt Preise.'
    },
    seasonal: {
      currentMonth: month,
      impact: isQ4 ? 'positive' : isQ1 ? 'negative' : 'neutral',
      description: isQ4
        ? 'Q4 zeigt traditionell höchste Nachfrage (Weihnachtsgeschäft, Jahresboni).'
        : isQ1
        ? 'Nach den Feiertagen normalerweise ruhigere Marktphase.'
        : 'Stabile Nachfrage im Luxusuhrensegment.'
    }
  };
}

/**
 * Generate market context for Vehicles
 */
function getVehicleContext(): MarketContextData {
  const month = getCurrentMonth();
  const quarter = getCurrentQuarter();
  
  // Spring (Q2) and Autumn (Q4) are strong due to registration periods
  const isSpring = quarter === 2;
  const isAutumn = quarter === 4;

  return {
    trend: {
      direction: 'stable',
      percentage: 2.1,
      period: 'YoY (12 Monate)',
      description: 'Sportwagen und Premium-SUVs stabil'
    },
    supplyDemand: {
      status: 'medium',
      label: 'Ausgeglichen',
      description: 'Gutes Angebot bei Premiumfahrzeugen. Preise auf stabilem Niveau.'
    },
    seasonal: {
      currentMonth: month,
      impact: isSpring || isAutumn ? 'positive' : 'neutral',
      description: isSpring
        ? 'Frühjahr: Hauptsaison für Fahrzeugkäufe (Neuregistrierungen).'
        : isAutumn
        ? 'Herbst: Zweite Hauptsaison vor Jahreswechsel.'
        : 'Standard-Nachfrage im Premiumfahrzeugmarkt.'
    }
  };
}

/**
 * Get market context based on asset type
 */
export function getMarketContext(
  assetType: 'real-estate' | 'luxusuhren' | 'fahrzeuge',
  location?: string
): MarketContextData {
  switch (assetType) {
    case 'real-estate':
      return getRealEstateContext(location);
    case 'luxusuhren':
      return getLuxuryWatchContext();
    case 'fahrzeuge':
      return getVehicleContext();
    default:
      throw new Error(`Unknown asset type: ${assetType}`);
  }
}

