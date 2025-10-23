"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ErrorBoundary } from "./ErrorBoundary";

const FeaturedGrid = dynamic(() => import("@/components/FeaturedGrid").then(mod => ({ default: mod.FeaturedGrid })), {
  ssr: false,
  loading: () => (
    <section className="section padded light">
      <div className="container">
        <h2 className="section-title center">Premium Highlights</h2>
        <p className="lead center" style={{ marginBottom: 48 }}>
          Handverlesene Top-Assets aus jeder Kategorie
        </p>
        <div className="featured-grid">
          <div className="featured-card">
            <div className="featured-image-wrap">
              <div className="featured-image">
                <img
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
                  alt="Premium Immobilie"
                  className="featured-photo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span className="featured-badge">Real Estate</span>
            </div>
            <div className="featured-content">
              <h3 className="featured-title">
                <Link href="/browse/real-estate">Premium Immobilien</Link>
              </h3>
              <p className="featured-price">Ab 500.000 €</p>
              <div className="featured-meta">
                <span className="meta-item">📍 Top-Lagen</span>
                <span className="meta-item">🏢 Gewerbe & Wohnen</span>
              </div>
              <div className="featured-actions">
                <Link href="/browse/real-estate" className="btn-primary">Immobilien entdecken</Link>
              </div>
            </div>
          </div>
          <div className="featured-card">
            <div className="featured-image-wrap">
              <div className="featured-image">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop"
                  alt="Luxusuhren"
                  className="featured-photo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span className="featured-badge">Luxusuhren</span>
            </div>
            <div className="featured-content">
              <h3 className="featured-title">
                <Link href="/browse/luxusuhren">Exklusive Zeitmesser</Link>
              </h3>
              <p className="featured-price">Ab 10.000 €</p>
              <div className="featured-meta">
                <span className="meta-item">⌚ Sammlerstücke</span>
                <span className="meta-item">💎 Edelsteine</span>
              </div>
              <div className="featured-actions">
                <Link href="/browse/luxusuhren" className="btn-primary">Uhren entdecken</Link>
              </div>
            </div>
          </div>
          <div className="featured-card">
            <div className="featured-image-wrap">
              <div className="featured-image">
                <img
                  src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop"
                  alt="Premium Fahrzeuge"
                  className="featured-photo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span className="featured-badge">Fahrzeuge</span>
            </div>
            <div className="featured-content">
              <h3 className="featured-title">
                <Link href="/browse/fahrzeuge">Premium Automobile</Link>
              </h3>
              <p className="featured-price">Ab 50.000 €</p>
              <div className="featured-meta">
                <span className="meta-item">🚗 Klassiker</span>
                <span className="meta-item">🏎️ Sportwagen</span>
              </div>
              <div className="featured-actions">
                <Link href="/browse/fahrzeuge" className="btn-primary">Fahrzeuge entdecken</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
});

export function FeaturedGridWrapper() {
  return (
    <ErrorBoundary>
      <FeaturedGrid />
    </ErrorBoundary>
  );
}
