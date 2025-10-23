'use client';

import { useState } from 'react';
import styles from './NaturalLanguageInput.module.css';

interface NaturalLanguageInputProps {
  assetType: 'immobilien' | 'luxusuhren' | 'fahrzeuge';
  onParsed: (data: any) => void;
}

export default function NaturalLanguageInput({ assetType, onParsed }: NaturalLanguageInputProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeholders = {
    immobilien: '3-Zimmer Wohnung in München, Schwabing, 90m², Neubau, Balkon, 2. Stock',
    luxusuhren: 'Rolex Submariner 116610LN, Baujahr 2018, Box & Papiere, Top Zustand',
    fahrzeuge: 'Porsche 911 Turbo S, 2020, 15.000 km, schwarz, Erstbesitz, scheckheftgepflegt'
  };

  const handleParse = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/parse-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: input, assetType })
      });

      if (!response.ok) {
        throw new Error('Parsing fehlgeschlagen');
      }

      const data = await response.json();
      onParsed(data.parsed);
      setInput(''); // Clear input after successful parse
    } catch (err) {
      setError('Beschreibung konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.');
      console.error('Parse error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleParse();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 className={styles.title}>⚡ Quick-Input mit KI</h3>
          <p className={styles.subtitle}>Beschreiben Sie Ihr Asset – wir füllen das Formular automatisch aus</p>
        </div>
      </div>

      <div className={styles.inputWrapper}>
        <textarea
          className={styles.textarea}
          placeholder={placeholders[assetType]}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={3}
          disabled={loading}
        />
        
        <button
          className={styles.button}
          onClick={handleParse}
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <>
              <span className={styles.spinner}></span>
              Verarbeite...
            </>
          ) : (
            <>
              <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Formular automatisch ausfüllen
            </>
          )}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth={2} strokeLinecap="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth={2} strokeLinecap="round" />
          </svg>
          {error}
        </div>
      )}

      <div className={styles.examples}>
        <span className={styles.examplesLabel}>Beispiele:</span>
        <div className={styles.exampleTags}>
          {assetType === 'immobilien' && (
            <>
              <button className={styles.tag} onClick={() => setInput('4-Zimmer Altbauwohnung in Hamburg, Eppendorf, 120m², saniert, Stuck')}>
                4-Zi Altbau Hamburg
              </button>
              <button className={styles.tag} onClick={() => setInput('Penthouse München, Maxvorstadt, 150m², Dachterrasse, Neubau 2022')}>
                Penthouse München
              </button>
            </>
          )}
          {assetType === 'luxusuhren' && (
            <>
              <button className={styles.tag} onClick={() => setInput('Patek Philippe Nautilus 5711, Stahl, 2019, Full Set, ungetragen')}>
                Patek Nautilus
              </button>
              <button className={styles.tag} onClick={() => setInput('Audemars Piguet Royal Oak 15400, 41mm, 2016, Service 2023')}>
                AP Royal Oak
              </button>
            </>
          )}
          {assetType === 'fahrzeuge' && (
            <>
              <button className={styles.tag} onClick={() => setInput('Ferrari F8 Tributo, 2021, 5000km, Rosso Corsa, Carbon Paket')}>
                Ferrari F8
              </button>
              <button className={styles.tag} onClick={() => setInput('Lamborghini Huracán EVO, 2020, 8000km, schwarz, Keramikbremse')}>
                Lamborghini Huracán
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

