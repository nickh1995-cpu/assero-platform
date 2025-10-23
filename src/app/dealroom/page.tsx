"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Header } from "@/components/Header";
import styles from "./dealroom.module.css";

interface Portfolio {
  id: string;
  name: string;
  description: string;
  total_value: number;
  currency: string;
  total_deals: number;
  closed_deals: number;
  active_deals: number;
  created_at: string;
  updated_at: string;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  asset_type: string;
  status: string;
  deal_value: number;
  currency: string;
  expected_close_date: string;
  created_at: string;
  updated_at: string;
}

interface AssetAllocation {
  asset_type: string;
  allocation_percentage: number;
  target_allocation: number;
  actual_value: number;
}

export default function DealroomPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [allocations, setAllocations] = useState<AssetAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [creatingSampleData, setCreatingSampleData] = useState(false);

  useEffect(() => {
    async function loadDealroomData() {
      const supabase = getSupabaseBrowserClient();
      
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) {
          router.push("/sign-in");
          return;
        }
        
        setUser(auth.user);
        
        // Get portfolios
        const { data: portfoliosData } = await supabase
          .from("portfolio_overview")
          .select("*")
          .order("updated_at", { ascending: false });
        setPortfolios(portfoliosData || []);
        
        // Get deals
        const { data: dealsData } = await supabase
          .from("deal_pipeline")
          .select("*")
          .order("expected_close_date", { ascending: true });
        setDeals(dealsData || []);
        
        // Get asset allocations for first portfolio
        if (portfoliosData && portfoliosData.length > 0) {
          const { data: allocationsData } = await supabase
            .from("asset_allocations")
            .select("*")
            .eq("portfolio_id", portfoliosData[0].id);
          setAllocations(allocationsData || []);
          setSelectedPortfolio(portfoliosData[0].id);
        }
        
      } catch (error) {
        console.warn("Error fetching dealroom data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDealroomData();
  }, [router]);

  const createSampleData = async () => {
    setCreatingSampleData(true);
    try {
      const response = await fetch('/api/dealroom/sample-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Reload data after creating sample data
        window.location.reload();
      } else {
        console.error('Failed to create sample data');
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
    } finally {
      setCreatingSampleData(false);
    }
  };

  const formatPrice = (value: number, currency: string) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "interest": return "text-blue-600 bg-blue-50";
      case "negotiation": return "text-yellow-600 bg-yellow-50";
      case "due-diligence": return "text-purple-600 bg-purple-50";
      case "contract": return "text-orange-600 bg-orange-50";
      case "closed": return "text-green-600 bg-green-50";
      case "cancelled": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "interest": return "Interesse";
      case "negotiation": return "Verhandlung";
      case "due-diligence": return "Due Diligence";
      case "contract": return "Vertrag";
      case "closed": return "Abgeschlossen";
      case "cancelled": return "Storniert";
      default: return status;
    }
  };

  const getAssetTypeLabel = (assetType: string) => {
    switch (assetType) {
      case "real-estate": return "Immobilie";
      case "luxury-watches": return "Luxusuhr";
      case "vehicles": return "Fahrzeug";
      case "art": return "Kunst";
      case "collectibles": return "Sammlerstück";
      default: return assetType;
    }
  };

  if (loading) {
    return (
      <main>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Lade Dealroom-Daten...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Dealroom</h1>
            <p className={styles.heroSubtitle}>
              Professionelle Investment-Management-Plattform für Luxus-Assets
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Overview */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Portfolio Übersicht</h2>
            <div className={styles.headerActions}>
              <button 
                className={styles.btnSecondary}
                onClick={createSampleData}
                disabled={creatingSampleData}
              >
                {creatingSampleData ? 'Erstelle...' : '📊 Sample Data'}
              </button>
              <button className={styles.btnPrimary}>
                + Neues Portfolio
              </button>
            </div>
          </div>

          {portfolios.length > 0 ? (
            <div className={styles.portfolioGrid}>
              {portfolios.map((portfolio) => (
                <div key={portfolio.id} className={styles.portfolioCard}>
                  <div className={styles.portfolioHeader}>
                    <h3 className={styles.portfolioName}>{portfolio.name}</h3>
                    <span className={styles.portfolioValue}>
                      {formatPrice(portfolio.total_value, portfolio.currency)}
                    </span>
                  </div>
                  <p className={styles.portfolioDescription}>{portfolio.description}</p>
                  
                  <div className={styles.portfolioStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>{portfolio.total_deals}</span>
                      <span className={styles.statLabel}>Deals</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>{portfolio.closed_deals}</span>
                      <span className={styles.statLabel}>Abgeschlossen</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>{portfolio.active_deals}</span>
                      <span className={styles.statLabel}>Aktiv</span>
                    </div>
                  </div>

                  <div className={styles.portfolioActions}>
                    <button className={styles.btnSecondary}>Details</button>
                    <button className={styles.btnPrimary}>Bearbeiten</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3>Noch keine Portfolios vorhanden</h3>
              <p>Erstellen Sie Ihr erstes Portfolio für professionelles Asset-Management.</p>
              <button className={styles.btnPrimary}>Erstes Portfolio erstellen</button>
            </div>
          )}
        </div>
      </section>

      {/* Deal Pipeline */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Deal Pipeline</h2>
            <button className={styles.btnPrimary}>
              + Neuer Deal
            </button>
          </div>

          {deals.length > 0 ? (
            <div className={styles.dealsGrid}>
              {deals.map((deal) => (
                <div key={deal.id} className={styles.dealCard}>
                  <div className={styles.dealHeader}>
                    <h3 className={styles.dealTitle}>{deal.title}</h3>
                    <span className={`${styles.statusBadge} ${getStatusColor(deal.status)}`}>
                      {getStatusLabel(deal.status)}
                    </span>
                  </div>
                  
                  <p className={styles.dealDescription}>{deal.description}</p>
                  
                  <div className={styles.dealMeta}>
                    <div className={styles.dealInfo}>
                      <span className={styles.dealType}>{getAssetTypeLabel(deal.asset_type)}</span>
                      <span className={styles.dealValue}>
                        {formatPrice(deal.deal_value, deal.currency)}
                      </span>
                    </div>
                    <div className={styles.dealDate}>
                      {new Date(deal.expected_close_date).toLocaleDateString("de-DE")}
                    </div>
                  </div>

                  <div className={styles.dealActions}>
                    <button className={styles.btnSecondary}>Details</button>
                    <button className={styles.btnPrimary}>Bearbeiten</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3>Noch keine Deals vorhanden</h3>
              <p>Erstellen Sie Ihren ersten Deal für professionelles Investment-Management.</p>
              <button className={styles.btnPrimary}>Ersten Deal erstellen</button>
            </div>
          )}
        </div>
      </section>

      {/* Asset Allocation */}
      {allocations.length > 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Asset Allocation</h2>
            
            <div className={styles.allocationGrid}>
              {allocations.map((allocation, index) => (
                <div key={index} className={styles.allocationCard}>
                  <div className={styles.allocationHeader}>
                    <h3 className={styles.allocationType}>
                      {getAssetTypeLabel(allocation.asset_type)}
                    </h3>
                    <span className={styles.allocationPercentage}>
                      {allocation.allocation_percentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className={styles.allocationBar}>
                    <div 
                      className={styles.allocationFill}
                      style={{ width: `${allocation.allocation_percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className={styles.allocationDetails}>
                    <div className={styles.allocationValue}>
                      <span className={styles.valueLabel}>Aktueller Wert:</span>
                      <span className={styles.valueAmount}>
                        {formatPrice(allocation.actual_value, "EUR")}
                      </span>
                    </div>
                    <div className={styles.allocationTarget}>
                      <span className={styles.targetLabel}>Ziel:</span>
                      <span className={styles.targetAmount}>
                        {allocation.target_allocation.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

