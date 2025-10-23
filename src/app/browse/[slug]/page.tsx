import { getSupabaseServerClient } from "@/lib/supabase/server";
import { FilterToggle } from "@/components/FilterToggle";
import { Header } from "@/components/Header";
import { LazyRealEstateFilters } from "@/components/LazyRealEstateFilters";
import { PremiumPropertyCard } from "@/components/PremiumPropertyCard";
import Link from "next/link";
// import Image from "next/image"; // Disabled for static export

// Generate static params for static export
export async function generateStaticParams() {
  // Return common category slugs for static export
  return [
    { slug: 'real-estate' },
    { slug: 'luxusuhren' },
    { slug: 'fahrzeuge' }
  ];
}

type Asset = {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  currency: string | null;
  metadata?: Record<string, unknown>;
};

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Validate slug parameter
  if (!slug || typeof slug !== 'string') {
    return (
      <main className="with-header-offset theme-light">
        <Header />
        <div className="section">
          <div className="container">
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <h1>Kategorie nicht gefunden</h1>
              <p>Die angeforderte Kategorie konnte nicht gefunden werden.</p>
              <Link href="/browse" className="btn btn-primary">Zurück zur Übersicht</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }
  const sp: SearchParams = {};
  const supabase = await getSupabaseServerClient();
  let category = null;
  let assets: Asset[] = [];
  let totalCount = 0;
  
  // Define variables outside the try-catch block
  const q = (sp?.q as string) ?? "";
  const minPrice = Number(sp?.min ?? "");
  const maxPrice = Number(sp?.max ?? "");
  const sort = (sp?.sort as string) ?? "new"; // new|price_asc|price_desc
  const page = Math.max(1, Number(sp?.page ?? 1));
  const limit = 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let count = 0;

  // Fallback data for when Supabase is not available
  const fallbackAssets: Asset[] = [
    {
      id: "premium-penthouse-001",
      title: "Penthouse am Gendarmenmarkt",
      description: "Exklusives Penthouse mit 360°-Blick über Berlin, hochwertige Ausstattung, private Dachterrasse und Premium-Ausstattung in bester Lage.",
      price: 2450000,
      currency: "EUR",
      category_id: "1",
      area_sqm: 145,
      rooms: 4,
      bathrooms: 2,
      year_built: 2018,
      yield_pct: 4.2,
      energy_rating: "A+",
      condition: "renovated",
      investment_grade: true,
      metadata: {
        location: "Berlin-Mitte",
        property_type: "wohnung",
        features: ["balkon", "garage", "aufzug", "terrasse", "keller"]
      }
    },
    {
      id: "premium-apartment-002",
      title: "Neubau-Eigentumswohnung München Schwabing",
      description: "Moderne 3-Zimmer-Wohnung in Top-Lage, Neubau 2024, hochwertige Ausstattung und exzellente Verkehrsanbindung.",
      price: 890000,
      currency: "EUR",
      category_id: "1",
      area_sqm: 85,
      rooms: 3,
      bathrooms: 1,
      year_built: 2024,
      yield_pct: 3.8,
      energy_rating: "A++",
      condition: "new",
      investment_grade: true,
      metadata: {
        location: "München-Schwabing",
        property_type: "wohnung",
        features: ["balkon", "garage", "aufzug", "terrasse"]
      }
    },
    {
      id: "premium-office-003",
      title: "Bürogebäude Frankfurt Innenstadt",
      description: "Renditeobjekt in bester Lage, voll vermietet, stabile Mieteinnahmen, Aufzug und moderne Ausstattung.",
      price: 3200000,
      currency: "EUR",
      category_id: "1",
      metadata: {
        location: "Frankfurt-Innenstadt",
        area_sqm: 850,
        rooms: "12",
        condition: "renovated",
        property_type: "gewerbe",
        features: ["aufzug", "garage", "keller"]
      }
    },
    {
      id: "luxury-rolex-001",
      title: "Rolex Submariner Date",
      description: "Klassische Taucheruhr in exzellentem Zustand. Mit Zertifikat und Originalbox.",
      price: 8500,
      currency: "EUR",
      category_id: "2",
      metadata: {
        brand: "Rolex",
        model: "Submariner Date",
        year: 2020,
        condition: "excellent",
        case_size: "41",
        movement: "Automatik",
        material: "Edelstahl",
        water_resistance: "300m",
        location: "München"
      }
    },
    {
      id: "luxury-porsche-001",
      title: "Porsche 911 Turbo S",
      description: "Sportwagen der Extraklasse mit nur 15.000 km. Vollständig dokumentiert und in Top-Zustand.",
      price: 180000,
      currency: "EUR", 
      category_id: "3",
      metadata: {
        brand: "Porsche",
        model: "911 Turbo S",
        year: 2021,
        mileage: 15000,
        condition: "excellent",
        power_hp: 650,
        fuel_type: "Benzin",
        transmission: "PDK",
        color: "Schwarz",
        location: "Stuttgart"
      }
    },
    {
      id: "luxury-patek-002",
      title: "Patek Philippe Calatrava",
      description: "Elegante Dresswatch von Patek Philippe. Mit Originalzertifikat und Box. Perfekter Zustand.",
      price: 18500,
      currency: "EUR",
      category_id: "2",
      metadata: {
        brand: "Patek Philippe",
        model: "Calatrava 5196P",
        year: 2019,
        condition: "excellent",
        case_size: "37",
        movement: "Handaufzug",
        material: "Platin",
        location: "Zürich"
      }
    },
    {
      id: "luxury-ferrari-002",
      title: "Ferrari 488 GTB",
      description: "Italienischer Sportwagen mit nur 8.500 km. Vollständige Service-Historie und Garantie.",
      price: 220000,
      currency: "EUR",
      category_id: "3",
      metadata: {
        brand: "Ferrari",
        model: "488 GTB",
        year: 2020,
        mileage: 8500,
        condition: "excellent",
        power_hp: 670,
        fuel_type: "Benzin",
        transmission: "F1",
        color: "Rosso Corsa",
        location: "Maranello"
      }
    },
    // Additional premium assets
    {
      id: "premium-house-004",
      title: "Reihenhaus Hamburg Eppendorf",
      description: "Charmantes Reihenhaus mit Garten, ruhige Lage, renovierungsbedürftig aber mit großem Potential.",
      price: 650000,
      currency: "EUR",
      category_id: "1",
      metadata: {
        location: "Hamburg-Eppendorf",
        area_sqm: 120,
        rooms: "5",
        condition: "needs_work",
        property_type: "haus",
        features: ["garten", "keller", "garage"]
      }
    },
    {
      id: "premium-altbau-005",
      title: "Altbau-Wohnung Berlin Prenzlauer Berg",
      description: "Charaktervolle Altbauwohnung mit Stuck, hohe Decken, zentral gelegen, Balkon und viel Charme.",
      price: 420000,
      currency: "EUR",
      category_id: "1",
      metadata: {
        location: "Berlin-Prenzlauer Berg",
        area_sqm: 65,
        rooms: "2",
        condition: "renovated",
        property_type: "wohnung",
        features: ["balkon", "stuck", "hohe_decken"]
      }
    },
    {
      id: "luxury-patek-002",
      title: "Patek Philippe Calatrava",
      description: "Elegante Dresswatch von Patek Philippe, limitierte Auflage, mit Zertifikat.",
      price: 25000,
      currency: "EUR",
      category_id: "2",
      metadata: {
        brand: "Patek Philippe",
        model: "Calatrava",
        year: 2019,
        condition: "excellent"
      }
    },
    {
      id: "luxury-ferrari-002",
      title: "Ferrari 488 GTB",
      description: "Italienischer Supercar mit nur 8.000 km, vollständige Service-Historie, seltene Farbe.",
      price: 280000,
      currency: "EUR",
      category_id: "3",
      metadata: {
        brand: "Ferrari",
        model: "488 GTB",
        year: 2018,
        mileage: 8000,
        condition: "excellent"
      }
    }
  ];

  const fallbackCategories: Category[] = [
    { id: "1", name: "Real Estate", slug: "real-estate" },
    { id: "2", name: "Luxusuhren", slug: "luxusuhren" },
    { id: "3", name: "Fahrzeuge", slug: "fahrzeuge" }
  ];
  
  // Always use fallback data for static export to ensure consistent IDs
  console.log("Using fallback data for static export consistency");
  category = fallbackCategories.find(cat => cat.slug === slug) || fallbackCategories[0];
  assets = fallbackAssets.filter(asset => {
    if (slug === "real-estate") return asset.category_id === "1";
    if (slug === "luxusuhren") return asset.category_id === "2";
    if (slug === "fahrzeuge") return asset.category_id === "3";
    return true;
  });
  count = assets.length;
  totalCount = count;

  return (
    <main className="with-header-offset theme-light">
      <Header />
      
      <div className="section">
        <div className="container">
        {/* Clean Category Header */}
        <div className="search-header-direct">
          <div className="search-header-content">
            <div className="search-breadcrumb">
              <Link href="/browse" className="breadcrumb-link">← Entdecken</Link>
              <span className="breadcrumb-separator">›</span>
              <span className="breadcrumb-current">{category?.name ?? "Kategorie"}</span>
            </div>
            <h1 className="search-title">{category?.name ?? "Kategorie"}</h1>
            <p className="search-subtitle">
              {slug === "real-estate" && "Premium Immobilien • Rendite-fokussiert • Marktführende Analyse"}
              {slug === "luxusuhren" && "Authentifizierte Uhren • Wertstabile Investments • Sammlerobjekte"}
              {slug === "fahrzeuge" && "Klassiker & Luxus • Wertentwicklung • Expertise seit Jahrzehnten"}
            </p>
          </div>
        </div>
        {/* Premium Search Interface - Category Specific */}
        <div className="premium-search-container">
          {/* Real Estate Tabs */}
          {slug === "real-estate" && (
            <div className="search-tabs">
              <div className="search-tab active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>
                </svg>
                <span>Kaufen</span>
              </div>
              <div className="search-tab">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>
                </svg>
                <span>Mieten</span>
              </div>
            </div>
          )}
          
          {/* Luxury Watches Tabs */}
          {slug === "luxusuhren" && (
            <div className="search-tabs">
              <div className="search-tab active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                <span>Alle Uhren</span>
              </div>
              <div className="search-tab">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>Premium</span>
              </div>
              <div className="search-tab">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <span>Investment</span>
              </div>
            </div>
          )}
          
          {/* Vehicles Tabs */}
          {slug === "fahrzeuge" && (
            <div className="search-tabs">
              <div className="search-tab active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10h-2l-1.5 1.1c-.8.2-1.5 1-1.5 1.9v3c0 .6.4 1 1 1h2"/>
                  <path d="M5 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.5-1.5-1.9L4 10H2l-1.5 1.1C-.3 11.3-1 12.1-1 13v3c0 .6.4 1 1 1h2"/>
                </svg>
                <span>Alle Fahrzeuge</span>
              </div>
              <div className="search-tab">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>Klassiker</span>
              </div>
              <div className="search-tab">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <span>Supercars</span>
              </div>
            </div>
          )}

          <div className="search-form-premium">
            <form className="immo-search-form">
              <input type="hidden" name="page" value="1" />
              
              {/* Real Estate Search Fields */}
              {slug === "real-estate" && (
                <div className="search-row">
                  <div className="search-field location-field">
                    <label className="field-label">Wo möchten Sie wohnen?</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <input 
                        name="loc" 
                        defaultValue={(sp?.loc as string) ?? ""} 
                        placeholder="Ort, PLZ, Stadtteil oder Region" 
                        className="location-input-premium" 
                      />
                    </div>
                  </div>

                  <div className="search-field price-field">
                    <label className="field-label">Kaufpreis</label>
                    <div className="price-inputs">
                      <div className="price-input-wrapper">
                        <input name="min" defaultValue={minPrice || ""} placeholder="Min" className="price-input-premium" inputMode="numeric" />
                        <span className="price-separator">€</span>
                      </div>
                      <div className="price-divider">bis</div>
                      <div className="price-input-wrapper">
                        <input name="max" defaultValue={maxPrice || ""} placeholder="Max" className="price-input-premium" inputMode="numeric" />
                        <span className="price-separator">€</span>
                      </div>
                    </div>
                  </div>

                  <div className="search-field rooms-field">
                    <label className="field-label">Zimmer</label>
                    <select name="rooms" defaultValue={(sp?.rooms as string) ?? ""} className="rooms-select-premium">
                      <option value="">Alle</option>
                      <option value="1">1 Zimmer</option>
                      <option value="2">2 Zimmer</option>
                      <option value="3">3 Zimmer</option>
                      <option value="4">4 Zimmer</option>
                      <option value="5+">5+ Zimmer</option>
                    </select>
                  </div>

                  <button type="submit" className="search-button-premium">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <span>Suchen</span>
                  </button>
                </div>
              )}

              {/* Luxury Watches Search Fields */}
              {slug === "luxusuhren" && (
                <div className="search-row">
                  <div className="search-field brand-field">
                    <label className="field-label">Marke</label>
                    <select name="brand" defaultValue={(sp?.brand as string) ?? ""} className="brand-select-premium">
                      <option value="">Alle Marken</option>
                      <option value="Rolex">Rolex</option>
                      <option value="Patek Philippe">Patek Philippe</option>
                      <option value="Audemars Piguet">Audemars Piguet</option>
                      <option value="Omega">Omega</option>
                      <option value="Breitling">Breitling</option>
                    </select>
                  </div>

                  <div className="search-field price-field">
                    <label className="field-label">Preis</label>
                    <div className="price-inputs">
                      <div className="price-input-wrapper">
                        <input name="min" defaultValue={minPrice || ""} placeholder="Min" className="price-input-premium" inputMode="numeric" />
                        <span className="price-separator">€</span>
                      </div>
                      <div className="price-divider">bis</div>
                      <div className="price-input-wrapper">
                        <input name="max" defaultValue={maxPrice || ""} placeholder="Max" className="price-input-premium" inputMode="numeric" />
                        <span className="price-separator">€</span>
                      </div>
                    </div>
                  </div>

                  <div className="search-field condition-field">
                    <label className="field-label">Zustand</label>
                    <select name="condition" defaultValue={(sp?.condition as string) ?? ""} className="condition-select-premium">
                      <option value="">Alle Zustände</option>
                      <option value="excellent">Exzellent</option>
                      <option value="very_good">Sehr gut</option>
                      <option value="good">Gut</option>
                      <option value="fair">Befriedigend</option>
                    </select>
                  </div>

                  <button type="submit" className="search-button-premium">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <span>Suchen</span>
                  </button>
                </div>
              )}

              {/* Vehicles Search Fields */}
              {slug === "fahrzeuge" && (
                <div className="search-row">
                  <div className="search-field brand-field">
                    <label className="field-label">Marke</label>
                    <select name="brand" defaultValue={(sp?.brand as string) ?? ""} className="brand-select-premium">
                      <option value="">Alle Marken</option>
                      <option value="Porsche">Porsche</option>
                      <option value="Ferrari">Ferrari</option>
                      <option value="Lamborghini">Lamborghini</option>
                      <option value="BMW">BMW</option>
                      <option value="Mercedes">Mercedes</option>
                    </select>
                  </div>

                  <div className="search-field price-field">
                    <label className="field-label">Preis</label>
                    <div className="price-inputs">
                      <div className="price-input-wrapper">
                        <input name="min" defaultValue={minPrice || ""} placeholder="Min" className="price-input-premium" inputMode="numeric" />
                        <span className="price-separator">€</span>
                      </div>
                      <div className="price-divider">bis</div>
                      <div className="price-input-wrapper">
                        <input name="max" defaultValue={maxPrice || ""} placeholder="Max" className="price-input-premium" inputMode="numeric" />
                        <span className="price-separator">€</span>
                      </div>
                    </div>
                  </div>

                  <div className="search-field year-field">
                    <label className="field-label">Baujahr</label>
                    <div className="year-inputs">
                      <div className="year-input-wrapper">
                        <input name="minYear" defaultValue={(sp?.minYear as string) ?? ""} placeholder="Min" className="year-input-premium" inputMode="numeric" />
                      </div>
                      <div className="year-divider">bis</div>
                      <div className="year-input-wrapper">
                        <input name="maxYear" defaultValue={(sp?.maxYear as string) ?? ""} placeholder="Max" className="year-input-premium" inputMode="numeric" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="search-button-premium">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <span>Suchen</span>
                  </button>
                </div>
              )}

              <div className="advanced-filters-toggle">
                <button type="button" className="filter-toggle-premium" data-toggle="advanced-filters">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="21" x2="4" y2="14"/>
                    <line x1="4" y1="10" x2="4" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12" y2="3"/>
                    <line x1="20" y1="21" x2="20" y2="16"/>
                    <line x1="20" y1="12" x2="20" y2="3"/>
                    <line x1="1" y1="14" x2="7" y2="14"/>
                    <line x1="9" y1="8" x2="15" y2="8"/>
                    <line x1="17" y1="16" x2="23" y2="16"/>
                  </svg>
                  <span>Erweiterte Suche</span>
                </button>
              </div>
            </form>
          </div>

          <div className="search-results-header">
            <div className="results-info">
              <span className="results-count">
                {count || 0} {slug === "real-estate" ? "Immobilien" : slug === "luxusuhren" ? "Uhren" : "Fahrzeuge"} gefunden
              </span>
              <span className="results-location">
                {sp?.loc ? `in ${sp.loc}` : 'in Deutschland'}
              </span>
            </div>
            <div className="sort-controls-premium">
              <label className="sort-label">Sortieren nach:</label>
              <select name="sort" defaultValue={sort} className="sort-select-premium">
                <option value="new">Neueste zuerst</option>
                <option value="price_asc">Preis aufsteigend</option>
                <option value="price_desc">Preis absteigend</option>
                {slug === "real-estate" && (
                  <>
                    <option value="area_desc">Größte zuerst</option>
                    <option value="yield_desc">Höchste Rendite</option>
                  </>
                )}
                {slug === "fahrzeuge" && (
                  <option value="year_desc">Neueste Baujahre</option>
                )}
              </select>
            </div>
          </div>
        </div>

            <div className="advanced-filters" id="advanced-filters" style={{ display: "none" }}>
              <form className="advanced-filter-form">
                <input type="hidden" name="page" value="1" />
                {/* Real Estate Advanced Filters */}
                {slug === "real-estate" && (
                  <div className="filter-grid">
                    <div className="filter-group">
                      <h4>Immobilientyp</h4>
                    <label className="checkbox-label">
                      <input type="checkbox" name="type" value="wohnung" defaultChecked={sp?.type === "wohnung"} />
                      <span>Eigentumswohnung</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" name="type" value="haus" defaultChecked={sp?.type === "haus"} />
                      <span>Haus</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" name="type" value="gewerbe" defaultChecked={sp?.type === "gewerbe"} />
                      <span>Gewerbeimmobilie</span>
                    </label>
                  </div>
                  
                  <div className="filter-group">
                    <h4>Wohnfläche</h4>
                    <div className="range-inputs">
                      <input name="minArea" defaultValue={(sp?.minArea as string) ?? ""} placeholder="von" className="range-input" inputMode="numeric" />
                      <span>bis</span>
                      <input name="maxArea" defaultValue={(sp?.maxArea as string) ?? ""} placeholder="bis" className="range-input" inputMode="numeric" />
                      <span>m²</span>
                    </div>
                  </div>

                  <div className="filter-group">
                    <h4>Zustand</h4>
                    <label className="radio-label">
                      <input type="radio" name="cond" value="" defaultChecked={!sp?.cond} />
                      <span>Alle Angebote</span>
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="cond" value="new" defaultChecked={sp?.cond === "new"} />
                      <span>Neubau</span>
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="cond" value="renovated" defaultChecked={sp?.cond === "renovated"} />
                      <span>Saniert</span>
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="cond" value="needs_work" defaultChecked={sp?.cond === "needs_work"} />
                      <span>Renovierungsbedürftig</span>
                    </label>
                  </div>

                  <div className="filter-group">
                    <h4>Ausstattung</h4>
                    <label className="checkbox-label">
                      <input type="checkbox" name="features" value="balkon" defaultChecked={sp?.features?.includes("balkon")} />
                      <span>Balkon/Terrasse</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" name="features" value="garage" defaultChecked={sp?.features?.includes("garage")} />
                      <span>Garage/Stellplatz</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" name="features" value="keller" defaultChecked={sp?.features?.includes("keller")} />
                      <span>Keller</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" name="features" value="aufzug" defaultChecked={sp?.features?.includes("aufzug")} />
                      <span>Aufzug</span>
                    </label>
                  </div>

                  <div className="filter-group">
                    <h4>Rendite</h4>
                    <div className="range-inputs">
                      <input name="minYield" defaultValue={(sp?.minYield as string) ?? ""} placeholder="von" className="range-input" inputMode="numeric" />
                      <span>%</span>
                    </div>
                    </div>
                  </div>
                )}

                {/* Luxury Watches Advanced Filters */}
                {slug === "luxusuhren" && (
                  <div className="filter-grid">
                    <div className="filter-group">
                      <h4>Uhrentyp</h4>
                      <label className="checkbox-label">
                        <input type="checkbox" name="watchType" value="dress" defaultChecked={sp?.watchType === "dress"} />
                        <span>Dresswatch</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" name="watchType" value="sports" defaultChecked={sp?.watchType === "sports"} />
                        <span>Sportuhr</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" name="watchType" value="diving" defaultChecked={sp?.watchType === "diving"} />
                        <span>Taucheruhr</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" name="watchType" value="chronograph" defaultChecked={sp?.watchType === "chronograph"} />
                        <span>Chronograph</span>
                      </label>
                    </div>
                    
                    <div className="filter-group">
                      <h4>Gehäuse-Material</h4>
                      <label className="checkbox-label">
                        <input type="checkbox" name="material" value="steel" defaultChecked={sp?.material === "steel"} />
                        <span>Edelstahl</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" name="material" value="gold" defaultChecked={sp?.material === "gold"} />
                        <span>Gold</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" name="material" value="platinum" defaultChecked={sp?.material === "platinum"} />
                        <span>Platin</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" name="material" value="titanium" defaultChecked={sp?.material === "titanium"} />
                        <span>Titan</span>
                      </label>
                    </div>

                    <div className="filter-group">
                      <h4>Zertifikat</h4>
                      <label className="checkbox-label">
                        <input type="checkbox" name="certificate" value="box" defaultChecked={sp?.certificate === "box"} />
                        <span>Originalbox</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" name="certificate" value="papers" defaultChecked={sp?.certificate === "papers"} />
                        <span>Papiere</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" name="certificate" value="service" defaultChecked={sp?.certificate === "service"} />
                        <span>Service-Historie</span>
                      </label>
                    </div>

                    <div className="filter-group">
                      <h4>Baujahr</h4>
                      <div className="range-inputs">
                        <input name="minYear" defaultValue={(sp?.minYear as string) ?? ""} placeholder="von" className="range-input" inputMode="numeric" />
                        <span>bis</span>
                        <input name="maxYear" defaultValue={(sp?.maxYear as string) ?? ""} placeholder="bis" className="range-input" inputMode="numeric" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Vehicles Advanced Filters */}
                {slug === "fahrzeuge" && (
                  <div className="filter-grid">
                    <div className="filter-group">
                      <h4>Fahrzeugtyp</h4>
                      <label className="checkbox-label">
                        <input type="checkbox" name="vehicleType" value="sports" defaultChecked={sp?.vehicleType === "sports"} />
                        <span>Sportwagen</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" name="vehicleType" value="classic" defaultChecked={sp?.vehicleType === "classic"} />
                        <span>Klassiker</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" name="vehicleType" value="supercar" defaultChecked={sp?.vehicleType === "supercar"} />
                        <span>Supercar</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" name="vehicleType" value="luxury" defaultChecked={sp?.vehicleType === "luxury"} />
                        <span>Luxusfahrzeug</span>
                      </label>
                    </div>
                    
                    <div className="filter-group">
                      <h4>Kraftstoff</h4>
                      <label className="checkbox-label">
                        <input type="checkbox" name="fuel" value="petrol" defaultChecked={sp?.fuel === "petrol"} />
                        <span>Benzin</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" name="fuel" value="hybrid" defaultChecked={sp?.fuel === "hybrid"} />
                        <span>Hybrid</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" name="fuel" value="electric" defaultChecked={sp?.fuel === "electric"} />
                        <span>Elektro</span>
                      </label>
                    </div>

                    <div className="filter-group">
                      <h4>Getriebe</h4>
                      <label className="checkbox-label">
                        <input type="checkbox" name="transmission" value="manual" defaultChecked={sp?.transmission === "manual"} />
                        <span>Schaltgetriebe</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" name="transmission" value="automatic" defaultChecked={sp?.transmission === "automatic"} />
                        <span>Automatik</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" name="transmission" value="semi" defaultChecked={sp?.transmission === "semi"} />
                        <span>Halbautomatik</span>
                      </label>
                    </div>

                    <div className="filter-group">
                      <h4>Kilometerstand</h4>
                      <div className="range-inputs">
                        <input name="minMileage" defaultValue={(sp?.minMileage as string) ?? ""} placeholder="von" className="range-input" inputMode="numeric" />
                        <span>bis</span>
                        <input name="maxMileage" defaultValue={(sp?.maxMileage as string) ?? ""} placeholder="bis" className="range-input" inputMode="numeric" />
                        <span>km</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="filter-actions">
                  <button type="button" className="btn-secondary" id="reset-filters-btn">Filter zurücksetzen</button>
                  <button type="submit" className="btn-primary">Filter anwenden</button>
                </div>
              </form>
            </div>
        <div className="premium-listings-grid">
          {(assets ?? []).map((a: Asset) => (
            <PremiumPropertyCard 
              key={a.id} 
              asset={a} 
              categorySlug={slug}
            />
          ))}
        </div>
        <div className="mt-6" style={{ display: "flex", gap: 8 }}>
          {page > 1 && (
            <Link className="btn" href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp ?? {}).map(([k,v]) => [k, Array.isArray(v)?v[0]:String(v)])), page: String(page-1) }).toString()}`}>Zurück</Link>
          )}
          {count && page * limit < count && (
            <Link className="btn" href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp ?? {}).map(([k,v]) => [k, Array.isArray(v)?v[0]:String(v)])), page: String(page+1) }).toString()}`}>Weiter</Link>
          )}
        </div>
        {/* @ts-expect-error Client Component */}
        <FilterToggle />
        {/* @ts-expect-error Client Component */}
        <LazyRealEstateFilters />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-inner">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-copyright">© {new Date().getFullYear()} Assero. All rights reserved.</span>
            <p className="footer-disclaimer">
              ASSERO fungiert als reine Vermittlungsplattform. Wir sind nicht Vertragspartner von Transaktionen zwischen Nutzern.
            </p>
          </div>
          <nav className="footer-nav">
            <a href="#platform">Plattform</a>
            <a href="#trust">Trust</a>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </div>
        </div>
      </footer>
    </main>
  );
}


