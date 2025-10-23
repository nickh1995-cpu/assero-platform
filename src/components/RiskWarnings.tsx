'use client';

import styles from './RiskWarnings.module.css';

interface Warning {
  id: string;
  title: string;
  message: string;
  impact: string;
  severity: 'high' | 'medium' | 'low';
}

interface RiskWarningsProps {
  assetType: 'immobilien' | 'luxusuhren' | 'fahrzeuge';
  formData: any;
}

export default function RiskWarnings({ assetType, formData }: RiskWarningsProps) {
  const warnings: Warning[] = [];

  // Real Estate Warnings
  if (assetType === 'immobilien') {
    // Very old building without renovation
    const currentYear = new Date().getFullYear();
    const age = currentYear - formData.buildYear;
    if (age > 80 && formData.condition === 'needs_renovation') {
      warnings.push({
        id: 'old-unrenovated',
        title: 'Hoher Sanierungsbedarf',
        message: 'Gebäude über 80 Jahre ohne Sanierung benötigen oft umfassende Modernisierung (Elektrik, Heizung, Dämmung)',
        impact: 'Zusatzkosten: €40.000 - €100.000+',
        severity: 'high'
      });
    }

    // Poor energy rating
    if (['F', 'G', 'H'].includes(formData.energyRating)) {
      warnings.push({
        id: 'poor-energy',
        title: 'Schlechte Energieeffizienz',
        message: 'Energieausweis F-H führt zu hohen Nebenkosten und geringerer Verkäuflichkeit. Sanierung oft erforderlich.',
        impact: 'Wertverlust: -8% bis -15%',
        severity: 'medium'
      });
    }

    // Ground floor without garden
    if (formData.floor === '0' && !formData.hasGarden && formData.propertyType === 'wohnung') {
      warnings.push({
        id: 'ground-floor',
        title: 'Erdgeschoss ohne Garten',
        message: 'Erdgeschosswohnungen ohne Garten/Terrasse sind schwerer verkäuflich und weniger wertbeständig',
        impact: 'Wertverlust: -5% bis -10%',
        severity: 'low'
      });
    }
  }

  // Luxury Watch Warnings
  if (assetType === 'luxusuhren') {
    // No papers
    if (!formData.hasPapers) {
      warnings.push({
        id: 'no-papers',
        title: 'Keine Originalpapiere',
        message: 'Fehlende Papiere erschweren den Weiterverkauf erheblich und reduzieren den Wert drastisch',
        impact: 'Wertverlust: -15% bis -25%',
        severity: 'high'
      });
    }

    // Fair condition
    if (formData.watchCondition === 'fair') {
      warnings.push({
        id: 'fair-condition',
        title: 'Zustand nur ausreichend',
        message: 'Uhren in ausreichendem Zustand sind schwer zu verkaufen. Käufer bevorzugen sehr guten bis mint Zustand',
        impact: 'Wertverlust: -20% bis -35%',
        severity: 'medium'
      });
    }

    // Old watch without service
    const watchAge = new Date().getFullYear() - formData.watchYear;
    if (watchAge > 8 && !formData.hasServiceHistory) {
      warnings.push({
        id: 'old-no-service',
        title: 'Ältere Uhr ohne Service-Historie',
        message: 'Mechanische Uhren benötigen regelmäßige Wartung (alle 5-7 Jahre). Fehlende Service-Historie deutet auf Vernachlässigung hin',
        impact: 'Service nötig: €800 - €2.500',
        severity: 'medium'
      });
    }
  }

  // Vehicle Warnings
  if (assetType === 'fahrzeuge') {
    // Accident damage
    if (!formData.isAccidentFree) {
      warnings.push({
        id: 'accident-damage',
        title: 'Unfallschaden',
        message: 'Fahrzeuge mit Unfallhistorie verlieren erheblich an Wert und sind deutlich schwerer zu verkaufen',
        impact: 'Wertverlust: -15% bis -30%',
        severity: 'high'
      });
    }

    // Very high mileage
    const age = new Date().getFullYear() - formData.vehicleYear;
    const expectedMileage = age * 15000;
    if (formData.mileageKm > expectedMileage * 2) {
      warnings.push({
        id: 'very-high-mileage',
        title: 'Sehr hohe Laufleistung',
        message: `Laufleistung deutlich über dem Durchschnitt (erwartet: ~${Math.round(expectedMileage).toLocaleString('de-DE')} km). Erhöhtes Verschleißrisiko.`,
        impact: 'Wertverlust: -18% bis -30%',
        severity: 'high'
      });
    }

    // No service book
    if (!formData.hasServiceBook && formData.mileageKm > 30000) {
      warnings.push({
        id: 'no-service-book',
        title: 'Kein Scheckheft',
        message: 'Fehlende Service-Dokumentation erschwert den Verkauf und lässt Zweifel an der Pflege aufkommen',
        impact: 'Wertverlust: -5% bis -10%',
        severity: 'medium'
      });
    }

    // Many previous owners
    if (formData.previousOwners >= 4) {
      warnings.push({
        id: 'many-owners',
        title: 'Viele Vorbesitzer',
        message: `${formData.previousOwners} Vorbesitzer deuten auf häufigen Halterwechsel hin, was Käufer abschreckt`,
        impact: 'Wertverlust: -8% bis -12%',
        severity: 'medium'
      });
    }

    // Old vehicle in used condition
    if (age > 10 && formData.vehicleCondition === 'used') {
      warnings.push({
        id: 'old-used',
        title: 'Hohes Alter mit Gebrauchsspuren',
        message: 'Fahrzeuge über 10 Jahre mit sichtbaren Gebrauchsspuren benötigen oft umfangreiche Instandsetzung',
        impact: 'Zusatzkosten möglich: €5.000 - €15.000',
        severity: 'low'
      });
    }
  }

  if (warnings.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <svg className={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className={styles.title}>⚠️ Wert-Risiken</h3>
      </div>

      <p className={styles.description}>
        Folgende Faktoren könnten den Wert Ihres Assets negativ beeinflussen:
      </p>

      <div className={styles.warnings}>
        {warnings.map((warning) => (
          <div
            key={warning.id}
            className={`${styles.warning} ${styles[warning.severity]}`}
          >
            <div className={styles.warningHeader}>
              <div className={styles.severityBadge}>
                {warning.severity === 'high' && '🔴'}
                {warning.severity === 'medium' && '🟡'}
                {warning.severity === 'low' && '🟢'}
              </div>
              <h4 className={styles.warningTitle}>{warning.title}</h4>
            </div>
            <p className={styles.warningMessage}>{warning.message}</p>
            <div className={styles.warningImpact}>
              <svg className={styles.impactIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              {warning.impact}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

