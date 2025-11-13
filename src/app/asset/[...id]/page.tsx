import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { safeFunctionCall, safeObjectAccess } from "@/lib/runtime-safety";
import Link from "next/link";

// Generate static params for static export
export async function generateStaticParams() {
  // Return a comprehensive list of asset IDs for static export
  return [
    // Real asset IDs from database
    { id: ["premium-penthouse-001"] },
    { id: ["premium-apartment-002"] },
    { id: ["premium-office-003"] },
    { id: ["premium-house-004"] },
    { id: ["premium-altbau-005"] },
    { id: ["luxury-rolex-001"] },
    { id: ["luxury-patek-002"] },
    { id: ["luxury-porsche-001"] },
    { id: ["luxury-ferrari-002"] },
    // Fallback IDs for compatibility
    { id: ["1"] },
    { id: ["2"] },
    { id: ["3"] },
    { id: ["374e40a8-2ad0-4d88-b544-0c43dab9976e"] },
    { id: ["77092888-10d6-43f6-a877-b5d7ee044e56"] },
    { id: ["acf995f4-22af-47bc-a07c-a9366632c952"] },
    { id: ["9c65a2bf-7c34-4aa9-bc74-b862c5634d63"] },
    { id: ["f2986a41-6c6f-4445-ba66-42aaeb125360"] },
    { id: ["7ab232ca-70ba-4954-aad7-7ee784d970e9"] },
    { id: ["d11c91eb-b793-4fca-bb0a-995189c5cde7"] },
    { id: ["78eec2a7-68e5-429a-8031-4345f14b8471"] },
    { id: ["cc0045b0-a091-42f1-90d2-1f4ebcdb60a3"] },
    { id: ["82a872e6-2f22-4a52-8669-96db76a87939"] },
    // Common test IDs
    { id: ["test"] },
    { id: ["demo"] },
    { id: ["sample"] },
    { id: ["example"] }
  ];
}

