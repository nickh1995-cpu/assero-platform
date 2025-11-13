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
        
        console.log('Dashboard: Auth state changed:', event);
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('Dashboard: User signed out, redirecting to sign-in');
          router.push("/sign-in");
        } else if (event === 'SIGNED_IN' && session?.user) {
          console.log('Dashboard: User signed in:', session.user.id);
          setUser(session.user);
          // Don't reload, just refresh data
          loadDashboardData();
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('Dashboard: Token refreshed for user:', session.user.id);
          setUser(session.user);
        }
      }
    );

    async function loadDashboardData() {
      const startTime = Date.now();
      console.log('Dashboard: Starting data load...');
      
      try {
        console.log('Dashboard: Checking session...');
        
        // Simple direct session check - no timeouts, no retries
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        let currentUser = null;
        
        if (sessionData?.session?.user && !sessionError) {
          currentUser = sessionData.session.user;
          console.log('Dashboard: Session found:', currentUser.id);
          setUser(currentUser);
        } else {
          // Fallback: try getUser
          console.log('Dashboard: No session, trying getUser...');
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userData?.user && !userError) {
            currentUser = userData.user;
            console.log('Dashboard: User found:', currentUser.id);
            setUser(currentUser);
          }
        }
        
        // If still no user, redirect to sign-in
        if (!currentUser) {
          console.error('Dashboard: No user found, redirecting to sign-in');
          router.push("/sign-in");
          return;
        }
        
        console.log('Dashboard: Using user:', currentUser.id);
        
        // Get user profile with error handling
        try {
          console.log('Dashboard: Loading profile...');
          const profileStartTime = Date.now();
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();
          
          const profileTime = Date.now() - profileStartTime;
          console.log(`Dashboard: Profile loaded in ${profileTime}ms`, profileError ? 'with error' : 'success');
          
          if (profileError) {
            console.error('Dashboard: Profile error:', profileError);
          }
          setProfile(profileData || null);
        } catch (profileErr) {
          console.error('Dashboard: Profile exception:', profileErr);
          setProfile(null);
        }
        
        // Get user's assets with error handling
        try {
          console.log('Dashboard: Loading listings...');
          const listingsStartTime = Date.now();
          const { data: listingsData, error: listingsError } = await supabase
            .from("assets")
            .select("id, title, status, updated_at, price, currency")
            .eq("owner_id", currentUser.id)
            .order("updated_at", { ascending: false })
            .limit(20);
          
          const listingsTime = Date.now() - listingsStartTime;
          console.log(`Dashboard: Listings loaded in ${listingsTime}ms`, listingsError ? 'with error' : 'success');
          
          if (listingsError) {
            console.error('Dashboard: Listings error:', listingsError);
          }
          setListings(listingsData || []);
        } catch (listingsErr) {
          console.error('Dashboard: Listings exception:', listingsErr);
          setListings([]);
        }
        
        // Get user's valuations with error handling (optional, might not exist)
        try {
          console.log('Dashboard: Loading valuations...');
          const valuationsStartTime = Date.now();
          const { data: valuationsData, error: valuationsError } = await supabase
            .from("saved_valuations")
            .select("id, asset_type, title, estimated_value, currency, created_at, updated_at")
            .eq("user_id", currentUser.id)
            .order("updated_at", { ascending: false })
            .limit(10);
          
          const valuationsTime = Date.now() - valuationsStartTime;
          console.log(`Dashboard: Valuations loaded in ${valuationsTime}ms`, valuationsError ? 'with error' : 'success');
          
          if (valuationsError) {
            console.warn('Dashboard: Valuations error (table might not exist):', valuationsError);
          }
          setValuations(valuationsData || []);
        } catch (valuationsErr) {
          console.warn('Dashboard: Valuations exception (table might not exist):', valuationsErr);
          setValuations([]);
        }
        
        const totalTime = Date.now() - startTime;
        console.log(`Dashboard: All data loaded in ${totalTime}ms`);
        
      } catch (error) {
        console.error("Dashboard: Error fetching dashboard data:", error);
        // Don't redirect on error, just show empty dashboard
      } finally {
        setLoading(false);
        console.log('Dashboard: Loading state set to false');
      }
    }
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Dashboard: Loading timeout - forcing stop');
      setLoading(false);
    }, 5000);
    
    loadDashboardData().finally(() => {
      clearTimeout(timeoutId);
    });
    
    // Cleanup auth listener and timeout on unmount
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
