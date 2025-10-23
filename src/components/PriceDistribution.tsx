"use client";

import styles from './PriceDistribution.module.css';

type PriceDistributionProps = {
  min: number;
  max: number;
  avg: number;
  median: number;
  percentile: number;
  userEstimate: number;
};

export default function PriceDistribution({
  min,
  max,
  avg,
  median,
  percentile,
  userEstimate
}: PriceDistributionProps) {
  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Calculate position percentages for visualization
  const range = max - min;
  const userPosition = ((userEstimate - min) / range) * 100;
  const avgPosition = ((avg - min) / range) * 100;

  const getPercentileMessage = () => {
    if (percentile >= 80) {
      return { text: "Überdurchschnittlich", color: "#10b981", icon: "🔥" };
    } else if (percentile >= 50) {
      return { text: "Marktpreis", color: "#3b82f6", icon: "📊" };
    } else {
      return { text: "Attraktiver Preis", color: "#f59e0b", icon: "💰" };
    }
  };

  const message = getPercentileMessage();

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Marktposition</h3>
      
      {/* Percentile Badge */}
      <div 
        className={styles.percentileBadge}
        style={{ background: message.color }}
      >
        {message.icon} {message.text}
        <div className={styles.percentileValue}>
          Top {100 - percentile}% der Vergleichsobjekte
        </div>
      </div>

      {/* Distribution Visualization */}
      <div className={styles.distribution}>
        <div className={styles.distributionBar}>
          {/* Background gradient representing distribution */}
          <div className={styles.gradient} />
          
          {/* Average Marker */}
          <div 
            className={styles.marker}
            style={{ left: `${avgPosition}%` }}
          >
            <div className={styles.markerLine} style={{ background: "#94a3b8" }} />
            <div className={styles.markerLabel}>
              Durchschnitt
              <div className={styles.markerPrice}>{formatPrice(avg)}</div>
            </div>
          </div>

          {/* User Estimate Marker */}
          <div 
            className={styles.marker}
            style={{ left: `${userPosition}%` }}
          >
            <div className={styles.markerLine} style={{ background: "#2c5a78" }} />
            <div className={styles.markerLabel} style={{ color: "#2c5a78", fontWeight: 700 }}>
              Ihre Schätzung
              <div className={styles.markerPrice} style={{ color: "#2c5a78" }}>
                {formatPrice(userEstimate)}
              </div>
            </div>
          </div>
        </div>

        {/* Min/Max Labels */}
        <div className={styles.rangeLabels}>
          <div className={styles.rangeLabel}>
            <div className={styles.rangeValue}>{formatPrice(min)}</div>
            <div className={styles.rangeName}>Minimum</div>
          </div>
          <div className={styles.rangeLabel}>
            <div className={styles.rangeValue}>{formatPrice(max)}</div>
            <div className={styles.rangeName}>Maximum</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatPrice(median)}</div>
          <div className={styles.statLabel}>Median</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{percentile}%</div>
          <div className={styles.statLabel}>Perzentil</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatPrice(max - min)}</div>
          <div className={styles.statLabel}>Spanne</div>
        </div>
      </div>
    </div>
  );
}

