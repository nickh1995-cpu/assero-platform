"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./PortfolioDashboard.module.css";

interface PortfolioMetrics {
  totalValue: number;
  totalDeals: number;
  activeDeals: number;
  closedDeals: number;
  monthlyReturn: number;
  yearlyReturn: number;
  riskScore: number;
  diversificationScore: number;
}

interface AssetAllocation {
  assetType: string;
  percentage: number;
  value: number;
  color: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface PerformanceData {
  date: string;
  value: number;
  benchmark: number;
}

interface PortfolioDashboardProps {
  portfolioId: string;
  onPortfolioUpdate?: (metrics: PortfolioMetrics) => void;
}

export function PortfolioDashboard({ portfolioId, onPortfolioUpdate }: PortfolioDashboardProps) {
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [allocations, setAllocations] = useState<AssetAllocation[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadPortfolioData();
    const interval = setInterval(loadPortfolioData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [portfolioId]);

  const loadPortfolioData = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      
      // Load portfolio metrics
      const { data: metricsData } = await supabase
        .from("portfolio_metrics")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .single();

      // Load asset allocations
      const { data: allocationsData } = await supabase
        .from("asset_allocations")
        .select("*")
        .eq("portfolio_id", portfolioId);

      // Load performance data
      const { data: performanceData } = await supabase
        .from("portfolio_performance")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .order("date", { ascending: false })
        .limit(30);

      if (metricsData) {
        setMetrics(metricsData);
        onPortfolioUpdate?.(metricsData);
      }

      if (allocationsData) {
        setAllocations(allocationsData);
      }

      if (performanceData) {
        setPerformanceData(performanceData.reverse());
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return '#10b981';
    if (value < 0) return '#ef4444';
    return '#6b7280';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getRiskLevel = (score: number) => {
    if (score <= 3) return { level: 'Niedrig', color: '#10b981' };
    if (score <= 6) return { level: 'Mittel', color: '#f59e0b' };
    return { level: 'Hoch', color: '#ef4444' };
  };

  if (loading && !metrics) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Lade Portfolio-Daten...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3>Keine Portfolio-Daten verfügbar</h3>
        <p>Erstellen Sie Ihr erstes Portfolio, um loszulegen.</p>
      </div>
    );
  }

  return (
    <div className={styles.portfolioDashboard}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h2 className={styles.dashboardTitle}>Portfolio Dashboard</h2>
          <div className={styles.lastUpdated}>
            <span className={styles.updateIcon}>🔄</span>
            <span>Zuletzt aktualisiert: {lastUpdated.toLocaleTimeString("de-DE")}</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={loadPortfolioData}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            Aktualisieren
          </button>
          <button className={styles.exportButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricTitle}>Gesamtwert</h3>
            <span className={styles.metricIcon}>💰</span>
          </div>
          <div className={styles.metricValue}>
            {formatCurrency(metrics.totalValue)}
          </div>
          <div className={styles.metricChange}>
            <span className={styles.changeValue} style={{ color: getPerformanceColor(metrics.monthlyReturn) }}>
              {formatPercentage(metrics.monthlyReturn)}
            </span>
            <span className={styles.changeLabel}>diesen Monat</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricTitle}>Aktive Deals</h3>
            <span className={styles.metricIcon}>📊</span>
          </div>
          <div className={styles.metricValue}>
            {metrics.activeDeals}
          </div>
          <div className={styles.metricChange}>
            <span className={styles.changeValue}>
              {metrics.totalDeals} Gesamt
            </span>
            <span className={styles.changeLabel}>
              {Math.round((metrics.activeDeals / metrics.totalDeals) * 100)}% aktiv
            </span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricTitle}>Jahresrendite</h3>
            <span className={styles.metricIcon}>📈</span>
          </div>
          <div className={styles.metricValue} style={{ color: getPerformanceColor(metrics.yearlyReturn) }}>
            {formatPercentage(metrics.yearlyReturn)}
          </div>
          <div className={styles.metricChange}>
            <span className={styles.changeValue}>
              {formatCurrency(metrics.totalValue * (metrics.yearlyReturn / 100))}
            </span>
            <span className={styles.changeLabel}>Gewinn/Verlust</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricTitle}>Risikobewertung</h3>
            <span className={styles.metricIcon}>⚠️</span>
          </div>
          <div className={styles.metricValue}>
            {metrics.riskScore}/10
          </div>
          <div className={styles.metricChange}>
            <span 
              className={styles.changeValue}
              style={{ color: getRiskLevel(metrics.riskScore).color }}
            >
              {getRiskLevel(metrics.riskScore).level}
            </span>
            <span className={styles.changeLabel}>Risikostufe</span>
          </div>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className={styles.allocationSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Asset Allocation</h3>
          <div className={styles.diversificationScore}>
            <span className={styles.scoreLabel}>Diversifikation:</span>
            <span className={styles.scoreValue}>{metrics.diversificationScore}/10</span>
          </div>
        </div>
        
        <div className={styles.allocationGrid}>
          {allocations.map((allocation, index) => (
            <div key={index} className={styles.allocationCard}>
              <div className={styles.allocationHeader}>
                <div className={styles.allocationInfo}>
                  <h4 className={styles.allocationType}>{allocation.assetType}</h4>
                  <div className={styles.allocationTrend}>
                    <span className={styles.trendIcon}>{getTrendIcon(allocation.trend)}</span>
                    <span className={styles.trendValue}>
                      {formatPercentage(allocation.change)}
                    </span>
                  </div>
                </div>
                <div className={styles.allocationPercentage}>
                  {allocation.percentage.toFixed(1)}%
                </div>
              </div>
              
              <div className={styles.allocationBar}>
                <div 
                  className={styles.allocationFill}
                  style={{ 
                    width: `${allocation.percentage}%`,
                    backgroundColor: allocation.color
                  }}
                ></div>
              </div>
              
              <div className={styles.allocationValue}>
                {formatCurrency(allocation.value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Chart */}
      <div className={styles.performanceSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Performance</h3>
          <div className={styles.chartControls}>
            <button className={styles.chartButton}>1M</button>
            <button className={`${styles.chartButton} ${styles.chartActive}`}>3M</button>
            <button className={styles.chartButton}>1J</button>
            <button className={styles.chartButton}>All</button>
          </div>
        </div>
        
        <div className={styles.chartContainer}>
          <div className={styles.chartPlaceholder}>
            <div className={styles.chartIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18"/>
                <path d="M18.71 15l-5.64-5.64-2.83 2.83-4.24-4.24"/>
              </svg>
            </div>
            <h4>Performance Chart</h4>
            <p>Interaktive Charts werden hier angezeigt</p>
            <div className={styles.chartData}>
              {performanceData.slice(-5).map((point, index) => (
                <div key={index} className={styles.dataPoint}>
                  <span className={styles.dataDate}>
                    {new Date(point.date).toLocaleDateString("de-DE", { month: 'short', day: 'numeric' })}
                  </span>
                  <span className={styles.dataValue}>
                    {formatCurrency(point.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h3 className={styles.sectionTitle}>Schnellaktionen</h3>
        <div className={styles.actionsGrid}>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>➕</span>
            <span className={styles.actionLabel}>Neuer Deal</span>
          </button>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>📊</span>
            <span className={styles.actionLabel}>Analyse</span>
          </button>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>📈</span>
            <span className={styles.actionLabel}>Optimierung</span>
          </button>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>📋</span>
            <span className={styles.actionLabel}>Bericht</span>
          </button>
        </div>
      </div>
    </div>
  );
}
