"use client";

/**
 * ASSERO REAL ESTATE FORM - Step 2
 * Phase 3.1: Basic Information Form for Real Estate Listings
 */

import { useState, useEffect } from 'react';
import type { RealEstateMetadata, PropertyType, PropertyCondition, HeatingType, EnergyRating } from '@/types/listing-metadata';
import { REAL_ESTATE_FEATURES } from '@/types/listing-metadata';
import styles from './RealEstateForm.module.css';

interface RealEstateFormProps {
  // Form Data
  title: string;
  description: string;
  price: number | null;
  currency: string;
  location: string;
  metadata: Partial<RealEstateMetadata>;
  
  // Handlers
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: number | null) => void;
  onCurrencyChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onMetadataChange: (metadata: Partial<RealEstateMetadata>) => void;
  
  // Validation
  validationErrors?: Record<string, string>;
}

export function RealEstateForm({
  title,
  description,
  price,
  currency,
  location,
  metadata,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onCurrencyChange,
  onLocationChange,
  onMetadataChange,
  validationErrors = {},
}: RealEstateFormProps) {

  // Local state for character counts
  const [titleLength, setTitleLength] = useState(title.length);
  const [descLength, setDescLength] = useState(description.length);

  useEffect(() => {
    setTitleLength(title.length);
  }, [title]);

  useEffect(() => {
    setDescLength(description.length);
  }, [description]);

  // Property Types
  const propertyTypes: { value: PropertyType; label: string; icon: string }[] = [
    { value: 'wohnung', label: 'Wohnung', icon: '🏢' },
    { value: 'haus', label: 'Haus', icon: '🏡' },
    { value: 'villa', label: 'Villa', icon: '🏰' },
    { value: 'penthouse', label: 'Penthouse', icon: '🏙️' },
    { value: 'gewerbe', label: 'Gewerbe', icon: '🏢' },
    { value: 'grundstueck', label: 'Grundstück', icon: '🏞️' },
  ];

  const conditions: { value: PropertyCondition; label: string }[] = [
    { value: 'new', label: 'Neubau' },
    { value: 'renovated', label: 'Renoviert' },
    { value: 'good', label: 'Guter Zustand' },
    { value: 'needs_renovation', label: 'Sanierungsbedürftig' },
  ];

  return (
    <div className={styles.formContainer}>
      
      {/* Header */}
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Immobilien-Details</h2>
        <p className={styles.formSubtitle}>
          Geben Sie die wichtigsten Informationen zu Ihrer Immobilie ein
        </p>
      </div>

      {/* Form Grid */}
      <div className={styles.formGrid}>

        {/* Section 1: Grunddaten */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>📋 Grunddaten</h3>

          {/* Titel */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Titel <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${validationErrors.title ? styles.inputError : ''}`}
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="z.B. Moderne 3-Zimmer Wohnung in München Altstadt"
              maxLength={100}
            />
            <div className={styles.inputMeta}>
              <span className={titleLength < 10 ? styles.metaError : styles.metaSuccess}>
                {titleLength}/100 Zeichen
              </span>
              {titleLength < 10 && <span className={styles.metaHint}>Mindestens 10 Zeichen</span>}
            </div>
            {validationErrors.title && (
              <div className={styles.errorMessage}>{validationErrors.title}</div>
            )}
          </div>

          {/* Beschreibung */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Beschreibung <span className={styles.required}>*</span>
            </label>
            <textarea
              className={`${styles.textarea} ${validationErrors.description ? styles.inputError : ''}`}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Beschreiben Sie Ihre Immobilie ausführlich..."
              rows={6}
              maxLength={2000}
            />
            <div className={styles.inputMeta}>
              <span className={descLength < 50 ? styles.metaError : styles.metaSuccess}>
                {descLength}/2000 Zeichen
              </span>
              {descLength < 50 && <span className={styles.metaHint}>Mindestens 50 Zeichen für eine gute Beschreibung</span>}
            </div>
            {validationErrors.description && (
              <div className={styles.errorMessage}>{validationErrors.description}</div>
            )}
          </div>

          {/* Preis & Währung */}
          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 2 }}>
              <label className={styles.label}>
                Preis <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                className={`${styles.input} ${validationErrors.price ? styles.inputError : ''}`}
                value={price || ''}
                onChange={(e) => onPriceChange(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="0"
                min="0"
                step="1000"
              />
              {validationErrors.price && (
                <div className={styles.errorMessage}>{validationErrors.price}</div>
              )}
            </div>

            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Währung</label>
              <select
                className={styles.select}
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value)}
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          {/* Standort */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Standort <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${validationErrors.location ? styles.inputError : ''}`}
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="z.B. München, Altstadt"
            />
            {validationErrors.location && (
              <div className={styles.errorMessage}>{validationErrors.location}</div>
            )}
          </div>
        </div>

        {/* Section 2: Immobilientyp & Zustand */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>🏠 Immobilientyp & Zustand</h3>

          {/* Property Type */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Immobilientyp <span className={styles.required}>*</span>
            </label>
            <div className={styles.propertyTypeGrid}>
              {propertyTypes.map((type) => {
                const isSelected = metadata.property_type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    className={`${styles.propertyTypeCard} ${isSelected ? styles.propertyTypeSelected : ''}`}
                    onClick={() => onMetadataChange({ ...metadata, property_type: type.value })}
                  >
                    <span className={styles.propertyTypeIcon}>{type.icon}</span>
                    <span className={styles.propertyTypeLabel}>{type.label}</span>
                  </button>
                );
              })}
            </div>
            {validationErrors.property_type && (
              <div className={styles.errorMessage}>{validationErrors.property_type}</div>
            )}
          </div>

          {/* Condition */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Zustand <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${validationErrors.condition ? styles.inputError : ''}`}
              value={metadata.condition || ''}
              onChange={(e) => onMetadataChange({ ...metadata, condition: e.target.value as PropertyCondition })}
            >
              <option value="">Bitte wählen</option>
              {conditions.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
            {validationErrors.condition && (
              <div className={styles.errorMessage}>{validationErrors.condition}</div>
            )}
          </div>

          {/* Baujahr */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Baujahr <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              className={`${styles.input} ${validationErrors.year_built ? styles.inputError : ''}`}
              value={metadata.year_built || ''}
              onChange={(e) => onMetadataChange({ ...metadata, year_built: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="z.B. 2020"
              min="1800"
              max={new Date().getFullYear() + 2}
            />
            {validationErrors.year_built && (
              <div className={styles.errorMessage}>{validationErrors.year_built}</div>
            )}
          </div>
        </div>

        {/* Section 3: Flächen & Räume */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>📐 Flächen & Räume</h3>

          <div className={styles.formRow}>
            {/* Wohnfläche */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Wohnfläche (m²) <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                className={`${styles.input} ${validationErrors.area_sqm ? styles.inputError : ''}`}
                value={metadata.area_sqm || ''}
                onChange={(e) => onMetadataChange({ ...metadata, area_sqm: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="z.B. 95"
                min="0"
                step="0.1"
              />
              {validationErrors.area_sqm && (
                <div className={styles.errorMessage}>{validationErrors.area_sqm}</div>
              )}
            </div>

            {/* Grundstücksfläche */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Grundstücksfläche (m²)</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.land_area_sqm || ''}
                onChange={(e) => onMetadataChange({ ...metadata, land_area_sqm: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Optional"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            {/* Zimmer */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Anzahl Zimmer <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                className={`${styles.input} ${validationErrors.rooms ? styles.inputError : ''}`}
                value={metadata.rooms || ''}
                onChange={(e) => onMetadataChange({ ...metadata, rooms: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="z.B. 3"
                min="0.5"
                step="0.5"
              />
              {validationErrors.rooms && (
                <div className={styles.errorMessage}>{validationErrors.rooms}</div>
              )}
            </div>

            {/* Schlafzimmer */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Schlafzimmer</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.bedrooms || ''}
                onChange={(e) => onMetadataChange({ ...metadata, bedrooms: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Optional"
                min="0"
              />
            </div>

            {/* Badezimmer */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Badezimmer</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.bathrooms || ''}
                onChange={(e) => onMetadataChange({ ...metadata, bathrooms: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Optional"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Lage & Etage */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>🏢 Lage & Etage</h3>

          <div className={styles.formRow}>
            {/* Etage */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Etage</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.floor !== undefined ? metadata.floor : ''}
                onChange={(e) => onMetadataChange({ ...metadata, floor: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="-1 = Keller, 0 = EG, 1+ = Etagen"
                step="1"
              />
              <div className={styles.inputMeta}>
                <span className={styles.metaHint}>Hinweis: -1 = Keller, 0 = Erdgeschoss</span>
              </div>
            </div>

            {/* Gesamtetagen */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Gesamtanzahl Etagen</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.total_floors || ''}
                onChange={(e) => onMetadataChange({ ...metadata, total_floors: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="z.B. 5"
                min="0"
              />
            </div>

            {/* Parkplätze */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Stellplätze</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.parking_spots || ''}
                onChange={(e) => onMetadataChange({ ...metadata, parking_spots: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Anzahl"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Ausstattung & Features */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>✨ Ausstattung & Features</h3>

          {/* Feature Categories */}
          <div className={styles.featureCategories}>
            {/* Basic Features */}
            <div className={styles.featureCategory}>
              <h4 className={styles.featureCategoryTitle}>Basis-Ausstattung</h4>
              <div className={styles.featureGrid}>
                {REAL_ESTATE_FEATURES.basic.map((feature) => {
                  const isChecked = metadata.features?.includes(feature) || false;
                  return (
                    <label key={feature} className={styles.featureCheckbox}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const currentFeatures = metadata.features || [];
                          const newFeatures = e.target.checked
                            ? [...currentFeatures, feature]
                            : currentFeatures.filter(f => f !== feature);
                          onMetadataChange({ ...metadata, features: newFeatures });
                        }}
                      />
                      <span className={styles.featureLabel}>{feature}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Comfort Features */}
            <div className={styles.featureCategory}>
              <h4 className={styles.featureCategoryTitle}>Komfort</h4>
              <div className={styles.featureGrid}>
                {REAL_ESTATE_FEATURES.comfort.map((feature) => {
                  const isChecked = metadata.features?.includes(feature) || false;
                  return (
                    <label key={feature} className={styles.featureCheckbox}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const currentFeatures = metadata.features || [];
                          const newFeatures = e.target.checked
                            ? [...currentFeatures, feature]
                            : currentFeatures.filter(f => f !== feature);
                          onMetadataChange({ ...metadata, features: newFeatures });
                        }}
                      />
                      <span className={styles.featureLabel}>{feature}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Premium Features */}
            <div className={styles.featureCategory}>
              <h4 className={styles.featureCategoryTitle}>Premium</h4>
              <div className={styles.featureGrid}>
                {REAL_ESTATE_FEATURES.premium.map((feature) => {
                  const isChecked = metadata.features?.includes(feature) || false;
                  return (
                    <label key={feature} className={styles.featureCheckbox}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const currentFeatures = metadata.features || [];
                          const newFeatures = e.target.checked
                            ? [...currentFeatures, feature]
                            : currentFeatures.filter(f => f !== feature);
                          onMetadataChange({ ...metadata, features: newFeatures });
                        }}
                      />
                      <span className={styles.featureLabel}>{feature}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Features Count */}
          {metadata.features && metadata.features.length > 0 && (
            <div className={styles.featureCount}>
              ✓ {metadata.features.length} Feature{metadata.features.length > 1 ? 's' : ''} ausgewählt
            </div>
          )}
        </div>

        {/* Section 6: Investment/Finanzen (Optional) */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>💰 Investment-Daten (Optional)</h3>
          <p className={styles.sectionSubtitle}>
            Nur relevant für Investment-Immobilien oder vermietete Objekte
          </p>

          <div className={styles.formRow}>
            {/* Mieteinnahmen */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Mieteinnahmen/Monat (€)</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.rental_income_monthly || ''}
                onChange={(e) => onMetadataChange({ ...metadata, rental_income_monthly: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Optional"
                min="0"
                step="100"
              />
            </div>

            {/* Nebenkosten */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Nebenkosten/Monat (€)</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.operating_costs_monthly || ''}
                onChange={(e) => onMetadataChange({ ...metadata, operating_costs_monthly: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Optional"
                min="0"
                step="10"
              />
            </div>

            {/* Rendite (auto-calculated or manual) */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Rendite (%)</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.yield_pct || ''}
                onChange={(e) => onMetadataChange({ ...metadata, yield_pct: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Optional"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Help Text */}
      <div className={styles.helpText}>
        <span className={styles.helpIcon}>💡</span>
        <span>
          Tipp: Je detaillierter Ihre Angaben, desto interessanter für potenzielle Käufer. 
          Alle Felder mit * sind Pflichtfelder.
        </span>
      </div>
    </div>
  );
}