type Asset = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  currency: string | null;
  category_id: string;
  metadata?: Record<string, unknown>;
  asset_categories?: { name: string; slug: string };
  property_type?: string;
  condition?: string;
  area_sqm?: number;
  rooms?: number;
  bathrooms?: number;
  year_built?: number;
  yield_pct?: number;
  energy_rating?: string;
  features?: string[];
  images?: any[];
  floor_plan_url?: string;
  virtual_tour_url?: string;
  neighborhood_score?: number;
  investment_grade?: boolean;
  premium_features?: Record<string, unknown>;
};

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string[] }> }) {
  const { id: idArray } = await params;
  const id = idArray?.[0] || 'default'; // Get the first part of the ID array with fallback
  const supabase = await getSupabaseServerClient();
  let asset: Asset | null = null;
  
  // Enhanced fallback data with premium features
  const fallbackAssets: Asset[] = [
    {
      id: "premium-penthouse-001",
      title: "Penthouse am Gendarmenmarkt",
      description: "Exklusives Penthouse mit 360°-Blick über Berlin, hochwertige Ausstattung, private Dachterrasse und Premium-Ausstattung in bester Lage.",
      price: 2450000,
      currency: "EUR",
      category_id: "1",
      property_type: "wohnung",
      condition: "renovated",
      area_sqm: 145,
      rooms: 4,
      bathrooms: 3,
      year_built: 2019,
      yield_pct: 2.8,
      energy_rating: "A",
      features: ["balkon", "garage", "aufzug", "dachterrasse", "concierge"],
      images: [
        { url: "/images/assets/penthouse-NEW.jpg", type: "main", is_primary: true },
        { url: "/images/assets/penthouse-interior.jpg", type: "gallery", is_primary: false },
        { url: "/images/assets/penthouse-terrace.jpg", type: "gallery", is_primary: false }
      ],
      neighborhood_score: 9,
      investment_grade: true,
      premium_features: {
        concierge_service: true,
        private_elevator: true,
        wine_cellar: true,
        home_automation: true
      },
      metadata: {
        location: "Berlin-Mitte",
        features: ["balkon", "garage", "aufzug"]
      },
      asset_categories: { name: "Real Estate", slug: "real-estate" }
    },
    {
      id: "luxury-rolex-001", 
      title: "Rolex Submariner Date",
      description: "Klassische Taucheruhr in exzellentem Zustand. Mit Zertifikat und Originalbox.",
      price: 8500,
      currency: "EUR",
      category_id: "2",
      property_type: "luxusuhren",
      condition: "excellent",
      images: [
        { url: "/images/assets/rolex-submariner-NEW.jpg", type: "main", is_primary: true }
      ],
      metadata: {
        brand: "Rolex",
        model: "Submariner",
        year: 2020,
        condition: "excellent",
        reference: "126610LN",
        movement: "Automatik",
        case_material: "Oystersteel",
        bracelet: "Oyster",
        water_resistance: "300m"
      },
      asset_categories: { name: "Luxusuhren", slug: "luxusuhren" }
    },
    {
      id: "luxury-porsche-001",
      title: "Porsche 911 Turbo S",
      description: "Sportwagen der Extraklasse mit nur 15.000 km. Vollständig dokumentiert und in Top-Zustand.",
      price: 180000,
      currency: "EUR", 
      category_id: "3",
      property_type: "fahrzeuge",
      condition: "excellent",
      images: [
        { url: "/images/assets/100900_Marco-Porsche-992-Turbo-S_6_klein.webp", type: "main", is_primary: true }
      ],
      metadata: {
        brand: "Porsche",
        model: "911 Turbo S",
        year: 2021,
        mileage: 15000,
        condition: "excellent",
        engine: "3.8L Twin-Turbo",
        power: "650 PS",
        transmission: "PDK",
        fuel_type: "Benzin",
        color: "Carrara White Metallic"
      },
      asset_categories: { name: "Fahrzeuge", slug: "fahrzeuge" }
    },
    {
      id: "premium-apartment-002",
      title: "Neubau-Eigentumswohnung München Schwabing",
      description: "Moderne 3-Zimmer-Wohnung in Top-Lage, Neubau 2024, hochwertige Ausstattung und exzellente Verkehrsanbindung.",
      price: 890000,
      currency: "EUR",
      category_id: "1",
      property_type: "wohnung",
      condition: "new",
      area_sqm: 85,
      rooms: 3,
      bathrooms: 2,
      year_built: 2024,
      yield_pct: 3.2,
      energy_rating: "A+",
      features: ["balkon", "garage", "aufzug", "smart_home"],
      images: [
        { url: "/images/assets/eigentumswohnung-NEW.jpg", type: "main", is_primary: true }
      ],
      neighborhood_score: 8,
      investment_grade: true,
      premium_features: {
        smart_home: true,
        concierge_service: false
      },
      metadata: {
        location: "München-Schwabing",
        features: ["balkon", "garage", "aufzug"]
      },
      asset_categories: { name: "Real Estate", slug: "real-estate" }
    },
    {
      id: "premium-office-003",
      title: "Bürogebäude Frankfurt Innenstadt",
      description: "Renditeobjekt in bester Lage, voll vermietet, stabile Mieteinnahmen, Aufzug und moderne Ausstattung.",
      price: 3200000,
      currency: "EUR",
      category_id: "1",
      property_type: "gewerbe",
      condition: "renovated",
      area_sqm: 850,
      rooms: 12,
      bathrooms: 4,
      year_built: 2015,
      yield_pct: 4.2,
      energy_rating: "B",
      features: ["aufzug", "garage", "keller", "concierge"],
      images: [
        { url: "/images/assets/schillerportal-frankfurt-NEW.jpg", type: "main", is_primary: true }
      ],
      neighborhood_score: 9,
      investment_grade: true,
      premium_features: {
        concierge_service: true,
        smart_home: false
      },
      metadata: {
        location: "Frankfurt-Innenstadt",
        features: ["aufzug", "garage", "keller"]
      },
      asset_categories: { name: "Real Estate", slug: "real-estate" }
    },
    {
      id: "premium-house-004",
      title: "Reihenhaus Hamburg Eppendorf",
      description: "Charmantes Reihenhaus mit Garten, ruhige Lage, renovierungsbedürftig aber mit großem Potential.",
      price: 650000,
      currency: "EUR",
      category_id: "1",
      property_type: "haus",
      condition: "needs_work",
      area_sqm: 120,
      rooms: 5,
      bathrooms: 2,
      year_built: 1985,
      yield_pct: 2.8,
      energy_rating: "D",
      features: ["garten", "keller", "garage"],
      images: [
        { url: "/images/assets/eppendorf-stadhaus-NEW.jpg", type: "main", is_primary: true }
      ],
      neighborhood_score: 7,
      investment_grade: false,
      premium_features: {
        smart_home: false,
        concierge_service: false
      },
      metadata: {
        location: "Hamburg-Eppendorf",
        features: ["garten", "keller", "garage"]
      },
      asset_categories: { name: "Real Estate", slug: "real-estate" }
    },
    {
      id: "premium-altbau-005",
      title: "Altbau-Wohnung Berlin Prenzlauer Berg",
      description: "Charaktervolle Altbauwohnung mit Stuck, hohe Decken, zentral gelegen, Balkon und viel Charme.",
      price: 420000,
      currency: "EUR",
      category_id: "1",
      property_type: "wohnung",
      condition: "renovated",
      area_sqm: 65,
      rooms: 2,
      bathrooms: 1,
      year_built: 1910,
      yield_pct: 3.8,
      energy_rating: "C",
      features: ["balkon", "stuck", "hohe_decken"],
      images: [
        { url: "/images/assets/altbau-wohnung-NEW.jpg", type: "main", is_primary: true }
      ],
      neighborhood_score: 8,
      investment_grade: true,
      premium_features: {
        smart_home: false,
        concierge_service: false
      },
      metadata: {
        location: "Berlin-Prenzlauer Berg",
        features: ["balkon", "stuck", "hohe_decken"]
      },
      asset_categories: { name: "Real Estate", slug: "real-estate" }
    },
    {
      id: "luxury-patek-002",
      title: "Patek Philippe Calatrava",
      description: "Elegante Dresswatch von Patek Philippe, limitierte Auflage, mit Zertifikat.",
      price: 25000,
      currency: "EUR",
      category_id: "2",
      property_type: "luxusuhren",
      condition: "excellent",
      images: [
        { url: "/images/assets/rolex-submariner-NEW.jpg", type: "main", is_primary: true }
      ],
      metadata: {
        brand: "Patek Philippe",
        model: "Calatrava",
        year: 2019,
        condition: "excellent",
        reference: "5196P",
        movement: "Handaufzug",
        case_material: "Platin",
        dial: "Silber",
        complications: "Datum"
      },
      asset_categories: { name: "Luxusuhren", slug: "luxusuhren" }
    },
    {
      id: "luxury-ferrari-002",
      title: "Ferrari 488 GTB",
      description: "Italienischer Supercar mit nur 8.000 km, vollständige Service-Historie, seltene Farbe.",
      price: 280000,
      currency: "EUR",
      category_id: "3",
      property_type: "fahrzeuge",
      condition: "excellent",
      images: [
        { url: "/images/assets/100900_Marco-Porsche-992-Turbo-S_6_klein.webp", type: "main", is_primary: true }
      ],
      metadata: {
        brand: "Ferrari",
        model: "488 GTB",
        year: 2018,
        mileage: 8000,
        condition: "excellent",
        engine: "3.9L V8 Twin-Turbo",
        power: "670 PS",
        transmission: "7-Gang F1",
        fuel_type: "Benzin",
        color: "Rosso Corsa",
        acceleration: "3.0s (0-100 km/h)"
      },
      asset_categories: { name: "Fahrzeuge", slug: "fahrzeuge" }
    }
  ];

  // Default fallback asset for any ID
  const defaultFallbackAsset: Asset = {
    id: id,
    title: "Premium Immobilie",
    description: "Exklusive Immobilie in bester Lage mit hochwertiger Ausstattung und modernen Standards.",
    price: 1500000,
    currency: "EUR",
    category_id: "1",
    property_type: "wohnung",
    condition: "excellent",
    area_sqm: 120,
    rooms: 3,
    bathrooms: 2,
    year_built: 2020,
    yield_pct: 3.5,
    energy_rating: "A",
    features: ["balkon", "garage", "aufzug"],
    images: [
      { url: "/images/assets/penthouse-NEW.jpg", type: "main", is_primary: true }
    ],
    neighborhood_score: 8,
    investment_grade: true,
    premium_features: {
      smart_home: true,
      concierge_service: true
    },
    metadata: {
      location: "Deutschland",
      features: ["balkon", "garage", "aufzug"]
    },
    asset_categories: { name: "Real Estate", slug: "real-estate" }
  };
  
  // First try to find in fallback assets (for static export)
  asset = fallbackAssets.find(a => a.id === id);
  
  // If not found in fallback, try Supabase
  if (!asset && supabase) {
    try {
      const { data } = await supabase
        .from("assets")
        .select(`
          id, title, description, price, currency, category_id, metadata,
          property_type, condition, area_sqm, rooms, bathrooms, year_built,
          yield_pct, energy_rating, features, images, floor_plan_url,
          virtual_tour_url, neighborhood_score, investment_grade, premium_features,
          asset_categories:category_id (name, slug)
        `)
        .eq("id", id)
        .eq("status", "active")
        .maybeSingle();
      
      if (data) {
        asset = {
          ...data,
          asset_categories: Array.isArray(data.asset_categories) ? data.asset_categories[0] : data.asset_categories
        } as Asset;
      }
    } catch (error) {
      console.warn("Error fetching asset from Supabase:", error);
    }
  }
  
  // Final fallback - use default asset with the requested ID
  if (!asset) {
    asset = { ...defaultFallbackAsset, id: id };
  }

  const formatPrice = (price: number | null, currency: string | null) => {
    if (!price) return "Preis auf Anfrage";
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency || "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Enhanced image logic with fallbacks
  const getImageSrc = (asset: Asset) => {
    // Check for images array first
    if (asset.images && asset.images.length > 0) {
      const primaryImage = asset.images.find(img => img.is_primary) || asset.images[0];
      return primaryImage.url;
    }
    
    // Check metadata image
    if (asset.metadata?.image && typeof asset.metadata.image === 'string' && !asset.metadata.image.includes("/api/image-proxy")) {
      return asset.metadata.image;
    }
    
    // Fallback to title-based logic with correct paths
    if (asset.title?.toLowerCase().includes("penthouse") || asset.title?.toLowerCase().includes("gendarmenmarkt")) {
      return "/images/assets/penthouse-NEW.jpg";
    } else if (asset.title?.toLowerCase().includes("porsche") || asset.title?.toLowerCase().includes("911")) {
      return "/images/assets/100900_Marco-Porsche-992-Turbo-S_6_klein.webp";
    } else if (asset.title?.toLowerCase().includes("rolex") || asset.title?.toLowerCase().includes("submariner")) {
      return "/images/assets/rolex-submariner-NEW.jpg";
    } else if (asset.title?.toLowerCase().includes("eigentum") || asset.title?.toLowerCase().includes("neubau")) {
      return "/images/assets/eigentumswohnung-NEW.jpg";
    } else if (asset.title?.toLowerCase().includes("altbau")) {
      return "/images/assets/altbau-wohnung-NEW.jpg";
    } else if (asset.title?.toLowerCase().includes("eppendorf") || asset.title?.toLowerCase().includes("reihenhaus")) {
      return "/images/assets/eppendorf-stadhaus-NEW.jpg";
    } else if (asset.title?.toLowerCase().includes("frankfurt") || asset.title?.toLowerCase().includes("bürogebäude")) {
      return "/images/assets/schillerportal-frankfurt-NEW.jpg";
    }
    
    return null;
  };

  const imageSrc = getImageSrc(asset);
  const isRealEstate = asset.asset_categories?.slug === "real-estate";

  return (
    <main className="premium-listing-page">
      <Header />
      
      <div className="premium-listing-container">
        {/* Prominent Back Button */}
        <div className="back-navigation-section">
          <Link href="/browse" className="back-button-prominent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Zurück zur Übersicht</span>
          </Link>
        </div>

        {/* Premium Breadcrumb with Back Navigation */}
        <nav className="premium-breadcrumb">
          <Link href="/browse" className="breadcrumb-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Zurück zur Übersicht</span>
          </Link>
          <div className="breadcrumb-separator">›</div>
          <Link href={`/browse/${asset.asset_categories?.slug || 'real-estate'}`} className="breadcrumb-category">
            {asset.asset_categories?.name || 'Real Estate'}
          </Link>
          <div className="breadcrumb-separator">›</div>
          <span className="breadcrumb-current">{asset.title}</span>
        </nav>

        {/* Premium Property Header */}
        <div className="premium-property-header">
          <div className="property-badges">
            {asset.investment_grade && (
              <span className="badge-premium investment-grade">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Investment Grade
              </span>
            )}
            {asset.condition && (
              <span className={`badge-premium condition-${asset.condition}`}>
                {asset.condition === "new" ? "NEUBAU" : 
                 asset.condition === "renovated" ? "SANIERT" : 
                 asset.condition === "excellent" ? "EXZELLENT" : "RENOVIERUNGSBEDÜRFTIG"}
              </span>
            )}
            {asset.energy_rating && (
              <span className="badge-premium energy-rating">
                Energieeffizienz {asset.energy_rating}
              </span>
            )}
          </div>
          
          <h1 className="premium-property-title">{asset.title}</h1>
          
          <div className="property-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{asset.metadata?.location || "Standort auf Anfrage"}</span>
            {asset.neighborhood_score && (
              <span className="neighborhood-score">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {asset.neighborhood_score}/10
              </span>
            )}
          </div>
        </div>

        {/* Premium Image Gallery */}
        <div className="premium-image-gallery">
          <div className="main-image-container">
            {imageSrc ? (
              <img 
                src={imageSrc} 
                alt={asset.title}
                className="main-property-image"
              />
            ) : (
              <div className="image-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                <span>Bild wird geladen...</span>
              </div>
            )}
            
            {/* Image overlay actions */}
            <div className="image-overlay-actions">
              <button className="overlay-action-btn" title="Vergrößern">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                  <line x1="11" y1="8" x2="11" y2="14"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </button>
              <button className="overlay-action-btn" title="Zu Favoriten">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              <button className="overlay-action-btn" title="Teilen">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Thumbnail gallery */}
          {asset.images && asset.images.length > 1 && (
            <div className="thumbnail-gallery">
              {asset.images.slice(0, 4).map((img, index) => (
                <div key={index} className="thumbnail-item">
                  <img src={img.url} alt={`${asset.title} - Bild ${index + 1}`} />
                </div>
              ))}
              {asset.images.length > 4 && (
                <div className="thumbnail-more">
                  <span>+{asset.images.length - 4}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Premium Content Grid */}
        <div className="premium-content-grid">
          {/* Main Content */}
          <div className="premium-main-content">
            {/* Price Section */}
            <div className="premium-price-section">
              <div className="price-display">
                <span className="price-amount">{formatPrice(asset.price, asset.currency)}</span>
                {isRealEstate && asset.yield_pct && (
                  <span className="yield-indicator">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                    {asset.yield_pct}% Rendite
                  </span>
                )}
              </div>
              <div className="price-details">
                {isRealEstate && asset.area_sqm && (
                  <span className="price-per-sqm">
                    {new Intl.NumberFormat("de-DE", {
                      style: "currency",
                      currency: "EUR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format((asset.price || 0) / asset.area_sqm)}/m²
                  </span>
                )}
                {asset.asset_categories?.slug === "fahrzeuge" && asset.metadata?.mileage && (
                  <span className="price-per-sqm">
                    {new Intl.NumberFormat("de-DE").format(asset.metadata.mileage)} km
                  </span>
                )}
              </div>
            </div>

            {/* Property Details */}
            {isRealEstate && (
              <div className="premium-property-details">
                <h3>Immobiliendetails</h3>
                <div className="details-grid">
                  {asset.area_sqm && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <path d="M9 9h6v6H9z"/>
                        </svg>
                      </div>
                      <div className="detail-content">
                        <span className="detail-value">{asset.area_sqm} m²</span>
                        <span className="detail-label">Wohnfläche</span>
                      </div>
                    </div>
                  )}
                  
                  {asset.rooms && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>
                        </svg>
                      </div>
                      <div className="detail-content">
                        <span className="detail-value">{asset.rooms}</span>
                        <span className="detail-label">Zimmer</span>
                      </div>
                    </div>
                  )}
                  
                  {asset.bathrooms && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>
                        </svg>
                      </div>
                      <div className="detail-content">
                        <span className="detail-value">{asset.bathrooms}</span>
                        <span className="detail-label">Badezimmer</span>
                      </div>
                    </div>
                  )}
                  
                  {asset.year_built && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                      </div>
                      <div className="detail-content">
                        <span className="detail-value">{asset.year_built}</span>
                        <span className="detail-label">Baujahr</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Luxury Watch Details */}
            {asset.asset_categories?.slug === "luxusuhren" && (
              <div className="premium-property-details">
                <h3>Uhr-Details</h3>
                <div className="details-grid">
                  {asset.metadata?.brand && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                      </div>
                      <div className="detail-content">
                        <span className="detail-value">{asset.metadata.brand}</span>
                        <span className="detail-label">Marke</span>
                      </div>
                    </div>
                  )}
                  
                  {asset.metadata?.model && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        </svg>
                      </div>
                      <div className="detail-content">
                        <span className="detail-value">{asset.metadata.model}</span>
                        <span className="detail-label">Modell</span>
                      </div>
                    </div>
                  )}
                  
                  {asset.metadata?.year && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                      </div>
                      <div className="detail-content">
                        <span className="detail-value">{asset.metadata.year}</span>
                        <span className="detail-label">Baujahr</span>
                      </div>
                    </div>
                  )}
                  
                  {asset.metadata?.reference && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                        </svg>
                      </div>
                      <div className="detail-content">
                        <span className="detail-value">{asset.metadata.reference}</span>
                        <span className="detail-label">Referenz</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vehicle Details */}
            {asset.asset_categories?.slug === "fahrzeuge" && (
              <div className="premium-property-details">
                <h3>Fahrzeug-Details</h3>
                <div className="details-grid">
                  {asset.metadata?.brand && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10h-2l-1.5 1.1c-.8.2-1.5 1-1.5 1.9v3c0 .6.4 1 1 1h2"/>
                          <path d="M5 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L4 10H2l-1.5 1.1C-.3 11.3-1 12.1-1 13v3c0 .6.4 1 1 1h2"/>
                        </svg>
                      </div>
                      <div className="detail-content">
                        <span className="detail-value">{asset.metadata.brand}</span>
                        <span className="detail-label">Marke</span>
                      </div>
                    </div>
                  )}
                  
                  {asset.metadata?.model && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        </svg>
                      </div>
                      <div className="detail-content">
                        <span className="detail-value">{asset.metadata.model}</span>
                        <span className="detail-label">Modell</span>
                      </div>
                    </div>
                  )}
                  
                  {asset.metadata?.year && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                      </div>
                      <div className="detail-content">
                        <span className="detail-value">{asset.metadata.year}</span>
                        <span className="detail-label">Baujahr</span>
                      </div>
                    </div>
                  )}
                  
                  {asset.metadata?.mileage && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <div className="detail-content">
                        <span className="detail-value">{new Intl.NumberFormat("de-DE").format(asset.metadata.mileage)} km</span>
                        <span className="detail-label">Kilometerstand</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Features Section */}
            {asset.features && asset.features.length > 0 && (
              <div className="premium-features-section">
                <h3>Ausstattung & Features</h3>
                <div className="features-grid">
                  {asset.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4"/>
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                      <span>{feature.charAt(0).toUpperCase() + feature.slice(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Premium Features */}
            {asset.premium_features && Object.keys(asset.premium_features).length > 0 && (
              <div className="premium-luxury-features">
                <h3>Premium Ausstattung</h3>
                <div className="luxury-features-grid">
                  {Object.entries(asset.premium_features).map(([key, value]) => 
                    value ? (
                      <div key={key} className="luxury-feature-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="premium-description">
              <h3>Beschreibung</h3>
              <p>{asset.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="premium-sidebar">
            {/* Contact Actions */}
            <div className="contact-actions-card">
              <h4>Interesse geweckt?</h4>
              <p>Kontaktieren Sie uns für eine persönliche Beratung und Besichtigungstermin.</p>
              
              <div className="action-buttons">
                <button className="btn-premium btn-primary btn-full">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Anfrage senden
                </button>
                
                <button className="btn-premium btn-secondary btn-full">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  Zu Favoriten
                </button>
                
                <button className="btn-premium btn-outline btn-full">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Teilen
                </button>
              </div>
            </div>

            {/* Investment Analysis */}
            {isRealEstate && asset.yield_pct && (
              <div className="investment-analysis-card">
                <h4>Investment Analyse</h4>
                <div className="analysis-metrics">
                  <div className="metric-item">
                    <span className="metric-label">Rendite</span>
                    <span className="metric-value">{asset.yield_pct}%</span>
                  </div>
                  {asset.area_sqm && asset.price && (
                    <div className="metric-item">
                      <span className="metric-label">Preis/m²</span>
                      <span className="metric-value">
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(asset.price / asset.area_sqm)}
                      </span>
                    </div>
                  )}
                  {asset.neighborhood_score && (
                    <div className="metric-item">
                      <span className="metric-label">Lage-Score</span>
                      <span className="metric-value">{asset.neighborhood_score}/10</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Virtual Tour */}
            {asset.virtual_tour_url && (
              <div className="virtual-tour-card">
                <h4>Virtueller Rundgang</h4>
                <p>Erkunden Sie die Immobilie in 360°</p>
                <button className="btn-premium btn-outline btn-full">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polygon points="12,6 12,12 16,14"/>
                  </svg>
                  Rundgang starten
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
