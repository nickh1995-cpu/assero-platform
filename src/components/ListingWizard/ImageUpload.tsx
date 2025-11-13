"use client";

/**
 * ASSERO IMAGE UPLOAD - Step 3
 * Phase 6.1: Drag & Drop Image Upload Component
 */

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  images: string[];           // URLs of uploaded images
  imageFiles: File[];         // Files pending upload
  coverImageIndex: number;    // Index of cover image
  onImagesAdd: (files: File[]) => void;
  onImageRemove: (index: number) => void;
  onCoverImageSet: (index: number) => void;
  onImagesReorder?: (fromIndex: number, toIndex: number) => void;
  maxImages?: number;
  maxSizeMB?: number;
  validationError?: string;
}

export function ImageUpload({
  images,
  imageFiles,
  coverImageIndex,
  onImagesAdd,
  onImageRemove,
  onCoverImageSet,
  onImagesReorder,
  maxImages = 10,
  maxSizeMB = 5,
  validationError,
}: ImageUploadProps) {

  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = images.length + imageFiles.length;

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return `${file.name}: Nur JPG, PNG und WebP Formate erlaubt`;
    }

    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `${file.name}: Datei zu groß (max. ${maxSizeMB}MB)`;
    }

    return null;
  };

  // Handle file selection
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadError(null);

    // Check total images limit
    if (totalImages + files.length > maxImages) {
      setUploadError(`Maximal ${maxImages} Bilder erlaubt`);
      return;
    }

    // Validate and filter files
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setUploadError(errors.join(', '));
      return;
    }

    if (validFiles.length > 0) {
      onImagesAdd(validFiles);
    }
  };

  // Drag & Drop Handlers
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  // File input handler
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Click to open file dialog
  const handleClickUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('📂 Opening file dialog...');
    fileInputRef.current?.click();
  };

  // Generate preview URL for File objects
  const getPreviewUrl = (index: number): string => {
    if (index < images.length) {
      return images[index];
    } else {
      const fileIndex = index - images.length;
      return URL.createObjectURL(imageFiles[fileIndex]);
    }
  };

  return (
    <div className={styles.uploadContainer}>
      
      {/* Header */}
      <div className={styles.uploadHeader}>
        <h2 className={styles.uploadTitle}>Bilder hochladen</h2>
        <p className={styles.uploadSubtitle}>
          Fügen Sie aussagekräftige Bilder hinzu. Das erste Bild wird als Titelbild verwendet.
        </p>
      </div>

      {/* Drop Zone */}
      {totalImages < maxImages && (
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClickUpload}
        >
          <div className={styles.dropZoneContent}>
            <div className={styles.dropZoneIcon}>📷</div>
            <div className={styles.dropZoneText}>
              <p className={styles.dropZoneTitle}>
                {isDragging ? 'Bilder hier ablegen...' : 'Bilder hierhin ziehen'}
              </p>
              <p className={styles.dropZoneSubtext}>
                oder klicken zum Auswählen
              </p>
            </div>
            <div className={styles.dropZoneMeta}>
              <span>Max. {maxImages} Bilder</span>
              <span>•</span>
              <span>Je max. {maxSizeMB}MB</span>
              <span>•</span>
              <span>JPG, PNG, WebP</span>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileInputChange}
            className={styles.fileInput}
          />
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className={styles.errorBanner}>
          <span className={styles.errorIcon}>⚠️</span>
          <span>{uploadError}</span>
          <button 
            className={styles.errorClose}
            onClick={() => setUploadError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Validation Error from Form */}
      {validationError && (
        <div className={styles.errorBanner}>
          <span className={styles.errorIcon}>⚠️</span>
          <span>{validationError}</span>
        </div>
      )}

      {/* Image Preview Grid */}
      {totalImages > 0 && (
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <h3 className={styles.previewTitle}>
              Hochgeladene Bilder ({totalImages}/{maxImages})
            </h3>
            <p className={styles.previewSubtitle}>
              Klicken Sie auf ein Bild, um es als Titelbild festzulegen
            </p>
          </div>

          <div className={styles.previewGrid}>
            {Array.from({ length: totalImages }).map((_, index) => {
              const isCover = index === coverImageIndex;
              const previewUrl = getPreviewUrl(index);

              return (
                <div
                  key={index}
                  className={`${styles.previewCard} ${isCover ? styles.previewCardCover : ''}`}
                  onClick={() => onCoverImageSet(index)}
                >
                  {/* Image */}
                  <div className={styles.previewImageWrapper}>
                    <img
                      src={previewUrl}
                      alt={`Preview ${index + 1}`}
                      className={styles.previewImage}
                    />
                    
                    {/* Cover Badge */}
                    {isCover && (
                      <div className={styles.coverBadge}>
                        <span className={styles.coverIcon}>⭐</span>
                        <span className={styles.coverText}>Titelbild</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={styles.previewActions}>
                    <button
                      type="button"
                      className={styles.btnSetCover}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCoverImageSet(index);
                      }}
                      disabled={isCover}
                    >
                      {isCover ? '✓ Titelbild' : 'Als Titelbild'}
                    </button>
                    <button
                      type="button"
                      className={styles.btnRemove}
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageRemove(index);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalImages === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>🖼️</div>
          <p className={styles.emptyStateText}>
            Noch keine Bilder hochgeladen
          </p>
          <p className={styles.emptyStateHint}>
            Ziehen Sie Bilder in den Bereich oben oder klicken Sie zum Auswählen
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className={styles.infoBox}>
        <span className={styles.infoIcon}>💡</span>
        <div className={styles.infoContent}>
          <p className={styles.infoTitle}>Tipps für bessere Bilder:</p>
          <ul className={styles.infoList}>
            <li>Hochauflösende Bilder (min. 1200px Breite)</li>
            <li>Gute Beleuchtung und klare Fokussierung</li>
            <li>Verschiedene Perspektiven (Außen, Innen, Details)</li>
            <li>Das erste Bild wird als Vorschaubild verwendet</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

