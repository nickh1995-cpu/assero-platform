"use client";

import { useState } from "react";
import styles from "./FallbackDealroom.module.css";

interface FallbackDealroomProps {
  onRetry?: () => void;
}

export function FallbackDealroom({ onRetry }: FallbackDealroomProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry?.();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className={styles.fallbackContainer}>
      <div className={styles.fallbackContent}>
        <div className={styles.fallbackIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
        </div>
        
        <h2 className={styles.fallbackTitle}>Verbindungsproblem</h2>
        <p className={styles.fallbackDescription}>
          Es gab ein Problem beim Laden der Daten. Dies kann verschiedene Ursachen haben:
        </p>
        
        <ul className={styles.fallbackList}>
          <li>Datenbank-Tabellen sind noch nicht eingerichtet</li>
          <li>Netzwerkverbindung ist langsam</li>
          <li>Benutzer-Authentifizierung ist fehlgeschlagen</li>
        </ul>
        
        <div className={styles.fallbackActions}>
          <button 
            className={styles.retryButton}
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <div className={styles.spinner}></div>
                Wird versucht...
              </>
            ) : (
              'Erneut versuchen'
            )}
          </button>
          
          <button 
            className={styles.setupButton}
            onClick={() => window.location.href = '/setup'}
          >
            Setup starten
          </button>
        </div>
        
        <div className={styles.fallbackHelp}>
          <h3>Hilfe benötigt?</h3>
          <p>
            Falls das Problem weiterhin besteht, überprüfen Sie:
          </p>
          <ul>
            <li>Supabase-Verbindung in den Umgebungsvariablen</li>
            <li>Datenbank-Schema ist korrekt eingerichtet</li>
            <li>Browser-Konsole für detaillierte Fehlermeldungen</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
