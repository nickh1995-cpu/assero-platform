"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Header } from "@/components/Header";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [valuations, setValuations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    
    // Set up auth state listener for session persistence
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Dashboard auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          router.push("/sign-in");
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          // Reload dashboard data when user signs in
          window.location.reload();
        }
      }
    );

    async function loadDashboardData() {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) {
          router.push("/sign-in");
          return;
        }
        
        setUser(auth.user);
        
        // Get user profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", auth.user.id)
          .maybeSingle();
        setProfile(profileData);
        
        // Get user's assets
        const { data: listingsData } = await supabase
          .from("assets")
          .select("id, title, status, updated_at, price, currency")
          .eq("owner_id", auth.user.id)
          .order("updated_at", { ascending: false })
          .limit(20);
        setListings(listingsData || []);
        
        // Get user's valuations
        const { data: valuationsData } = await supabase
          .from("saved_valuations")
          .select("id, asset_type, title, estimated_value, currency, created_at, updated_at")
          .eq("user_id", auth.user.id)
          .order("updated_at", { ascending: false })
          .limit(10);
        setValuations(valuationsData || []);
      } catch (error) {
        console.warn("Error fetching dashboard data:", error);
        router.push("/sign-in");
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboardData();
    
    // Cleanup auth listener on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  const formatPrice = (price: number | null, currency: string | null) => {
    if (!price) return "Preis auf Anfrage";
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency || "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Veröffentlicht";
      case "draft": return "Entwurf";
      case "pending": return "Wartet auf Freigabe";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-50";
      case "draft": return "text-yellow-600 bg-yellow-50";
      case "pending": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <main style={{ backgroundColor: "#f4f7fa", minHeight: "100vh" }}>
        <Header />
        <div style={{ padding: "80px 0" }}>
          <div className="container">
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p>Lade Dashboard...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: "#f4f7fa", minHeight: "100vh" }}>
      <Header />
      
      <div style={{ padding: "80px 0" }}>
        <div className="container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">
              Willkommen zurück{profile?.first_name ? `, ${profile.first_name}` : ''}!
            </h1>
            <p className="dashboard-subtitle">
              Verwalten Sie Ihre Assets und Inserate auf der ASSERO-Plattform.
            </p>
          </div>

          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-number">{listings.length}</div>
              <div className="stat-label">Ihre Inserate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{valuations.length}</div>
              <div className="stat-label">Bewertungen</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {listings.filter((l: any) => l.status === "active").length}
              </div>
              <div className="stat-label">Veröffentlicht</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {valuations.filter((v: any) => v.asset_type === "real-estate").length}
              </div>
              <div className="stat-label">Immobilien-Bewertungen</div>
            </div>
          </div>

          <div className="dashboard-actions">
            <a href="/valuation" className="btn-primary btn-large">
              💎 Asset bewerten
            </a>
            <a href="/list/create" className="btn-secondary btn-large">
              🚀 Neues Inserat erstellen
            </a>
            <a href="/browse" className="btn-secondary btn-large">
              🔍 Assets entdecken
            </a>
          </div>

          <div className="dashboard-content">
            {/* Bewertungen Sektion */}
            <div className="content-section">
              <h2 className="section-title">Ihre Bewertungen</h2>
              
              {valuations && valuations.length > 0 ? (
                <div className="listings-grid">
                  {valuations.map((valuation: any) => (
                    <div key={valuation.id} className="listing-card">
                      <div className="listing-header">
                        <h3 className="listing-title">{valuation.title}</h3>
                        <span className="status-badge text-blue-600 bg-blue-50">
                          {valuation.asset_type === "real-estate" ? "Immobilie" : 
                           valuation.asset_type === "luxury-watches" ? "Luxusuhr" : 
                           valuation.asset_type === "vehicles" ? "Fahrzeug" : valuation.asset_type}
                        </span>
                      </div>
                      <div className="listing-meta">
                        <span className="listing-price">
                          {formatPrice(valuation.estimated_value, valuation.currency)}
                        </span>
                        <span className="listing-date">
                          {new Date(valuation.updated_at).toLocaleDateString("de-DE")}
                        </span>
                      </div>
                      <div className="listing-actions">
                        <a href={`/valuation?id=${valuation.id}`} className="btn-small btn-primary">
                          Ansehen
                        </a>
                        <a href="/valuation" className="btn-small btn-secondary">
                          Neue Bewertung
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <h3>Noch keine Bewertungen vorhanden</h3>
                  <p>Erstellen Sie Ihre erste Asset-Bewertung mit unserem professionellen Bewertungstool.</p>
                  <a href="/valuation" className="btn-primary">
                    Erste Bewertung erstellen
                  </a>
                </div>
              )}
            </div>

            {/* Inserate Sektion */}
            <div className="content-section">
              <h2 className="section-title">Ihre Inserate</h2>
              
              {listings && listings.length > 0 ? (
                <div className="listings-grid">
                  {listings.map((listing: any) => (
                    <div key={listing.id} className="listing-card">
                      <div className="listing-header">
                        <h3 className="listing-title">{listing.title}</h3>
                        <span className={`status-badge ${getStatusColor(listing.status)}`}>
                          {getStatusLabel(listing.status)}
                        </span>
                      </div>
                      <div className="listing-meta">
                        <span className="listing-price">{formatPrice(listing.price, listing.currency)}</span>
                        <span className="listing-date">
                          {new Date(listing.updated_at).toLocaleDateString("de-DE")}
                        </span>
                      </div>
                      <div className="listing-actions">
                        <a href={`/asset/${listing.id}`} className="btn-small btn-secondary">
                          Ansehen
                        </a>
                        <a href={`/list/create/real-estate/${listing.id}`} className="btn-small btn-primary">
                          Bearbeiten
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>
                    </svg>
                  </div>
                  <h3>Noch keine Inserate vorhanden</h3>
                  <p>Erstellen Sie Ihr erstes Inserat und verkaufen Sie Ihre Assets über ASSERO.</p>
                  <a href="/list/create" className="btn-primary">
                    Erstes Inserat erstellen
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
