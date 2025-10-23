import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export default async function BrowsePage() {
  let categories: Category[] = [];
  let errorMessage: string | null = null;
  
  // Fallback categories if Supabase is not configured
  const fallbackCategories: Category[] = [
    {
      id: "1",
      name: "Real Estate",
      slug: "real-estate",
      description: "Premium Immobilien und Gewerbeobjekte"
    },
    {
      id: "2", 
      name: "Luxusuhren",
      slug: "luxusuhren",
      description: "Exklusive Zeitmesser und Sammlerstücke"
    },
    {
      id: "3",
      name: "Fahrzeuge", 
      slug: "fahrzeuge",
      description: "Premium Automobile und Klassiker"
    }
  ];

  try {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("asset_categories")
        .select("id, name, slug, description")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      categories = (data ?? []) as Category[];
    } else {
      categories = fallbackCategories;
    }
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : "Fehler beim Laden der Kategorien";
    // Use fallback categories on error
    categories = fallbackCategories;
  }

  return (
    <main className="with-header-offset theme-light">
      <Header />

      {/* Hero Section */}
      <section className="browse-hero">
        <div className="container">
          <div className="browse-hero-content">
            <h1 className="browse-title">Entdecken Sie Premium Assets</h1>
            <p className="browse-subtitle">
              Europas erste Multi-Asset Plattform für professionelle Investoren. 
              Real Estate, Luxusuhren und Fahrzeuge – alle in einer einheitlichen Oberfläche.
            </p>
            <div className="browse-stats">
              <div className="stat">
                <span className="stat-number">3</span>
                <span className="stat-label">Asset-Kategorien</span>
              </div>
              <div className="stat">
                <span className="stat-number">€2.4M</span>
                <span className="stat-label">Ø Transaktionswert</span>
              </div>
              <div className="stat">
                <span className="stat-number">4.2%</span>
                <span className="stat-label">Ø Jahresrendite</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="categories-title">Wählen Sie Ihre Asset-Kategorie</h2>
          <p className="categories-subtitle">
            Jede Kategorie bietet spezialisierte Filter, Bewertungen und Marktanalysen
          </p>
          
          {errorMessage ? (
            <div className="error-message">{errorMessage}</div>
          ) : null}
          
          <div className="categories-grid">
            {categories.length === 0 ? (
              <div className="category-placeholder">
                <p>Noch keine Kategorien verfügbar.</p>
              </div>
            ) : (
              categories.map((c) => (
                <a key={c.id} href={`/browse/${c.slug}`} className="category-card" aria-label={`${c.name} ansehen`}>
                  <div className="category-icon">
                    {c.slug === "real-estate" && (
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                        <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>
                      </svg>
                    )}
                    {c.slug === "luxusuhren" && (
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                        <circle cx="12" cy="12" r="6"/>
                        <path d="M12 8v4l3 2"/>
                      </svg>
                    )}
                    {c.slug === "fahrzeuge" && (
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                        <path d="M3 13l2-4h14l2 4"/>
                        <rect x="4" y="13" width="16" height="5" rx="1"/>
                        <circle cx="7" cy="18" r="1.5"/>
                        <circle cx="17" cy="18" r="1.5"/>
                      </svg>
                    )}
                  </div>
                  <div className="category-content">
                    <h3 className="category-name">{c.name}</h3>
                    <p className="category-description">
                      {c.description ?? "Kuratiertes Angebot und präzise Filter – entdecken Sie Assets dieser Kategorie."}
                    </p>
                    <div className="category-features">
                      {c.slug === "real-estate" && (
                        <>
                          <span className="feature-tag">Rendite-fokussiert</span>
                          <span className="feature-tag">Marktanalyse</span>
                          <span className="feature-tag">Standort-Bewertung</span>
                        </>
                      )}
                      {c.slug === "luxusuhren" && (
                        <>
                          <span className="feature-tag">Authentifiziert</span>
                          <span className="feature-tag">Wertstabil</span>
                          <span className="feature-tag">Sammlerobjekte</span>
                        </>
                      )}
                      {c.slug === "fahrzeuge" && (
                        <>
                          <span className="feature-tag">Klassiker</span>
                          <span className="feature-tag">Wertentwicklung</span>
                          <span className="feature-tag">Expertise</span>
                        </>
                      )}
                    </div>
                    <div className="category-cta">
                      <span className="cta-text">Kategorie erkunden</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}


