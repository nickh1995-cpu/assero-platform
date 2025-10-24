"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./AssetComparison.module.css";

interface Asset {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  location?: string;
  image?: string;
  status: string;
  created_at: string;
  metadata?: any;
}

interface ComparisonMetric {
  label: string;
  value: string | number;
  unit?: string;
  isBetter?: boolean;
}

interface AssetComparisonProps {
  assetIds: string[];
  onClose?: () => void;
}

export function AssetComparison({ assetIds, onClose }: AssetComparisonProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<ComparisonMetric[][]>([]);

  useEffect(() => {
    if (assetIds.length > 0) {
      loadAssets();
    }
  }, [assetIds]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .in("id", assetIds);

      if (error) throw error;
      setAssets(data || []);
      generateComparisonData(data || []);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateComparisonData = (assets: Asset[]) => {
    const metrics: ComparisonMetric[][] = [];

    // Basic Info
    metrics.push([
      { label: "Titel", value: assets[0]?.title || "", isBetter: true },
      { label: "Titel", value: assets[1]?.title || "", isBetter: true },
      { label: "Titel", value: assets[2]?.title || "", isBetter: true }
    ]);

    // Price Comparison
    const prices = assets.map(asset => asset.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    metrics.push([
      { 
        label: "Preis", 
        value: formatPrice(assets[0]?.price || 0, assets[0]?.currency || "EUR"),
        isBetter: assets[0]?.price === minPrice
      },
      { 
        label: "Preis", 
        value: formatPrice(assets[1]?.price || 0, assets[1]?.currency || "EUR"),
        isBetter: assets[1]?.price === minPrice
      },
      { 
        label: "Preis", 
        value: formatPrice(assets[2]?.price || 0, assets[2]?.currency || "EUR"),
        isBetter: assets[2]?.price === minPrice
      }
    ]);

    // Category
    metrics.push([
      { label: "Kategorie", value: getCategoryLabel(assets[0]?.category || ""), isBetter: true },
      { label: "Kategorie", value: getCategoryLabel(assets[1]?.category || ""), isBetter: true },
      { label: "Kategorie", value: getCategoryLabel(assets[2]?.category || ""), isBetter: true }
    ]);

    // Location
    metrics.push([
      { label: "Standort", value: assets[0]?.location || "Nicht angegeben", isBetter: true },
      { label: "Standort", value: assets[1]?.location || "Nicht angegeben", isBetter: true },
      { label: "Standort", value: assets[2]?.location || "Nicht angegeben", isBetter: true }
    ]);

    // Status
    metrics.push([
      { label: "Status", value: getStatusLabel(assets[0]?.status || ""), isBetter: assets[0]?.status === "active" },
      { label: "Status", value: getStatusLabel(assets[1]?.status || ""), isBetter: assets[1]?.status === "active" },
      { label: "Status", value: getStatusLabel(assets[2]?.status || ""), isBetter: assets[2]?.status === "active" }
    ]);

    // Date
    metrics.push([
      { label: "Erstellt", value: formatDate(assets[0]?.created_at || ""), isBetter: true },
      { label: "Erstellt", value: formatDate(assets[1]?.created_at || ""), isBetter: true },
      { label: "Erstellt", value: formatDate(assets[2]?.created_at || ""), isBetter: true }
    ]);

    // Custom metrics based on category
    if (assets[0]?.category === "real-estate") {
      metrics.push([
        { label: "Fläche", value: assets[0]?.metadata?.area_sqm ? `${assets[0].metadata.area_sqm} m²` : "N/A", isBetter: true },
        { label: "Fläche", value: assets[1]?.metadata?.area_sqm ? `${assets[1].metadata.area_sqm} m²` : "N/A", isBetter: true },
        { label: "Fläche", value: assets[2]?.metadata?.area_sqm ? `${assets[2].metadata.area_sqm} m²` : "N/A", isBetter: true }
      ]);

      metrics.push([
        { label: "Zimmer", value: assets[0]?.metadata?.rooms || "N/A", isBetter: true },
        { label: "Zimmer", value: assets[1]?.metadata?.rooms || "N/A", isBetter: true },
        { label: "Zimmer", value: assets[2]?.metadata?.rooms || "N/A", isBetter: true }
      ]);
    }

    if (assets[0]?.category === "vehicles") {
      metrics.push([
        { label: "Jahr", value: assets[0]?.metadata?.year || "N/A", isBetter: true },
        { label: "Jahr", value: assets[1]?.metadata?.year || "N/A", isBetter: true },
        { label: "Jahr", value: assets[2]?.metadata?.year || "N/A", isBetter: true }
      ]);

      metrics.push([
        { label: "Kilometerstand", value: assets[0]?.metadata?.mileage ? `${assets[0].metadata.mileage.toLocaleString()} km` : "N/A", isBetter: true },
        { label: "Kilometerstand", value: assets[1]?.metadata?.mileage ? `${assets[1].metadata.mileage.toLocaleString()} km` : "N/A", isBetter: true },
        { label: "Kilometerstand", value: assets[2]?.metadata?.mileage ? `${assets[2].metadata.mileage.toLocaleString()} km` : "N/A", isBetter: true }
      ]);
    }

    setComparisonData(metrics);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE");
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      'real-estate': 'Immobilie',
      'luxury-watches': 'Luxusuhr',
      'vehicles': 'Fahrzeug',
      'art': 'Kunst',
      'collectibles': 'Sammlerstück'
    };
    return categories[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      'active': 'Aktiv',
      'sold': 'Verkauft',
      'draft': 'Entwurf',
      'expired': 'Abgelaufen'
    };
    return statuses[status] || status;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'real-estate': '🏠',
      'luxury-watches': '⌚',
      'vehicles': '🚗',
      'art': '🎨',
      'collectibles': '💎'
    };
    return icons[category] || '📦';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': '#10b981',
      'sold': '#6b7280',
      'draft': '#f59e0b',
      'expired': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Lade Vergleichsdaten...</p>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3>Keine Assets zum Vergleichen</h3>
        <p>Wählen Sie Assets aus, um sie zu vergleichen</p>
      </div>
    );
  }

  return (
    <div className={styles.assetComparison}>
      {/* Header */}
      <div className={styles.comparisonHeader}>
        <div className={styles.headerLeft}>
          <h2 className={styles.comparisonTitle}>Asset-Vergleich</h2>
          <div className={styles.assetCount}>
            {assets.length} Assets im Vergleich
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.exportButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
          {onClose && (
            <button className={styles.closeButton} onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Assets Overview */}
      <div className={styles.assetsOverview}>
        {assets.map((asset, index) => (
          <div key={asset.id} className={styles.assetCard}>
            <div className={styles.assetImage}>
              {asset.image ? (
                <img src={asset.image} alt={asset.title} />
              ) : (
                <div className={styles.assetPlaceholder}>
                  {getCategoryIcon(asset.category)}
                </div>
              )}
              <div className={styles.assetStatus}>
                <span 
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(asset.status) }}
                >
                  {getStatusLabel(asset.status)}
                </span>
              </div>
            </div>
            
            <div className={styles.assetInfo}>
              <h3 className={styles.assetTitle}>{asset.title}</h3>
              <div className={styles.assetCategory}>
                {getCategoryIcon(asset.category)} {getCategoryLabel(asset.category)}
              </div>
              <div className={styles.assetPrice}>
                {formatPrice(asset.price, asset.currency)}
              </div>
              {asset.location && (
                <div className={styles.assetLocation}>
                  📍 {asset.location}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className={styles.comparisonTable}>
        <div className={styles.tableHeader}>
          <div className={styles.metricColumn}>Eigenschaft</div>
          {assets.map((asset, index) => (
            <div key={asset.id} className={styles.assetColumn}>
              Asset {index + 1}
            </div>
          ))}
        </div>
        
        <div className={styles.tableBody}>
          {comparisonData.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.tableRow}>
              <div className={styles.metricColumn}>
                <span className={styles.metricLabel}>{row[0].label}</span>
              </div>
              {row.map((metric, colIndex) => (
                <div 
                  key={colIndex} 
                  className={`${styles.assetColumn} ${metric.isBetter ? styles.betterValue : ''}`}
                >
                  <span className={styles.metricValue}>{metric.value}</span>
                  {metric.isBetter && (
                    <span className={styles.betterIndicator}>✓</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className={styles.comparisonSummary}>
        <h3 className={styles.summaryTitle}>Vergleichszusammenfassung</h3>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Günstigstes Asset</div>
            <div className={styles.summaryValue}>
              {assets.reduce((min, asset) => asset.price < min.price ? asset : min).title}
            </div>
            <div className={styles.summaryPrice}>
              {formatPrice(
                assets.reduce((min, asset) => asset.price < min.price ? asset : min).price,
                assets.reduce((min, asset) => asset.price < min.price ? asset : min).currency
              )}
            </div>
          </div>
          
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Neuestes Asset</div>
            <div className={styles.summaryValue}>
              {assets.reduce((newest, asset) => 
                new Date(asset.created_at) > new Date(newest.created_at) ? asset : newest
              ).title}
            </div>
            <div className={styles.summaryDate}>
              {formatDate(
                assets.reduce((newest, asset) => 
                  new Date(asset.created_at) > new Date(newest.created_at) ? asset : newest
                ).created_at
              )}
            </div>
          </div>
          
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Preisspanne</div>
            <div className={styles.summaryValue}>
              {formatPrice(Math.min(...assets.map(a => a.price)), assets[0]?.currency || "EUR")} - 
              {formatPrice(Math.max(...assets.map(a => a.price)), assets[0]?.currency || "EUR")}
            </div>
            <div className={styles.summaryRange}>
              Differenz: {formatPrice(
                Math.max(...assets.map(a => a.price)) - Math.min(...assets.map(a => a.price)),
                assets[0]?.currency || "EUR"
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
