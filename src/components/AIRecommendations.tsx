"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./AIRecommendations.module.css";

interface AIRecommendation {
  id: string;
  asset_id: string;
  asset_title: string;
  asset_category: string;
  asset_price: number;
  asset_currency: string;
  asset_image?: string;
  recommendation_score: number;
  recommendation_reason: string;
  market_analysis: string;
  risk_assessment: string;
  expected_return: number;
  time_horizon: string;
  confidence_level: number;
  created_at: string;
  ai_model: string;
  factors: string[];
}

interface RecommendationFilters {
  category: string[];
  priceRange: [number, number];
  riskLevel: string[];
  timeHorizon: string[];
  minScore: number;
}

interface AIRecommendationsProps {
  portfolioId: string;
  onRecommendationSelect?: (recommendation: AIRecommendation) => void;
  onRecommendationDismiss?: (recommendationId: string) => void;
}

export function AIRecommendations({ 
  portfolioId, 
  onRecommendationSelect, 
  onRecommendationDismiss 
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<RecommendationFilters>({
    category: [],
    priceRange: [0, 10000000],
    riskLevel: [],
    timeHorizon: [],
    minScore: 0
  });

  const categories = [
    { value: 'real-estate', label: 'Immobilien', icon: '🏠' },
    { value: 'luxury-watches', label: 'Luxusuhren', icon: '⌚' },
    { value: 'vehicles', label: 'Fahrzeuge', icon: '🚗' },
    { value: 'art', label: 'Kunst', icon: '🎨' },
    { value: 'collectibles', label: 'Sammlerstücke', icon: '💎' }
  ];

  const riskLevels = [
    { value: 'low', label: 'Niedrig', color: '#10b981' },
    { value: 'medium', label: 'Mittel', color: '#f59e0b' },
    { value: 'high', label: 'Hoch', color: '#ef4444' }
  ];

  const timeHorizons = [
    { value: 'short', label: 'Kurz (1-2 Jahre)' },
    { value: 'medium', label: 'Mittel (3-5 Jahre)' },
    { value: 'long', label: 'Lang (5+ Jahre)' }
  ];

  useEffect(() => {
    loadRecommendations();
  }, [portfolioId]);

  useEffect(() => {
    applyFilters();
  }, [recommendations, filters]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("ai_recommendations")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .order("recommendation_score", { ascending: false });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...recommendations];

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(rec => filters.category.includes(rec.asset_category));
    }

    // Price range filter
    filtered = filtered.filter(rec => 
      rec.asset_price >= filters.priceRange[0] && rec.asset_price <= filters.priceRange[1]
    );

    // Risk level filter
    if (filters.riskLevel.length > 0) {
      filtered = filtered.filter(rec => {
        const riskLevel = rec.risk_assessment.toLowerCase();
        return filters.riskLevel.some(level => riskLevel.includes(level));
      });
    }

    // Time horizon filter
    if (filters.timeHorizon.length > 0) {
      filtered = filtered.filter(rec => filters.timeHorizon.includes(rec.time_horizon));
    }

    // Minimum score filter
    filtered = filtered.filter(rec => rec.recommendation_score >= filters.minScore);

    setFilteredRecommendations(filtered);
  };

  const handleRecommendationClick = (recommendation: AIRecommendation) => {
    setSelectedRecommendation(recommendation);
    onRecommendationSelect?.(recommendation);
  };

  const handleDismissRecommendation = (recommendationId: string) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
    onRecommendationDismiss?.(recommendationId);
  };

  const handleAcceptRecommendation = async (recommendation: AIRecommendation) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("ai_recommendations")
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq("id", recommendation.id);

      if (error) throw error;
      
      // Remove from recommendations
      handleDismissRecommendation(recommendation.id);
      
      // Show success message
      alert('Empfehlung akzeptiert! Das Asset wurde zu Ihrem Portfolio hinzugefügt.');
    } catch (error) {
      console.error('Error accepting recommendation:', error);
      alert('Fehler beim Akzeptieren der Empfehlung.');
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
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.icon || '📦';
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.label || category;
  };

  const getRiskLevelColor = (riskAssessment: string) => {
    const risk = riskAssessment.toLowerCase();
    if (risk.includes('niedrig') || risk.includes('low')) return '#10b981';
    if (risk.includes('mittel') || risk.includes('medium')) return '#f59e0b';
    if (risk.includes('hoch') || risk.includes('high')) return '#ef4444';
    return '#6b7280';
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#f59e0b';
    if (score >= 4) return '#ef4444';
    return '#6b7280';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10b981';
    if (confidence >= 0.6) return '#f59e0b';
    if (confidence >= 0.4) return '#ef4444';
    return '#6b7280';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Lade AI-Empfehlungen...</p>
      </div>
    );
  }

  return (
    <div className={styles.aiRecommendations}>
      {/* Header */}
      <div className={styles.recommendationsHeader}>
        <div className={styles.headerLeft}>
          <h2 className={styles.recommendationsTitle}>AI-Empfehlungen</h2>
          <div className={styles.recommendationsSubtitle}>
            Künstliche Intelligenz analysiert Markttrends und schlägt optimale Assets vor
          </div>
          <div className={styles.recommendationsCount}>
            {filteredRecommendations.length} von {recommendations.length} Empfehlungen
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.filterButton}
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
            </svg>
            Filter
          </button>
          <button className={styles.refreshButton} onClick={loadRecommendations}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            Aktualisieren
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Kategorien</label>
            <div className={styles.filterOptions}>
              {categories.map(category => (
                <label key={category.value} className={styles.filterOption}>
                  <input
                    type="checkbox"
                    checked={filters.category.includes(category.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({
                          ...prev,
                          category: [...prev.category, category.value]
                        }));
                      } else {
                        setFilters(prev => ({
                          ...prev,
                          category: prev.category.filter(c => c !== category.value)
                        }));
                      }
                    }}
                  />
                  <span className={styles.filterOptionLabel}>
                    {category.icon} {category.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Preisbereich</label>
            <div className={styles.priceRange}>
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  priceRange: [Number(e.target.value) || 0, prev.priceRange[1]]
                }))}
                className={styles.priceInput}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  priceRange: [prev.priceRange[0], Number(e.target.value) || 10000000]
                }))}
                className={styles.priceInput}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Risikostufe</label>
            <div className={styles.filterOptions}>
              {riskLevels.map(risk => (
                <label key={risk.value} className={styles.filterOption}>
                  <input
                    type="checkbox"
                    checked={filters.riskLevel.includes(risk.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({
                          ...prev,
                          riskLevel: [...prev.riskLevel, risk.value]
                        }));
                      } else {
                        setFilters(prev => ({
                          ...prev,
                          riskLevel: prev.riskLevel.filter(r => r !== risk.value)
                        }));
                      }
                    }}
                  />
                  <span className={styles.filterOptionLabel}>
                    {risk.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Zeithorizont</label>
            <div className={styles.filterOptions}>
              {timeHorizons.map(horizon => (
                <label key={horizon.value} className={styles.filterOption}>
                  <input
                    type="checkbox"
                    checked={filters.timeHorizon.includes(horizon.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({
                          ...prev,
                          timeHorizon: [...prev.timeHorizon, horizon.value]
                        }));
                      } else {
                        setFilters(prev => ({
                          ...prev,
                          timeHorizon: prev.timeHorizon.filter(t => t !== horizon.value)
                        }));
                      }
                    }}
                  />
                  <span className={styles.filterOptionLabel}>
                    {horizon.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Mindest-Score</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={filters.minScore}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                minScore: Number(e.target.value)
              }))}
              className={styles.scoreSlider}
            />
            <div className={styles.scoreValue}>{filters.minScore}/10</div>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className={styles.recommendationsGrid}>
        {filteredRecommendations.map((recommendation) => (
          <div 
            key={recommendation.id} 
            className={styles.recommendationCard}
            onClick={() => handleRecommendationClick(recommendation)}
          >
            <div className={styles.recommendationHeader}>
              <div className={styles.assetInfo}>
                <div className={styles.assetImage}>
                  {recommendation.asset_image ? (
                    <img src={recommendation.asset_image} alt={recommendation.asset_title} />
                  ) : (
                    <div className={styles.assetPlaceholder}>
                      {getCategoryIcon(recommendation.asset_category)}
                    </div>
                  )}
                </div>
                <div className={styles.assetDetails}>
                  <h3 className={styles.assetTitle}>{recommendation.asset_title}</h3>
                  <div className={styles.assetCategory}>
                    {getCategoryIcon(recommendation.asset_category)} {getCategoryLabel(recommendation.asset_category)}
                  </div>
                  <div className={styles.assetPrice}>
                    {formatCurrency(recommendation.asset_price, recommendation.asset_currency)}
                  </div>
                </div>
              </div>
              
              <div className={styles.recommendationScore}>
                <div 
                  className={styles.scoreBadge}
                  style={{ backgroundColor: getScoreColor(recommendation.recommendation_score) }}
                >
                  {recommendation.recommendation_score.toFixed(1)}/10
                </div>
                <div className={styles.confidenceLevel}>
                  <span className={styles.confidenceLabel}>Vertrauen:</span>
                  <span 
                    className={styles.confidenceValue}
                    style={{ color: getConfidenceColor(recommendation.confidence_level) }}
                  >
                    {(recommendation.confidence_level * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.recommendationContent}>
              <div className={styles.recommendationReason}>
                <div className={styles.reasonLabel}>Empfehlungsgrund:</div>
                <div className={styles.reasonText}>{recommendation.recommendation_reason}</div>
              </div>

              <div className={styles.recommendationMetrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Erwartete Rendite:</span>
                  <span 
                    className={styles.metricValue}
                    style={{ color: recommendation.expected_return >= 0 ? '#10b981' : '#ef4444' }}
                  >
                    {formatPercentage(recommendation.expected_return)}
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Zeithorizont:</span>
                  <span className={styles.metricValue}>{recommendation.time_horizon}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Risiko:</span>
                  <span 
                    className={styles.metricValue}
                    style={{ color: getRiskLevelColor(recommendation.risk_assessment) }}
                  >
                    {recommendation.risk_assessment}
                  </span>
                </div>
              </div>

              <div className={styles.marketAnalysis}>
                <div className={styles.analysisLabel}>Marktanalyse:</div>
                <div className={styles.analysisText}>{recommendation.market_analysis}</div>
              </div>

              <div className={styles.factorsList}>
                <div className={styles.factorsLabel}>Einflussfaktoren:</div>
                <div className={styles.factors}>
                  {recommendation.factors.map((factor, index) => (
                    <span key={index} className={styles.factorTag}>
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.recommendationActions}>
              <button 
                className={styles.acceptButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptRecommendation(recommendation);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Akzeptieren
              </button>
              <button 
                className={styles.dismissButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismissRecommendation(recommendation.id);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Ablehnen
              </button>
            </div>

            <div className={styles.aiModel}>
              <span className={styles.modelLabel}>AI-Modell:</span>
              <span className={styles.modelName}>{recommendation.ai_model}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3>Keine Empfehlungen gefunden</h3>
          <p>Versuchen Sie andere Filter oder warten Sie auf neue AI-Analysen</p>
        </div>
      )}
    </div>
  );
}
