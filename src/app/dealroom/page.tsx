"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { checkUserVerification, VerificationStatus } from "@/lib/verification";
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
import { EmailConfirmationNotice } from "@/components/EmailConfirmationNotice";
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
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [allocations, setAllocations] = useState<AssetAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [creatingSampleData, setCreatingSampleData] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpeningModal, setIsOpeningModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    
    // Set up auth state listener for persistent session management
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('=== SIGNED_IN EVENT ===');
          console.log('User ID:', session.user.id);
          console.log('Email:', session.user.email);
          console.log('Email confirmed:', session.user.email_confirmed_at);
          
          // User signed in - check verification
          const status = await checkUserVerification();
          console.log('Verification Status:', JSON.stringify(status, null, 2));
          setVerificationStatus(status);
          
          if (status.isVerified) {
            console.log('✅ User verified - loading dealroom data');
            setUser(session.user);
            setShowRegistration(false);
            setShowNavigation(false);
            // Continue loading dealroom data
            loadDealroomData();
          } else {
            console.warn('❌ User NOT verified - showing registration');
            console.warn('Reason:', status.message);
            // IMPORTANT: Only show registration for truly new users
            // If user has email confirmed but profile missing, allow access anyway
            if (status.isEmailConfirmed) {
              console.log('⚠️ Email confirmed but profile issues - allowing access with degradation');
              setUser(session.user);
              setShowRegistration(false);
            loadDealroomData();
          } else {
            // User signed in but not verified - show registration/confirmation
            setShowRegistration(true);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setVerificationStatus(null);
          setShowRegistration(true);
          setShowNavigation(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Session token refreshed - maintaining login state');
          // Token was refreshed - session is still valid, no action needed
        } else if (event === 'USER_UPDATED') {
          console.log('User data updated');
          if (session?.user) {
            setUser(session.user);
          }
        }
      }
    );

    // Set a timeout to prevent infinite loading
    // NOTE: Must be longer than Supabase query timeouts (30s) to avoid conflicts
    const timeoutId = setTimeout(() => {
      console.warn('⏱️ === OVERALL DATA LOADING TIMEOUT (60s) ===');
      console.warn('Data loading exceeded 60 seconds - forcing UI to display');
      console.warn('This might indicate:');
      console.warn('1. Slow Supabase connection');
      console.warn('2. Missing tables or RLS policy issues');
      console.warn('3. Network latency');
      
      // Force stop loading to show UI
      setLoading(false);
      
      // Intelligent fallback decision
      const authCookie = document.cookie.includes('sb-') && document.cookie.includes('-auth-token');
      console.log('Cookie check:', authCookie ? '✅ Auth cookie present' : '❌ No auth cookie');
      
      if (!verificationStatus && !user) {
        if (authCookie) {
          console.warn('→ Auth cookie present but no user loaded → showing fallback UI');
          setShowFallback(true);
        } else {
          console.warn('→ No auth cookie → showing registration');
        setShowRegistration(true);
      }
      } else {
        console.log('→ User/verification status present → continuing normally');
      }
    }, 60000); // 60 second timeout (longer than individual Supabase timeouts)

    async function loadDealroomData() {
      
      try {
        console.log('Starting data load...');
        setLoadingProgress(10); // Start progress
        
        // Quick auth check with timeout
        console.log('Dealroom: Checking session...');
        let session = null;
        let currentUser = null;
        
        try {
          const sessionPromise = supabase.auth.getSession();
          const sessionTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session query timeout')), 30000) // Increased to 30s
          );
          
          const sessionResult = await Promise.race([sessionPromise, sessionTimeout]) as any;
          
          if (sessionResult?.data?.session?.user) {
            session = sessionResult.data.session;
            currentUser = session.user;
            console.log('Dealroom: Session found:', currentUser.id);
            setUser(currentUser);
            setLoadingProgress(30); // Session found
          }
        } catch (sessionErr: any) {
          console.warn('Dealroom: Session check failed:', sessionErr?.message || sessionErr);
          setLoadingProgress(25); // Session failed, continue
        }
        
        // If no session, try getUser with timeout
        if (!currentUser) {
          console.log('Dealroom: No session, trying getUser...');
          try {
            const userPromise = supabase.auth.getUser();
            const userTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('User query timeout')), 30000) // Increased to 30s
            );
            
            const userResult = await Promise.race([userPromise, userTimeout]) as any;
            
            if (userResult?.data?.user) {
              currentUser = userResult.data.user;
              console.log('Dealroom: User found:', currentUser.id);
              setUser(currentUser);
              setLoadingProgress(50); // User found
            }
          } catch (userErr: any) {
            console.warn('Dealroom: User check failed:', userErr?.message || userErr);
            setLoadingProgress(45); // User check failed
          }
        }
        
        // If still no user, apply intelligent fallback logic
        if (!currentUser) {
          console.warn('⚠️ === NO USER FOUND AFTER SESSION + USER CHECKS ===');
          console.warn('This might indicate:');
          console.warn('1. User is not logged in (legitimate - needs registration)');
          console.warn('2. Supabase connection is slow/failing (temporary issue)');
          console.warn('3. Auth token expired (need re-login)');
          console.warn('4. Cache was cleared but user IS logged in (cookie exists)');
          
          // Check for auth cookie to distinguish between cases
          const authCookie = document.cookie.includes('sb-') && document.cookie.includes('-auth-token');
          console.log('🍪 Cookie check:', authCookie ? '✅ Auth cookie present' : '❌ No auth cookie');
          
          if (authCookie) {
            console.warn('⚠️ ===== CRITICAL: AUTH COOKIE EXISTS BUT SESSION/USER QUERY FAILED =====');
            console.warn('This strongly suggests:');
            console.warn('→ Supabase connection issues (slow or timeout)');
            console.warn('→ User IS logged in but backend is unreachable');
            console.warn('→ Showing FALLBACK UI instead of forcing registration');
            console.warn('→ This preserves user experience and prevents data loss');
            
            // Show fallback UI with retry option
            setShowFallback(true);
            setLoading(false);
            return;
          }
          
          console.log('❌ No auth cookie found');
          console.log('→ User genuinely NOT logged in');
          console.log('→ Showing registration as expected');
          setShowRegistration(true);
          setLoading(false);
          return;
        }
        
        console.log('✅ User authenticated successfully:', currentUser.id, currentUser.email);
        setLoadingProgress(60); // User authenticated
        
        // Set verification status to allow access
        setVerificationStatus({
          isVerified: true,
          isEmailConfirmed: currentUser.email_confirmed_at !== null,
          isProfileVerified: true,
          isProfileComplete: true,
          profile: null,
          message: 'Access granted'
        });
        
        console.log('Dealroom: Using user:', currentUser.id);
        setLoadingProgress(70); // Verification set
        
        // Load user role with error handling (non-blocking)
        try {
          const rolePromise = supabase
            .from('user_roles')
            .select('role_type')
            .eq('user_id', currentUser.id)
            .eq('is_primary_role', true)
            .single();
          
          const roleTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Role query timeout')), 2000)
          );
          
          const roleResult = await Promise.race([rolePromise, roleTimeout]) as any;
          
          if (roleResult?.data) {
            console.log('User role loaded:', roleResult.data.role_type);
            setUserRole(roleResult.data.role_type);
            setLoadingProgress(80); // Role loaded
          } else {
            setUserRole('buyer');
            setLoadingProgress(75); // Default role
          }
        } catch (roleError: any) {
          console.warn('User role not loaded (using default):', roleError?.message || roleError);
          setUserRole('buyer');
          setLoadingProgress(75); // Default role
        }
        
        // Get portfolios with error handling (non-blocking)
        try {
          console.log('Dealroom: Loading portfolios...');
          const portfoliosPromise = supabase
            .from("portfolios")
            .select("*")
            .eq("user_id", currentUser.id)
            .eq("is_active", true)
            .order("updated_at", { ascending: false });
          
          const portfoliosTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Portfolios query timeout')), 3000)
          );
          
          const portfoliosResult = await Promise.race([portfoliosPromise, portfoliosTimeout]) as any;
          
          if (portfoliosResult?.error) {
            console.error('Dealroom: Portfolios error:', portfoliosResult.error);
            setPortfolios([]);
            setLoadingProgress(85); // Portfolios failed
          } else {
            const portfoliosData = portfoliosResult?.data || [];
            console.log('Dealroom: Loaded portfolios:', portfoliosData.length);
            setPortfolios(portfoliosData);
            setLoadingProgress(90); // Portfolios loaded
            
            // Get asset allocations for first portfolio (non-blocking)
            if (portfoliosData.length > 0) {
              try {
                const { data: allocationsData } = await supabase
                  .from("asset_allocations")
                  .select("*")
                  .eq("portfolio_id", portfoliosData[0].id);
                setAllocations(allocationsData || []);
                setSelectedPortfolio(portfoliosData[0].id);
              } catch (allocError) {
                console.warn('Dealroom: Allocations error:', allocError);
                setAllocations([]);
              }
            }
          }
        } catch (portfoliosError: any) {
          console.warn('Dealroom: Portfolios timeout/error:', portfoliosError?.message || portfoliosError);
          setPortfolios([]);
        }
        
        // Get deals with error handling (non-blocking)
        try {
          console.log('Dealroom: Loading deals...');
          const dealsPromise = supabase
            .from("deals")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("expected_close_date", { ascending: true });
          
          const dealsTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Deals query timeout')), 3000)
          );
          
          const dealsResult = await Promise.race([dealsPromise, dealsTimeout]) as any;
          
          if (dealsResult?.error) {
            console.error('Dealroom: Deals error:', dealsResult.error);
            setDeals([]);
          } else {
            const dealsData = dealsResult?.data || [];
            console.log('Dealroom: Loaded deals:', dealsData.length);
            setDeals(dealsData);
          }
        } catch (dealsError: any) {
          console.warn('Dealroom: Deals timeout/error:', dealsError?.message || dealsError);
          setDeals([]);
        }
        
      } catch (error) {
        console.error("Error fetching dealroom data:", error);
        setShowFallback(true);
        setLoading(false);
        setLoadingProgress(100); // Error, but complete
      } finally {
        clearTimeout(timeoutId);
        setLoadingProgress(100); // Complete
        setLoading(false);
        // Force loading to false if we show registration
        if (showRegistration) {
          setLoading(false);
        }
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

  const handlePortfolioCreated = async (portfolio: any) => {
    console.log('Portfolio created:', portfolio);
    setShowPortfolioModal(false);
    
    // Reload portfolios from database to ensure consistency
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("updated_at", { ascending: false });
      
      if (!portfoliosError && portfoliosData) {
        console.log('Reloaded portfolios:', portfoliosData.length);
        setPortfolios(portfoliosData);
      }
    }
  };

  const handleDealCreated = async (deal: any) => {
    console.log('Deal created:', deal);
    setShowDealModal(false);
    
    // Reload deals from database to ensure consistency
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: dealsData, error: dealsError } = await supabase
        .from("deals")
        .select("*")
        .eq("user_id", user.id)
        .order("expected_close_date", { ascending: true });
      
      if (!dealsError && dealsData) {
        console.log('Reloaded deals:', dealsData.length);
        setDeals(dealsData);
      }
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

  const handleDealClick = (dealId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Prevent double-click - check if already opening or open
    if (isOpeningModal || (isModalOpen && selectedDealId === dealId)) {
      console.log('Modal already opening or open for this deal:', dealId);
      return;
    }
    
    console.log('Deal clicked:', dealId);
    
    // Set flag to prevent double clicks
    setIsOpeningModal(true);
    
    // Set modal state
    setSelectedDealId(dealId);
    setIsModalOpen(true);
    
    // Reset flag after a short delay to allow modal to open
    setTimeout(() => {
      setIsOpeningModal(false);
    }, 300);
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
    
    // Registration is complete - user was shown email confirmation message
    // and redirected to home page by UserRegistration component
    // This callback should not do anything else
  };

  const handleEmailConfirmed = () => {
    setShowEmailConfirmation(false);
    setPendingEmail(null);
    // Reload to check verification status
    window.location.reload();
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

  // Removed: This was conflicting with the main timeout logic
  // The main useEffect at line 137 already handles timeout after 60s

  // Show email confirmation notice if user registered but didn't confirm email
  if (showEmailConfirmation && pendingEmail) {
    return (
      <main>
        <Header />
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
          <EmailConfirmationNotice 
            email={pendingEmail}
            onConfirmed={handleEmailConfirmed}
            redirectTo="/dealroom"
          />
        </div>
      </main>
    );
  }

  // Show registration modal if user is not authenticated or not verified
  if (showRegistration) {
    // Determine if user can close the modal
    // Only allow closing if user is NOT logged in or email is NOT confirmed
    // For logged-in users who need verification, prevent closing
    const canClose = !verificationStatus || !verificationStatus.isEmailConfirmed;
    
    return (
      <div>
        <UserRegistration 
          onRegistrationComplete={handleRegistrationComplete}
          onClose={canClose ? () => {
            // Only redirect to sign-in if they try to close and are logged in
            if (verificationStatus && verificationStatus.isEmailConfirmed) {
              // User is logged in but not verified - redirect to sign-in
              router.push('/sign-in');
            } else {
              // User is not logged in - just close (go to homepage)
              router.push('/');
            }
          } : undefined}
        />
        {verificationStatus && verificationStatus.message && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ff4444',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10000,
            maxWidth: '90%',
            textAlign: 'center'
          }}>
            <strong>⚠️ Verifikation erforderlich</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
              {verificationStatus.message}
            </p>
          </div>
        )}
      </div>
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

  // Don't show loading if we have registration modal (user interaction needed)
  // Also don't block UI if loading times out or user is verified
  if (loading && !showRegistration && !verificationStatus?.isVerified) {
    return (
      <main>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Lade Dealroom-Daten...</p>
          {loadingProgress > 0 && (
            <div style={{
              marginTop: '16px',
              width: '200px',
              height: '4px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${loadingProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4a8bb8, #3d7a9f)',
                transition: 'width 0.5s ease',
              }}></div>
            </div>
          )}
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(255,255,255,0.6)',
            marginTop: '12px'
          }}>
            {loadingProgress < 30 ? 'Verbinde mit Server...' : 
             loadingProgress < 60 ? 'Authentifizierung läuft...' : 
             'Lade Daten...'}
          </p>
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
                      onClick={(e) => handleDealClick(deal.id, e)}
                      type="button"
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

