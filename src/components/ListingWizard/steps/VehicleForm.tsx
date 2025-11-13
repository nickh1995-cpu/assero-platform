"use client";

/**
 * ASSERO VEHICLE FORM - Step 2
 * Phase 4: Vehicle Listing Form for Cars, Motorcycles, etc.
 */

import { useState, useEffect } from 'react';
import type { VehicleMetadata, VehicleType, FuelType, TransmissionType, VehicleCondition } from '@/types/listing-metadata';
import { VEHICLE_FEATURES } from '@/types/listing-metadata';
import styles from './VehicleForm.module.css';

interface VehicleFormProps {
  // Form Data
  title: string;
  description: string;
  price: number | null;
  currency: string;
  location: string;
  metadata: Partial<VehicleMetadata>;
  
  // Handlers
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: number | null) => void;
  onCurrencyChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onMetadataChange: (metadata: Partial<VehicleMetadata>) => void;
  
  // Validation
  validationErrors?: Record<string, string>;
}

export function VehicleForm({
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
}: VehicleFormProps) {

  // Local state for character counts
  const [titleLength, setTitleLength] = useState(title.length);
  const [descLength, setDescLength] = useState(description.length);

  useEffect(() => {
    setTitleLength(title.length);
  }, [title]);

  useEffect(() => {
    setDescLength(description.length);
  }, [description]);

  // Auto-generate title from make, model, year
  useEffect(() => {
    if (metadata.make && metadata.model && metadata.year) {
      const generatedTitle = `${metadata.make} ${metadata.model} ${metadata.year}`;
      if (title !== generatedTitle) {
        onTitleChange(generatedTitle);
      }
    }
  }, [metadata.make, metadata.model, metadata.year]);

  // Vehicle Types
  const vehicleTypes: { value: VehicleType; label: string; icon: string }[] = [
    { value: 'car', label: 'PKW', icon: '🚗' },
    { value: 'suv', label: 'SUV', icon: '🚙' },
    { value: 'sports_car', label: 'Sportwagen', icon: '🏎️' },
    { value: 'motorcycle', label: 'Motorrad', icon: '🏍️' },
    { value: 'van', label: 'Van', icon: '🚐' },
    { value: 'truck', label: 'LKW', icon: '🚚' },
  ];

  // Fuel Types
  const fuelTypes: { value: FuelType; label: string }[] = [
    { value: 'gasoline', label: 'Benzin' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'electric', label: 'Elektro' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'plug_in_hybrid', label: 'Plug-in Hybrid' },
  ];

  // Transmission Types
  const transmissionTypes: { value: TransmissionType; label: string }[] = [
    { value: 'automatic', label: 'Automatik' },
    { value: 'manual', label: 'Schaltgetriebe' },
    { value: 'semi_automatic', label: 'Halbautomatik' },
  ];

  // Conditions
  const conditions: { value: VehicleCondition; label: string }[] = [
    { value: 'new', label: 'Neuwertig' },
    { value: 'excellent', label: 'Sehr gut' },
    { value: 'good', label: 'Gut' },
    { value: 'fair', label: 'Durchschnittlich' },
  ];

  // Popular Car Brands
  const carBrands = [
    'Porsche', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen',
    'Ferrari', 'Lamborghini', 'McLaren', 'Aston Martin',
    'Bentley', 'Rolls-Royce', 'Maserati', 'Bugatti',
    'Tesla', 'Lotus', 'Jaguar', 'Land Rover',
    'Lexus', 'Toyota', 'Honda', 'Nissan',
    'Andere'
  ];

  return (
    <div className={styles.formContainer}>
      
      {/* Header */}
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Fahrzeug-Details</h2>
        <p className={styles.formSubtitle}>
          Geben Sie die wichtigsten Informationen zu Ihrem Fahrzeug ein
        </p>
      </div>

      {/* Form Grid */}
      <div className={styles.formGrid}>

        {/* Section 1: Fahrzeugtyp */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>🚗 Fahrzeugtyp</h3>

          {/* Vehicle Type Selection */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Fahrzeugtyp <span className={styles.required}>*</span>
            </label>
            <div className={styles.vehicleTypeGrid}>
              {vehicleTypes.map((type) => {
                const isSelected = metadata.vehicle_type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    className={`${styles.vehicleTypeCard} ${isSelected ? styles.vehicleTypeSelected : ''}`}
                    onClick={() => onMetadataChange({ ...metadata, vehicle_type: type.value })}
                  >
                    <span className={styles.vehicleTypeIcon}>{type.icon}</span>
                    <span className={styles.vehicleTypeLabel}>{type.label}</span>
                  </button>
                );
              })}
            </div>
            {validationErrors.vehicle_type && (
              <div className={styles.errorMessage}>{validationErrors.vehicle_type}</div>
            )}
          </div>
        </div>

        {/* Section 2: Basisdaten */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>📋 Basisdaten</h3>

          <div className={styles.formRow}>
            {/* Marke */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Marke <span className={styles.required}>*</span>
              </label>
              <select
                className={`${styles.select} ${validationErrors.make ? styles.inputError : ''}`}
                value={metadata.make || ''}
                onChange={(e) => onMetadataChange({ ...metadata, make: e.target.value })}
              >
                <option value="">Bitte wählen</option>
                {carBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              {validationErrors.make && (
                <div className={styles.errorMessage}>{validationErrors.make}</div>
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
                placeholder="z.B. 911 Carrera"
              />
              {validationErrors.model && (
                <div className={styles.errorMessage}>{validationErrors.model}</div>
              )}
            </div>
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
              placeholder="Wird automatisch generiert: Marke Modell Jahr"
              maxLength={100}
            />
            <div className={styles.inputMeta}>
              <span className={titleLength < 10 ? styles.metaError : styles.metaSuccess}>
                {titleLength}/100 Zeichen
              </span>
              {titleLength < 10 && <span className={styles.metaHint}>Auto-generiert aus Marke, Modell & Jahr</span>}
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
              placeholder="Beschreiben Sie Ihr Fahrzeug ausführlich..."
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
                min="1900"
                max={new Date().getFullYear() + 1}
              />
              {validationErrors.year && (
                <div className={styles.errorMessage}>{validationErrors.year}</div>
              )}
            </div>

            {/* Kilometerstand */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Kilometerstand (km) <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                className={`${styles.input} ${validationErrors.mileage_km ? styles.inputError : ''}`}
                value={metadata.mileage_km || ''}
                onChange={(e) => onMetadataChange({ ...metadata, mileage_km: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="z.B. 15000"
                min="0"
                step="1000"
              />
              {validationErrors.mileage_km && (
                <div className={styles.errorMessage}>{validationErrors.mileage_km}</div>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
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

        {/* Section 3: Technische Daten */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>⚙️ Technische Daten</h3>

          <div className={styles.formRow}>
            {/* Kraftstoffart */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Kraftstoffart <span className={styles.required}>*</span>
              </label>
              <select
                className={`${styles.select} ${validationErrors.fuel_type ? styles.inputError : ''}`}
                value={metadata.fuel_type || ''}
                onChange={(e) => onMetadataChange({ ...metadata, fuel_type: e.target.value as FuelType })}
              >
                <option value="">Bitte wählen</option>
                {fuelTypes.map((fuel) => (
                  <option key={fuel.value} value={fuel.value}>
                    {fuel.label}
                  </option>
                ))}
              </select>
              {validationErrors.fuel_type && (
                <div className={styles.errorMessage}>{validationErrors.fuel_type}</div>
              )}
            </div>

            {/* Getriebe */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Getriebe <span className={styles.required}>*</span>
              </label>
              <select
                className={`${styles.select} ${validationErrors.transmission ? styles.inputError : ''}`}
                value={metadata.transmission || ''}
                onChange={(e) => onMetadataChange({ ...metadata, transmission: e.target.value as TransmissionType })}
              >
                <option value="">Bitte wählen</option>
                {transmissionTypes.map((trans) => (
                  <option key={trans.value} value={trans.value}>
                    {trans.label}
                  </option>
                ))}
              </select>
              {validationErrors.transmission && (
                <div className={styles.errorMessage}>{validationErrors.transmission}</div>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            {/* Leistung (PS) */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Leistung (PS) <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                className={`${styles.input} ${validationErrors.horsepower ? styles.inputError : ''}`}
                value={metadata.horsepower || ''}
                onChange={(e) => onMetadataChange({ ...metadata, horsepower: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="z.B. 450"
                min="0"
              />
              {validationErrors.horsepower && (
                <div className={styles.errorMessage}>{validationErrors.horsepower}</div>
              )}
            </div>

            {/* Hubraum */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Hubraum (L)</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.displacement_liters || ''}
                onChange={(e) => onMetadataChange({ ...metadata, displacement_liters: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="z.B. 3.0"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            {/* Außenfarbe */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Außenfarbe <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={`${styles.input} ${validationErrors.exterior_color ? styles.inputError : ''}`}
                value={metadata.exterior_color || ''}
                onChange={(e) => onMetadataChange({ ...metadata, exterior_color: e.target.value })}
                placeholder="z.B. Schwarz Metallic"
              />
              {validationErrors.exterior_color && (
                <div className={styles.errorMessage}>{validationErrors.exterior_color}</div>
              )}
            </div>

            {/* Innenfarbe */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Innenfarbe</label>
              <input
                type="text"
                className={styles.input}
                value={metadata.interior_color || ''}
                onChange={(e) => onMetadataChange({ ...metadata, interior_color: e.target.value })}
                placeholder="z.B. Schwarz Leder"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            {/* Anzahl Türen */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Anzahl Türen</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.doors || ''}
                onChange={(e) => onMetadataChange({ ...metadata, doors: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="z.B. 4"
                min="2"
                max="5"
              />
            </div>

            {/* Anzahl Sitze */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Anzahl Sitze</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.seats || ''}
                onChange={(e) => onMetadataChange({ ...metadata, seats: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="z.B. 5"
                min="1"
                max="9"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Zustand & Historie */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>📝 Zustand & Historie</h3>

          {/* Zustand */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Zustand <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${validationErrors.condition ? styles.inputError : ''}`}
              value={metadata.condition || ''}
              onChange={(e) => onMetadataChange({ ...metadata, condition: e.target.value as VehicleCondition })}
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

          <div className={styles.formRow}>
            {/* Unfallfreies Fahrzeug */}
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={metadata.accident_free || false}
                  onChange={(e) => onMetadataChange({ ...metadata, accident_free: e.target.checked })}
                />
                <span>Unfallfreies Fahrzeug</span>
              </label>
            </div>

            {/* Scheckheftgepflegt */}
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={metadata.service_history || false}
                  onChange={(e) => onMetadataChange({ ...metadata, service_history: e.target.checked })}
                />
                <span>Scheckheftgepflegt</span>
              </label>
            </div>
          </div>

          <div className={styles.formRow}>
            {/* Anzahl Vorbesitzer */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Anzahl Vorbesitzer</label>
              <input
                type="number"
                className={styles.input}
                value={metadata.previous_owners || ''}
                onChange={(e) => onMetadataChange({ ...metadata, previous_owners: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="z.B. 1"
                min="0"
                max="10"
              />
            </div>

            {/* Erstzulassung */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Erstzulassung</label>
              <input
                type="month"
                className={styles.input}
                value={metadata.first_registration || ''}
                onChange={(e) => onMetadataChange({ ...metadata, first_registration: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section 5: Ausstattung & Features */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>✨ Ausstattung & Features</h3>

          {/* Feature Categories */}
          <div className={styles.featureCategories}>
            {/* Comfort Features */}
            <div className={styles.featureCategory}>
              <h4 className={styles.featureCategoryTitle}>Komfort</h4>
              <div className={styles.featureGrid}>
                {VEHICLE_FEATURES.comfort.map((feature) => {
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

            {/* Technology Features */}
            <div className={styles.featureCategory}>
              <h4 className={styles.featureCategoryTitle}>Technik & Assistenzsysteme</h4>
              <div className={styles.featureGrid}>
                {VEHICLE_FEATURES.technology.map((feature) => {
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

            {/* Entertainment Features */}
            <div className={styles.featureCategory}>
              <h4 className={styles.featureCategoryTitle}>Sound & Entertainment</h4>
              <div className={styles.featureGrid}>
                {VEHICLE_FEATURES.entertainment.map((feature) => {
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

