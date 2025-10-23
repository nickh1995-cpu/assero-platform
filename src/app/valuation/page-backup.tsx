"use client";

import { useEffect, useState } from "react";
import type { ValuationInput } from "@/lib/valuation";
import { estimateValuation, formatCurrency } from "@/lib/valuation";
import ProgressStepper from "@/components/ProgressStepper";
import AssetSelection from "@/components/AssetSelection";
import styles from "./valuation.module.css";

type AssetType = "real-estate" | "luxusuhren" | "fahrzeuge";
type WizardStep = 1 | 2 | 3 | 4;

interface WizardState {
  currentStep: WizardStep;
  selectedAsset: AssetType | null;
  realEstate: {
    locationTier: 1 | 2 | 3;
    areaSqm: number;
    rooms: number;
    condition: "new" | "renovated" | "needs_renovation";
    energyClass: string;
    premiumFeatures: string[];
  };
  watch: {
    brandTier: 1 | 2 | 3;
    modelGrade: 1 | 2 | 3;
    condition: "mint" | "very_good" | "good" | "fair";
    fullSet: boolean;
    limited: boolean;
  };
  vehicle: {
    segment: "sports" | "luxury" | "suv" | "sedan";
    brandTier: 1 | 2 | 3;
    year: number;
    mileageKm: number;
    condition: "excellent" | "good" | "used";
    features: string[];
  };
}

const WIZARD_STEPS = [
  { number: 1, label: "Asset-Typ" },
  { number: 2, label: "Basis-Daten" },
  { number: 3, label: "Details" },
  { number: 4, label: "Bewertung" },
];

const STORAGE_KEY = "assero_valuation_wizard";

