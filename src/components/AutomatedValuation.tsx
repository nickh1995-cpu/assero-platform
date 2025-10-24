"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./AutomatedValuation.module.css";

interface ValuationData {
  id: string;
  asset_id: string;
  asset_title: string;
  asset_category: string;
  current_value: number;
  currency: string;
  valuation_date: string;
  valuation_method: string;
  confidence_score: number;
  market_conditions: string;
  comparable_sales: ComparableSale[];
  price_history: PricePoint[];
  market_trends: MarketTrend[];
  risk_factors: RiskFactor[];
  recommendations: string[];
  ai_analysis: string;
  created_at: string;
}

interface ComparableSale {
  id: string;
  asset_title: string;
  sale_price: number;
  sale_date: string;
  location?: string;
  condition: string;
  similarity_score: number;
}

interface PricePoint {
  date: string;
  value: number;
  source: string;
}

interface MarketTrend {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  strength: number;
  description: string;
}

interface RiskFactor {
  factor: string;
  risk_level: 'low' | 'medium' | 'high';
  impact: number;
  description: string;
  mitigation: string;
}

interface AutomatedValuationProps {
  assetId: string;
  onValuationUpdate?: (valuation: ValuationData) => void;
  onValuationComplete?: (valuation: ValuationData) => void;
}

