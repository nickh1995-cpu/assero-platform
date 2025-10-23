'use client';

import styles from './SmartSuggestions.module.css';

interface Suggestion {
  id: string;
  message: string;
  impact: string; // e.g., "+6% Wert"
  type: 'upgrade' | 'info' | 'warning';
  icon: string;
}

interface SmartSuggestionsProps {
  assetType: 'immobilien' | 'luxusuhren' | 'fahrzeuge';
  formData: any;
}

export default function SmartSuggestions({ assetType, formData }: SmartSuggestionsProps) {
  const suggestions: Suggestion[] = [];

  // Real Estate Suggestions
  if (assetType === 'immobilien') {
    // Energy Rating Suggestion
    if (!formData.energyRating || ['D', 'E', 'F', 'G', 'H'].includes(formData.energyRating)) {
      suggestions.push({
        id: 'energy-upgrade',
        message: 'Betrachten Sie eine Energieausweis-Verbesserung',
        impact: '+3-8% Wert',
        type: 'upgrade',
        icon: '⚡'
      });
    }

    // Condition Suggestion
    if (formData.condition === 'needs_renovation') {
      suggestions.push({
        id: 'renovation',
        message: 'Eine Renovierung könnte den Wert deutlich steigern',
        impact: '+12-20% Wert',
        type: 'upgrade',
        icon: '🔨'
      });
    }

    // Balcony/Terrace
    if (!formData.hasBalcony && formData.propertyType === 'wohnung') {
      suggestions.push({
        id: 'balcony-info',
        message: 'Balkon oder Terrasse erhöhen die Attraktivität',
        impact: '+3-5% Wert',
        type: 'info',
        icon: '🌿'
      });
    }

    // Build Year Warning
    const currentYear = new Date().getFullYear();
    const age = currentYear - formData.buildYear;
    if (age > 50 && formData.condition !== 'saniert' && formData.condition !== 'renovated') {
      suggestions.push({
        id: 'old-building',
        message: 'Altbauten ohne Sanierung benötigen oft umfangreiche Modernisierung',
        impact: 'Beachten bei Bewertung',
        type: 'warning',
        icon: '⚠️'
      });
    }
  }

  // Luxury Watch Suggestions
  if (assetType === 'luxusuhren') {
    // Box & Papers
    if (!formData.hasBox || !formData.hasPapers) {
      const missing = [];
      if (!formData.hasBox) missing.push('Box');
      if (!formData.hasPapers) missing.push('Papiere');
      suggestions.push({
        id: 'box-papers',
        message: `${missing.join(' und ')} erhöhen den Wert erheblich`,
        impact: formData.hasBox || formData.hasPapers ? '+10-12%' : '+18-25% Wert',
        type: 'info',
        icon: '📦'
      });
    }

    // Service History
    if (!formData.hasServiceHistory) {
      const age = new Date().getFullYear() - formData.watchYear;
      if (age > 5) {
        suggestions.push({
          id: 'service-history',
          message: 'Service-Historie dokumentiert erhöht Vertrauen bei Käufern',
          impact: '+3-5% Wert',
          type: 'upgrade',
          icon: '🔧'
        });
      }
    }

    // Limited Edition
    if (formData.isLimitedEdition) {
      suggestions.push({
        id: 'limited-edition-info',
        message: 'Limitierte Editionen haben oft hohes Wertsteigerungs-Potenzial',
        impact: 'Langfristig +15-40%',
        type: 'info',
        icon: '⭐'
      });
    }

    // Condition Warning
    if (formData.watchCondition === 'fair') {
      suggestions.push({
        id: 'condition-warning',
        message: 'Professionelle Aufbereitung könnte sich lohnen',
        impact: '+8-12% nach Service',
        type: 'warning',
        icon: '⚠️'
      });
    }
  }

  // Vehicle Suggestions
  if (assetType === 'fahrzeuge') {
    // High Mileage Warning
    const age = new Date().getFullYear() - formData.vehicleYear;
    const expectedMileage = age * 15000;
    if (formData.mileageKm > expectedMileage * 1.5) {
      suggestions.push({
        id: 'high-mileage',
        message: 'Hohe Laufleistung reduziert den Wert deutlich',
        impact: '-10-18% Wert',
        type: 'warning',
        icon: '⚠️'
      });
    }

    // Service Book
    if (!formData.hasServiceBook) {
      suggestions.push({
        id: 'service-book',
        message: 'Scheckheft-gepflegte Fahrzeuge erzielen höhere Preise',
        impact: '+5-8% Wert',
        type: 'upgrade',
        icon: '📓'
      });
    }

    // Accident-Free
    if (!formData.isAccidentFree) {
      suggestions.push({
        id: 'accident-history',
        message: 'Unfallfreiheit ist ein wichtiger Werttreiber',
        impact: 'Unfall: -15-25%',
        type: 'warning',
        icon: '🚨'
      });
    }

    // First Owner
    if (formData.previousOwners === 0) {
      suggestions.push({
        id: 'first-owner',
        message: 'Erstbesitz ist ein starkes Verkaufsargument',
        impact: '+5-8% Wert',
        type: 'info',
        icon: '🏆'
      });
    }

    // Warranty
    if (formData.hasWarranty) {
      suggestions.push({
        id: 'warranty-info',
        message: 'Restgarantie erhöht die Attraktivität erheblich',
        impact: '+3-5% Wert',
        type: 'info',
        icon: '✅'
      });
    }
  }

  if (suggestions.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <svg className={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className={styles.title}>💡 Smart Insights</h3>
      </div>

      <div className={styles.suggestions}>
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`${styles.suggestion} ${styles[suggestion.type]}`}
          >
            <div className={styles.suggestionIcon}>{suggestion.icon}</div>
            <div className={styles.suggestionContent}>
              <p className={styles.suggestionMessage}>{suggestion.message}</p>
              <span className={styles.suggestionImpact}>{suggestion.impact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

