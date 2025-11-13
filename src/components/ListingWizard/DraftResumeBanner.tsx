"use client";

/**
 * ASSERO DRAFT RESUME BANNER
 * Phase 2.3: Banner to resume existing draft or start fresh
 */

import styles from './DraftResumeBanner.module.css';

interface DraftResumeBannerProps {
  lastSaved: Date | null;
  currentStep: number;
  onContinue: () => void;
  onStartNew: () => void;
}

export function DraftResumeBanner({ lastSaved, currentStep, onContinue, onStartNew }: DraftResumeBannerProps) {
  
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
    }
    if (hours > 0) {
      return `vor ${hours} Stunde${hours > 1 ? 'n' : ''}`;
    }
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) {
      return `vor ${minutes} Minute${minutes > 1 ? 'n' : ''}`;
    }
    return 'gerade eben';
  };

  return (
    <div className={styles.bannerContainer}>
      <div className={styles.banner}>
        <div className={styles.icon}>📝</div>
        
        <div className={styles.content}>
          <h3 className={styles.title}>
            Entwurf gefunden
          </h3>
          <p className={styles.subtitle}>
            Sie haben einen unvollständigen Entwurf{' '}
            {lastSaved && <span>({formatLastSaved(lastSaved)} gespeichert)</span>}.{' '}
            Schritt {currentStep} von 4.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onStartNew}
          >
            Neu beginnen
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={onContinue}
          >
            Fortsetzen →
          </button>
        </div>
      </div>
    </div>
  );
}

