/**
 * Geocoding Service using Nominatim (OpenStreetMap)
 * FREE - No API key required
 * Rate limit: 1 request/second
 */

export interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    postcode?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Geocode a German address using Nominatim
 * @param address - Full address or city name
 * @returns Geocoding result or null
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&countrycodes=de&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Assero.io Valuation Platform'
      }
    });
    
    if (!response.ok) {
      console.error('Geocoding failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      return null;
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name,
      address: data[0].address || {}
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Extract city name from geocoding result
 */
export function extractCityFromGeocoding(result: GeocodingResult): string {
  const { address } = result;
  return address.city || address.town || address.village || 'Unbekannt';
}

/**
 * Rate limiter for Nominatim (1 req/sec)
 */
let lastRequestTime = 0;

export async function geocodeWithRateLimit(address: string): Promise<GeocodingResult | null> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < 1000) {
    // Wait to respect rate limit
    await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  return geocodeAddress(address);
}