export function AutomatedValuation({ 
  assetId, 
  onValuationUpdate, 
  onValuationComplete 
}: AutomatedValuationProps) {
  const [valuation, setValuation] = useState<ValuationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isValuating, setIsValuating] = useState(false);
  const [valuationProgress, setValuationProgress] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'analysis' | 'comparables' | 'trends' | 'risks'>('overview');

  useEffect(() => {
    if (assetId) {
      loadValuation();
    }
  }, [assetId]);

  const loadValuation = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("automated_valuations")
        .select("*")
        .eq("asset_id", assetId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setValuation(data);
    } catch (error) {
      console.error('Error loading valuation:', error);
    } finally {
      setLoading(false);
    }
  };

  const startValuation = async () => {
    setIsValuating(true);
    setValuationProgress(0);

    try {
      const supabase = getSupabaseBrowserClient();
      
      // Simulate valuation process with progress updates
      const progressInterval = setInterval(() => {
        setValuationProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // Call valuation API
      const { data, error } = await supabase
        .from("automated_valuations")
        .insert({
          asset_id: assetId,
          valuation_method: 'ai_automated',
          status: 'processing'
        })
        .select()
        .single();

      if (error) throw error;

      // Wait for AI processing (simulated)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Get completed valuation
      const { data: completedValuation, error: fetchError } = await supabase
        .from("automated_valuations")
        .select("*")
        .eq("id", data.id)
        .single();

      if (fetchError) throw fetchError;

      setValuation(completedValuation);
      onValuationComplete?.(completedValuation);
      clearInterval(progressInterval);
      setValuationProgress(100);
    } catch (error) {
      console.error('Error starting valuation:', error);
      alert('Fehler beim Starten der Bewertung.');
    } finally {
      setIsValuating(false);
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return '#10b981';
    if (score >= 0.6) return '#f59e0b';
    if (score >= 0.4) return '#ef4444';
    return '#6b7280';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      case 'neutral': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      case 'neutral': return '➡️';
      default: return '➡️';
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Lade Bewertungsdaten...</p>
      </div>
    );
  }

  return (
    <div className={styles.automatedValuation}>
      {/* Header */}
      <div className={styles.valuationHeader}>
        <div className={styles.headerLeft}>
          <h2 className={styles.valuationTitle}>Automatisierte Bewertung</h2>
          <div className={styles.valuationSubtitle}>
            KI-gestützte Asset-Bewertung mit Marktanalyse
          </div>
        </div>
        <div className={styles.headerActions}>
          {!valuation && (
            <button 
              className={styles.startValuationButton}
              onClick={startValuation}
              disabled={isValuating}
            >
              {isValuating ? (
                <>
                  <div className={styles.spinner}></div>
                  Bewertung läuft...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  Bewertung starten
                </>
              )}
            </button>
          )}
          {valuation && (
            <button className={styles.refreshButton} onClick={loadValuation}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              Aktualisieren
            </button>
          )}
        </div>
      </div>

      {/* Valuation Progress */}
      {isValuating && (
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <h3 className={styles.progressTitle}>Bewertung wird durchgeführt</h3>
            <div className={styles.progressSubtitle}>
              KI analysiert Marktdaten und vergleichbare Verkäufe
            </div>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${valuationProgress}%` }}
            ></div>
          </div>
          <div className={styles.progressLabel}>
            {Math.round(valuationProgress)}% abgeschlossen
          </div>
        </div>
      )}

      {/* Valuation Results */}
      {valuation && (
        <div className={styles.valuationResults}>
          {/* Valuation Overview */}
          <div className={styles.valuationOverview}>
            <div className={styles.overviewCard}>
              <div className={styles.overviewHeader}>
                <h3 className={styles.overviewTitle}>Bewertungsergebnis</h3>
                <div className={styles.valuationDate}>
                  {new Date(valuation.valuation_date).toLocaleDateString("de-DE")}
                </div>
              </div>
              
              <div className={styles.valuationValue}>
                <div className={styles.valueAmount}>
                  {formatCurrency(valuation.current_value, valuation.currency)}
                </div>
                <div className={styles.valueDetails}>
                  <div className={styles.valueMethod}>
                    Methode: {valuation.valuation_method}
                  </div>
                  <div 
                    className={styles.confidenceScore}
                    style={{ color: getConfidenceColor(valuation.confidence_score) }}
                  >
                    Vertrauen: {formatPercentage(valuation.confidence_score * 100)}
                  </div>
                </div>
              </div>

              <div className={styles.marketConditions}>
                <div className={styles.conditionsLabel}>Marktbedingungen:</div>
                <div className={styles.conditionsText}>{valuation.market_conditions}</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              {[
                { id: 'overview', label: 'Übersicht', icon: '📊' },
                { id: 'analysis', label: 'Analyse', icon: '🔍' },
                { id: 'comparables', label: 'Vergleichswerte', icon: '📈' },
                { id: 'trends', label: 'Trends', icon: '📉' },
                { id: 'risks', label: 'Risiken', icon: '⚠️' }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`${styles.tab} ${selectedTab === tab.id ? styles.tabActive : ''}`}
                  onClick={() => setSelectedTab(tab.id as any)}
                >
                  <span className={styles.tabIcon}>{tab.icon}</span>
                  <span className={styles.tabLabel}>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
              {selectedTab === 'overview' && (
                <div className={styles.overviewContent}>
                  <div className={styles.aiAnalysis}>
                    <h4 className={styles.analysisTitle}>KI-Analyse</h4>
                    <div className={styles.analysisText}>{valuation.ai_analysis}</div>
                  </div>
                  
                  <div className={styles.recommendations}>
                    <h4 className={styles.recommendationsTitle}>Empfehlungen</h4>
                    <div className={styles.recommendationsList}>
                      {valuation.recommendations.map((recommendation, index) => (
                        <div key={index} className={styles.recommendationItem}>
                          <span className={styles.recommendationIcon}>💡</span>
                          <span className={styles.recommendationText}>{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'analysis' && (
                <div className={styles.analysisContent}>
                  <div className={styles.priceHistory}>
                    <h4 className={styles.historyTitle}>Preisverlauf</h4>
                    <div className={styles.historyChart}>
                      {valuation.price_history.map((point, index) => (
                        <div key={index} className={styles.historyPoint}>
                          <div className={styles.pointDate}>
                            {new Date(point.date).toLocaleDateString("de-DE")}
                          </div>
                          <div className={styles.pointValue}>
                            {formatCurrency(point.value, valuation.currency)}
                          </div>
                          <div className={styles.pointSource}>{point.source}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'comparables' && (
                <div className={styles.comparablesContent}>
                  <h4 className={styles.comparablesTitle}>Vergleichswerte</h4>
                  <div className={styles.comparablesList}>
                    {valuation.comparable_sales.map((sale) => (
                      <div key={sale.id} className={styles.comparableCard}>
                        <div className={styles.comparableHeader}>
                          <h5 className={styles.comparableTitle}>{sale.asset_title}</h5>
                          <div 
                            className={styles.similarityScore}
                            style={{ color: getConfidenceColor(sale.similarity_score) }}
                          >
                            {formatPercentage(sale.similarity_score * 100)} ähnlich
                          </div>
                        </div>
                        <div className={styles.comparableDetails}>
                          <div className={styles.salePrice}>
                            {formatCurrency(sale.sale_price, valuation.currency)}
                          </div>
                          <div className={styles.saleDate}>
                            {new Date(sale.sale_date).toLocaleDateString("de-DE")}
                          </div>
                          {sale.location && (
                            <div className={styles.saleLocation}>📍 {sale.location}</div>
                          )}
                          <div className={styles.saleCondition}>
                            Zustand: {sale.condition}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'trends' && (
                <div className={styles.trendsContent}>
                  <h4 className={styles.trendsTitle}>Markttrends</h4>
                  <div className={styles.trendsList}>
                    {valuation.market_trends.map((trend, index) => (
                      <div key={index} className={styles.trendCard}>
                        <div className={styles.trendHeader}>
                          <div className={styles.trendFactor}>{trend.factor}</div>
                          <div className={styles.trendImpact}>
                            <span className={styles.impactIcon}>
                              {getImpactIcon(trend.impact)}
                            </span>
                            <span 
                              className={styles.impactLabel}
                              style={{ color: getImpactColor(trend.impact) }}
                            >
                              {trend.impact === 'positive' ? 'Positiv' : 
                               trend.impact === 'negative' ? 'Negativ' : 'Neutral'}
                            </span>
                          </div>
                        </div>
                        <div className={styles.trendDescription}>{trend.description}</div>
                        <div className={styles.trendStrength}>
                          <div className={styles.strengthLabel}>Stärke:</div>
                          <div className={styles.strengthBar}>
                            <div 
                              className={styles.strengthFill}
                              style={{ 
                                width: `${trend.strength * 100}%`,
                                backgroundColor: getImpactColor(trend.impact)
                              }}
                            ></div>
                          </div>
                          <div className={styles.strengthValue}>
                            {formatPercentage(trend.strength * 100)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'risks' && (
                <div className={styles.risksContent}>
                  <h4 className={styles.risksTitle}>Risikofaktoren</h4>
                  <div className={styles.risksList}>
                    {valuation.risk_factors.map((risk, index) => (
                      <div key={index} className={styles.riskCard}>
                        <div className={styles.riskHeader}>
                          <div className={styles.riskFactor}>{risk.factor}</div>
                          <div 
                            className={styles.riskLevel}
                            style={{ backgroundColor: getRiskColor(risk.risk_level) }}
                          >
                            {risk.risk_level === 'low' ? 'Niedrig' :
                             risk.risk_level === 'medium' ? 'Mittel' : 'Hoch'}
                          </div>
                        </div>
                        <div className={styles.riskDescription}>{risk.description}</div>
                        <div className={styles.riskImpact}>
                          <div className={styles.impactLabel}>Auswirkung:</div>
                          <div className={styles.impactValue}>
                            {formatPercentage(risk.impact * 100)}
                          </div>
                        </div>
                        <div className={styles.riskMitigation}>
                          <div className={styles.mitigationLabel}>Minderung:</div>
                          <div className={styles.mitigationText}>{risk.mitigation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Valuation State */}
      {!valuation && !isValuating && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3>Keine Bewertung verfügbar</h3>
          <p>Starten Sie eine automatische Bewertung, um den aktuellen Marktwert zu ermitteln</p>
        </div>
      )}
    </div>
  );
}
