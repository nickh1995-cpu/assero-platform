// Mock data for comparable assets
// Later replace with real database queries

export type ComparableAsset = {
  id: string;
  type: "real-estate" | "luxusuhren" | "fahrzeuge";
  title: string;
  price: number;
  image?: string;
  specs: Record<string, string | number>;
  location?: string;
  similarity: number; // 0-100%
  listingUrl?: string;
};

// Real Estate Comparables
const realEstateComps: ComparableAsset[] = [
  {
    id: "re-1",
    type: "real-estate",
    title: "3-Zimmer Wohnung, Altstadt",
    price: 520000,
    image: "/placeholder-property.jpg",
    specs: {
      "Fläche": "95 m²",
      "Zimmer": 3,
      "Zustand": "Renoviert",
      "Lage": "Toplage"
    },
    location: "München, Altstadt",
    similarity: 94,
    listingUrl: "/browse/re-1"
  },
  {
    id: "re-2",
    type: "real-estate",
    title: "4-Zimmer Maisonette, Zentrum",
    price: 580000,
    image: "/placeholder-property.jpg",
    specs: {
      "Fläche": "110 m²",
      "Zimmer": 4,
      "Zustand": "Neubau",
      "Lage": "Toplage"
    },
    location: "München, Maxvorstadt",
    similarity: 87,
    listingUrl: "/browse/re-2"
  },
  {
    id: "re-3",
    type: "real-estate",
    title: "3.5-Zimmer Wohnung, Schwabing",
    price: 495000,
    image: "/placeholder-property.jpg",
    specs: {
      "Fläche": "92 m²",
      "Zimmer": 3.5,
      "Zustand": "Renoviert",
      "Lage": "Gute Lage"
    },
    location: "München, Schwabing",
    similarity: 91,
    listingUrl: "/browse/re-3"
  },
  {
    id: "re-4",
    type: "real-estate",
    title: "3-Zimmer Penthouse, Altbau",
    price: 615000,
    image: "/placeholder-property.jpg",
    specs: {
      "Fläche": "105 m²",
      "Zimmer": 3,
      "Zustand": "Neubau",
      "Lage": "Toplage"
    },
    location: "München, Lehel",
    similarity: 89,
    listingUrl: "/browse/re-4"
  },
  {
    id: "re-5",
    type: "real-estate",
    title: "2.5-Zimmer Wohnung, Haidhausen",
    price: 445000,
    image: "/placeholder-property.jpg",
    specs: {
      "Fläche": "88 m²",
      "Zimmer": 2.5,
      "Zustand": "Renoviert",
      "Lage": "Gute Lage"
    },
    location: "München, Haidhausen",
    similarity: 82,
    listingUrl: "/browse/re-5"
  }
];

// Luxury Watches Comparables
const watchComps: ComparableAsset[] = [
  {
    id: "watch-1",
    type: "luxusuhren",
    title: "Rolex Submariner Date 41mm",
    price: 12500,
    image: "/placeholder-watch.jpg",
    specs: {
      "Marke": "Rolex",
      "Modell": "Submariner",
      "Zustand": "Sehr gut",
      "Full Set": "Ja"
    },
    similarity: 96,
    listingUrl: "/browse/watch-1"
  },
  {
    id: "watch-2",
    type: "luxusuhren",
    title: "Omega Seamaster Diver 300M",
    price: 4800,
    image: "/placeholder-watch.jpg",
    specs: {
      "Marke": "Omega",
      "Modell": "Seamaster",
      "Zustand": "Mint",
      "Full Set": "Ja"
    },
    similarity: 88,
    listingUrl: "/browse/watch-2"
  },
  {
    id: "watch-3",
    type: "luxusuhren",
    title: "Rolex Datejust 41",
    price: 10200,
    image: "/placeholder-watch.jpg",
    specs: {
      "Marke": "Rolex",
      "Modell": "Datejust",
      "Zustand": "Sehr gut",
      "Full Set": "Nein"
    },
    similarity: 92,
    listingUrl: "/browse/watch-3"
  },
  {
    id: "watch-4",
    type: "luxusuhren",
    title: "IWC Portugieser Chronograph",
    price: 8900,
    image: "/placeholder-watch.jpg",
    specs: {
      "Marke": "IWC",
      "Modell": "Portugieser",
      "Zustand": "Mint",
      "Full Set": "Ja"
    },
    similarity: 85,
    listingUrl: "/browse/watch-4"
  },
  {
    id: "watch-5",
    type: "luxusuhren",
    title: "Rolex Explorer II 42mm",
    price: 11800,
    image: "/placeholder-watch.jpg",
    specs: {
      "Marke": "Rolex",
      "Modell": "Explorer II",
      "Zustand": "Sehr gut",
      "Full Set": "Ja"
    },
    similarity: 90,
    listingUrl: "/browse/watch-5"
  }
];

