"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";

type FeaturedAsset = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  category_id: string;
  image: string | null;
  metadata: any;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

export function FeaturedGrid() {
  const [featuredAssets, setFeaturedAssets] = useState<FeaturedAsset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          console.warn("Supabase client not available, showing fallback content");
          setLoading(false);
          return;
        }
        
        // Get categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("asset_categories")
          .select("id, name, slug")
          .eq("is_active", true)
          .order("sort_order");

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
          setLoading(false);
          return;
        }

        if (!categoriesData || categoriesData.length === 0) {
          console.warn("No categories found");
          setLoading(false);
          return;
        }

        setCategories(categoriesData as Category[]);

        // Get featured assets for each category
        const assets: FeaturedAsset[] = [];
        for (const category of categoriesData as Category[]) {
          const { data, error } = await supabase
            .from("assets")
            .select("id, title, description, price, currency, category_id, metadata")
            .eq("category_id", category.id)
            .eq("status", "active")
            .eq("featured", true)
            .limit(1)
            .maybeSingle();
          
          if (error) {
            console.error(`Error fetching assets for category ${category.name}:`, error);
            continue;
          }
          
          if (data) {
            assets.push(data as FeaturedAsset);
          }
        }

        setFeaturedAssets(assets);
      } catch (error) {
        console.error("Error fetching featured assets:", error);
        // Show fallback content instead of failing completely
        setFeaturedAssets([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []); // Remove supabase dependency to prevent re-renders

  if (loading) {
    return (
      <section className="section padded light">
        <div className="container">
          <h2 className="section-title center">Premium Highlights</h2>
          <p className="lead center" style={{ marginBottom: 48 }}>
            Handverlesene Top-Assets aus jeder Kategorie
          </p>
          <div className="featured-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="featured-card" style={{ opacity: 0.6 }}>
                <div className="featured-image-wrap">
                  <div className="featured-image-placeholder real-estate">
                    <div className="placeholder-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="featured-content">
                  <h3 className="featured-title">Lädt...</h3>
                  <p className="featured-price">-</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featuredAssets.length === 0) {
    return (
      <section className="section padded light">
        <div className="container">
          <h2 className="section-title center">Premium Highlights</h2>
          <p className="lead center" style={{ marginBottom: 48 }}>
            Handverlesene Top-Assets aus jeder Kategorie
          </p>
          <div className="featured-grid">
            <div className="featured-card">
              <div className="featured-image-wrap">
                <div className="featured-image">
                  <img 
                    src="./images/assets/penthouse-NEW.jpg"
                    alt="Premium Immobilie"
                    className="featured-photo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span className="featured-badge">Real Estate</span>
              </div>
              <div className="featured-content">
                <h3 className="featured-title">
                  <Link href="/browse/real-estate">Premium Immobilien</Link>
                </h3>
                <p className="featured-price">Ab 500.000 €</p>
                <div className="featured-meta">
                  <span className="meta-item">📍 Top-Lagen</span>
                  <span className="meta-item">🏢 Gewerbe & Wohnen</span>
                </div>
                <div className="featured-actions">
                  <Link href="/browse/real-estate" className="btn-primary">Immobilien entdecken</Link>
                </div>
              </div>
            </div>
            
            <div className="featured-card">
              <div className="featured-image-wrap">
                <div className="featured-image">
                  <img 
                    src="./images/assets/rolex-submariner-NEW.jpg"
                    alt="Luxusuhren"
                    className="featured-photo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span className="featured-badge">Luxusuhren</span>
              </div>
              <div className="featured-content">
                <h3 className="featured-title">
                  <Link href="/browse/luxusuhren">Exklusive Uhren</Link>
                </h3>
                <p className="featured-price">Ab 5.000 €</p>
                <div className="featured-meta">
                  <span className="meta-item">⌚ Rolex, Patek Philippe</span>
                  <span className="meta-item">💎 Limitierte Editionen</span>
                </div>
                <div className="featured-actions">
                  <Link href="/browse/luxusuhren" className="btn-primary">Uhren entdecken</Link>
                </div>
              </div>
            </div>
            
            <div className="featured-card">
              <div className="featured-image-wrap">
                <div className="featured-image">
                  <img 
                    src="./images/assets/100900_Marco-Porsche-992-Turbo-S_6_klein.webp"
                    alt="Premium Fahrzeuge"
                    className="featured-photo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span className="featured-badge">Fahrzeuge</span>
              </div>
              <div className="featured-content">
                <h3 className="featured-title">
                  <Link href="/browse/fahrzeuge">Premium Fahrzeuge</Link>
                </h3>
                <p className="featured-price">Ab 50.000 €</p>
                <div className="featured-meta">
                  <span className="meta-item">🚗 Sportwagen & Klassiker</span>
                  <span className="meta-item">🏎️ Porsche, Ferrari, Lamborghini</span>
                </div>
                <div className="featured-actions">
                  <Link href="/browse/fahrzeuge" className="btn-primary">Fahrzeuge entdecken</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Format price for display
  const formatPrice = (price: number | null, currency: string | null) => {
    if (!price) return "Preis auf Anfrage";
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency || "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get category info
  const getCategoryInfo = (categoryId: string) => {
    return categories.find((c: Category) => c.id === categoryId);
  };


  return (
    <section className="section padded light">
      <div className="container">
        <h2 className="section-title center">Premium Highlights</h2>
        <p className="lead center" style={{ marginBottom: 48 }}>
          Handverlesene Top-Assets aus jeder Kategorie
        </p>
        <div className="featured-grid">
          {featuredAssets.map((asset) => {
            const category = getCategoryInfo(asset.category_id);
            const categorySlug = category?.slug || "assets";
            
            // Debug: Log all asset information
            console.log("=== ASSET DEBUG ===");
            console.log("Asset ID:", asset.id);
            console.log("Asset Title:", asset.title);
            console.log("Category Slug:", categorySlug);
            
            // Use the same image logic as browse and asset detail pages
            let imageSrc = "";
            // Handle real Supabase assets first - ORDER MATTERS! More specific first
            if (asset.title?.toLowerCase().includes("penthouse") || asset.title?.toLowerCase().includes("gendarmenmarkt") || asset.id === "1" || asset.id === "9c65a2bf-7c34-4aa9-bc74-b862c5634d63") {
              imageSrc = `./images/assets/penthouse-NEW.jpg`;
            } else if (asset.title?.toLowerCase().includes("porsche") || asset.title?.toLowerCase().includes("911") || asset.id === "3" || asset.id === "f2986a41-6c6f-4445-ba66-42aaeb125360") {
              imageSrc = `./images/assets/100900_Marco-Porsche-992-Turbo-S_6_klein.webp`;
            } else if (asset.title?.toLowerCase().includes("rolex") || asset.title?.toLowerCase().includes("submariner") || asset.id === "2" || asset.id === "7ab232ca-70ba-4954-aad7-7ee784d970e9") {
              imageSrc = `./images/assets/rolex-submariner-NEW.jpg`;
            } else if (asset.title?.toLowerCase().includes("eigentum") || asset.title?.toLowerCase().includes("eigentumswohnung") || asset.title?.toLowerCase().includes("neubau") || asset.id === "d11c91eb-b793-4fca-bb0a-995189c5cde7") {
              imageSrc = `./images/assets/eigentumswohnung-NEW.jpg`;
            } else if (asset.title?.toLowerCase().includes("altbau") || asset.id === "82a872e6-2f22-4a52-8669-96db76a87939") {
              imageSrc = `./images/assets/altbau-wohnung-NEW.jpg`;
            } else if (asset.title?.toLowerCase().includes("eppendorf") || asset.title?.toLowerCase().includes("stadhaus") || asset.title?.toLowerCase().includes("reihenhaus") || asset.id === "78eec2a7-68e5-429a-8031-4345f14b8471") {
              imageSrc = `./images/assets/eppendorf-stadhaus-NEW.jpg`;
            } else if (asset.title?.toLowerCase().includes("schillerportal") || asset.title?.toLowerCase().includes("frankfurt") || asset.title?.toLowerCase().includes("bürogebäude") || asset.id === "cc0045b0-a091-42f1-90d2-1f4ebcdb60a3") {
              imageSrc = `./images/assets/schillerportal-frankfurt-NEW.jpg`;
            } else if (asset.id === "374e40a8-2ad0-4d88-b544-0c43dab9976e") {
              imageSrc = `./images/assets/penthouse-NEW.jpg`;
            } else if (asset.id === "77092888-10d6-43f6-a877-b5d7ee044e56") {
              imageSrc = `./images/assets/100900_Marco-Porsche-992-Turbo-S_6_klein.webp`;
            } else if (asset.id === "acf995f4-22af-47bc-a07c-a9366632c952") {
              imageSrc = `./images/assets/rolex-submariner-NEW.jpg`;
            } else if (asset.metadata?.image && !asset.metadata.image.includes("/api/image-proxy")) {
              // Only use metadata image if it's not a broken API proxy URL
              imageSrc = asset.metadata.image;
            } else {
              // Fallback to placeholder based on category
              if (categorySlug === "real-estate") {
                imageSrc = "./images/assets/penthouse-NEW.jpg";
              } else if (categorySlug === "luxusuhren") {
                imageSrc = "./images/assets/rolex-submariner-NEW.jpg";
              } else if (categorySlug === "fahrzeuge") {
                imageSrc = "./images/assets/100900_Marco-Porsche-992-Turbo-S_6_klein.webp";
              } else {
                imageSrc = "./images/assets/penthouse-NEW.jpg";
              }
            }
            
            console.log("✅ Final imageSrc:", imageSrc);
            
            return (
              <article key={asset.id} className="featured-card">
                <Link href={`/asset/${asset.id}`} className="featured-image-wrap">
                  <div className="featured-image">
                    <img 
                      src={imageSrc}
                      alt={asset.title}
                      className="featured-photo"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    
                  </div>
                  <span className="featured-badge">{category?.name}</span>
                </Link>
                <div className="featured-content">
                  <h3 className="featured-title">
                    <Link href={`/asset/${asset.id}`}>{asset.title}</Link>
                  </h3>
                  <p className="featured-price">{formatPrice(asset.price, asset.currency)}</p>
                  {asset.metadata && (
                    <div className="featured-meta">
                      {categorySlug === "real-estate" && asset.metadata.location && (
                        <span className="meta-item">📍 {asset.metadata.location}</span>
                      )}
                      {categorySlug === "real-estate" && asset.metadata.area_sqm && (
                        <span className="meta-item">{asset.metadata.area_sqm} m²</span>
                      )}
                      {categorySlug === "real-estate" && asset.metadata.yield_pct && (
                        <span className="meta-item">{asset.metadata.yield_pct}% Rendite</span>
                      )}
                    </div>
                  )}
                  {asset.description && (
                    <p className="featured-desc">{asset.description}</p>
                  )}
                  <div className="featured-actions">
                    <Link href={`/asset/${asset.id}`} className="btn-primary">Details ansehen</Link>
                    <Link href={`/browse/${categorySlug}`} className="link-subtle">Mehr {category?.name} →</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}


