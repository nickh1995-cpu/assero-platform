import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { description, assetType } = await request.json();

    if (!description || !assetType) {
      return NextResponse.json(
        { error: 'Description and assetType are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Fallback: Rule-based parsing if no API key
    if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
      console.log('Using rule-based parsing (no OpenAI API key)');
      const parsed = ruleBasedParsing(description, assetType);
      return NextResponse.json({ parsed, method: 'rule-based' });
    }

    // GPT-4 Parsing
    const systemPrompt = getSystemPrompt(assetType);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: description }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const parsedText = data.choices[0]?.message?.content;

    if (!parsedText) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(parsedText);
    return NextResponse.json({ parsed, method: 'gpt-4' });

  } catch (error) {
    console.error('Parse error:', error);
    // Fallback to rule-based parsing on error
    const { description, assetType } = await request.json();
    const parsed = ruleBasedParsing(description, assetType);
    return NextResponse.json({ parsed, method: 'rule-based-fallback' });
  }
}

function getSystemPrompt(assetType: string): string {
  const basePrompt = `Du bist ein Experte für Asset-Bewertungen. Parse die Beschreibung und extrahiere strukturierte Daten als JSON.`;

  const formats = {
    immobilien: `
Beispiel Output:
{
  "area": 90,
  "rooms": 3,
  "location": "München, Schwabing",
  "city": "München",
  "zipCode": null,
  "propertyType": "wohnung",
  "condition": "renovated",
  "floor": 2,
  "hasBalcony": true,
  "hasParking": false,
  "buildYear": null,
  "energyRating": null
}

Wichtig:
- propertyType: "wohnung", "haus", "penthouse", "villa"
- condition: "new", "renovated", "good", "fair"
- Extrahiere Zahlen für area, rooms, floor, buildYear
- Booleans für hasBalcony, hasParking, hasElevator
`,
    luxusuhren: `
Beispiel Output:
{
  "watchBrand": "Rolex",
  "watchModel": "Submariner",
  "watchReference": "116610LN",
  "watchYear": 2018,
  "watchCondition": "very_good",
  "hasBox": true,
  "hasPapers": true,
  "hasServiceHistory": false,
  "isLimitedEdition": false,
  "isUnpolished": false,
  "brandTier": 1
}

Wichtig:
- watchCondition: "mint", "very_good", "good", "fair"
- brandTier: 1 (Patek, Rolex, AP), 2 (Omega, IWC, Cartier), 3 (andere)
- Extrahiere Referenznummer wenn vorhanden
`,
    fahrzeuge: `
Beispiel Output:
{
  "vehicleBrand": "Porsche",
  "vehicleModel": "911 Turbo S",
  "vehicleType": "sportwagen",
  "vehicleYear": 2020,
  "firstRegistration": 2020,
  "mileageKm": 15000,
  "vehicleColor": "schwarz",
  "vehicleCondition": "excellent",
  "previousOwners": 0,
  "isAccidentFree": true,
  "hasServiceBook": true,
  "hasWarranty": false,
  "brandTier": 1
}

Wichtig:
- vehicleType: "sportwagen", "coupe", "cabrio", "suv", "limousine"
- vehicleCondition: "excellent", "good", "used"
- brandTier: 1 (Ferrari, Lamborghini, Porsche), 2 (BMW, Mercedes, Audi), 3 (andere)
`
  };

  return basePrompt + (formats[assetType as keyof typeof formats] || '');
}

// Rule-based parsing as fallback
function ruleBasedParsing(description: string, assetType: string): any {
  const lower = description.toLowerCase();

  if (assetType === 'immobilien') {
    return {
      area: extractNumber(lower, ['m²', 'qm', 'quadratmeter']) || null,
      rooms: extractNumber(lower, ['zimmer', 'zi', '-zimmer']) || null,
      location: extractLocation(description) || null,
      city: extractCity(description) || null,
      propertyType: extractPropertyType(lower),
      condition: extractCondition(lower),
      floor: extractNumber(lower, ['stock', 'etage', 'og']) || null,
      hasBalcony: lower.includes('balkon') || lower.includes('terrasse'),
      hasParking: lower.includes('stellplatz') || lower.includes('garage') || lower.includes('tiefgarage'),
      buildYear: extractYear(description) || null,
      energyRating: null
    };
  }

  if (assetType === 'luxusuhren') {
    return {
      watchBrand: extractWatchBrand(description) || null,
      watchModel: extractAfterBrand(description) || null,
      watchReference: extractReference(description) || null,
      watchYear: extractYear(description) || null,
      watchCondition: extractWatchCondition(lower),
      hasBox: lower.includes('box'),
      hasPapers: lower.includes('papiere') || lower.includes('papers') || lower.includes('zertifikat'),
      hasServiceHistory: lower.includes('service') || lower.includes('revision'),
      isLimitedEdition: lower.includes('limited') || lower.includes('limitiert'),
      isUnpolished: lower.includes('unpoliert') || lower.includes('unpolished'),
      brandTier: detectWatchBrandTier(description)
    };
  }

  if (assetType === 'fahrzeuge') {
    return {
      vehicleBrand: extractVehicleBrand(description) || null,
      vehicleModel: extractAfterBrand(description) || null,
      vehicleType: extractVehicleType(lower),
      vehicleYear: extractYear(description) || null,
      firstRegistration: extractYear(description) || null,
      mileageKm: extractNumber(lower, ['km', 'kilometer']) || null,
      vehicleColor: extractColor(lower) || null,
      vehicleCondition: extractVehicleCondition(lower),
      previousOwners: extractNumber(lower, ['besitzer', 'vorbesitzer', 'hand']) || 0,
      isAccidentFree: lower.includes('unfall') && lower.includes('frei'),
      hasServiceBook: lower.includes('scheckheft') || lower.includes('serviceheft'),
      hasWarranty: lower.includes('garantie') || lower.includes('warranty'),
      brandTier: detectVehicleBrandTier(description)
    };
  }

  return {};
}

