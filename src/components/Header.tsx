"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const router = useRouter();
  const { user, signOut } = useAuth();

  // Prevent unnecessary re-renders during development
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const email = useMemo(() => user?.email ?? null, [user]);
  const userName = useMemo(() => {
    if (!user) return null;
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "Benutzer";
  }, [user]);

  // Close dropdown when clicking outside - optimized to prevent unnecessary re-renders
  useEffect(() => {
    if (!userDropdownOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-dropdown-container')) {
        setUserDropdownOpen(false);
      }
    };

    // Use a small delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setUserDropdownOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [router, signOut]);

  const toggleUserDropdown = useCallback(() => {
    setUserDropdownOpen(prev => !prev);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setUserDropdownOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTimeout(() => setUserDropdownOpen(false), 1000);
  }, []);

  const handleDropdownMouseLeave = useCallback(() => {
    setTimeout(() => setUserDropdownOpen(false), 800);
  }, []);

  return (
    <header className="site-header" aria-label="Primary">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="Assero home">
          <span className="brand-word">ASSERO</span>
        </Link>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="nav-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Desktop Navigation */}
        <nav className="nav" role="navigation">
          <ul className="nav-list">
            <li><Link href="/browse">Entdecken</Link></li>
            <li><Link href="/valuation">Valuation</Link></li>
            <li><Link href="/wallet">Wallet</Link></li>
            <li><Link href="/dealroom">Dealroom</Link></li>
            <li><Link href="/insights">Insights</Link></li>
            <li><Link href="/list/create" className="nav-cta">Inserieren</Link></li>
            <li>
              {email ? (
                <div className="user-dropdown-container">
                  <Link 
                    href="/dashboard" 
                    className="nav-link"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    Konto
                  </Link>
                  
                  {isClient && userDropdownOpen && (
                    <div 
                      className={`user-dropdown ${userDropdownOpen ? 'show' : ''}`}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="user-dropdown-header">
                        <div className="user-info">
                          <div className="user-avatar-large">
                            {userName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="user-details">
                            <div className="user-name-large">{userName}</div>
                            <div className="user-email">{email}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="user-dropdown-menu">
                        <Link href="/dashboard" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4L8 1L14 4V11L8 14L2 11V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 8L8 10L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Dashboard
                        </Link>
                        
                        <Link href="/dealroom" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 3H14V13H2V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 7H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M6 9H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          Dealroom
                        </Link>
                        
                        <Link href="/wallet" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4H14V12H2V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4 6H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          Wallet
                        </Link>
                        
                        <div className="dropdown-divider"></div>
                        
                        <button className="dropdown-item sign-out" onClick={handleSignOut}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 11L14 7L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Abmelden
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/sign-in">Anmelden</Link>
              )}
            </li>
          </ul>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="nav-mobile" role="navigation">
            <ul className="nav-list-mobile">
              <li><Link href="/browse" onClick={closeMobileMenu}>Entdecken</Link></li>
              <li><Link href="/valuation" onClick={closeMobileMenu}>Valuation</Link></li>
              <li><Link href="/wallet" onClick={closeMobileMenu}>Wallet</Link></li>
              <li><Link href="/dealroom" onClick={closeMobileMenu}>Dealroom</Link></li>
              <li><Link href="/insights" onClick={closeMobileMenu}>Insights</Link></li>
              <li><Link href="/list/create" className="nav-cta" onClick={closeMobileMenu}>Inserieren</Link></li>
              <li>
                {email ? (
                  <div className="mobile-user-section">
                    <Link href="/dashboard" className="mobile-user-link" onClick={closeMobileMenu}>
                      Konto
                    </Link>
                    <div className="mobile-user-actions">
                      <Link href="/dealroom" className="mobile-user-link" onClick={closeMobileMenu}>
                        Dealroom
                      </Link>
                      <Link href="/wallet" className="mobile-user-link" onClick={closeMobileMenu}>
                        Wallet
                      </Link>
                      <button className="mobile-sign-out" onClick={handleSignOut}>
                        Abmelden
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link href="/sign-in" onClick={closeMobileMenu}>Anmelden</Link>
                )}
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}


