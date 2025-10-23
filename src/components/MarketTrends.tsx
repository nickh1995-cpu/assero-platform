"use client";

import React, { useEffect, useState } from 'react';
import styles from './MarketTrends.module.css';

interface MarketTrendsProps {
  assetType: 'real-estate' | 'luxusuhren' | 'fahrzeuge';
  location?: string;
}

interface TrendData {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  period: string;
  description: string;
  dataSource?: 'database' | 'estimated';
}

interface SupplyDemandData {
  status: 'high' | 'medium' | 'low';
  label: string;
  description: string;
  activeListings?: number;
}

interface SeasonalData {
  currentMonth: string;
  impact: 'positive' | 'neutral' | 'negative';
  description: string;
}

interface PriceStats {
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  count: number;
}

export default function MarketTrends({ 
  assetType, 
  location 
}: MarketTrendsProps) {
  const [trend, setTrend] = useState<TrendData | null>(null);
  const [supplyDemand, setSupplyDemand] = useState<SupplyDemandData | null>(null);
  const [priceStats, setPriceStats] = useState<PriceStats | null>(null);
  const [seasonal, setSeasonal] = useState<SeasonalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarketData() {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          assetType,
          ...(location && { location })
        });

        const response = await fetch(`/api/market-stats?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch market stats');
        }

        const result = await response.json();
        
        if (result.success) {
          setTrend(result.data.trend);
          setSupplyDemand(result.data.supplyDemand);
          setPriceStats(result.data.priceStats);
          
          // Calculate seasonal data
          setSeasonal(getSeasonalData(assetType));
        }
      } catch (err) {
        console.error('Error fetching market stats:', err);
        setError('Marktdaten konnten nicht geladen werden');
      } finally {
        setLoading(false);
      }
    }

    fetchMarketData();
  }, [assetType, location]);

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>📊 Marktkontext</h3>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Lade Marktdaten...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !trend || !supplyDemand) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>📊 Marktkontext</h3>
        <div className={styles.error}>
          <p>⚠️ {error || 'Daten nicht verfügbar'}</p>
        </div>
      </div>
    );
  }

  // Trend icon and color
  const trendIcon = trend.direction === 'up' ? '📈' : trend.direction === 'down' ? '📉' : '➡️';
  const trendColor = trend.direction === 'up' ? '#2c5a78' : trend.direction === 'down' ? '#c7a770' : '#666';

  // Supply/Demand indicator
  const demandIndicator = supplyDemand.status === 'high' ? '🔥' : 
                          supplyDemand.status === 'medium' ? '✓' : '📊';
  const demandColor = supplyDemand.status === 'high' ? '#2c5a78' : 
                      supplyDemand.status === 'medium' ? '#4a90a4' : '#c7a770';

  // Seasonal indicator
  const seasonalIcon = seasonal?.impact === 'positive' ? '🌟' : 
                       seasonal?.impact === 'negative' ? '⚠️' : 'ℹ️';

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>📊 Marktkontext</h3>
      
      {/* Data Source Badge */}
      {trend.dataSource && (
        <div className={styles.dataBadge}>
          {trend.dataSource === 'database' ? (
            <span className={styles.realData}>✓ Echte Marktdaten</span>
          ) : (
            <span className={styles.estimatedData}>~ Branchenschätzung</span>
          )}
        </div>
      )}

      <div className={styles.trendsGrid}>
        {/* Price Trend */}
        <div className={styles.trendCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>{trendIcon}</span>
            <h4 className={styles.cardTitle}>Preistrend</h4>
          </div>
          <div className={styles.trendValue} style={{ color: trendColor }}>
            {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : '±'}
            {trend.percentage.toFixed(1)}%
          </div>
          <div className={styles.trendPeriod}>{trend.period}</div>
          <p className={styles.cardDescription}>{trend.description}</p>
        </div>

        {/* Supply & Demand */}
        <div className={styles.trendCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>{demandIndicator}</span>
            <h4 className={styles.cardTitle}>Angebot & Nachfrage</h4>
          </div>
          <div className={styles.trendValue} style={{ color: demandColor }}>
            {supplyDemand.label}
          </div>
          {supplyDemand.activeListings !== undefined && (
            <div className={styles.trendPeriod}>
              {supplyDemand.activeListings} aktive Angebote
            </div>
          )}
          <p className={styles.cardDescription}>{supplyDemand.description}</p>
        </div>

        {/* Seasonal */}
        {seasonal && (
          <div className={styles.trendCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>{seasonalIcon}</span>
              <h4 className={styles.cardTitle}>Saisonalität</h4>
            </div>
            <div className={styles.trendValue}>
              {seasonal.currentMonth}
            </div>
            <div className={styles.trendPeriod}>
              {seasonal.impact === 'positive' ? 'Gute Zeit für Kauf' : 
               seasonal.impact === 'negative' ? 'Vorsicht geboten' : 'Neutral'}
            </div>
            <p className={styles.cardDescription}>{seasonal.description}</p>
          </div>
        )}
      </div>

      {/* Price Statistics (if available) */}
      {priceStats && (
        <div className={styles.priceStatsBox}>
          <h4 className={styles.statsTitle}>💰 Preis-Statistiken</h4>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Durchschnitt</span>
              <span className={styles.statValue}>
                {priceStats.avgPrice.toLocaleString('de-DE')} €
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Min - Max</span>
              <span className={styles.statValue}>
                {priceStats.minPrice.toLocaleString('de-DE')} € - {priceStats.maxPrice.toLocaleString('de-DE')} €
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Basis</span>
              <span className={styles.statValue}>
                {priceStats.count} Objekte
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Get seasonal data based on current month
 */
function getSeasonalData(assetType: string): SeasonalData {
  const currentMonth = new Date().toLocaleString('de-DE', { month: 'long' });
  const month = new Date().getMonth() + 1; // 1-12

  if (assetType === 'real-estate') {
    // Q1: Jan-Mar (winter, low activity)
    if (month >= 1 && month <= 3) {
      return {
        currentMonth,
        impact: 'neutral',
        description: 'Wintermonate: Ruhigerer Markt, weniger Konkurrenz.'
      };
    }
    // Q2: Apr-Jun (spring, peak season)
    if (month >= 4 && month <= 6) {
      return {
        currentMonth,
        impact: 'positive',
        description: 'Frühling/Sommer: Hauptsaison für Immobilienkäufe.'
      };
    }
    // Q3: Jul-Sep (summer, good activity)
    if (month >= 7 && month <= 9) {
      return {
        currentMonth,
        impact: 'positive',
        description: 'Sommer: Gute Zeit für Besichtigungen und Abschlüsse.'
      };
    }
    // Q4: Oct-Dec (autumn/winter, slowing down)
    return {
      currentMonth,
      impact: 'neutral',
      description: 'Herbst/Winter: Markt verlangsamt sich, weniger Angebot.'
    };
  }

  if (assetType === 'luxusuhren') {
    // Q4: Holiday season, high demand
    if (month >= 11 && month <= 12) {
      return {
        currentMonth,
        impact: 'positive',
        description: 'Weihnachtsgeschäft: Erhöhte Nachfrage nach Luxusuhren.'
      };
    }
    // Q1: Post-holiday, slower
    if (month >= 1 && month <= 2) {
      return {
        currentMonth,
        impact: 'negative',
        description: 'Nach Weihnachten: Ruhigerer Markt, gute Kaufgelegenheiten.'
      };
    }
    return {
      currentMonth,
      impact: 'neutral',
      description: 'Stabile Nachfrage über das Jahr hinweg.'
    };
  }

  // Vehicles
  if (month >= 3 && month <= 5) {
    return {
      currentMonth,
      impact: 'positive',
      description: 'Frühjahr: Hauptsaison für Fahrzeugverkäufe.'
    };
  }
  if (month === 12) {
    return {
      currentMonth,
      impact: 'negative',
      description: 'Dezember: Jahresendgeschäft, höhere Preise.'
    };
  }
  return {
    currentMonth,
    impact: 'neutral',
    description: 'Ausgeglichene Marktverhältnisse.'
  };
}
