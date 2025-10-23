"use client";

import React, { useState } from 'react';
import styles from './WatchlistCTA.module.css';

interface WatchlistCTAProps {
  assetType: 'real-estate' | 'luxusuhren' | 'fahrzeuge';
  estimatedValue: number;
  assetDetails?: {
    brand?: string;
    model?: string;
    location?: string;
  };
}

export default function WatchlistCTA({ assetType, estimatedValue, assetDetails }: WatchlistCTAProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  
  const assetTypeLabels = {
    'real-estate': 'Immobilie',
    'luxusuhren': 'Luxusuhr',
    'fahrzeuge': 'Fahrzeug'
  };
  
  const handleAddToWatchlist = () => {
    if (!showEmailForm) {
      setShowEmailForm(true);
      return;
    }
    
    if (email && email.includes('@')) {
      // In production: Send to API
      console.log('Adding to watchlist:', { assetType, estimatedValue, email, assetDetails });
      setIsAdded(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsAdded(false);
        setShowEmailForm(false);
        setEmail('');
      }, 3000);
    }
  };
  
  const formatPrice = (num: number) => 
    new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0 
    }).format(num);
  
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {!isAdded ? (
          <>
            <div className={styles.iconSection}>
              <div className={styles.iconCircle}>
                <span className={styles.icon}>🔔</span>
              </div>
            </div>
            
            <div className={styles.content}>
              <h3 className={styles.title}>
                Bleiben Sie informiert
              </h3>
              <p className={styles.description}>
                Erhalten Sie Updates zu ähnlichen {assetTypeLabels[assetType]}en 
                in der Preisklasse {formatPrice(estimatedValue * 0.8)} - {formatPrice(estimatedValue * 1.2)}
              </p>
              
              {assetDetails && (
                <div className={styles.assetInfo}>
                  {assetDetails.brand && assetDetails.model && (
                    <span className={styles.badge}>
                      {assetDetails.brand} {assetDetails.model}
                    </span>
                  )}
                  {assetDetails.location && (
                    <span className={styles.badge}>
                      📍 {assetDetails.location}
                    </span>
                  )}
                </div>
              )}
              
              {!showEmailForm ? (
                <button 
                  onClick={handleAddToWatchlist}
                  className={styles.button}
                >
                  <span className={styles.buttonIcon}>+</span>
                  Zur Watchlist hinzufügen
                </button>
              ) : (
                <div className={styles.emailForm}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ihre.email@beispiel.de"
                    className={styles.emailInput}
                    autoFocus
                  />
                  <button 
                    onClick={handleAddToWatchlist}
                    className={styles.submitButton}
                    disabled={!email || !email.includes('@')}
                  >
                    ✓ Abonnieren
                  </button>
                </div>
              )}
              
              <p className={styles.benefits}>
                ✓ Marktpreis-Alerts &nbsp;·&nbsp; ✓ Neue Angebote &nbsp;·&nbsp; ✓ Trendanalysen
              </p>
            </div>
          </>
        ) : (
          <div className={styles.successState}>
            <div className={styles.successIcon}>✓</div>
            <h3 className={styles.successTitle}>Erfolgreich hinzugefügt!</h3>
            <p className={styles.successMessage}>
              Sie erhalten ab jetzt Updates zu passenden Angeboten.
            </p>
          </div>
        )}
      </div>
      
      <div className={styles.trust}>
        <span className={styles.trustIcon}>🔒</span>
        <span className={styles.trustText}>
          Ihre Daten sind sicher. Jederzeit kündbar. Kein Spam.
        </span>
      </div>
    </div>
  );
}

