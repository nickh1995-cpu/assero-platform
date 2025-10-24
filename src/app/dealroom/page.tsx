"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Header } from "@/components/Header";
import { DealDetailsModal } from "@/components/DealDetailsModal";
import { PortfolioDashboard } from "@/components/PortfolioDashboard";
import { QuickActionsToolbar } from "@/components/QuickActionsToolbar";
import { MobileTouchHandler } from "@/components/MobileTouchHandler";
import { UserRegistration } from "@/components/UserRegistration";
import { RoleBasedNavigation } from "@/components/RoleBasedNavigation";
import { FallbackDealroom } from "@/components/FallbackDealroom";
import { PortfolioModal } from "@/components/PortfolioModal";
import { DealModal } from "@/components/DealModal";
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

function DealroomContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [allocations, setAllocations] = useState<AssetAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [creatingSampleData, setCreatingSampleData] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    
    // Set up auth state listener for session persistence
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setShowRegistration(false);
          setShowNavigation(true);
          // Reload data when user signs in
          window.location.reload();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setShowRegistration(true);
          setShowNavigation(false);
        }
      }
    );

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Data loading timeout - forcing loading to stop');
      setLoading(false);
    }, 10000); // 10 second timeout

    async function loadDealroomData() {
      
      try {
        console.log('Starting data load...');
        
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found, showing registration');
          setShowRegistration(true);
          setLoading(false);
          return;
        }
        
        // Check if user's email is confirmed
        if (user.email_confirmed_at === null) {
          console.log('User email not confirmed, showing registration');
          setShowRegistration(true);
          setLoading(false);
          return;
        }
        
        console.log('User found:', user.id);
        setUser(user);
        
        // Load user role with error handling
        try {
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role_type')
            .eq('user_id', user.id)
            .eq('is_primary_role', true)
            .single();
          
          if (roleError) {
            console.warn('Error loading user role (table might not exist):', roleError);
            // Set default role
            setUserRole('buyer');
          } else if (roleData) {
            console.log('User role loaded:', roleData.role_type);
            setUserRole(roleData.role_type);
          }
        } catch (roleError) {
          console.warn('User roles table not found, using default role');
          setUserRole('buyer');
        }
        
        // Get portfolios with error handling
        try {
          console.log('Loading portfolios...');
          const { data: portfoliosData, error: portfoliosError } = await supabase
            .from("portfolio_overview")
            .select("*")
            .order("updated_at", { ascending: false });
          
          if (portfoliosError) {
            console.warn('Error loading portfolios:', portfoliosError);
            setPortfolios([]);
          } else if (portfoliosData) {
            console.log('Loaded portfolios:', portfoliosData.length);
            // Remove duplicates based on id
            const uniquePortfolios = portfoliosData.filter((portfolio, index, self) => 
              index === self.findIndex(p => p.id === portfolio.id)
            );
            console.log('Unique portfolios:', uniquePortfolios.length);
            setPortfolios(uniquePortfolios);
            
            // Get asset allocations for first portfolio
            if (uniquePortfolios.length > 0) {
              try {
                const { data: allocationsData } = await supabase
                  .from("asset_allocations")
                  .select("*")
                  .eq("portfolio_id", uniquePortfolios[0].id);
                setAllocations(allocationsData || []);
                setSelectedPortfolio(uniquePortfolios[0].id);
              } catch (allocError) {
                console.warn('Error loading allocations:', allocError);
                setAllocations([]);
              }
            }
          }
        } catch (portfoliosError) {
          console.warn('Portfolios table not found, using empty array');
          setPortfolios([]);
        }
        
        // Get deals with error handling
        try {
          console.log('Loading deals...');
          const { data: dealsData, error: dealsError } = await supabase
            .from("deal_pipeline")
            .select("*")
            .order("expected_close_date", { ascending: true });
          
          if (dealsError) {
            console.warn('Error loading deals:', dealsError);
            setDeals([]);
          } else if (dealsData) {
            console.log('Loaded deals:', dealsData.length);
            // Remove duplicates based on id
            const uniqueDeals = dealsData.filter((deal, index, self) => 
              index === self.findIndex(d => d.id === deal.id)
            );
            console.log('Unique deals:', uniqueDeals.length);
            setDeals(uniqueDeals);
          }
        } catch (dealsError) {
          console.warn('Deals table not found, using empty array');
          setDeals([]);
        }
        
      } catch (error) {
        console.error("Error fetching dealroom data:", error);
        setShowFallback(true);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }

    loadDealroomData();
    
    // Cleanup timeout and auth listener on unmount
    return () => {
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []); // Remove router dependency to prevent multiple loads

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

  const handleCreatePortfolio = () => {
    console.log('Opening portfolio modal...');
    setShowPortfolioModal(true);
  };

  const handleCreateDeal = () => {
    console.log('Opening deal modal...');
    setShowDealModal(true);
  };

  const handlePortfolioCreated = (portfolio: any) => {
    console.log('Portfolio created:', portfolio);
    setPortfolios(prev => [portfolio, ...prev]);
    setShowPortfolioModal(false);
  };

  const handleDealCreated = (deal: any) => {
    console.log('Deal created:', deal);
    setDeals(prev => [deal, ...prev]);
    setShowDealModal(false);
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

  const handleDealClick = (dealId: string) => {
    setSelectedDealId(dealId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDealId(null);
  };

  const handlePortfolioClick = (portfolioId: string) => {
    console.log('Portfolio clicked:', portfolioId);
    if (!portfolioId) {
      console.error('No portfolio ID provided');
      return;
    }
    setSelectedPortfolioId(portfolioId);
    setShowDashboard(true);
  };

  const handleBackToPortfolios = () => {
    setShowDashboard(false);
    setSelectedPortfolioId(null);
  };

  const handleSwipeLeft = () => {
    // Navigate to next section or close modal
    if (isModalOpen) {
      handleCloseModal();
    }
  };

  const handleSwipeRight = () => {
    // Navigate to previous section
    if (showDashboard) {
      handleBackToPortfolios();
    }
  };

  const handleSwipeUp = () => {
    // Open quick actions
    console.log('Swipe up - Open quick actions');
  };

  const handleSwipeDown = () => {
    // Close any open modals or go back
    if (isModalOpen) {
      handleCloseModal();
    } else if (showDashboard) {
      handleBackToPortfolios();
    }
  };

  const handleLongPress = () => {
    // Open context menu or additional options
    console.log('Long press - Open context menu');
  };

  const handleRegistrationComplete = (userData: any) => {
    console.log('Registration completed:', userData);
    setShowRegistration(false);
    setUserRole(userData.role);
    setUser(userData.user);
    
    // Show success message and redirect after a short delay
    setTimeout(() => {
      alert('🎉 Willkommen bei ASSERO! Sie werden zum Dashboard weitergeleitet...');
      // Redirect to dashboard instead of reloading
      window.location.href = '/dashboard';
    }, 1000);
  };

  const handleShowNavigation = () => {
    setShowNavigation(!showNavigation);
  };

  const handleRetry = () => {
    setShowFallback(false);
    setLoading(true);
    // Reload the page to retry
    window.location.reload();
  };

  // Show registration modal if user is not authenticated
  if (showRegistration) {
    return (
      <UserRegistration 
        onRegistrationComplete={handleRegistrationComplete}
        onClose={() => setShowRegistration(false)}
      />
    );
  }

  // Show role-based navigation if user wants to switch roles
  if (showNavigation) {
    return (
      <RoleBasedNavigation 
        onRoleChange={(role) => {
          setUserRole(role.role);
          setShowNavigation(false);
        }}
      />
    );
  }

  // Show fallback if there's a critical error
  if (showFallback) {
    return <FallbackDealroom onRetry={handleRetry} />;
  }

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

  if (showDashboard && selectedPortfolioId) {
    return (
      <MobileTouchHandler
        onSwipeRight={handleSwipeRight}
        onSwipeDown={handleSwipeDown}
        onLongPress={handleLongPress}
        className={styles.mobileContainer}
      >
        <main>
          <Header />
          <div className={styles.dashboardContainer}>
            <div className={styles.dashboardHeader}>
              <button className={styles.backButton} onClick={handleBackToPortfolios}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Zurück zu Portfolios
              </button>
              <h1 className={styles.dashboardTitle}>Portfolio Dashboard</h1>
            </div>
            <PortfolioDashboard 
              portfolioId={selectedPortfolioId}
              onPortfolioUpdate={(metrics) => {
                console.log('Portfolio updated:', metrics);
              }}
            />
          </div>
        </main>
      </MobileTouchHandler>
    );
  }

  return (
    <MobileTouchHandler
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      onSwipeUp={handleSwipeUp}
      onSwipeDown={handleSwipeDown}
      onLongPress={handleLongPress}
      className={styles.mobileContainer}
    >
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
              {userRole && (
                <div className={styles.roleIndicator}>
                  <span className={styles.roleIcon}>
                    {userRole === 'buyer' ? '🛒' : '🏪'}
                  </span>
                  <span className={styles.roleText}>
                    {userRole === 'buyer' ? 'Käufer-Modus' : 'Verkäufer-Modus'}
                  </span>
                  <button 
                    className={styles.roleSwitchButton}
                    onClick={handleShowNavigation}
                  >
                    Rolle wechseln
                  </button>
                </div>
              )}
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
              <button 
                className={styles.btnPrimary}
                onClick={handleCreatePortfolio}
              >
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
                    <button 
                      className={styles.btnSecondary}
                      onClick={() => handlePortfolioClick(portfolio.id)}
                      disabled={!portfolio.id}
                    >
                      Dashboard
                    </button>
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
            <button 
              className={styles.btnPrimary}
              onClick={handleCreateDeal}
            >
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
                    <button 
                      className={styles.btnSecondary}
                      onClick={() => handleDealClick(deal.id)}
                    >
                      Details
                    </button>
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

      {/* Deal Details Modal */}
      <DealDetailsModal
        dealId={selectedDealId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

        {/* Quick Actions Toolbar */}
        <QuickActionsToolbar
          onAction={(actionId) => {
            console.log('Quick action triggered:', actionId);
          }}
        />
      </main>

      {/* Modals */}
      <PortfolioModal
        isOpen={showPortfolioModal}
        onClose={() => setShowPortfolioModal(false)}
        onPortfolioCreated={handlePortfolioCreated}
      />
      
      <DealModal
        isOpen={showDealModal}
        onClose={() => setShowDealModal(false)}
        onDealCreated={handleDealCreated}
      />
    </MobileTouchHandler>
  );
}

// Main export with Suspense wrapper
export default function DealroomPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DealroomContent />
    </Suspense>
  );
}

