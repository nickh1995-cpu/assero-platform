"use client";

import styles from './CompCard.module.css';

type CompCardProps = {
  title: string;
  price: number;
  specs: Record<string, string | number>;
  location?: string;
  similarity: number;
  listingUrl?: string;
  image?: string;
};

export default function CompCard({
  title,
  price,
  specs,
  location,
  similarity,
  listingUrl,
  image
}: CompCardProps) {
  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const handleClick = () => {
    if (listingUrl) {
      window.open(listingUrl, '_blank');
    }
  };

  return (
    <div 
      className={`${styles.compCard} ${listingUrl ? styles.clickable : ''}`}
      onClick={handleClick}
    >
      {/* Similarity Badge */}
      <div className={styles.similarityBadge}>
        {similarity}% Match
      </div>

      {/* Image Placeholder */}
      {image ? (
        <div className={styles.imageContainer}>
          <img src={image} alt={title} className={styles.image} />
        </div>
      ) : (
        <div className={styles.imagePlaceholder}>
          <span className={styles.placeholderIcon}>📷</span>
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        <h4 className={styles.title}>{title}</h4>
        
        {location && (
          <div className={styles.location}>
            📍 {location}
          </div>
        )}

        <div className={styles.price}>
          {formatPrice(price)}
        </div>

        {/* Specs */}
        <div className={styles.specs}>
          {Object.entries(specs).slice(0, 3).map(([key, value]) => (
            <div key={key} className={styles.specItem}>
              <span className={styles.specLabel}>{key}:</span>
              <span className={styles.specValue}>{value}</span>
            </div>
          ))}
        </div>

        {listingUrl && (
          <div className={styles.viewLink}>
            Details ansehen →
          </div>
        )}
      </div>
    </div>
  );
}

