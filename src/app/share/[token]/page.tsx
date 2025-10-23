'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import styles from './share.module.css';

interface ValuationData {
  id: string;
  asset_type: string;
  form_data: any;
  estimated_value: number;
  value_min: number;
  value_max: number;
  title: string;
  created_at: string;
}

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const [valuation, setValuation] = useState<ValuationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSharedValuation();
  }, [resolvedParams.token]);

  const fetchSharedValuation = async () => {
    try {
      const response = await fetch(`/api/share/${resolvedParams.token}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch valuation');
      }

      const data = await response.json();
      setValuation(data.valuation);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'real-estate': return '🏠';
      case 'luxusuhren': return '⌚';
      case 'fahrzeuge': return '🚗';
      default: return '📊';
    }
  };

  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case 'real-estate': return 'Immobilie';
      case 'luxusuhren': return 'Luxusuhr';
      case 'fahrzeuge': return 'Fahrzeug';
      default: return 'Asset';
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Laden...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>Bewertung nicht verfügbar</h2>
        <p>{error}</p>
        <a href="/" className={styles.homeLink}>Zur Startseite</a>
      </div>
    );
  }

  if (!valuation) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoText}>ASSERO</span>
          <span className={styles.logoTagline}>Asset Valuation</span>
        </div>
        <div className={styles.badge}>
          🔓 Öffentliche Bewertung
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Title Section */}
        <div className={styles.titleSection}>
          <div className={styles.assetIcon}>
            {getAssetIcon(valuation.asset_type)}
          </div>
          <div>
            <h1 className={styles.title}>{valuation.title}</h1>
            <p className={styles.meta}>
              {getAssetTypeLabel(valuation.asset_type)} • Erstellt am {formatDate(valuation.created_at)}
            </p>
          </div>
        </div>

        {/* Valuation Card */}
        <div className={styles.valuationCard}>
          <p className={styles.valuationLabel}>Geschätzte Bewertung</p>
          <h2 className={styles.valuationAmount}>
            {formatCurrency(valuation.estimated_value)}
          </h2>
          <div className={styles.range}>
            <div className={styles.rangeBar}>
              <div className={styles.rangeIndicator}></div>
            </div>
            <div className={styles.rangeLabels}>
              <span>{formatCurrency(valuation.value_min)}</span>
              <span>{formatCurrency(valuation.value_max)}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className={styles.detailsCard}>
          <h3 className={styles.detailsTitle}>Asset-Details</h3>
          <div className={styles.detailsGrid}>
            {Object.entries(valuation.form_data).slice(0, 10).map(([key, value]: [string, any]) => {
              if (!value || value === '' || value === false) return null;
              
              return (
                <div key={key} className={styles.detailItem}>
                  <span className={styles.detailKey}>{formatKey(key)}</span>
                  <span className={styles.detailValue}>{formatValue(value)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className={styles.cta}>
          <div className={styles.ctaContent}>
            <h3 className={styles.ctaTitle}>Erstellen Sie Ihre eigene Bewertung</h3>
            <p className={styles.ctaText}>
              Bewerten Sie Ihre Immobilien, Luxusuhren und Fahrzeuge kostenlos auf ASSERO.
            </p>
            <a href="/valuation" className={styles.ctaButton}>
              <svg className={styles.ctaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Jetzt bewerten
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className={styles.disclaimer}>
          <p>
            <strong>⚠️ Hinweis:</strong> Diese Bewertung wurde algorithmisch erstellt und dient ausschließlich zu Informationszwecken. Sie stellt keine rechtlich bindende Wertermittlung dar.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>© ASSERO - Asset Valuation Platform</p>
        <a href="/privacy">Datenschutz</a>
        <a href="/terms">AGB</a>
      </div>
    </div>
  );
}

// Helper functions
function formatKey(key: string): string {
  const labels: Record<string, string> = {
    locationAddress: 'Standort',
    propertyType: 'Immobilientyp',
    areaSqm: 'Wohnfläche',
    rooms: 'Zimmer',
    buildYear: 'Baujahr',
    watchBrand: 'Marke',
    watchModel: 'Modell',
    watchYear: 'Herstellungsjahr',
    vehicleBrand: 'Marke',
    vehicleModel: 'Modell',
    vehicleYear: 'Herstellungsjahr',
    mileageKm: 'Laufleistung'
  };
  return labels[key] || key;
}

function formatValue(value: any): string {
  if (typeof value === 'boolean') {
    return value ? 'Ja' : 'Nein';
  }
  if (typeof value === 'number') {
    return value.toLocaleString('de-DE');
  }
  return String(value);
}

