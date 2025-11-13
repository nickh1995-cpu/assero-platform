"use client";

/**
 * ASSERO LISTING WIZARD - Multi-Step Form Container
 * Phase 2: Complete Wizard with Progress, Navigation & Auto-Save
 */

import { ReactNode } from 'react';
import styles from './ListingWizard.module.css';

// Step definitions
export const WIZARD_STEPS = [
  { id: 1, label: 'Kategorie', key: 'category' },
  { id: 2, label: 'Details', key: 'details' },
  { id: 3, label: 'Bilder', key: 'images' },
  { id: 4, label: 'Vorschau', key: 'preview' },
] as const;

export type WizardStepId = typeof WIZARD_STEPS[number]['id'];

// Props
export interface ListingWizardProps {
  currentStep: WizardStepId;
  children: ReactNode;
  
  // Navigation
  onNext?: () => void;
  onBack?: () => void;
  onExit?: () => void;
  canGoNext?: boolean;
  canGoBack?: boolean;
  isLastStep?: boolean;
  
  // Auto-Save
  autoSaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date | null;
  
  // Submit
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

export function ListingWizard({
  currentStep,
  children,
  onNext,
  onBack,
  onExit,
  canGoNext = true,
  canGoBack = true,
  isLastStep = false,
  autoSaveStatus = 'idle',
  lastSaved,
  onSubmit,
  isSubmitting = false,
}: ListingWizardProps) {
  
  // Calculate progress line width
  const progressPercentage = ((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100;
  
  // Format last saved time
  const formatLastSaved = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 5) return 'Gerade eben gespeichert';
    if (seconds < 60) return `Vor ${seconds} Sek. gespeichert`;
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return 'Vor 1 Min. gespeichert';
    if (minutes < 60) return `Vor ${minutes} Min. gespeichert`;
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.wizardContainer}>
      <div className={styles.wizardInner}>
        
        {/* Header */}
        <header className={styles.wizardHeader}>
          <h1 className={styles.wizardTitle}>Neues Listing erstellen</h1>
          <p className={styles.wizardSubtitle}>
            Folgen Sie den Schritten, um Ihr Asset professionell zu präsentieren
          </p>
        </header>

        {/* Progress Indicator */}
        <div className={styles.progressContainer}>
          <div className={styles.progressSteps}>
            {/* Progress Line (active portion) */}
            <div 
              className={styles.progressLine}
              style={{ width: `calc(${progressPercentage}% - 60px)` }}
            />
            
            {/* Steps */}
            {WIZARD_STEPS.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              const className = [
                styles.stepItem,
                isActive && styles.active,
                isCompleted && styles.completed,
              ].filter(Boolean).join(' ');

              return (
                <div key={step.id} className={className}>
                  <div className={styles.stepCircle}>
                    <span>{step.id}</span>
                  </div>
                  <div className={styles.stepLabel}>
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content (Step Body) */}
        <div className={styles.wizardContent}>
          {children}
        </div>

        {/* Navigation Footer */}
        <div className={styles.wizardNavigation}>
          
          {/* Left: Exit Button */}
          <div className={styles.navLeft}>
            {onExit && (
              <button 
                type="button"
                className={styles.btnDanger}
                onClick={onExit}
                disabled={isSubmitting}
              >
                🚪 Abbrechen
              </button>
            )}
          </div>

          {/* Right: Auto-Save + Back + Next/Submit */}
          <div className={styles.navRight}>
            
            {/* Auto-Save Indicator */}
            {autoSaveStatus !== 'idle' && (
              <div className={`${styles.autoSaveIndicator} ${styles[autoSaveStatus]}`}>
                <span className={`${styles.saveIcon} ${autoSaveStatus === 'saving' ? styles.spinning : ''}`}>
                  {autoSaveStatus === 'saving' && '⏳'}
                  {autoSaveStatus === 'saved' && '✓'}
                  {autoSaveStatus === 'error' && '⚠️'}
                </span>
                <span>
                  {autoSaveStatus === 'saving' && 'Wird gespeichert...'}
                  {autoSaveStatus === 'saved' && formatLastSaved(lastSaved)}
                  {autoSaveStatus === 'error' && 'Speichern fehlgeschlagen'}
                </span>
              </div>
            )}

            {/* Back Button */}
            {onBack && canGoBack && (
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={onBack}
                disabled={isSubmitting}
              >
                ← Zurück
              </button>
            )}

            {/* Next/Submit Button */}
            {isLastStep ? (
              onSubmit && (
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={onSubmit}
                  disabled={!canGoNext || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className={styles.spinning}>⏳</span>
                      Wird eingereicht...
                    </>
                  ) : (
                    <>
                      📤 Listing einreichen
                    </>
                  )}
                </button>
              )
            ) : (
              onNext && (
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={onNext}
                  disabled={!canGoNext || isSubmitting}
                >
                  Weiter →
                </button>
              )
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