// Vehicle Comparables
const vehicleComps: ComparableAsset[] = [
  {
    id: "vehicle-1",
    type: "fahrzeuge",
    title: "Porsche 911 Carrera S",
    price: 95000,
    image: "/placeholder-car.jpg",
    specs: {
      "Marke": "Porsche",
      "Modell": "911 Carrera S",
      "Baujahr": 2021,
      "Kilometerstand": "25.000 km",
      "Zustand": "Sehr gut"
    },
    location: "München",
    similarity: 93,
    listingUrl: "/browse/vehicle-1"
  },
  {
    id: "vehicle-2",
    type: "fahrzeuge",
    title: "BMW M4 Competition",
    price: 78000,
    image: "/placeholder-car.jpg",
    specs: {
      "Marke": "BMW",
      "Modell": "M4 Competition",
      "Baujahr": 2022,
      "Kilometerstand": "18.000 km",
      "Zustand": "Neuwertig"
    },
    location: "Stuttgart",
    similarity: 87,
    listingUrl: "/browse/vehicle-2"
  },
  {
    id: "vehicle-3",
    type: "fahrzeuge",
    title: "Porsche Cayenne Turbo",
    price: 92000,
    image: "/placeholder-car.jpg",
    specs: {
      "Marke": "Porsche",
      "Modell": "Cayenne Turbo",
      "Baujahr": 2021,
      "Kilometerstand": "32.000 km",
      "Zustand": "Sehr gut"
    },
    location: "Hamburg",
    similarity: 90,
    listingUrl: "/browse/vehicle-3"
  },
  {
    id: "vehicle-4",
    type: "fahrzeuge",
    title: "Mercedes-AMG GT 63 S",
    price: 105000,
    image: "/placeholder-car.jpg",
    specs: {
      "Marke": "Mercedes-AMG",
      "Modell": "GT 63 S",
      "Baujahr": 2022,
      "Kilometerstand": "15.000 km",
      "Zustand": "Neuwertig"
    },
    location: "München",
    similarity: 88,
    listingUrl: "/browse/vehicle-4"
  },
  {
    id: "vehicle-5",
    type: "fahrzeuge",
    title: "Audi RS6 Avant",
    price: 89000,
    image: "/placeholder-car.jpg",
    specs: {
      "Marke": "Audi",
      "Modell": "RS6 Avant",
      "Baujahr": 2021,
      "Kilometerstand": "28.000 km",
      "Zustand": "Sehr gut"
    },
    location: "Frankfurt",
    similarity: 85,
    listingUrl: "/browse/vehicle-5"
  }
];

// Get comparables by asset type
export function getComparables(
  assetType: "real-estate" | "luxusuhren" | "fahrzeuge",
  userEstimate?: number,
  limit: number = 5
): ComparableAsset[] {
  let comps: ComparableAsset[] = [];
  
  switch (assetType) {
    case "real-estate":
      comps = [...realEstateComps];
      break;
    case "luxusuhren":
      comps = [...watchComps];
      break;
    case "fahrzeuge":
      comps = [...vehicleComps];
      break;
  }

  // Sort by similarity (highest first)
  comps.sort((a, b) => b.similarity - a.similarity);

  // Take top N
  return comps.slice(0, limit);
}

// Calculate price distribution statistics
export function getPriceDistribution(
  assetType: "real-estate" | "luxusuhren" | "fahrzeuge",
  userEstimate: number
) {
  const comps = getComparables(assetType, userEstimate, 20);
  const prices = comps.map(c => c.price);
  
  prices.push(userEstimate); // Include user's estimate
  prices.sort((a, b) => a - b);

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const median = prices[Math.floor(prices.length / 2)];

  // Calculate percentile
  const userIndex = prices.indexOf(userEstimate);
  const percentile = Math.round((userIndex / prices.length) * 100);

  return {
    min,
    max,
    avg: Math.round(avg),
    median: Math.round(median),
    percentile,
    priceRange: {
      low: Math.round(avg * 0.85),
      mid: Math.round(avg),
      high: Math.round(avg * 1.15)
    }
  };
}