// Helper functions
function extractNumber(text: string, keywords: string[]): number | null {
  for (const keyword of keywords) {
    const regex = new RegExp(`(\\d+[\\.,]?\\d*)\\s*${keyword}`, 'i');
    const match = text.match(regex);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
    // Also check for pattern like "3-Zimmer"
    const prefixRegex = new RegExp(`(\\d+)[-\\s]*${keyword}`, 'i');
    const prefixMatch = text.match(prefixRegex);
    if (prefixMatch) {
      return parseInt(prefixMatch[1]);
    }
  }
  return null;
}

function extractYear(text: string): number | null {
  const match = text.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? parseInt(match[1]) : null;
}

function extractLocation(text: string): string | null {
  const match = text.match(/in ([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*)/);
  return match ? match[1] : null;
}

function extractCity(text: string): string | null {
  const cities = ['München', 'Hamburg', 'Berlin', 'Frankfurt', 'Köln', 'Stuttgart', 'Düsseldorf'];
  for (const city of cities) {
    if (text.includes(city)) return city;
  }
  return null;
}

function extractPropertyType(text: string): string {
  if (text.includes('penthouse')) return 'penthouse';
  if (text.includes('villa')) return 'villa';
  if (text.includes('haus')) return 'haus';
  if (text.includes('wohnung')) return 'wohnung';
  return 'wohnung';
}

function extractCondition(text: string): string {
  if (text.includes('neubau') || text.includes('neu')) return 'new';
  if (text.includes('saniert') || text.includes('renoviert')) return 'renovated';
  if (text.includes('gut')) return 'good';
  return 'good';
}

function extractWatchBrand(text: string): string | null {
  const brands = ['Rolex', 'Patek Philippe', 'Audemars Piguet', 'Omega', 'IWC', 'Cartier', 'TAG Heuer'];
  for (const brand of brands) {
    if (text.includes(brand)) return brand;
  }
  return null;
}

function extractVehicleBrand(text: string): string | null {
  const brands = ['Ferrari', 'Lamborghini', 'Porsche', 'Mercedes', 'BMW', 'Audi', 'Bentley', 'Rolls-Royce'];
  for (const brand of brands) {
    if (text.includes(brand)) return brand;
  }
  return null;
}

function extractAfterBrand(text: string): string | null {
  const brands = [
    'Rolex', 'Patek Philippe', 'Audemars Piguet', 'Omega', 'IWC',
    'Ferrari', 'Lamborghini', 'Porsche', 'Mercedes', 'BMW', 'Audi'
  ];
  
  for (const brand of brands) {
    const index = text.indexOf(brand);
    if (index !== -1) {
      const afterBrand = text.substring(index + brand.length).trim();
      const modelMatch = afterBrand.match(/^([A-Za-z0-9\s\-]+)/);
      return modelMatch ? modelMatch[1].trim() : null;
    }
  }
  return null;
}

function extractReference(text: string): string | null {
  const match = text.match(/\b(\d{5,6}[A-Z]*)\b/);
  return match ? match[1] : null;
}

function extractWatchCondition(text: string): string {
  if (text.includes('mint') || text.includes('ungetragen') || text.includes('neu')) return 'mint';
  if (text.includes('sehr gut') || text.includes('top')) return 'very_good';
  if (text.includes('gut')) return 'good';
  return 'good';
}

function extractVehicleType(text: string): string {
  if (text.includes('sportwagen') || text.includes('sport')) return 'sportwagen';
  if (text.includes('cabrio') || text.includes('cabriolet')) return 'cabrio';
  if (text.includes('coupé') || text.includes('coupe')) return 'coupe';
  if (text.includes('suv')) return 'suv';
  if (text.includes('limousine')) return 'limousine';
  return 'sportwagen';
}

function extractVehicleCondition(text: string): string {
  if (text.includes('neuwertig') || text.includes('wie neu')) return 'excellent';
  if (text.includes('gut')) return 'good';
  return 'used';
}

function extractColor(text: string): string | null {
  const colors = ['schwarz', 'weiß', 'silber', 'grau', 'blau', 'rot', 'grün'];
  for (const color of colors) {
    if (text.includes(color)) return color;
  }
  return null;
}

function detectWatchBrandTier(text: string): number {
  if (text.match(/Patek|Rolex|Audemars/i)) return 1;
  if (text.match(/Omega|IWC|Cartier/i)) return 2;
  return 3;
}

function detectVehicleBrandTier(text: string): number {
  if (text.match(/Ferrari|Lamborghini|Porsche/i)) return 1;
  if (text.match(/Mercedes|BMW|Audi/i)) return 2;
  return 3;
}

