"use client";

/**
 * ASSERO WATCH FORM - Step 2
 * Phase 5: Luxury Watch Listing Form
 */

import { useState, useEffect } from 'react';
import type { WatchMetadata, MovementType, CaseMaterial, BraceletMaterial, WatchCondition } from '@/types/listing-metadata';
import { WATCH_COMPLICATIONS } from '@/types/listing-metadata';
import styles from './WatchForm.module.css';

interface WatchFormProps {
  // Form Data
  title: string;
  description: string;
  price: number | null;
  currency: string;
  location: string;
  metadata: Partial<WatchMetadata>;
  
  // Handlers
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: number | null) => void;
  onCurrencyChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onMetadataChange: (metadata: Partial<WatchMetadata>) => void;
  
  // Validation
  validationErrors?: Record<string, string>;
}

export function WatchForm({
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
}: WatchFormProps) {

  // Local state for character counts
  const [titleLength, setTitleLength] = useState(title.length);
  const [descLength, setDescLength] = useState(description.length);

  useEffect(() => {
    setTitleLength(title.length);
  }, [title]);

  useEffect(() => {
    setDescLength(description.length);
  }, [description]);

  // Auto-generate title from brand, model, reference
  useEffect(() => {
    if (metadata.brand && metadata.model) {
      const generatedTitle = metadata.reference_number
        ? `${metadata.brand} ${metadata.model} ${metadata.reference_number}`
        : `${metadata.brand} ${metadata.model}`;
      if (title !== generatedTitle) {
        onTitleChange(generatedTitle);
      }
    }
  }, [metadata.brand, metadata.model, metadata.reference_number]);

  // Luxury Watch Brands
  const watchBrands = [
    'Rolex',
    'Patek Philippe',
    'Audemars Piguet',
    'Omega',
    'Breitling',
    'TAG Heuer',
    'IWC',
    'Jaeger-LeCoultre',
    'Cartier',
    'Panerai',
    'Hublot',
    'Richard Mille',
    'Vacheron Constantin',
    'A. Lange & Söhne',
    'Breguet',
    'Blancpain',
    'Zenith',
    'Tudor',
    'Grand Seiko',
    'Andere'
  ];

  // Movement Types
  const movementTypes: { value: MovementType; label: string }[] = [
    { value: 'automatic', label: 'Automatik' },
    { value: 'manual', label: 'Handaufzug' },
    { value: 'quartz', label: 'Quarz' },
  ];

  // Case Materials
  const caseMaterials: { value: CaseMaterial; label: string }[] = [
    { value: 'stainless_steel', label: 'Edelstahl' },
    { value: 'gold', label: 'Gold' },
    { value: 'rose_gold', label: 'Roségold' },
    { value: 'white_gold', label: 'Weißgold' },
    { value: 'platinum', label: 'Platin' },
    { value: 'titanium', label: 'Titan' },
    { value: 'ceramic', label: 'Keramik' },
    { value: 'carbon', label: 'Carbon' },
  ];

  // Bracelet Materials
  const braceletMaterials: { value: BraceletMaterial; label: string }[] = [
    { value: 'stainless_steel', label: 'Edelstahl' },
    { value: 'leather', label: 'Leder' },
    { value: 'rubber', label: 'Kautschuk' },
    { value: 'gold', label: 'Gold' },
    { value: 'ceramic', label: 'Keramik' },
    { value: 'fabric', label: 'Textil' },
  ];

  // Watch Conditions
  const conditions: { value: WatchCondition; label: string }[] = [
    { value: 'unworn', label: 'Unworn (ungetragen)' },
    { value: 'mint', label: 'Neuwertig' },
    { value: 'excellent', label: 'Sehr gut' },
    { value: 'good', label: 'Gut' },
    { value: 'fair', label: 'Akzeptabel' },
  ];

  return (
    <div className={styles.formContainer}>
      
      {/* Header */}
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Luxusuhr-Details</h2>
        <p className={styles.formSubtitle}>
          Geben Sie die wichtigsten Informationen zu Ihrer Uhr ein
        </p>
      </div>

      {/* Form Grid */}
      <div className={styles.formGrid}>

        {/* Section 1: Grunddaten */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>⌚ Grunddaten</h3>

          <div className={styles.formRow}>
            {/* Marke */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Marke <span className={styles.required}>*</span>
              </label>
              <select
                className={`${styles.select} ${validationErrors.brand ? styles.inputError : ''}`}
                value={metadata.brand || ''}
                onChange={(e) => onMetadataChange({ ...metadata, brand: e.target.value })}
              >
                <option value="">Bitte wählen</option>
                {watchBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              {validationErrors.brand && (
                <div className={styles.errorMessage}>{validationErrors.brand}</div>
              )}
            </div>

            {/* Modell */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Modell <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={`${styles.input} ${validationErrors.model ? styles.inputError : ''}`}
                value={metadata.model || ''}
                onChange={(e) => onMetadataChange({ ...metadata, model: e.target.value })}
                placeholder="z.B. Submariner Date"
              />
              {validationErrors.model && (
                <div className={styles.errorMessage}>{validationErrors.model}</div>
              )}
            </div>
          </div>

          {/* Referenznummer */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Referenznummer <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${validationErrors.reference_number ? styles.inputError : ''}`}
              value={metadata.reference_number || ''}
              onChange={(e) => onMetadataChange({ ...metadata, reference_number: e.target.value })}
              placeholder="z.B. 126610LN"
            />
            {validationErrors.reference_number && (
              <div className={styles.errorMessage}>{validationErrors.reference_number}</div>
            )}
          </div>

          {/* Auto-Generated Title */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Titel <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${validationErrors.title ? styles.inputError : ''}`}
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Wird automatisch generiert: Marke Modell Referenz"
              maxLength={100}
            />
            <div className={styles.inputMeta}>
              <span className={titleLength < 10 ? styles.metaError : styles.metaSuccess}>
                {titleLength}/100 Zeichen
              </span>
              {titleLength < 10 && <span className={styles.metaHint}>Auto-generiert aus Marke, Modell & Referenz</span>}
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
              placeholder="Beschreiben Sie Ihre Uhr ausführlich..."
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

          <div className={styles.formRow}>
            {/* Baujahr */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Baujahr <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                className={`${styles.input} ${validationErrors.year ? styles.inputError : ''}`}
                value={metadata.year || ''}
                onChange={(e) => onMetadataChange({ ...metadata, year: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="z.B. 2020"
                min="1800"
                max={new Date().getFullYear() + 1}
              />
              {validationErrors.year && (
                <div className={styles.errorMessage}>{validationErrors.year}</div>
              )}
            </div>

            {/* Preis */}
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

            {/* Währung */}
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
                <option value="CHF">CHF (Fr)</option>
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
              placeholder="z.B. München, Deutschland"
            />
            {validationErrors.location && (
              <div className={styles.errorMessage}>{validationErrors.location}</div>
            )}
          </div>
        </div>

        {/* Section 2: Technische Details */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>⚙️ Technische Details</h3>

          <div className={styles.formRow}>
            {/* Uhrwerk */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Uhrwerk <span className={styles.required}>*</span>
              </label>
              <select
                className={`${styles.select} ${validationErrors.movement ? styles.inputError : ''}`}
                value={metadata.movement || ''}
                onChange={(e) => onMetadataChange({ ...metadata, movement: e.target.value as MovementType })}
              >
                <option value="">Bitte wählen</option>
                {movementTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {validationErrors.movement && (
                <div className={styles.errorMessage}>{validationErrors.movement}</div>
              )}
            </div>

            {/* Gehäusematerial */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Gehäusematerial <span className={styles.required}>*</span>
              </label>
              <select
                className={`${styles.select} ${validationErrors.case_material ? styles.inputError : ''}`}
                value={metadata.case_material || ''}
                onChange={(e) => onMetadataChange({ ...metadata, case_material: e.target.value as CaseMaterial })}
              >
                <option value="">Bitte wählen</option>
                {caseMaterials.map((material) => (
                  <option key={material.value} value={material.value}>
                    {material.label}
                  </option>
                ))}
              </select>
              {validationErrors.case_material && (
                <div className={styles.errorMessage}>{validationErrors.case_material}</div>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            {/* Gehäusedurchmesser */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Gehäusedurchmesser (mm) <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                className={`${styles.input} ${validationErrors.case_diameter_mm ? styles.inputError : ''}`}
                value={metadata.case_diameter_mm || ''}
                onChange={(e) => onMetadataChange({ ...metadata, case_diameter_mm: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="z.B. 41"
                min="0"
                step="0.1"
              />
              {validationErrors.case_diameter_mm && (
                <div className={styles.errorMessage}>{validationErrors.case_diameter_mm}</div>
              )}
            </div>

            {/* Armbandmaterial */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Armbandmaterial</label>
              <select
                className={styles.select}
                value={metadata.bracelet_material || ''}
                onChange={(e) => onMetadataChange({ ...metadata, bracelet_material: e.target.value as BraceletMaterial })}
              >
                <option value="">Bitte wählen</option>
                {braceletMaterials.map((material) => (
                  <option key={material.value} value={material.value}>
                    {material.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            {/* Wasserdichtigkeit */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Wasserdichtigkeit (m)</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.water_resistance_m || ''}
                onChange={(e) => onMetadataChange({ ...metadata, water_resistance_m: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="z.B. 300"
                min="0"
              />
            </div>

            {/* Gangreserve */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Gangreserve (Stunden)</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.power_reserve_hours || ''}
                onChange={(e) => onMetadataChange({ ...metadata, power_reserve_hours: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="z.B. 70"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Zustand & Dokumentation */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>📝 Zustand & Dokumentation</h3>

          {/* Zustand */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Zustand <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${validationErrors.condition ? styles.inputError : ''}`}
              value={metadata.condition || ''}
              onChange={(e) => onMetadataChange({ ...metadata, condition: e.target.value as WatchCondition })}
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

          {/* Dokumentation Checkboxes */}
          <div className={styles.documentationGrid}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={metadata.full_set || false}
                onChange={(e) => onMetadataChange({ ...metadata, full_set: e.target.checked })}
              />
              <span>Fullset (Box + Papiere + Garantie)</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={metadata.box_included || false}
                onChange={(e) => onMetadataChange({ ...metadata, box_included: e.target.checked })}
              />
              <span>Box vorhanden</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={metadata.papers_included || false}
                onChange={(e) => onMetadataChange({ ...metadata, papers_included: e.target.checked })}
              />
              <span>Papiere vorhanden</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={metadata.warranty_card || false}
                onChange={(e) => onMetadataChange({ ...metadata, warranty_card: e.target.checked })}
              />
              <span>Garantiekarte vorhanden</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={metadata.service_history || false}
                onChange={(e) => onMetadataChange({ ...metadata, service_history: e.target.checked })}
              />
              <span>Service-Historie vorhanden</span>
            </label>
          </div>

          <div className={styles.formRow}>
            {/* Restgarantie */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Restgarantie (Monate)</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.warranty_remaining_months || ''}
                onChange={(e) => onMetadataChange({ ...metadata, warranty_remaining_months: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="z.B. 24"
                min="0"
                max="120"
              />
            </div>

            {/* Letzter Service */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Letzter Service (Jahr)</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.last_service_year || ''}
                onChange={(e) => onMetadataChange({ ...metadata, last_service_year: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="z.B. 2022"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Komplikationen */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>✨ Komplikationen & Features</h3>

          <div className={styles.complicationGrid}>
            {WATCH_COMPLICATIONS.map((complication) => {
              const isChecked = metadata.complications?.includes(complication) || false;
              return (
                <label key={complication} className={styles.featureCheckbox}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const currentComplications = metadata.complications || [];
                      const newComplications = e.target.checked
                        ? [...currentComplications, complication]
                        : currentComplications.filter(c => c !== complication);
                      onMetadataChange({ ...metadata, complications: newComplications });
                    }}
                  />
                  <span className={styles.featureLabel}>{complication}</span>
                </label>
              );
            })}
          </div>

          {/* Selected Complications Count */}
          {metadata.complications && metadata.complications.length > 0 && (
            <div className={styles.featureCount}>
              ✓ {metadata.complications.length} Komplikation{metadata.complications.length > 1 ? 'en' : ''} ausgewählt
            </div>
          )}
        </div>

      </div>

      {/* Help Text */}
      <div className={styles.helpText}>
        <span className={styles.helpIcon}>💡</span>
        <span>
          Tipp: Je detaillierter Ihre Angaben, desto interessanter für Sammler und Käufer. 
          Alle Felder mit * sind Pflichtfelder.
        </span>
      </div>
    </div>
  );
}

