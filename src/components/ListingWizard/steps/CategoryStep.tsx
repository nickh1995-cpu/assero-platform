"use client";

/**
 * ASSERO LISTING WIZARD - Category Selection Step
 * Phase 2.2: Professional Category Selection with Keyboard Navigation
 */

import { useEffect, useState, useCallback, KeyboardEvent } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { AssetCategory } from '@/types/listing';
import styles from './CategoryStep.module.css';

interface CategoryStepProps {
  selectedCategory: AssetCategory | null;
  onCategorySelect: (category: AssetCategory) => void;
  validationError?: string;
}

export function CategoryStep({ selectedCategory, onCategorySelect, validationError }: CategoryStepProps) {
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  // Load categories from Supabase
  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      // Fallback categories if Supabase not available
      setCategories([
        {
          id: '1',
          name: 'Real Estate',
          slug: 'real-estate',
          description: 'Premium Immobilien und Gewerbeimmobilien',
          icon: '🏠',
          sort_order: 1,
          is_active: true,
        },
        {
          id: '2',
          name: 'Luxusuhren',
          slug: 'luxusuhren',
          description: 'Premium Uhren von Rolex, Patek Philippe, Audemars Piguet',
          icon: '⌚️',
          sort_order: 2,
          is_active: true,
        },
        {
          id: '3',
          name: 'Fahrzeuge',
          slug: 'fahrzeuge',
          description: 'Sportwagen, Luxuslimousinen und SUVs',
          icon: '🏎️',
          sort_order: 3,
          is_active: true,
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('asset_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (fetchError) throw fetchError;

      setCategories(data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading categories:', err);
      setError('Kategorien konnten nicht geladen werden. Bitte versuchen Sie es erneut.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Keyboard Navigation
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (categories.length === 0) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % categories.length);
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + categories.length) % categories.length);
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        onCategorySelect(categories[focusedIndex]);
        break;

      case 'Escape':
        e.preventDefault();
        setFocusedIndex(0);
        break;
    }
  }, [categories, focusedIndex, onCategorySelect]);

  // Loading State
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Lade Kategorien...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Fehler beim Laden</h3>
          <p>{error}</p>
          <button className={styles.retryButton} onClick={loadCategories}>
            🔄 Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (categories.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3>Keine Kategorien verfügbar</h3>
          <p>Es wurden keine aktiven Kategorien gefunden.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} onKeyDown={handleKeyDown} tabIndex={0}>
      
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Wählen Sie eine Kategorie</h2>
        <p className={styles.subtitle}>
          Welche Art von Asset möchten Sie inserieren?
        </p>
      </div>

      {/* Category Grid */}
      <div className={styles.categoryGrid}>
        {categories.map((category, index) => {
          const isSelected = selectedCategory?.id === category.id;
          const isFocused = focusedIndex === index;

          return (
            <button
              key={category.id}
              type="button"
              className={`${styles.categoryCard} ${isSelected ? styles.selected : ''} ${isFocused ? styles.focused : ''}`}
              onClick={() => onCategorySelect(category)}
              onFocus={() => setFocusedIndex(index)}
              aria-pressed={isSelected}
              aria-label={`${category.name}: ${category.description}`}
            >
              {/* Icon */}
              <div className={styles.categoryIcon}>
                {category.icon || '📦'}
              </div>

              {/* Content */}
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryName}>
                  {category.name}
                </h3>
                <p className={styles.categoryDescription}>
                  {category.description || 'Premium Assets'}
                </p>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className={styles.selectedBadge}>
                  <span className={styles.checkmark}>✓</span>
                  Ausgewählt
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className={styles.validationError}>
          <span className={styles.errorIcon}>⚠️</span>
          {validationError}
        </div>
      )}

      {/* Keyboard Hint */}
      <div className={styles.keyboardHint}>
        💡 Tipp: Nutzen Sie die Pfeiltasten zur Navigation und Enter zur Auswahl
      </div>
    </div>
  );
}

