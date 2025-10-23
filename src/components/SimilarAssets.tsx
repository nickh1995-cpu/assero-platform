"use client";

import React from 'react';
import styles from './SimilarAssets.module.css';

interface SimilarAssetsProps {
  currentAssetType: 'real-estate' | 'luxusuhren' | 'fahrzeuge';
  estimatedValue: number;
}

interface AssetSuggestion {
  type: 'real-estate' | 'luxusuhren' | 'fahrzeuge';
  title: string;
  description: string;
  priceRange: string;
  icon: string;
  color: string;
}

export default function SimilarAssets({ currentAssetType, estimatedValue }: SimilarAssetsProps) {
  // Generate smart recommendations based on price range
  const getSuggestions = (): AssetSuggestion[] => {
    const suggestions: AssetSuggestion[] = [];
    
    // If valuing real estate, suggest luxury items in similar price range
    if (currentAssetType === 'real-estate') {
      if (estimatedValue >= 300000) {
        suggestions.push({
          type: 'luxusuhren',
          title: 'Luxusuhren',
          description: 'Diversifizieren Sie Ihr Portfolio mit Zeitmessern',
          priceRange: '10.000 € - 100.000 €',
          icon: '⌚',
          color: '#c7a770'
        });
        suggestions.push({
          type: 'fahrzeuge',
          title: 'Premium-Fahrzeuge',
          description: 'Sportwagen und Luxusfahrzeuge als Wertanlage',
          priceRange: '50.000 € - 300.000 €',
          icon: '🚗',
          color: '#2c5a78'
        });
      }
    }
    
    // If valuing watches, suggest real estate and vehicles
    if (currentAssetType === 'luxusuhren') {
      suggestions.push({
        type: 'real-estate',
        title: 'Immobilien',
        description: 'Stabile Wertanlage mit langfristigem Wachstum',
        priceRange: '200.000 € - 2.000.000 €',
        icon: '🏠',
        color: '#2c5a78'
      });
      if (estimatedValue >= 20000) {
        suggestions.push({
          type: 'fahrzeuge',
          title: 'Klassische Fahrzeuge',
          description: 'Oldtimer und Sportwagen als Sammlerstücke',
          priceRange: '50.000 € - 500.000 €',
          icon: '🏎️',
          color: '#4a90a4'
        });
      }
    }
    
    // If valuing vehicles, suggest real estate and watches
    if (currentAssetType === 'fahrzeuge') {
      suggestions.push({
        type: 'luxusuhren',
        title: 'Luxusuhren',
        description: 'Kompakte Wertanlage mit hoher Liquidität',
        priceRange: '5.000 € - 150.000 €',
        icon: '⌚',
        color: '#c7a770'
      });
      if (estimatedValue >= 80000) {
        suggestions.push({
          type: 'real-estate',
          title: 'Luxusimmobilien',
          description: 'Langfristige Wertsteigerung und Mietrendite',
          priceRange: '300.000 € - 3.000.000 €',
          icon: '🏠',
          color: '#2c5a78'
        });
      }
    }
    
    return suggestions;
  };
  
  const suggestions = getSuggestions();
  
  if (suggestions.length === 0) {
    return null;
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>💡 Weitere Anlageklassen entdecken</h3>
        <p className={styles.subtitle}>
          Diversifizieren Sie Ihr Portfolio mit weiteren Luxusgütern
        </p>
      </div>
      
      <div className={styles.grid}>
        {suggestions.map((suggestion, index) => (
          <a
            key={index}
            href={`/valuation?asset=${suggestion.type}`}
            className={styles.card}
            style={{
              borderColor: `${suggestion.color}40`,
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className={styles.cardIcon} style={{ background: `${suggestion.color}15` }}>
              <span style={{ fontSize: '2.5rem' }}>{suggestion.icon}</span>
            </div>
            
            <div className={styles.cardContent}>
              <h4 className={styles.cardTitle} style={{ color: suggestion.color }}>
                {suggestion.title}
              </h4>
              <p className={styles.cardDescription}>
                {suggestion.description}
              </p>
              <div className={styles.priceRange}>
                <span className={styles.priceLabel}>Typischer Bereich:</span>
                <span className={styles.priceValue}>{suggestion.priceRange}</span>
              </div>
            </div>
            
            <div className={styles.cardArrow} style={{ color: suggestion.color }}>
              →
            </div>
          </a>
        ))}
      </div>
      
      <div className={styles.footer}>
        <p className={styles.footerText}>
          💼 Profitieren Sie von unserer Expertise in allen Luxus-Segmenten
        </p>
      </div>
    </div>
  );
}

