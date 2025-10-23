import Link from "next/link";
import { safeFormatPrice, safeGetImageSrc, validateAsset } from "@/lib/error-handler";
import { safeFunctionCall, safeObjectAccess } from "@/lib/runtime-safety";

interface PremiumPropertyCardProps {
  asset: {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    currency: string | null;
    metadata?: Record<string, unknown>;
    property_type?: string;
    condition?: string;
    area_sqm?: number;
    rooms?: number;
    bathrooms?: number;
    year_built?: number;
    yield_pct?: number;
    energy_rating?: string;
    features?: string[];
    images?: any[];
    neighborhood_score?: number;
    investment_grade?: boolean;
  };
  categorySlug: string;
}

export function PremiumPropertyCard({ asset, categorySlug }: PremiumPropertyCardProps) {
  // Validate asset prop
  if (!validateAsset(asset)) {
    return null;
  }

  const imageSrc = safeGetImageSrc(asset);
  const isRealEstate = categorySlug === "real-estate";

  return (
    <article className="premium-listing-card enhanced-conversion">
      <Link href={`/asset/${asset.id}`} className="premium-listing-link">
        <div className="premium-listing-image">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt={asset.title}
              className="premium-listing-photo"
            />
          ) : (
            <div className="premium-listing-placeholder">
              <div className="placeholder-overlay">
                {isRealEstate && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>
                  </svg>
                )}
                {categorySlug === "luxusuhren" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="6"/>
                    <path d="M12 8v4l3 2"/>
                  </svg>
                )}
                {categorySlug === "fahrzeuge" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 13l2-4h14l2 4"/>
                    <rect x="4" y="13" width="16" height="5" rx="1"/>
                    <circle cx="7" cy="18" r="1.5"/>
                    <circle cx="17" cy="18" r="1.5"/>
                  </svg>
                )}
              </div>
            </div>
          )}
          
          {/* Premium Badges */}
          <div className="premium-listing-badges">
            {asset.investment_grade && (
              <span className="premium-badge investment-grade">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Investment Grade
              </span>
            )}
            {asset.condition && (
              <span className={`premium-badge condition-${asset.condition}`}>
                {asset.condition === "new" ? "NEUBAU" : 
                 asset.condition === "renovated" ? "SANIERT" : 
                 asset.condition === "excellent" ? "EXZELLENT" : "RENOVIERUNGSBEDÜRFTIG"}
              </span>
            )}
          </div>
          
          {/* Premium Actions */}
          <div className="premium-listing-actions">
            <button className="premium-action-btn" title="Merken">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
          
          {/* Quick View Overlay */}
          <div className="quick-view-overlay">
            <span className="quick-view-text">Details ansehen</span>
          </div>
        </div>
        
        <div className="premium-listing-content">
          <div className="premium-listing-price">{safeFormatPrice(asset.price, asset.currency)}</div>
          <h3 className="premium-listing-title">{asset.title}</h3>
          
          <div className="premium-listing-details">
            {isRealEstate && (
              <>
                {asset.area_sqm && (
                  <div className="premium-detail-item">
                    <span className="premium-detail-value">{asset.area_sqm}</span>
                    <span className="premium-detail-label">m²</span>
                  </div>
                )}
                {asset.rooms && (
                  <div className="premium-detail-item">
                    <span className="premium-detail-value">{asset.rooms}</span>
                    <span className="premium-detail-label">Zi.</span>
                  </div>
                )}
                {asset.bathrooms && (
                  <div className="premium-detail-item">
                    <span className="premium-detail-value">{asset.bathrooms}</span>
                    <span className="premium-detail-label">Bad</span>
                  </div>
                )}
                {asset.year_built && (
                  <div className="premium-detail-item">
                    <span className="premium-detail-value">{asset.year_built}</span>
                    <span className="premium-detail-label">Baujahr</span>
                  </div>
                )}
                {asset.yield_pct && (
                  <div className="premium-detail-item highlight">
                    <span className="premium-detail-value">{asset.yield_pct}%</span>
                    <span className="premium-detail-label">Rendite</span>
                  </div>
                )}
                {asset.energy_rating && (
                  <div className="premium-detail-item energy-rating">
                    <span className="premium-detail-value">{asset.energy_rating}</span>
                    <span className="premium-detail-label">Energie</span>
                  </div>
                )}
              </>
            )}
            {categorySlug === "luxusuhren" && asset.metadata && (
              <>
                <div className="premium-detail-item">
                  <span className="premium-detail-value">{safeObjectAccess(asset.metadata, 'brand') || "k.A."}</span>
                  <span className="premium-detail-label">Marke</span>
                </div>
                <div className="premium-detail-item">
                  <span className="premium-detail-value">{safeObjectAccess(asset.metadata, 'model') || "k.A."}</span>
                  <span className="premium-detail-label">Modell</span>
                </div>
                <div className="premium-detail-item">
                  <span className="premium-detail-value">{safeObjectAccess(asset.metadata, 'year') || "k.A."}</span>
                  <span className="premium-detail-label">Jahr</span>
                </div>
                <div className="premium-detail-item">
                  <span className="premium-detail-value">{safeObjectAccess(asset.metadata, 'case_size') || "k.A."}</span>
                  <span className="premium-detail-label">mm</span>
                </div>
                <div className="premium-detail-item">
                  <span className="premium-detail-value">{safeObjectAccess(asset.metadata, 'movement') || "k.A."}</span>
                  <span className="premium-detail-label">Werk</span>
                </div>
                <div className="premium-detail-item highlight">
                  <span className="premium-detail-value">{safeObjectAccess(asset.metadata, 'condition') === "excellent" ? "Exzellent" : safeObjectAccess(asset.metadata, 'condition') || "k.A."}</span>
                  <span className="premium-detail-label">Zustand</span>
                </div>
              </>
            )}
            {categorySlug === "fahrzeuge" && asset.metadata && (
              <>
                <div className="premium-detail-item">
                  <span className="premium-detail-value">{safeObjectAccess(asset.metadata, 'brand') || "k.A."}</span>
                  <span className="premium-detail-label">Marke</span>
                </div>
                <div className="premium-detail-item">
                  <span className="premium-detail-value">{safeObjectAccess(asset.metadata, 'model') || "k.A."}</span>
                  <span className="premium-detail-label">Modell</span>
                </div>
                <div className="premium-detail-item">
                  <span className="premium-detail-value">{safeObjectAccess(asset.metadata, 'year') || "k.A."}</span>
                  <span className="premium-detail-label">Bj.</span>
                </div>
                <div className="premium-detail-item">
                  <span className="premium-detail-value">{safeObjectAccess(asset.metadata, 'mileage') ? `${new Intl.NumberFormat("de-DE").format(safeObjectAccess(asset.metadata, 'mileage') as number)} km` : "k.A."}</span>
                  <span className="premium-detail-label">KM</span>
                </div>
                <div className="premium-detail-item">
                  <span className="premium-detail-value">{safeObjectAccess(asset.metadata, 'power_hp') || safeObjectAccess(asset.metadata, 'power_kw') || "k.A."}</span>
                  <span className="premium-detail-label">{safeObjectAccess(asset.metadata, 'power_hp') ? "PS" : "kW"}</span>
                </div>
                <div className="premium-detail-item">
                  <span className="premium-detail-value">{safeObjectAccess(asset.metadata, 'fuel_type') || "k.A."}</span>
                  <span className="premium-detail-label">Kraftstoff</span>
                </div>
                <div className="premium-detail-item highlight">
                  <span className="premium-detail-value">{safeObjectAccess(asset.metadata, 'condition') === "excellent" ? "Exzellent" : safeObjectAccess(asset.metadata, 'condition') || "k.A."}</span>
                  <span className="premium-detail-label">Zustand</span>
                </div>
              </>
            )}
          </div>

          <div className="premium-listing-location">
            {asset.metadata?.location && (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{asset.metadata.location}</span>
              </>
            )}
          </div>
          
          {asset.description && (
            <p className="premium-listing-desc">{asset.description}</p>
          )}
        </div>
      </Link>
    </article>
  );
}