export default function ValuationLanding() {
  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 1,
    selectedAsset: null,
    realEstate: {
      locationTier: 1,
      areaSqm: 120,
      rooms: 4,
      condition: "renovated",
      energyClass: "A",
      premiumFeatures: ["terrace", "view"],
    },
    watch: {
      brandTier: 1,
      modelGrade: 1,
      condition: "very_good",
      fullSet: true,
      limited: false,
    },
    vehicle: {
      segment: "sports",
      brandTier: 1,
      year: 2021,
      mileageKm: 22000,
      condition: "good",
      features: ["ceramic_brakes"],
    },
  });

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const currency = "EUR" as const;

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWizardState(parsed);
      } catch (e) {
        console.error("Failed to parse saved wizard state:", e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wizardState));
  }, [wizardState]);

  // Auto-calculate when on Step 4 (Results)
  useEffect(() => {
    if (wizardState.currentStep === 4 && wizardState.selectedAsset) {
      const timeoutId = setTimeout(() => {
        performCalculation();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    wizardState.currentStep,
    wizardState.selectedAsset,
    JSON.stringify(wizardState.realEstate),
    JSON.stringify(wizardState.watch),
    JSON.stringify(wizardState.vehicle),
  ]);

  function performCalculation() {
    if (!wizardState.selectedAsset) return;

    try {
      setError(null);
      setIsCalculating(true);

      let input: ValuationInput;
      if (wizardState.selectedAsset === "real-estate") {
        input = {
          category: "real-estate",
          ...wizardState.realEstate,
        } as any;
      } else if (wizardState.selectedAsset === "luxusuhren") {
        input = { category: "luxusuhren", ...wizardState.watch } as any;
      } else {
        input = { category: "fahrzeuge", ...wizardState.vehicle } as any;
      }

      // Simulate slight delay for premium feel
      setTimeout(() => {
        const r = estimateValuation(input, currency);
        setResult(r);
        setIsCalculating(false);
      }, 200);
    } catch (e: any) {
      setError(e?.message ?? "Fehler bei der Bewertung");
      setIsCalculating(false);
    }
  }

  // Wizard Navigation
  function handleAssetSelect(asset: AssetType) {
    setWizardState((prev) => ({
      ...prev,
      selectedAsset: asset,
    }));
  }

  function goToNextStep() {
    if (wizardState.currentStep < 4) {
      setWizardState((prev) => ({
        ...prev,
        currentStep: (prev.currentStep + 1) as WizardStep,
      }));
    }
  }

  function goToPrevStep() {
    if (wizardState.currentStep > 1) {
      setWizardState((prev) => ({
        ...prev,
        currentStep: (prev.currentStep - 1) as WizardStep,
      }));
    }
  }

  function canProceedToNextStep(): boolean {
    switch (wizardState.currentStep) {
      case 1:
        return wizardState.selectedAsset !== null;
      case 2:
        // Basic validation
        if (wizardState.selectedAsset === "real-estate") {
          return wizardState.realEstate.areaSqm > 0 && wizardState.realEstate.rooms > 0;
        }
        if (wizardState.selectedAsset === "fahrzeuge") {
          return wizardState.vehicle.year > 1900 && wizardState.vehicle.mileageKm >= 0;
        }
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  }

  // Update handlers
  function updateRealEstate(updates: Partial<WizardState["realEstate"]>) {
    setWizardState((prev) => ({
      ...prev,
      realEstate: { ...prev.realEstate, ...updates },
    }));
  }

  function updateWatch(updates: Partial<WizardState["watch"]>) {
    setWizardState((prev) => ({
      ...prev,
      watch: { ...prev.watch, ...updates },
    }));
  }

  function updateVehicle(updates: Partial<WizardState["vehicle"]>) {
    setWizardState((prev) => ({
      ...prev,
      vehicle: { ...prev.vehicle, ...updates },
    }));
  }

  return (
    <main className="section padded light">
      <div className="container">
        <h1 className="section-title">Asset Valuation</h1>
        <p className="lead">
          Premium-Schätzung mit transparenten Parametern und Comps. Für Immobilien,
          Luxusuhren und Fahrzeuge.
        </p>

        {/* Progress Stepper */}
        <ProgressStepper currentStep={wizardState.currentStep} steps={WIZARD_STEPS} />

        {/* Wizard Content */}
        <div className={styles.wizardContent}>
          {/* Step 1: Asset Selection */}
          {wizardState.currentStep === 1 && (
            <div className={styles.step}>
              <AssetSelection
                selectedAsset={wizardState.selectedAsset}
                onSelect={handleAssetSelect}
              />
            </div>
          )}

          {/* Step 2: Basis-Daten (Pflichtfelder) */}
          {wizardState.currentStep === 2 && wizardState.selectedAsset && (
            <div className={styles.step}>
              <div className={styles.stepHeader}>
                <h2 className={styles.stepTitle}>Basis-Parameter</h2>
                <p className={styles.stepSubtitle}>Geben Sie die wichtigsten Eckdaten ein</p>
              </div>

              {wizardState.selectedAsset === "real-estate" && (
                <div className={styles.formCard}>
                  <div className={styles.formGrid}>
                    <div className={styles.formField}>
                      <label>Lage-Tier</label>
                      <select
                        value={wizardState.realEstate.locationTier}
                        onChange={(e) =>
                          updateRealEstate({
                            locationTier: Number(e.target.value) as 1 | 2 | 3,
                          })
                        }
                      >
                        <option value={1}>1 (Toplage)</option>
                        <option value={2}>2 (Gute Lage)</option>
                        <option value={3}>3 (Solide Lage)</option>
                      </select>
                    </div>

                    <div className={styles.formField}>
                      <label>Fläche (m²)</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={wizardState.realEstate.areaSqm}
                        onChange={(e) =>
                          updateRealEstate({ areaSqm: Number(e.target.value || 0) })
                        }
                      />
                    </div>

                    <div className={styles.formField}>
                      <label>Anzahl Zimmer</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={wizardState.realEstate.rooms}
                        onChange={(e) =>
                          updateRealEstate({ rooms: Number(e.target.value || 0) })
                        }
                      />
                    </div>

                    <div className={styles.formField}>
                      <label>Zustand</label>
                      <select
                        value={wizardState.realEstate.condition}
                        onChange={(e) =>
                          updateRealEstate({ condition: e.target.value as any })
                        }
                      >
                        <option value="new">Neubau</option>
                        <option value="renovated">Saniert</option>
                        <option value="needs_renovation">Renovierungsbedürftig</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {wizardState.selectedAsset === "luxusuhren" && (
                <div className={styles.formCard}>
                  <div className={styles.formGrid}>
                    <div className={styles.formField}>
                      <label>Marken-Tier</label>
                      <select
                        value={wizardState.watch.brandTier}
                        onChange={(e) =>
                          updateWatch({ brandTier: Number(e.target.value) as any })
                        }
                      >
                        <option value={1}>1 (Patek/AP/Rolex)</option>
                        <option value={2}>2 (Omega/IWC/Cartier)</option>
                        <option value={3}>3 (Tudor/Longines)</option>
                      </select>
                    </div>

                    <div className={styles.formField}>
                      <label>Modell-Grad</label>
                      <select
                        value={wizardState.watch.modelGrade}
                        onChange={(e) =>
                          updateWatch({ modelGrade: Number(e.target.value) as any })
                        }
                      >
                        <option value={1}>Icon</option>
                        <option value={2}>Core</option>
                        <option value={3}>Entry</option>
                      </select>
                    </div>

                    <div className={styles.formField}>
                      <label>Zustand</label>
                      <select
                        value={wizardState.watch.condition}
                        onChange={(e) => updateWatch({ condition: e.target.value as any })}
                      >
                        <option value="mint">Mint</option>
                        <option value="very_good">Sehr gut</option>
                        <option value="good">Gut</option>
                        <option value="fair">Okay</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {wizardState.selectedAsset === "fahrzeuge" && (
                <div className={styles.formCard}>
                  <div className={styles.formGrid}>
                    <div className={styles.formField}>
                      <label>Segment</label>
                      <select
                        value={wizardState.vehicle.segment}
                        onChange={(e) => updateVehicle({ segment: e.target.value as any })}
                      >
                        <option value="sports">Sports</option>
                        <option value="luxury">Luxury</option>
                        <option value="suv">SUV</option>
                        <option value="sedan">Sedan</option>
                      </select>
                    </div>

                    <div className={styles.formField}>
                      <label>Brand-Tier</label>
                      <select
                        value={wizardState.vehicle.brandTier}
                        onChange={(e) =>
                          updateVehicle({ brandTier: Number(e.target.value) as any })
                        }
                      >
                        <option value={1}>1 (Top Marken)</option>
                        <option value={2}>2 (Premium)</option>
                        <option value={3}>3 (Solid)</option>
                      </select>
                    </div>

                    <div className={styles.formField}>
                      <label>Baujahr</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={wizardState.vehicle.year}
                        onChange={(e) =>
                          updateVehicle({ year: Number(e.target.value || 0) })
                        }
                      />
                    </div>

                    <div className={styles.formField}>
                      <label>Kilometer</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={wizardState.vehicle.mileageKm}
                        onChange={(e) =>
                          updateVehicle({ mileageKm: Number(e.target.value || 0) })
                        }
                      />
                    </div>

                    <div className={styles.formField}>
                      <label>Zustand</label>
                      <select
                        value={wizardState.vehicle.condition}
                        onChange={(e) => updateVehicle({ condition: e.target.value as any })}
                      >
                        <option value="excellent">Exzellent</option>
                        <option value="good">Gut</option>
                        <option value="used">Gebraucht</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Details & Premium Features */}
          {wizardState.currentStep === 3 && wizardState.selectedAsset && (
            <div className={styles.step}>
              <div className={styles.stepHeader}>
                <h2 className={styles.stepTitle}>Details & Premium-Features</h2>
                <p className={styles.stepSubtitle}>
                  Zusätzliche Angaben für eine präzisere Bewertung
                </p>
              </div>

              {wizardState.selectedAsset === "real-estate" && (
                <div className={styles.formCard}>
                  <div className={styles.formGrid}>
                    <div className={styles.formField}>
                      <label>Energieklasse</label>
                      <select
                        value={wizardState.realEstate.energyClass}
                        onChange={(e) => updateRealEstate({ energyClass: e.target.value })}
                      >
                        {["A+", "A", "B", "C", "D", "E", "F", "G"].map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
                      <label>Premium-Features</label>
                      <div className={styles.checkboxGroup}>
                        {["terrace", "view", "parking", "concierge", "elevator", "balcony"].map(
                          (p) => (
                            <label key={p} className={styles.checkboxLabel}>
                              <input
                                type="checkbox"
                                checked={wizardState.realEstate.premiumFeatures.includes(p)}
                                onChange={(e) => {
                                  const features = e.target.checked
                                    ? Array.from(
                                        new Set([...wizardState.realEstate.premiumFeatures, p])
                                      )
                                    : wizardState.realEstate.premiumFeatures.filter(
                                        (x) => x !== p
                                      );
                                  updateRealEstate({ premiumFeatures: features });
                                }}
                              />
                              <span>{p}</span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {wizardState.selectedAsset === "luxusuhren" && (
                <div className={styles.formCard}>
                  <div className={styles.formGrid}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={wizardState.watch.fullSet}
                        onChange={(e) => updateWatch({ fullSet: e.target.checked })}
                      />
                      <span>Full Set (Box & Papers)</span>
                    </label>

                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={wizardState.watch.limited}
                        onChange={(e) => updateWatch({ limited: e.target.checked })}
                      />
                      <span>Limited Edition</span>
                    </label>
                  </div>
                </div>
              )}

              {wizardState.selectedAsset === "fahrzeuge" && (
                <div className={styles.formCard}>
                  <div className={styles.formField}>
                    <label>Sonderausstattung</label>
                    <div className={styles.checkboxGroup}>
                      {["ceramic_brakes", "carbon", "rare_color", "awd"].map((p) => (
                        <label key={p} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={wizardState.vehicle.features.includes(p)}
                            onChange={(e) => {
                              const features = e.target.checked
                                ? Array.from(
                                    new Set([...wizardState.vehicle.features, p])
                                  )
                                : wizardState.vehicle.features.filter((x) => x !== p);
                              updateVehicle({ features });
                            }}
                          />
                          <span>{p.replace("_", " ")}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Results */}
          {wizardState.currentStep === 4 && (
            <div className={styles.step}>
              {error && (
                <div className="card" style={{ marginTop: 16, borderColor: "#cc7a7a" }}>
                  <div style={{ color: "#cc7a7a" }}>{error}</div>
                </div>
              )}

              {/* Loading State */}
              {isCalculating && !result && (
                <div className={styles.resultsContainer}>
                  <div className={styles.skeleton + " " + styles.skeletonHero}></div>
                  <div
                    style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}
                  >
                    <div className={styles.skeleton + " " + styles.skeletonCard}></div>
                    <div className={styles.skeleton + " " + styles.skeletonCard}></div>
                    <div className={styles.skeleton + " " + styles.skeletonCard}></div>
                  </div>
                </div>
              )}

              {/* Results */}
              {result && !isCalculating && (
                <div className={styles.resultsContainer}>
                  {/* Hero Estimate */}
                  <div className={styles.heroEstimate}>
                    <div className={styles.heroLabel}>Geschätzter Marktwert</div>
                    <div className={styles.heroValue}>{formatCurrency(result.estimated)}</div>
                    <div className={styles.heroSubtext}>
                      Basierend auf aktuellen Marktdaten und Vergleichswerten
                    </div>
                  </div>

                  {/* Stats Grid with Confidence Badge */}
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Bandbreite</div>
                      <div className={styles.statValue} style={{ fontSize: "1.125rem" }}>
                        {formatCurrency(result.low)}
                        <br />
                        <span style={{ fontSize: "0.875rem", color: "#64748b" }}>bis</span>
                        <br />
                        {formatCurrency(result.high)}
                      </div>
                    </div>

                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Genauigkeit</div>
                      <div className={styles.statValue}>
                        <div
                          className={`${styles.confidenceBadge} ${
                            result.confidence >= 0.75
                              ? styles.high
                              : result.confidence >= 0.65
                              ? styles.medium
                              : styles.low
                          }`}
                        >
                          <span className={styles.confidenceIcon}></span>
                          {Math.round(result.confidence * 100)}%
                        </div>
                      </div>
                    </div>

                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Währung</div>
                      <div className={styles.statValue}>EUR</div>
                    </div>
                  </div>

                  {/* Range Visualization */}
                  <div className={styles.rangeVisualization}>
                    <div className={styles.sectionTitle}>Wertspanne</div>
                    <div className={styles.rangeBar}>
                      <div className={styles.rangeBarFill} style={{ width: "100%" }}></div>
                      <div
                        className={styles.rangeMarker}
                        style={{
                          left: `${
                            ((result.estimated - result.low) / (result.high - result.low)) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className={styles.rangeLabels}>
                      <span>
                        <strong>Min</strong> {formatCurrency(result.low)}
                      </span>
                      <span>
                        <strong>Schätzung</strong> {formatCurrency(result.estimated)}
                      </span>
                      <span>
                        <strong>Max</strong> {formatCurrency(result.high)}
                      </span>
                    </div>
                  </div>

                  {/* Key Drivers Cards with Icons */}
                  {!!result.rationale?.length && (
                    <div className={styles.sectionHeader}>
                      <div className={styles.sectionTitle}>Bewertungsfaktoren</div>
                      <div className={styles.sectionSubtitle}>
                        Diese Faktoren haben den größten Einfluss auf die Bewertung
                      </div>
                    </div>
                  )}

                  {!!result.rationale?.length && (
                    <div className={styles.keyDriversGrid}>
                      {result.rationale.map((r: string, idx: number) => {
                        const icons = ["📍", "⭐", "🏆", "✨"];
                        return (
                          <div key={r} className={styles.driverCard}>
                            <div className={styles.driverIcon}>{icons[idx] || "📊"}</div>
                            <div className={styles.driverContent}>
                              <div className={styles.driverLabel}>Faktor {idx + 1}</div>
                              <div className={styles.driverValue}>{r}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Comparables */}
                  {!!result.comparables?.length && (
                    <div className={styles.sectionHeader}>
                      <div className={styles.sectionTitle}>Vergleichswerte</div>
                      <div className={styles.sectionSubtitle}>
                        Ähnliche Assets auf dem Markt
                      </div>
                    </div>
                  )}

                  {!!result.comparables?.length && (
                    <div className={styles.comparablesGrid}>
                      {result.comparables.map((c: any) => (
                        <div key={c.title} className={styles.compCard}>
                          <div className={styles.compTitle}>{c.title}</div>
                          <div className={styles.compPrice}>{formatCurrency(c.price)}</div>
                          {c.source && <div className={styles.compSource}>{c.source}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div
                    style={{
                      marginTop: "2rem",
                      padding: "1rem",
                      background: "rgba(148,163,184,0.1)",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      color: "#64748b",
                    }}
                  >
                    <strong>Hinweis:</strong> Diese Schätzung basiert auf Heuristiken und
                    Vergleichswerten. Sie stellt keine Anlageberatung dar und kann von
                    tatsächlichen Marktwerten abweichen.
                  </div>
                </div>
              )}

              {/* Live Calculation Indicator */}
              {isCalculating && result && (
                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                  <div className={styles.calculatingIndicator}>
                    <div className={styles.spinner}></div>
                    Aktualisiere Schätzung...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className={styles.navigationControls}>
          {wizardState.currentStep > 1 && (
            <button className="btn-secondary" onClick={goToPrevStep}>
              ← Zurück
            </button>
          )}

          {wizardState.currentStep < 4 && (
            <button
              className="btn-primary"
              onClick={goToNextStep}
              disabled={!canProceedToNextStep()}
              style={{ marginLeft: "auto" }}
            >
              Weiter →
            </button>
          )}

          {wizardState.currentStep === 4 && (
            <button
              className="btn-secondary"
              onClick={() => {
                setWizardState((prev) => ({ ...prev, currentStep: 1, selectedAsset: null }));
                setResult(null);
              }}
              style={{ marginLeft: "auto" }}
            >
              Neue Bewertung
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
