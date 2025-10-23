"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        setEmail(data.user?.email ?? null);
      }).catch((error) => {
        console.warn("Error getting user:", error);
        setEmail(null);
      });
    }
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

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
            <li>{email ? <Link href="/dashboard">Konto</Link> : <Link href="/sign-in">Anmelden</Link>}</li>
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
              <li>{email ? <Link href="/dashboard" onClick={closeMobileMenu}>Konto</Link> : <Link href="/sign-in" onClick={closeMobileMenu}>Anmelden</Link>}</li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}


