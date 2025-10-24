"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./AnalyticsDashboard.module.css";

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
  target?: number;
  benchmark?: number;
}

interface RiskMetric {
  id: string;
  name: string;
  value: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

interface MarketTrend {
  id: string;
  asset: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  timeframe: string;
  factors: string[];
}

interface AnalyticsDashboardProps {
  portfolioId: string;
  onAnalyticsUpdate?: (metrics: PerformanceMetric[]) => void;
}

export function AnalyticsDashboard({ portfolioId, onAnalyticsUpdate }: AnalyticsDashboardProps) {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalyticsData();
    const interval = setInterval(loadAnalyticsData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [portfolioId, selectedTimeframe]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      
      // Load performance metrics
      const { data: performanceData } = await supabase
        .from("analytics_performance")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .eq("timeframe", selectedTimeframe);

      // Load risk metrics
      const { data: riskData } = await supabase
        .from("analytics_risk")
        .select("*")
        .eq("portfolio_id", portfolioId);

      // Load market trends
      const { data: trendsData } = await supabase
        .from("analytics_trends")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .order("confidence", { ascending: false });

      if (performanceData) {
        setPerformanceMetrics(performanceData);
        onAnalyticsUpdate?.(performanceData);
      }

      if (riskData) {
        setRiskMetrics(riskData);
      }

      if (trendsData) {
        setMarketTrends(trendsData);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading analytics data:', error);
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getRiskLevelLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Niedrig';
      case 'medium': return 'Mittel';
      case 'high': return 'Hoch';
      case 'critical': return 'Kritisch';
      default: return 'Unbekannt';
    }
  };

  const getMarketTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return '🐂';
      case 'bearish': return '🐻';
      default: return '➡️';
    }
  };

  const getMarketTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return '#10b981';
      case 'bearish': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const timeframes = [
    { value: '1D', label: '1 Tag' },
    { value: '1W', label: '1 Woche' },
    { value: '1M', label: '1 Monat' },
    { value: '3M', label: '3 Monate' },
    { value: '1Y', label: '1 Jahr' },
    { value: 'ALL', label: 'Alle' }
  ];

  if (loading && performanceMetrics.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Lade Analytics-Daten...</p>
      </div>
    );
  }

  return (
    <div className={styles.analyticsDashboard}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h2 className={styles.dashboardTitle}>Analytics Dashboard</h2>
          <div className={styles.lastUpdated}>
            <span className={styles.updateIcon}>🔄</span>
            <span>Zuletzt aktualisiert: {lastUpdated.toLocaleTimeString("de-DE")}</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.timeframeSelector}>
            {timeframes.map(timeframe => (
              <button
                key={timeframe.value}
                className={`${styles.timeframeButton} ${selectedTimeframe === timeframe.value ? styles.timeframeActive : ''}`}
                onClick={() => setSelectedTimeframe(timeframe.value as any)}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
          <button className={styles.refreshButton} onClick={loadAnalyticsData}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            Aktualisieren
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className={styles.performanceSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Performance Metriken</h3>
          <div className={styles.sectionSubtitle}>
            Real-time Performance Tracking
          </div>
        </div>
        
        <div className={styles.metricsGrid}>
          {performanceMetrics.map((metric) => (
            <div key={metric.id} className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <h4 className={styles.metricTitle}>{metric.name}</h4>
                <div className={styles.metricTrend}>
                  <span className={styles.trendIcon}>{getTrendIcon(metric.trend)}</span>
                  <span 
                    className={styles.trendValue}
                    style={{ color: getTrendColor(metric.trend) }}
                  >
                    {formatPercentage(metric.changePercent)}
                  </span>
                </div>
              </div>
              
              <div className={styles.metricValue}>
                {formatCurrency(metric.value)}
              </div>
              
              <div className={styles.metricDetails}>
                <div className={styles.metricChange}>
                  <span className={styles.changeLabel}>Änderung:</span>
                  <span 
                    className={styles.changeValue}
                    style={{ color: getTrendColor(metric.trend) }}
                  >
                    {formatCurrency(metric.change)}
                  </span>
                </div>
                
                {metric.target && (
                  <div className={styles.metricTarget}>
                    <span className={styles.targetLabel}>Ziel:</span>
                    <span className={styles.targetValue}>
                      {formatCurrency(metric.target)}
                    </span>
                  </div>
                )}
                
                {metric.benchmark && (
                  <div className={styles.metricBenchmark}>
                    <span className={styles.benchmarkLabel}>Benchmark:</span>
                    <span className={styles.benchmarkValue}>
                      {formatCurrency(metric.benchmark)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className={styles.metricProgress}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ 
                      width: `${Math.min(100, Math.max(0, (metric.value / (metric.target || metric.value)) * 100))}%`,
                      backgroundColor: getTrendColor(metric.trend)
                    }}
                  ></div>
                </div>
                <div className={styles.progressLabel}>
                  {metric.period}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className={styles.riskSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Risikobewertung</h3>
          <div className={styles.sectionSubtitle}>
            Portfolio Risk Analysis
          </div>
        </div>
        
        <div className={styles.riskGrid}>
          {riskMetrics.map((risk) => (
            <div key={risk.id} className={styles.riskCard}>
              <div className={styles.riskHeader}>
                <h4 className={styles.riskTitle}>{risk.name}</h4>
                <div 
                  className={styles.riskLevel}
                  style={{ backgroundColor: getRiskLevelColor(risk.level) }}
                >
                  {getRiskLevelLabel(risk.level)}
                </div>
              </div>
              
              <div className={styles.riskValue}>
                {risk.value.toFixed(1)}/10
              </div>
              
              <div className={styles.riskDescription}>
                {risk.description}
              </div>
              
              <div className={styles.riskRecommendation}>
                <div className={styles.recommendationLabel}>Empfehlung:</div>
                <div className={styles.recommendationText}>
                  {risk.recommendation}
                </div>
              </div>
              
              <div className={styles.riskProgress}>
                <div className={styles.riskBar}>
                  <div 
                    className={styles.riskFill}
                    style={{ 
                      width: `${(risk.value / 10) * 100}%`,
                      backgroundColor: getRiskLevelColor(risk.level)
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Trends */}
      <div className={styles.trendsSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Markttrends</h3>
          <div className={styles.sectionSubtitle}>
            AI-Powered Market Analysis
          </div>
        </div>
        
        <div className={styles.trendsGrid}>
          {marketTrends.map((trend) => (
            <div key={trend.id} className={styles.trendCard}>
              <div className={styles.trendHeader}>
                <div className={styles.trendAsset}>
                  <span className={styles.assetIcon}>
                    {getMarketTrendIcon(trend.trend)}
                  </span>
                  <span className={styles.assetName}>{trend.asset}</span>
                </div>
                <div 
                  className={styles.trendDirection}
                  style={{ color: getMarketTrendColor(trend.trend) }}
                >
                  {trend.trend === 'bullish' ? 'Aufwärtstrend' : 
                   trend.trend === 'bearish' ? 'Abwärtstrend' : 'Seitwärtstrend'}
                </div>
              </div>
              
              <div className={styles.trendConfidence}>
                <div className={styles.confidenceLabel}>Vertrauen:</div>
                <div className={styles.confidenceValue}>
                  {(trend.confidence * 100).toFixed(1)}%
                </div>
                <div className={styles.confidenceBar}>
                  <div 
                    className={styles.confidenceFill}
                    style={{ 
                      width: `${trend.confidence * 100}%`,
                      backgroundColor: getMarketTrendColor(trend.trend)
                    }}
                  ></div>
                </div>
              </div>
              
              <div className={styles.trendTimeframe}>
                <span className={styles.timeframeLabel}>Zeitraum:</span>
                <span className={styles.timeframeValue}>{trend.timeframe}</span>
              </div>
              
              <div className={styles.trendFactors}>
                <div className={styles.factorsLabel}>Einflussfaktoren:</div>
                <div className={styles.factorsList}>
                  {trend.factors.map((factor, index) => (
                    <span key={index} className={styles.factorTag}>
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className={styles.summarySection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Zusammenfassung</h3>
          <div className={styles.sectionSubtitle}>
            Portfolio Performance Overview
          </div>
        </div>
        
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>📊</div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryLabel}>Gesamtperformance</div>
              <div className={styles.summaryValue}>
                {performanceMetrics.length > 0 
                  ? formatPercentage(
                      performanceMetrics.reduce((sum, metric) => sum + metric.changePercent, 0) / performanceMetrics.length
                    )
                  : 'N/A'
                }
              </div>
            </div>
          </div>
          
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>⚠️</div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryLabel}>Risikostufe</div>
              <div className={styles.summaryValue}>
                {riskMetrics.length > 0 
                  ? getRiskLevelLabel(
                      riskMetrics.reduce((sum, risk) => sum + risk.value, 0) / riskMetrics.length > 7 ? 'high' :
                      riskMetrics.reduce((sum, risk) => sum + risk.value, 0) / riskMetrics.length > 4 ? 'medium' : 'low'
                    )
                  : 'N/A'
                }
              </div>
            </div>
          </div>
          
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>📈</div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryLabel}>Markttrends</div>
              <div className={styles.summaryValue}>
                {marketTrends.filter(trend => trend.trend === 'bullish').length} Bullish
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
