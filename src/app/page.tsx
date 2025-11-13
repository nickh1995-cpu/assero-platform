'use client';

import { Header } from "@/components/Header";
import { FeaturedGridWrapper } from "@/components/FeaturedGridWrapper";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function HomeContent() {
  const searchParams = useSearchParams();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  useEffect(() => {
    // Check if user just verified email
    const verified = searchParams?.get('verified');
    if (verified === 'true') {
      setShowSuccessMessage(true);
      // Remove query param from URL
      window.history.replaceState({}, '', '/');
      // Hide message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
    
    // FAQ Toggle Functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
      question.addEventListener('click', () => {
        const faqItem = question.closest('.faq-item');
        const answer = faqItem?.querySelector('.faq-answer');
        const icon = question.querySelector('.faq-icon');
        const isExpanded = question.getAttribute('aria-expanded') === 'true';
        
        // Close all other FAQ items
        faqQuestions.forEach(otherQuestion => {
          if (otherQuestion !== question) {
            const otherFaqItem = otherQuestion.closest('.faq-item');
            const otherAnswer = otherFaqItem?.querySelector('.faq-answer');
            const otherIcon = otherQuestion.querySelector('.faq-icon');
            
            otherQuestion.setAttribute('aria-expanded', 'false');
            otherAnswer?.classList.remove('active');
            otherIcon?.classList.remove('rotated');
          }
        });
        
        // Toggle current FAQ item
        if (isExpanded) {
          question.setAttribute('aria-expanded', 'false');
          answer?.classList.remove('active');
          icon?.classList.remove('rotated');
        } else {
          question.setAttribute('aria-expanded', 'true');
          answer?.classList.add('active');
          icon?.classList.add('rotated');
        }
      });
    });
  }, []);
  return (
    <main>
      {/* Header */}
      <Header />
      
      {/* Success Message after Email Verification */}
      {showSuccessMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10b981',
          color: 'white',
          padding: '20px 32px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
          zIndex: 10000,
          maxWidth: '90%',
          textAlign: 'center',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <strong style={{ fontSize: '18px', display: 'block', marginBottom: '8px' }}>
            ✅ Registrierung abgeschlossen!
          </strong>
          <p style={{ margin: 0, fontSize: '16px' }}>
            Ihre E-Mail wurde erfolgreich verifiziert. Sie sind jetzt angemeldet.
          </p>
        </div>
      )}

      {/* Hero */}
      <section id="home" className="section hero" aria-label="Hero">
        <div className="video-wrap" aria-hidden="true">
          <video id="hero-video" playsInline autoPlay muted loop tabIndex={-1}>
            <source src="/assets/hero.mp4" type="video/mp4" />
          </video>
          <div className="hero-fog"></div>
          <div className="hero-vignette"></div>
        </div>
        <div className="container hero-content">
          <h1 className="brand-title">ASSERO</h1>
          <p className="subtitle">Europas erste Multi‑Asset‑Plattform für Inserate, Bewertung und Handel von Real‑Assets.</p>
        </div>
      </section>

      {/* Platform overview - Enhanced USP */}
      <section id="platform" className="section padded light">
        <div className="container">
          <div className="platform-hero">
            <h2 className="section-title">Die All‑in‑One Multi‑Asset‑Plattform.</h2>
            <p className="lead">Europas erste Plattform, die Real Estate, Luxusuhren und Fahrzeuge in einer einheitlichen Oberfläche vereint. Vom Inserat bis zum Abschluss – mit KI‑gestützten Bewertungen und professionellen Workflows.</p>
          </div>
          
          <div className="usp-grid">
            <div className="usp-card">
              <div className="usp-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>
                </svg>
              </div>
              <h3>Multi‑Asset in einer App</h3>
              <p>Real Estate, Luxusuhren und Fahrzeuge – alle Asset-Klassen mit einheitlichen Standards, Filtern und Vergleichsmöglichkeiten.</p>
              <div className="usp-stats">
                <span className="stat">3 Asset-Kategorien</span>
                <span className="stat">Einheitliche Daten</span>
              </div>
            </div>
            
            <div className="usp-card">
              <div className="usp-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3>KI‑gestützte Bewertungen</h3>
              <p>Marktführende Algorithmen liefern präzise Bewertungen, Comps und Rendite-Prognosen für jede Asset-Klasse.</p>
              <div className="usp-stats">
                <span className="stat">95% Genauigkeit</span>
                <span className="stat">Echtzeit-Daten</span>
              </div>
            </div>
            
            <div className="usp-card">
              <div className="usp-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3>Integrierter Dealroom</h3>
              <p>Professionelle Workflows für Anfragen, Dokumente, Verhandlungen und Abschlüsse – alles an einem Ort.</p>
              <div className="usp-stats">
                <span className="stat">Sichere Transaktionen</span>
                <span className="stat">Vollständige Dokumentation</span>
              </div>
            </div>
            
            <div className="usp-card">
              <div className="usp-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3>Asset‑Wallet</h3>
              <p>Watchlists, Portfolio und Alerts – verwalten Sie Ihre Assets zentral und verfolgen Sie die Wertentwicklung.</p>
              <div className="usp-stats">
                <span className="stat">Portfolio-Tracking</span>
                <span className="stat">Smart Alerts</span>
              </div>
            </div>
          </div>
          
          <div className="platform-cta">
            <Link href="/browse" className="btn-primary">Jetzt entdecken</Link>
            <a href="#how" className="btn-secondary">So funktioniert&apos;s</a>
          </div>
        </div>
      </section>


      {/* How it works - Enhanced Process */}
      <section id="how" className="section padded brand-dark">
        <div className="container">
          <div className="process-header">
            <h2 className="section-title">Von Entdecken bis Abschluss – in vier Schritten.</h2>
            <p className="process-subtitle">Ein durchdachter Workflow, der Ihnen Zeit spart und Sicherheit gibt</p>
          </div>
          
          <div className="process-timeline">
            <div className="timeline-row">
              <div className="process-step">
                <div className="step-number">01</div>
                <div className="step-content">
                  <h3>Inserieren oder entdecken</h3>
                  <p>Geführtes Onboarding mit vollständigen Daten. Ob Sie ein Asset verkaufen oder kaufen möchten – wir führen Sie durch den gesamten Prozess.</p>
                  <ul className="step-features">
                    <li>Intelligente Formulare mit Validierung</li>
                    <li>Automatische Kategorisierung</li>
                    <li>Datenqualitäts-Check</li>
                  </ul>
                </div>
              </div>
              
              <div className="process-step">
                <div className="step-number">02</div>
                <div className="step-content">
                  <h3>Bewerten & vergleichen</h3>
                  <p>KI‑gestützte Bewertungen und Marktanalysen liefern Ihnen präzise Einschätzungen und Vergleichsmöglichkeiten.</p>
                  <ul className="step-features">
                    <li>Echtzeit-Marktpreise</li>
                    <li>Rendite-Berechnungen</li>
                    <li>Ähnliche Assets finden</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="timeline-row">
              <div className="process-step">
                <div className="step-number">03</div>
                <div className="step-content">
                  <h3>Verhandeln</h3>
                  <p>Private Dealrooms ermöglichen sichere Kommunikation, Dokumentenaustausch und strukturierte Verhandlungen.</p>
                  <ul className="step-features">
                    <li>Verschlüsselte Kommunikation</li>
                    <li>Dokumenten-Management</li>
                    <li>Status-Tracking</li>
                  </ul>
                </div>
              </div>
              
              <div className="process-step">
                <div className="step-number">04</div>
                <div className="step-content">
                  <h3>Abschließen</h3>
                  <p>Sichere Workflows und vollständige Protokollierung sorgen für einen reibungslosen und nachvollziehbaren Abschluss.</p>
                  <ul className="step-features">
                    <li>Digitale Verträge</li>
                    <li>Zahlungsabwicklung</li>
                    <li>Vollständige Dokumentation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="process-cta">
            <Link href="/browse" className="btn-primary">Jetzt starten</Link>
            <Link href="/valuation" className="btn-secondary">Asset bewerten</Link>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <FeaturedGridWrapper />

      {/* Security & Trust - Integrated Value Proposition */}
      <section className="security-trust-section">
        <div className="container">
          <div className="security-header">
            <h2 className="security-title">Sicherheit & Vertrauen</h2>
            <p className="security-subtitle">Professionelle Standards für Ihre wertvollsten Transaktionen</p>
          </div>
          
          <div className="security-grid">
            <div className="security-card">
              <div className="security-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>DSGVO-konform</h3>
              <p>Höchste Datenschutzstandards mit vollständiger Transparenz und Kontrolle über Ihre Daten.</p>
            </div>
            
            <div className="security-card">
              <div className="security-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                </svg>
              </div>
              <h3>Verifizierte Partner</h3>
              <p>Alle Anbieter durchlaufen unser strenges Verifizierungsverfahren für maximale Sicherheit.</p>
            </div>
            
            <div className="security-card">
              <div className="security-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <h3>Vollständige Dokumentation</h3>
              <p>Jede Transaktion wird lückenlos dokumentiert und ist jederzeit nachvollziehbar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="faq-header">
            <h2 className="faq-title">Häufig gestellte Fragen</h2>
            <p className="faq-subtitle">Alles was Sie über ASSERO wissen müssen</p>
          </div>
          
          <div className="faq-grid">
            <div className="faq-item">
              <button className="faq-question" aria-expanded="false">
                <span>Was ist ASSERO?</span>
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <div className="faq-answer">
                <p>ASSERO ist Europas erste Multi-Asset-Plattform, die Real Estate, Luxusuhren und Fahrzeuge in einer einheitlichen Oberfläche vereint. Von der Bewertung bis zum Abschluss – alles an einem Ort.</p>
                <p>Unsere Plattform revolutioniert die Art, wie Premium-Assets bewertet, vermarktet und gehandelt werden. Mit KI-gestützter Bewertung und professioneller Betreuung bieten wir eine vollständige Lösung für anspruchsvolle Investoren.</p>
              </div>
            </div>
            
            <div className="faq-item">
              <button className="faq-question" aria-expanded="false">
                <span>Welche Asset-Klassen werden unterstützt?</span>
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <div className="faq-answer">
                <p>Wir unterstützen drei Premium-Asset-Klassen:</p>
                <ul>
                  <li><strong>Real Estate:</strong> Luxusimmobilien, Penthouses, Gewerbeimmobilien</li>
                  <li><strong>Luxusuhren:</strong> Rolex, Patek Philippe, Audemars Piguet und mehr</li>
                  <li><strong>Fahrzeuge:</strong> Sportwagen, Klassiker, Supercars</li>
                </ul>
                <p>Alle mit einheitlichen Standards, spezialisierten Filtern und Vergleichsmöglichkeiten.</p>
              </div>
            </div>
            
            <div className="faq-item">
              <button className="faq-question" aria-expanded="false">
                <span>Wie funktioniert die KI-gestützte Bewertung?</span>
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <div className="faq-answer">
                <p>Unsere KI analysiert umfassende Marktdaten:</p>
                <ul>
                  <li>Historische Preisentwicklungen und Markttrends</li>
                  <li>Standortfaktoren und Nachbarschaftsanalysen</li>
                  <li>Asset-spezifische Merkmale und Zustand</li>
                  <li>Vergleichbare Verkäufe und Marktvolatilität</li>
                </ul>
                <p>Mit 95% Genauigkeit und kontinuierlicher Verbesserung durch Machine Learning.</p>
              </div>
            </div>
            
            <div className="faq-item">
              <button className="faq-question" aria-expanded="false">
                <span>Was ist der integrierte Dealroom?</span>
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <div className="faq-answer">
                <p>Der Dealroom ist Ihr zentraler Transaktionshub:</p>
                <ul>
                  <li>Verwaltung aller Anfragen und Interessenten</li>
                  <li>Sichere Dokumentenablage und -freigabe</li>
                  <li>Verhandlungsprotokoll und Kommunikation</li>
                  <li>Automatisierte Workflows bis zum Abschluss</li>
                </ul>
                <p>Alles sicher und professionell an einem Ort.</p>
              </div>
            </div>
            
            <div className="faq-item">
              <button className="faq-question" aria-expanded="false">
                <span>Wie sicher sind meine Daten?</span>
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <div className="faq-answer">
                <p>Datensicherheit hat für uns höchste Priorität:</p>
                <ul>
                  <li>256-Bit-Verschlüsselung (Bank-Level-Sicherheit)</li>
                  <li>DSGVO-konforme Datenverarbeitung</li>
                  <li>Zwei-Faktor-Authentifizierung</li>
                  <li>Regelmäßige Sicherheitsaudits</li>
                  <li>Deutsche Rechenzentren</li>
                </ul>
              </div>
            </div>
            
            <div className="faq-item">
              <button className="faq-question" aria-expanded="false">
                <span>Kann ich auch als Verkäufer auf ASSERO aktiv werden?</span>
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <div className="faq-answer">
                <p>Ja, ASSERO ist für Käufer und Verkäufer gleichermaßen konzipiert:</p>
                <ol>
                  <li><strong>Registrierung:</strong> Kostenlose Anmeldung mit Verifikation</li>
                  <li><strong>Asset-Dokumentation:</strong> Hochladen aller relevanten Unterlagen</li>
                  <li><strong>Bewertung:</strong> KI-gestützte Analyse und Expertenvalidierung</li>
                  <li><strong>Vermarktung:</strong> Professionelle Präsentation und Marketing</li>
                  <li><strong>Transaktion:</strong> Begleitung bis zum erfolgreichen Abschluss</li>
                </ol>
              </div>
            </div>
            
            <div className="faq-item">
              <button className="faq-question" aria-expanded="false">
                <span>Was ist die Asset-Wallet?</span>
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <div className="faq-answer">
                <p>Die Asset-Wallet ist Ihr persönliches Portfolio-Management:</p>
                <ul>
                  <li>Verwalten Sie Watchlists und Favoriten</li>
                  <li>Verfolgen Sie die Wertentwicklung Ihrer Assets</li>
                  <li>Smart Alerts bei relevanten Marktveränderungen</li>
                  <li>Performance-Analysen und Reporting</li>
                  <li>Integration mit externen Portfolios</li>
                </ul>
              </div>
            </div>
            
            <div className="faq-item">
              <button className="faq-question" aria-expanded="false">
                <span>Wie unterscheidet sich ASSERO von anderen Plattformen?</span>
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <div className="faq-answer">
                <p>ASSERO ist einzigartig durch:</p>
                <ul>
                  <li><strong>Multi-Asset-Ansatz:</strong> Verschiedene Asset-Klassen mit einheitlichen Standards</li>
                  <li><strong>Premium Kuratierung:</strong> Nur hochwertige, verifizierte Assets</li>
                  <li><strong>KI-gestützte Bewertungen:</strong> Präzise, datenbasierte Analysen</li>
                  <li><strong>Integrierter Dealroom:</strong> Vollständiger Transaktionsprozess</li>
                  <li><strong>Professionelle Betreuung:</strong> Persönliche Berater für jeden Kunden</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="faq-cta">
            <p className="faq-cta-text">Weitere Fragen? Kontaktieren Sie uns gerne.</p>
            <Link href="/browse" className="btn-primary">Jetzt entdecken</Link>
          </div>
        </div>
      </section>

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

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
