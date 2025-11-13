"use client";

/**
 * ASSERO LISTING PREVIEW - Step 4
 * Phase 7.1: Live Preview before Publishing
 */

import { useState } from 'react';
import type { AssetCategory } from '@/types/listing';
import type { AssetMetadata } from '@/types/listing-metadata';
import styles from './ListingPreview.module.css';

interface ListingPreviewProps {
  // Form Data
  category: AssetCategory | null;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  location: string;
  metadata: Partial<AssetMetadata>;
  images: string[];
  imageFiles: File[];
  coverImageIndex: number;
  
  // Actions
  onEditStep: (step: number) => void;
  onPublish: () => void;
  isPublishing: boolean;
}

export function ListingPreview({
  category,
  title,
  description,
  price,
  currency,
  location,
  metadata,
  images,
  imageFiles,
  coverImageIndex,
  onEditStep,
  onPublish,
  isPublishing,
}: ListingPreviewProps) {

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Format price
  const formatPrice = (price: number | null, currency: string): string => {
    if (!price) return 'N/A';
    const symbols: Record<string, string> = {
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
      'CHF': 'Fr',
    };
    return `${symbols[currency] || '€'}${price.toLocaleString('de-DE')}`;
  };

  // Get all image URLs (existing + new files as blob URLs)
  const getAllImageUrls = (): string[] => {
    const urls = [...images];
    imageFiles.forEach(file => {
      urls.push(URL.createObjectURL(file));
    });
    return urls;
  };

  const allImages = getAllImageUrls();
  const totalImages = allImages.length;

  // Format metadata based on category
  const renderMetadata = () => {
    if (!category) return null;

    const meta = metadata as any;

    // Real Estate
    if (category.slug === 'real-estate') {
      return (
        <>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Immobilientyp:</span>
            <span className={styles.detailValue}>{meta.property_type || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Wohnfläche:</span>
            <span className={styles.detailValue}>{meta.area_sqm ? `${meta.area_sqm} m²` : 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Zimmer:</span>
            <span className={styles.detailValue}>{meta.rooms || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Zustand:</span>
            <span className={styles.detailValue}>{meta.condition || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Baujahr:</span>
            <span className={styles.detailValue}>{meta.year_built || 'N/A'}</span>
          </div>
          {meta.features && meta.features.length > 0 && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Ausstattung:</span>
              <span className={styles.detailValue}>{meta.features.length} Features</span>
            </div>
          )}
        </>
      );
    }

    // Vehicle
    if (category.slug === 'fahrzeuge') {
      return (
        <>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Fahrzeugtyp:</span>
            <span className={styles.detailValue}>{meta.vehicle_type || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Marke:</span>
            <span className={styles.detailValue}>{meta.make || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Modell:</span>
            <span className={styles.detailValue}>{meta.model || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Baujahr:</span>
            <span className={styles.detailValue}>{meta.year || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Kilometerstand:</span>
            <span className={styles.detailValue}>{meta.mileage_km ? `${meta.mileage_km.toLocaleString('de-DE')} km` : 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Kraftstoff:</span>
            <span className={styles.detailValue}>{meta.fuel_type || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Leistung:</span>
            <span className={styles.detailValue}>{meta.horsepower ? `${meta.horsepower} PS` : 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Zustand:</span>
            <span className={styles.detailValue}>{meta.condition || 'N/A'}</span>
          </div>
        </>
      );
    }

    // Watch
    if (category.slug === 'luxusuhren') {
      return (
        <>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Marke:</span>
            <span className={styles.detailValue}>{meta.brand || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Modell:</span>
            <span className={styles.detailValue}>{meta.model || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Referenznummer:</span>
            <span className={styles.detailValue}>{meta.reference_number || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Baujahr:</span>
            <span className={styles.detailValue}>{meta.year || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Uhrwerk:</span>
            <span className={styles.detailValue}>{meta.movement || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Gehäusematerial:</span>
            <span className={styles.detailValue}>{meta.case_material || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Durchmesser:</span>
            <span className={styles.detailValue}>{meta.case_diameter_mm ? `${meta.case_diameter_mm} mm` : 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Zustand:</span>
            <span className={styles.detailValue}>{meta.condition || 'N/A'}</span>
          </div>
          {meta.full_set && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Fullset:</span>
              <span className={styles.detailValue}>✓ Ja</span>
            </div>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <div className={styles.previewContainer}>
      
      {/* Header */}
      <div className={styles.previewHeader}>
        <h2 className={styles.previewTitle}>Vorschau Ihres Listings</h2>
        <p className={styles.previewSubtitle}>
          So wird Ihr Listing auf der Plattform angezeigt
        </p>
      </div>

      {/* Preview Card (wie auf /browse) */}
      <div className={styles.listingCard}>

        {/* Image Gallery */}
        {totalImages > 0 ? (
          <div className={styles.imageSection}>
            <div className={styles.mainImageWrapper}>
              <img
                src={allImages[currentImageIndex]}
                alt={title}
                className={styles.mainImage}
              />
              {totalImages > 1 && (
                <div className={styles.imageNav}>
                  <button
                    className={styles.imageNavBtn}
                    onClick={() => setCurrentImageIndex((currentImageIndex - 1 + totalImages) % totalImages)}
                  >
                    ‹
                  </button>
                  <span className={styles.imageCounter}>
                    {currentImageIndex + 1} / {totalImages}
                  </span>
                  <button
                    className={styles.imageNavBtn}
                    onClick={() => setCurrentImageIndex((currentImageIndex + 1) % totalImages)}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
            <button 
              className={styles.editButton}
              onClick={() => onEditStep(3)}
            >
              ✏️ Bilder bearbeiten
            </button>
          </div>
        ) : (
          <div className={styles.noImages}>
            <div className={styles.noImagesIcon}>🖼️</div>
            <p>Keine Bilder hochgeladen</p>
            <button 
              className={styles.editButton}
              onClick={() => onEditStep(3)}
            >
              Bilder hinzufügen
            </button>
          </div>
        )}

        {/* Basic Info Section */}
        <div className={styles.infoSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Grunddaten</h3>
            <button 
              className={styles.editButtonSmall}
              onClick={() => onEditStep(2)}
            >
              ✏️ Bearbeiten
            </button>
          </div>

          <h1 className={styles.listingTitle}>{title || 'Kein Titel'}</h1>
          
          <div className={styles.priceLocation}>
            <div className={styles.price}>{formatPrice(price, currency)}</div>
            <div className={styles.location}>📍 {location || 'Kein Standort'}</div>
          </div>

          {category && (
            <div className={styles.categoryBadge}>
              <span className={styles.categoryIcon}>{category.icon}</span>
              <span className={styles.categoryName}>{category.name}</span>
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className={styles.infoSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Beschreibung</h3>
            <button 
              className={styles.editButtonSmall}
              onClick={() => onEditStep(2)}
            >
              ✏️ Bearbeiten
            </button>
          </div>
          <p className={styles.description}>
            {description || 'Keine Beschreibung vorhanden'}
          </p>
        </div>

        {/* Details Section */}
        <div className={styles.infoSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Details</h3>
            <button 
              className={styles.editButtonSmall}
              onClick={() => onEditStep(2)}
            >
              ✏️ Bearbeiten
            </button>
          </div>
          <div className={styles.detailsGrid}>
            {renderMetadata()}
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className={styles.termsSection}>
        <label className={styles.termsLabel}>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className={styles.termsCheckbox}
          />
          <span className={styles.termsText}>
            Ich bestätige, dass alle Angaben korrekt sind und ich die 
            <a href="/terms" target="_blank" className={styles.termsLink}> AGB </a>
            und
            <a href="/privacy" target="_blank" className={styles.termsLink}> Datenschutzbestimmungen </a>
            akzeptiere.
          </span>
        </label>
      </div>

      {/* Publish Actions */}
      <div className={styles.publishActions}>
        <button
          type="button"
          className={styles.btnPublish}
          onClick={onPublish}
          disabled={!termsAccepted || isPublishing}
        >
          {isPublishing ? '⏳ Wird veröffentlicht...' : '✓ Zur Prüfung einreichen'}
        </button>
        <p className={styles.publishHint}>
          Ihr Listing wird nach Prüfung durch unser Team veröffentlicht.
        </p>
      </div>

      {/* Info Box */}
      <div className={styles.infoBox}>
        <span className={styles.infoIcon}>💡</span>
        <div className={styles.infoContent}>
          <p className={styles.infoTitle}>Was passiert jetzt?</p>
          <ul className={styles.infoList}>
            <li>Ihr Listing wird an unser Team zur Prüfung gesendet</li>
            <li>Wir prüfen die Angaben innerhalb von 24-48 Stunden</li>
            <li>Nach Freigabe wird Ihr Listing veröffentlicht</li>
            <li>Sie erhalten eine E-Mail-Benachrichtigung</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

