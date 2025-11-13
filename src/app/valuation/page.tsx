"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProgressStepper from "@/components/ProgressStepper";
import CompCard from "@/components/CompCard";
import PriceDistribution from "@/components/PriceDistribution";
import MarketTrends from "@/components/MarketTrends";
import SimilarAssets from "@/components/SimilarAssets";
import WatchlistCTA from "@/components/WatchlistCTA";
import NaturalLanguageInput from "@/components/NaturalLanguageInput";
import SmartSuggestions from "@/components/SmartSuggestions";
import RiskWarnings from "@/components/RiskWarnings";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { detectLocationTier, getLocationSuggestions } from "@/lib/location-data";
import styles from "./valuation.module.css";

type ComparableAsset = {
  id: string;
  type: string;
  title: string;
  price: number;
  image?: string;
  specs: Record<string, string | number>;
  location?: string;
  similarity: number;
  listingUrl?: string;
};

type PriceDistributionData = {
  min: number;
  max: number;
  avg: number;
  median: number;
  percentile: number;
  priceRange: {
    low: number;
    mid: number;
    high: number;
  };
};

const STORAGE_KEY = "assero_valuation_wizard";

type AssetType = "real-estate" | "luxusuhren" | "fahrzeuge";
type WizardStep = 1 | 2 | 3 | 4;

const WIZARD_STEPS = [
  { number: 1, label: "Asset-Typ" },
  { number: 2, label: "Basis-Daten" },
  { number: 3, label: "Details" },
  { number: 4, label: "Bewertung" },
];

export default function ValuationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [selectedAsset, setSelectedAsset] = useState<AssetType | null>(null);
  
  // Comparables State
  const [comparables, setComparables] = useState<ComparableAsset[]>([]);
  const [distribution, setDistribution] = useState<PriceDistributionData | null>(null);
  const [loadingComps, setLoadingComps] = useState(false);
  
  // Save Valuation State
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedValuationId, setSavedValuationId] = useState<string | null>(null);
  
  // Export/Share State
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Form Data State
  const [formData, setFormData] = useState({
    // Real Estate - PROFESSIONAL FIELDS
    locationAddress: "", // Full address (auto-detects tier)
    locationTier: 2 as 1 | 2 | 3, // Auto-set based on address
    locationLabel: "✓ Gute Lage", // Auto-set based on address
    propertyType: "wohnung" as "wohnung" | "haus" | "penthouse" | "reihenhaus" | "doppelhaushaelfte",
    areaSqm: 100,
    rooms: 3,
    buildYear: 2000, // NEW: Essential for valuation!
    floor: "" as string, // NEW: Etage (bei Wohnung)
    condition: "renovated" as "new" | "saniert" | "renovated" | "needs_renovation",
    // Ausstattung (NEW)
    hasBalcony: false,
    hasGarage: false,
    hasKitchen: false,
    hasElevator: false,
    hasGarden: false,
    hasCellar: false,
    energyRating: "" as "" | "A+" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H",
    // Watch - PROFESSIONAL FIELDS
    watchLocation: "",
    watchBrand: "", // NEW: Konkrete Marke (Rolex, Patek, etc.)
    watchModel: "", // NEW: Konkretes Modell (Submariner, Nautilus, etc.)
    watchReference: "", // NEW: Referenznummer (116610LN, 5711/1A, etc.)
    watchYear: new Date().getFullYear() - 5, // NEW: Herstellungsjahr
    brandTier: 2 as 1 | 2 | 3, // Keep for fallback
    modelGrade: 2 as 1 | 2 | 3, // Keep for fallback
    watchCondition: "very_good" as "mint" | "very_good" | "good" | "fair",
    // Box & Papers - SEPARATED
    hasBox: false, // NEW: Box vorhanden?
    hasPapers: false, // NEW: Papiere vorhanden?
    fullSet: false, // DEPRECATED (aber behalten für Kompatibilität)
    // Additional Details
    isLimitedEdition: false, // NEW: Limitierte Edition?
    isUnpolished: false, // NEW: Original/Unpoliert?
    hasServiceHistory: false, // NEW: Service-Historie vorhanden?
    // Vehicle - PROFESSIONAL FIELDS
    vehicleLocation: "",
    vehicleBrand: "", // NEW: Konkrete Marke (Porsche, Ferrari, Mercedes, etc.)
    vehicleModel: "", // NEW: Konkretes Modell (911 Turbo S, F8 Tributo, etc.)
    vehicleType: "coupe" as "coupe" | "cabrio" | "suv" | "limousine" | "kombi" | "sportwagen",
    vehicleYear: new Date().getFullYear() - 3, // Baujahr
    firstRegistration: "", // NEW: Erstzulassung (MM/YYYY)
    previousOwners: 1, // NEW: Anzahl Vorbesitzer
    mileageKm: 30000,
    vehicleColor: "", // NEW: Farbe (wichtig für Wert!)
    vehicleCondition: "good" as "excellent" | "good" | "used",
    // Additional Details
    isAccidentFree: true, // NEW: Unfallfrei?
    hasServiceBook: false, // NEW: Scheckheft gepflegt?
    hasWarranty: false, // NEW: Garantie vorhanden?
    // Brand Tier (for fallback)
    brandTier: 2 as 1 | 2 | 3,
  });

  const handleAssetSelect = (asset: AssetType) => {
    setSelectedAsset(asset);
    setCurrentStep(2);
  };

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    // Special handling for location address - auto-detect tier
    if (field === "locationAddress") {
      const locationInfo = detectLocationTier(value);
      setFormData(prev => ({ 
        ...prev, 
        locationAddress: value,
        locationTier: locationInfo.tier,
        locationLabel: locationInfo.label
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Real-time validation
    const errors: Record<string, string> = {};
    
    if (field === "areaSqm") {
      const val = Number(value);
      if (val < 20) errors.areaSqm = "Mindestens 20 m²";
      if (val > 1000) errors.areaSqm = "Maximal 1.000 m²";
    }
    
    if (field === "buildYear") {
      const val = Number(value);
      const currentYear = new Date().getFullYear();
      if (val < 1800) errors.buildYear = "Jahr muss nach 1800 liegen";
      if (val > currentYear + 2) errors.buildYear = `Maximum ${currentYear + 2}`;
    }
    
    if (field === "vehicleYear") {
      const val = Number(value);
      const currentYear = new Date().getFullYear();
      if (val < 1950) errors.vehicleYear = "Jahr muss nach 1950 liegen";
      if (val > currentYear + 1) errors.vehicleYear = `Maximum ${currentYear + 1}`;
    }
    
    if (field === "mileageKm") {
      const val = Number(value);
      const age = new Date().getFullYear() - formData.vehicleYear;
      if (val > 500000) errors.mileageKm = "Maximal 500.000 km";
      // Plausibility: 0 km bei altem Auto?
      if (val === 0 && age > 1) {
        errors.mileageKm = "⚠️ 0 km bei älterem Fahrzeug?";
      }
    }
    
    setValidationErrors(errors);
  };

  // Format number with thousand separators
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num);
  };

  // Check if can proceed to next step
  const [missingFieldsError, setMissingFieldsError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/sign-in?redirect_to=/valuation');
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <main>
        <Header />
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "40px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "12px" }}>
            {authLoading ? "Authentifizierung wird geladen ..." : "Anmeldung erforderlich"}
          </div>
          {!authLoading && (
            <p style={{ maxWidth: "420px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
              Bitte melden Sie sich an, um den Bewertungsassistenten zu nutzen. Ihre letzten Bewertungen stehen Ihnen danach wieder vollständig zur Verfügung.
            </p>
          )}
        </div>
      </main>
    );
  }

  const canProceedToNextStep = () => {
    if (currentStep === 2 && selectedAsset === "real-estate") {
      // Required: Location, Property Type, Area, Rooms, Build Year, Condition
      if (!formData.locationAddress || formData.locationAddress.length < 3) {
        setMissingFieldsError("Bitte geben Sie einen Standort ein");
        return false;
      }
      if (!formData.areaSqm || formData.areaSqm < 20) {
        setMissingFieldsError("Bitte geben Sie die Wohnfläche ein (mindestens 20 m²)");
        return false;
      }
      if (!formData.rooms || formData.rooms < 1) {
        setMissingFieldsError("Bitte geben Sie die Anzahl der Zimmer ein");
        return false;
      }
      if (!formData.buildYear || formData.buildYear < 1800) {
        setMissingFieldsError("Bitte geben Sie das Baujahr ein");
        return false;
      }
      // Optional Floor check for Wohnung/Penthouse
      if ((formData.propertyType === "wohnung" || formData.propertyType === "penthouse") && !formData.floor) {
        setMissingFieldsError("Bitte wählen Sie die Etage aus");
        return false;
      }
    }
    setMissingFieldsError("");
    return true;
  };

  const goToNextStep = () => {
    if (canProceedToNextStep() && currentStep < 4) {
      setCurrentStep((currentStep + 1) as WizardStep);
      setMissingFieldsError("");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
      setMissingFieldsError("");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handler for Save Valuation
  const handleSaveValuation = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/valuations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_type: selectedAsset,
          form_data: formData,
          estimated_value: valuation.estimate,
          value_min: valuation.min,
          value_max: valuation.max
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      const data = await response.json();
      setSaved(true);
      setSavedValuationId(data.valuation?.id);
      
      // Reset saved state after 3 seconds
      setTimeout(() => {
        setSaved(false);
      }, 3000);

    } catch (error: any) {
      console.error('Error saving valuation:', error);
      setSaveError(error.message || 'Fehler beim Speichern');
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setSaveError(null);
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  // Handler for Export PDF
  const handleExportPDF = async () => {
    setExporting(true);

    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valuationData: {
            asset_type: selectedAsset,
            form_data: formData,
            estimated_value: valuation.estimate,
            value_min: valuation.min,
            value_max: valuation.max,
            title: `${selectedAsset === 'real-estate' ? 'Immobilie' : selectedAsset === 'luxusuhren' ? 'Uhr' : 'Fahrzeug'} Bewertung`,
            created_at: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ASSERO_Bewertung_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('PDF export error:', error);
      alert('PDF-Export fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setExporting(false);
    }
  };

  // Handler for Share Link Generation
  const handleGenerateShareLink = async () => {
    // First, save the valuation if not already saved
    if (!savedValuationId) {
      alert('Bitte speichern Sie die Bewertung zuerst, um sie zu teilen.');
      return;
    }

    setSharing(true);

    try {
      const response = await fetch(`/api/valuations/${savedValuationId}/share`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Share link generation failed');
      }

      const data = await response.json();
      setShareUrl(data.shareUrl);
      setShowShareModal(true);

    } catch (error) {
      console.error('Share link error:', error);
      alert('Share-Link Generierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setSharing(false);
    }
  };

  // Handler for Copy Share Link
  const handleCopyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      alert('Link in Zwischenablage kopiert!');
    }
  };

  // Handler for Asset Type Change
  const handleAssetTypeChange = (newAssetType: string) => {
    setSelectedAsset(newAssetType);
    // Reset form data when changing asset type
    setFormData({
      // Real Estate - PROFESSIONAL FIELDS
      locationAddress: "",
      propertyType: "",
      areaSqm: "",
      rooms: "",
      buildYear: "",
      condition: "",
      floor: "",
      energyRating: "",
      hasBalcony: false,
      hasGarage: false,
      hasKitchen: false,
      hasElevator: false,
      hasGarden: false,
      
      // Luxusuhren - PROFESSIONAL FIELDS
      watchBrand: "",
      watchModel: "",
      watchReference: "",
      watchYear: "",
      watchCondition: "",
      hasBox: false,
      hasPapers: false,
      hasServiceHistory: false,
      isLimitedEdition: false,
      isUnpolished: false,
      
      // Fahrzeuge - PROFESSIONAL FIELDS
      vehicleBrand: "",
      vehicleModel: "",
      vehicleType: "",
      vehicleYear: "",
      firstRegistration: "",
      mileageKm: "",
      vehicleColor: "",
      vehicleCondition: "",
      previousOwners: "",
      isAccidentFree: false,
      hasServiceBook: false,
      hasWarranty: false
    });
    
    // Reset valuation
    setValuation({
      estimate: 0,
      min: 0,
      max: 0,
      confidence: 0,
      keyDrivers: []
    });
    
    // Reset step to 1
    setCurrentStep(1);
  };

  // Handler for Natural Language Parsing
  const handleParsedData = (parsed: any) => {
    console.log("📝 Parsed data from NL input:", parsed);
    
    // Merge parsed data into formData
    const updates: Partial<typeof formData> = {};
    
    if (selectedAsset === "real-estate") {
      if (parsed.area) updates.areaSqm = parsed.area;
      if (parsed.rooms) updates.rooms = parsed.rooms;
      if (parsed.location) updates.locationAddress = parsed.location;
      if (parsed.city) updates.locationAddress = parsed.city + (parsed.location ? `, ${parsed.location}` : '');
      if (parsed.propertyType) updates.propertyType = parsed.propertyType;
      if (parsed.condition) updates.condition = parsed.condition;
      if (parsed.floor !== null && parsed.floor !== undefined) updates.floor = parsed.floor.toString();
      if (parsed.buildYear) updates.buildYear = parsed.buildYear;
      if (parsed.hasBalcony !== undefined) updates.hasBalcony = parsed.hasBalcony;
      if (parsed.hasParking !== undefined) updates.hasGarage = parsed.hasParking;
      if (parsed.energyRating) updates.energyRating = parsed.energyRating;
      
      // Auto-detect location tier
      if (parsed.location || parsed.city) {
        const detectedTier = detectLocationTier(parsed.location || parsed.city || '');
        updates.locationTier = detectedTier.tier;
        updates.locationLabel = detectedTier.label;
      }
    }
    
    if (selectedAsset === "luxusuhren") {
      if (parsed.watchBrand) updates.watchBrand = parsed.watchBrand;
      if (parsed.watchModel) updates.watchModel = parsed.watchModel;
      if (parsed.watchReference) updates.watchReference = parsed.watchReference;
      if (parsed.watchYear) updates.watchYear = parsed.watchYear;
      if (parsed.watchCondition) updates.watchCondition = parsed.watchCondition;
      if (parsed.hasBox !== undefined) updates.hasBox = parsed.hasBox;
      if (parsed.hasPapers !== undefined) updates.hasPapers = parsed.hasPapers;
      if (parsed.hasServiceHistory !== undefined) updates.hasServiceHistory = parsed.hasServiceHistory;
      if (parsed.isLimitedEdition !== undefined) updates.isLimitedEdition = parsed.isLimitedEdition;
      if (parsed.isUnpolished !== undefined) updates.isUnpolished = parsed.isUnpolished;
      if (parsed.brandTier) updates.brandTier = parsed.brandTier;
    }
    
    if (selectedAsset === "fahrzeuge") {
      if (parsed.vehicleBrand) updates.vehicleBrand = parsed.vehicleBrand;
      if (parsed.vehicleModel) updates.vehicleModel = parsed.vehicleModel;
      if (parsed.vehicleType) updates.vehicleType = parsed.vehicleType;
      if (parsed.vehicleYear) updates.vehicleYear = parsed.vehicleYear;
      if (parsed.firstRegistration) updates.firstRegistration = parsed.firstRegistration;
      if (parsed.mileageKm) updates.mileageKm = parsed.mileageKm;
      if (parsed.vehicleColor) updates.vehicleColor = parsed.vehicleColor;
      if (parsed.vehicleCondition) updates.vehicleCondition = parsed.vehicleCondition;
      if (parsed.previousOwners !== undefined) updates.previousOwners = parsed.previousOwners;
      if (parsed.isAccidentFree !== undefined) updates.isAccidentFree = parsed.isAccidentFree;
      if (parsed.hasServiceBook !== undefined) updates.hasServiceBook = parsed.hasServiceBook;
      if (parsed.hasWarranty !== undefined) updates.hasWarranty = parsed.hasWarranty;
      if (parsed.brandTier) updates.brandTier = parsed.brandTier;
    }
    
    // Apply updates
    setFormData(prev => ({ ...prev, ...updates }));
    
    // Show success notification (optional)
    console.log("✅ Form auto-filled successfully!");
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setSelectedAsset(null);
    setFormData({
      locationAddress: "",
      locationTier: 2 as 1 | 2 | 3,
      locationLabel: "✓ Gute Lage",
      propertyType: "wohnung" as "wohnung" | "haus" | "penthouse" | "reihenhaus" | "doppelhaushaelfte",
      areaSqm: 100,
      rooms: 3,
      buildYear: 2000,
      floor: "",
      condition: "renovated" as "new" | "saniert" | "renovated" | "needs_renovation",
      hasBalcony: false,
      hasGarage: false,
      hasKitchen: false,
      hasElevator: false,
      hasGarden: false,
      hasCellar: false,
      energyRating: "" as "" | "A+" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H",
      watchLocation: "",
      watchBrand: "",
      watchModel: "",
      watchReference: "",
      watchYear: new Date().getFullYear() - 5,
      brandTier: 2 as 1 | 2 | 3,
      modelGrade: 2 as 1 | 2 | 3,
      watchCondition: "very_good" as "mint" | "very_good" | "good" | "fair",
      hasBox: false,
      hasPapers: false,
      fullSet: false,
      isLimitedEdition: false,
      isUnpolished: false,
      hasServiceHistory: false,
      vehicleLocation: "",
      vehicleBrand: "",
      vehicleModel: "",
      vehicleType: "coupe" as "coupe" | "cabrio" | "suv" | "limousine" | "kombi" | "sportwagen",
      vehicleYear: new Date().getFullYear() - 3,
      firstRegistration: "",
      previousOwners: 1,
      mileageKm: 30000,
      vehicleColor: "",
      vehicleCondition: "good" as "excellent" | "good" | "used",
      isAccidentFree: true,
      hasServiceBook: false,
      hasWarranty: false,
      brandTier: 2 as 1 | 2 | 3,
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  // Calculate confidence score based on asset type
  const calculateConfidence = () => {
    if (selectedAsset === "real-estate") {
      // Higher confidence for standard inputs
      const hasTypicalSize = formData.areaSqm >= 50 && formData.areaSqm <= 200;
      return hasTypicalSize ? 78 : 68;
    }
    if (selectedAsset === "luxusuhren") {
      // Lower confidence due to volatile watch market
      return formData.fullSet ? 72 : 65;
    }
    if (selectedAsset === "fahrzeuge") {
      // Higher confidence for newer, low-mileage vehicles
      const age = new Date().getFullYear() - formData.vehicleYear;
      const lowMileage = formData.mileageKm < age * 20000;
      return (age < 5 && lowMileage) ? 75 : 68;
    }
    return 70;
  };

  // Calculate key drivers for valuation
  const getKeyDrivers = () => {
    if (selectedAsset === "real-estate") {
      const drivers = [];
      
      // Lage (always most important)
      drivers.push({ 
        icon: "📍", 
        label: formData.locationLabel,
        impact: formData.locationTier === 1 ? "+60-80%" : formData.locationTier === 2 ? "+40-60%" : "Basis",
        positive: formData.locationTier <= 2
      });
      
      // Property Type
      if (formData.propertyType === 'penthouse') {
        drivers.push({ 
          icon: "🌟", 
          label: "Penthouse", 
          impact: "+35%",
          positive: true
        });
      } else if (formData.propertyType === 'haus') {
        drivers.push({ 
          icon: "🏠", 
          label: "Einfamilienhaus", 
          impact: "+15%",
          positive: true
        });
      }
      
      // Ausstattung (if significant)
      const ausstattungCount = [
        formData.hasBalcony, formData.hasGarage, formData.hasKitchen,
        formData.hasElevator, formData.hasGarden, formData.hasCellar
      ].filter(Boolean).length;
      
      if (ausstattungCount >= 3) {
        drivers.push({ 
          icon: "✨", 
          label: "Premium Ausstattung", 
          impact: `+${Math.round(ausstattungCount * 5)}%`,
          positive: true
        });
      }
      
      // Zustand
      if (formData.condition === "new" || formData.condition === "saniert") {
        drivers.push({ 
          icon: "🏗️", 
          label: formData.condition === "new" ? "Neubau" : "Vollsaniert", 
          impact: formData.condition === "new" ? "+25%" : "+15%",
          positive: true
        });
      } else if (formData.condition === "needs_renovation") {
        drivers.push({ 
          icon: "⚠️", 
          label: "Renovierungsbedarf", 
          impact: "-25%",
          positive: false
        });
      }
      
      // Age (if significant)
      const age = new Date().getFullYear() - formData.buildYear;
      if (age <= 5 && formData.condition !== 'new') {
        drivers.push({ 
          icon: "📅", 
          label: "Sehr jung", 
          impact: "Wie Neubau",
          positive: true
        });
      } else if (age >= 30 && formData.condition !== 'saniert') {
        drivers.push({ 
          icon: "📅", 
          label: `${age} Jahre alt`, 
          impact: `-${Math.min(20, Math.round(age * 0.5))}%`,
          positive: false
        });
      }
      
      // Energy rating (if good or bad)
      if (formData.energyRating === 'A+' || formData.energyRating === 'A') {
        drivers.push({ 
          icon: "⚡", 
          label: `Energie ${formData.energyRating}`, 
          impact: formData.energyRating === 'A+' ? "+8%" : "+5%",
          positive: true
        });
      } else if (formData.energyRating && ['F', 'G', 'H'].includes(formData.energyRating)) {
        drivers.push({ 
          icon: "⚡", 
          label: `Energie ${formData.energyRating}`, 
          impact: `-${(8 - ['F', 'G', 'H'].indexOf(formData.energyRating)) * 3}%`,
          positive: false
        });
      }
      
      // Return top 3 most significant
      return drivers.slice(0, 3);
    }
    if (selectedAsset === "luxusuhren") {
      return [
        { 
          icon: "👑", 
          label: "Marke", 
          impact: formData.brandTier === 1 ? "Premium" : formData.brandTier === 2 ? "Luxus" : "Standard",
          positive: formData.brandTier <= 2
        },
        { 
          icon: "💎", 
          label: "Zustand", 
          impact: formData.watchCondition === "mint" ? "+20%" : formData.watchCondition === "very_good" ? "Standard" : "-15%",
          positive: formData.watchCondition !== "fair"
        },
        { 
          icon: "📦", 
          label: "Full Set", 
          impact: formData.fullSet ? "+15%" : "-",
          positive: formData.fullSet
        }
      ];
    }
    if (selectedAsset === "fahrzeuge") {
      const age = new Date().getFullYear() - formData.vehicleYear;
      return [
        { 
          icon: "📅", 
          label: "Alter", 
          impact: age <= 3 ? "Neuwertig" : age <= 7 ? "Gut" : "Älter",
          positive: age <= 7
        },
        { 
          icon: "🛣️", 
          label: "Laufleistung", 
          impact: formData.mileageKm < 50000 ? "Niedrig" : formData.mileageKm < 150000 ? "Mittel" : "Hoch",
          positive: formData.mileageKm < 100000
        },
        { 
          icon: "✨", 
          label: "Zustand", 
          impact: formData.vehicleCondition === "excellent" ? "+10%" : formData.vehicleCondition === "good" ? "Standard" : "-15%",
          positive: formData.vehicleCondition !== "used"
        }
      ];
    }
    return [];
  };

  // Simple Valuation Calculation
  const calculateEstimate = () => {
    if (selectedAsset === "real-estate") {
      // Base price per sqm based on location tier
      let basePricePerSqm = formData.locationTier === 1 ? 8000 : formData.locationTier === 2 ? 5000 : 3000;
      
      // Property type multiplier (adjusted for realism)
      const propertyTypeMultiplier = {
        'wohnung': 1.0,
        'penthouse': 1.25, // Reduced from 1.35
        'haus': 1.20, // Increased from 1.15 (Häuser sind teurer!)
        'reihenhaus': 0.95,
        'doppelhaushaelfte': 0.92
      }[formData.propertyType] || 1.0;
      
      basePricePerSqm *= propertyTypeMultiplier;
      
      // Condition multiplier (adjusted)
      const conditionMultiplier = {
        'new': 1.20, // Reduced from 1.25
        'saniert': 1.12, // Reduced from 1.15
        'renovated': 1.0,
        'needs_renovation': 0.78 // Increased from 0.75 (nicht SO schlimm)
      }[formData.condition] || 1.0;
      
      // Age factor (based on build year) - IMPROVED
      const currentYear = new Date().getFullYear();
      const age = currentYear - formData.buildYear;
      let ageFactor = 1.0;
      
      if (formData.condition !== 'new' && formData.condition !== 'saniert') {
        // Special handling for Altbau (pre-1945) - can be premium!
        if (formData.buildYear <= 1945 && formData.buildYear >= 1870) {
          // Classic Altbau: if renovated, NO penalty (Stuck, hohe Decken = wertvoll!)
          if (formData.condition === 'renovated') {
            ageFactor = 1.0; // No depreciation for renovated Altbau
          } else {
            ageFactor = 0.85; // Only if needs renovation
          }
        } else {
          // Modern buildings: depreciation curve
          // First 10 years: minimal depreciation (0.3% per year)
          // After 10 years: 0.5% per year
          // Max depreciation: -20%
          if (age <= 10) {
            ageFactor = Math.max(0.97, 1 - (age * 0.003));
          } else {
            const depreciationAfter10 = (age - 10) * 0.005;
            ageFactor = Math.max(0.8, 0.97 - depreciationAfter10);
          }
        }
      }
      
      // Floor multiplier (for Wohnung/Penthouse)
      let floorMultiplier = 1.0;
      if (formData.propertyType === 'wohnung' || formData.propertyType === 'penthouse') {
        if (formData.floor === 'EG') floorMultiplier = 0.95; // EG less desirable
        if (formData.floor === 'DG') floorMultiplier = 1.05; // Dachgeschoss premium
        if (formData.floor && parseInt(formData.floor) >= 3) floorMultiplier = 1.03; // Higher floors
      }
      
      // Ausstattung bonuses (diminishing returns to prevent stacking)
      let ausstattungBonus = 0;
      if (formData.hasBalcony) ausstattungBonus += 0.05; // +5% (reduziert von 7%)
      if (formData.hasGarage) ausstattungBonus += 0.04; // +4% (reduziert von 5%)
      if (formData.hasKitchen) ausstattungBonus += 0.02; // +2% (reduziert von 3%)
      if (formData.hasElevator && (formData.propertyType === 'wohnung' || formData.propertyType === 'penthouse')) {
        ausstattungBonus += 0.03; // +3% (reduziert von 5%)
      }
      if (formData.hasGarden && formData.propertyType !== 'wohnung') {
        ausstattungBonus += 0.08; // +8% for houses with garden (reduziert von 10%)
      }
      if (formData.hasCellar) ausstattungBonus += 0.02; // +2% (reduziert von 3%)
      
      // Cap total bonus at 15% to prevent unrealistic stacking
      ausstattungBonus = Math.min(ausstattungBonus, 0.15);
      const ausstattungMultiplier = 1 + ausstattungBonus;
      
      // Energy efficiency factor
      let energyMultiplier = 1.0;
      if (formData.energyRating) {
        const energyFactors: Record<string, number> = {
          'A+': 1.08, 'A': 1.05, 'B': 1.02, 'C': 1.0,
          'D': 0.98, 'E': 0.95, 'F': 0.92, 'G': 0.88, 'H': 0.85
        };
        energyMultiplier = energyFactors[formData.energyRating] || 1.0;
      }
      
      // Calculate final estimate
      const estimate = formData.areaSqm * basePricePerSqm * conditionMultiplier * ageFactor * floorMultiplier * ausstattungMultiplier * energyMultiplier;
      const min = Math.round(estimate * 0.9);
      const max = Math.round(estimate * 1.1);
      return { min, max, estimate: Math.round(estimate) };
    }
    
    if (selectedAsset === "luxusuhren") {
      // REALISTIC WATCH VALUATION
      // Base price from brand tier (fallback if brand not specified)
      let basePrice = formData.brandTier === 1 ? 80000 : formData.brandTier === 2 ? 35000 : 15000;
      
      // Condition multiplier (watches are VERY condition-sensitive!)
      const conditionMultiplier = {
        'mint': 1.20,        // Unworn = premium
        'very_good': 1.0,    // Normal baseline
        'good': 0.82,        // Visible wear
        'fair': 0.65         // Heavy wear
      }[formData.watchCondition] || 1.0;
      
      // Age factor (watches can appreciate OR depreciate)
      const currentYear = new Date().getFullYear();
      const age = currentYear - formData.watchYear;
      let ageFactor = 1.0;
      
      if (age <= 3) {
        ageFactor = 0.95; // New watches depreciate initially (wie Autos!)
      } else if (age <= 10) {
        ageFactor = 1.0; // Sweet spot: modern + established
      } else if (age <= 25) {
        ageFactor = 1.05; // Vintage premium starts
      } else {
        ageFactor = 1.15; // Classic/vintage watches = more valuable
      }
      
      // Box & Papers (separate, realistic impact)
      let boxPapersBonus = 1.0;
      if (formData.hasBox && formData.hasPapers) {
        boxPapersBonus = 1.22; // Full set: +22% (box 8% + papers 12% + synergy 2%)
      } else if (formData.hasPapers) {
        boxPapersBonus = 1.12; // Papers alone: +12% (wichtiger als Box!)
      } else if (formData.hasBox) {
        boxPapersBonus = 1.08; // Box alone: +8%
      }
      
      // Service history (shows care)
      const serviceBonus = formData.hasServiceHistory ? 1.05 : 1.0;
      
      // Limited edition (BIG value driver for watches!)
      let limitedEditionBonus = 1.0;
      if (formData.isLimitedEdition) {
        // Limited editions can be 15-30% more, depending on age
        limitedEditionBonus = age > 10 ? 1.30 : 1.18; // Older limited = more rare
      }
      
      // Unpolished (collectors love originality)
      const unpolishedBonus = formData.isUnpolished ? 1.05 : 1.0;
      
      // Calculate final estimate
      const estimate = basePrice * 
                      conditionMultiplier * 
                      ageFactor * 
                      boxPapersBonus * 
                      serviceBonus * 
                      limitedEditionBonus * 
                      unpolishedBonus;
      
      // Range is wider for watches (volatile market)
      const min = Math.round(estimate * 0.80); // -20%
      const max = Math.round(estimate * 1.25); // +25%
      
      return { min, max, estimate: Math.round(estimate) };
    }
    
    if (selectedAsset === "fahrzeuge") {
      // REALISTIC VEHICLE VALUATION
      // Base price from brand tier (fallback)
      let basePrice = formData.brandTier === 1 ? 250000 : formData.brandTier === 2 ? 95000 : 45000;
      
      // Age-based depreciation (realistic curve)
      const currentYear = new Date().getFullYear();
      const age = currentYear - formData.vehicleYear;
      let ageFactor = 1.0;
      
      if (age <= 1) {
        ageFactor = 0.85; // First year: -15% (Neuwagen-Verlust!)
      } else if (age <= 3) {
        ageFactor = 0.75; // Years 2-3: further -10%
      } else if (age <= 5) {
        ageFactor = 0.65; // Years 4-5: -10%
      } else if (age <= 10) {
        ageFactor = Math.max(0.45, 0.65 - ((age - 5) * 0.04)); // -4% per year
      } else {
        // After 10 years: slower depreciation (floor at 30%)
        ageFactor = Math.max(0.30, 0.45 - ((age - 10) * 0.02)); // -2% per year
      }
      
      // Mileage factor (realistic for luxury/sports cars)
      const expectedMileage = age * 15000; // 15k km/year average
      let mileageFactor = 1.0;
      
      if (formData.mileageKm < expectedMileage * 0.5) {
        mileageFactor = 1.05; // Very low mileage = bonus!
      } else if (formData.mileageKm < expectedMileage) {
        mileageFactor = 1.0; // Below average = neutral
      } else if (formData.mileageKm < expectedMileage * 1.5) {
        mileageFactor = 0.95; // Slightly above average
      } else if (formData.mileageKm < expectedMileage * 2) {
        mileageFactor = 0.85; // High mileage
      } else {
        mileageFactor = 0.70; // Very high mileage = significant penalty
      }
      
      // Condition multiplier
      const conditionMultiplier = {
        'excellent': 1.12,  // Showroom condition
        'good': 1.0,        // Well maintained
        'used': 0.88        // Average wear
      }[formData.vehicleCondition] || 1.0;
      
      // Vehicle type multiplier (some types hold value better)
      const vehicleTypeMultiplier = {
        'sportwagen': 1.08,   // Sports cars = collectible
        'coupe': 1.02,        // Coupés popular
        'cabrio': 1.05,       // Convertibles premium
        'suv': 1.0,           // SUVs standard
        'limousine': 0.98,    // Sedans depreciate more
        'kombi': 0.95         // Wagons least popular
      }[formData.vehicleType] || 1.0;
      
      // Previous owners (fewer = better)
      let ownerPenalty = 1.0;
      if (formData.previousOwners === 0) {
        ownerPenalty = 1.08; // Brand new / first owner = premium!
      } else if (formData.previousOwners === 1) {
        ownerPenalty = 1.03; // One owner = good
      } else if (formData.previousOwners <= 3) {
        ownerPenalty = 1.0; // 2-3 owners = normal
      } else {
        ownerPenalty = 0.92; // Many owners = red flag
      }
      
      // Accident-free (CRITICAL for value!)
      const accidentMultiplier = formData.isAccidentFree ? 1.10 : 0.82; // +10% or -18%!
      
      // Service book (shows maintenance)
      const serviceBookBonus = formData.hasServiceBook ? 1.08 : 1.0;
      
      // Warranty (adds security)
      const warrantyBonus = formData.hasWarranty ? 1.05 : 1.0;
      
      // Calculate final estimate
      const estimate = basePrice * 
                      ageFactor * 
                      mileageFactor * 
                      conditionMultiplier * 
                      vehicleTypeMultiplier * 
                      ownerPenalty * 
                      accidentMultiplier * 
                      serviceBookBonus * 
                      warrantyBonus;
      
      // Range (vehicles have moderate volatility)
      const min = Math.round(estimate * 0.85); // -15%
      const max = Math.round(estimate * 1.15); // +15%
      
      return { min, max, estimate: Math.round(estimate) };
    }
    
    return { min: 400000, max: 600000, estimate: 500000 };
  };

  const valuation = calculateEstimate();
  const confidence = calculateConfidence();
  const keyDrivers = getKeyDrivers();
  
  const formatPrice = (num: number) => new Intl.NumberFormat('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0 
  }).format(num);

  const getConfidenceColor = (score: number) => {
    if (score >= 75) return { bg: "#10b981", text: "Hoch", emoji: "🟢" };
    if (score >= 65) return { bg: "#f59e0b", text: "Mittel", emoji: "🟡" };
    return { bg: "#f97316", text: "Moderat", emoji: "🟠" };
  };

  const confidenceInfo = getConfidenceColor(confidence);

  // Load saved data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setCurrentStep(data.currentStep || 1);
        setSelectedAsset(data.selectedAsset || null);
        setFormData(prev => ({ ...prev, ...data.formData }));
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
  }, []);

  // Auto-save to localStorage on every change
  useEffect(() => {
    try {
      const dataToSave = {
        currentStep,
        selectedAsset,
        formData,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }, [currentStep, selectedAsset, formData]);

  // Fetch comparables when reaching Step 4
  useEffect(() => {
    if (currentStep === 4 && selectedAsset) {
      const fetchComparables = async () => {
        setLoadingComps(true);
        try {
          const estimate = valuation.estimate;
          const response = await fetch(
            `/api/comparables?assetType=${selectedAsset}&estimate=${estimate}&limit=5`
          );
          const result = await response.json();
          
          if (result.success) {
            setComparables(result.data.comparables);
            setDistribution(result.data.distribution);
          }
        } catch (error) {
          console.error('Failed to fetch comparables:', error);
        } finally {
          setLoadingComps(false);
        }
      };
      
      fetchComparables();
    }
  }, [currentStep, selectedAsset, valuation.estimate]);

  return (
    <div style={{ padding: "0", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header - Same as Startseite/Entdecken */}
      <Header />


      <div style={{ padding: "80px 40px" }}>
        {/* Progress Stepper */}
        <ProgressStepper 
          steps={WIZARD_STEPS} 
          currentStep={currentStep} 
        />

      <h1 style={{ 
        fontFamily: "'Playfair Display', serif", 
        color: "#102231",
        fontSize: "2.5rem",
        marginBottom: "1rem",
        marginTop: "3rem"
      }}>
        {currentStep === 1 && "Asset-Typ auswählen"}
        {currentStep === 2 && "Basis-Daten eingeben"}
        {currentStep === 3 && "Details angeben"}
        {currentStep === 4 && "Bewertung"}
      </h1>
      
      <p style={{ 
        fontFamily: "'Montserrat', sans-serif",
        color: "#718096",
        marginBottom: "3rem"
      }}>
        {currentStep === 1 && "Wählen Sie den Asset-Typ für Ihre Bewertung"}
        {currentStep === 2 && "Grundlegende Informationen zu Ihrem Asset"}
        {currentStep === 3 && "Zusätzliche Details für präzise Bewertung"}
        {currentStep === 4 && "Ihre Bewertungs-Ergebnisse"}
      </p>

      {/* Step 1: Asset Selection */}
      {currentStep === 1 && (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          marginBottom: "3rem"
        }}>
          <button
            onClick={() => handleAssetSelect("real-estate")}
            className={styles.glassCard}
          style={{
            padding: "2rem",
            border: selectedAsset === "real-estate" ? "2px solid #2c5a78" : "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "16px",
            background: selectedAsset === "real-estate" 
              ? "linear-gradient(135deg, rgba(44, 90, 120, 0.08) 0%, rgba(199, 167, 112, 0.05) 100%)" 
              : "rgba(255, 255, 255, 0.7)",
            cursor: "pointer"
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏠</div>
          <h3 style={{ 
            fontFamily: "'Playfair Display', serif",
            color: "#102231",
            marginBottom: "0.5rem"
          }}>
            Immobilien
          </h3>
          <p style={{ 
            fontFamily: "'Montserrat', sans-serif",
            color: "#718096",
            fontSize: "0.9rem"
          }}>
            Wohnungen, Häuser, Gewerbe
          </p>
        </button>

        <button
          onClick={() => handleAssetSelect("luxusuhren")}
          className={styles.glassCard}
          style={{
            padding: "2rem",
            border: selectedAsset === "luxusuhren" ? "2px solid #2c5a78" : "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "16px",
            background: selectedAsset === "luxusuhren" 
              ? "linear-gradient(135deg, rgba(44, 90, 120, 0.08) 0%, rgba(199, 167, 112, 0.05) 100%)" 
              : "rgba(255, 255, 255, 0.7)",
            cursor: "pointer"
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⌚</div>
          <h3 style={{ 
            fontFamily: "'Playfair Display', serif",
            color: "#102231",
            marginBottom: "0.5rem"
          }}>
            Luxusuhren
          </h3>
          <p style={{ 
            fontFamily: "'Montserrat', sans-serif",
            color: "#718096",
            fontSize: "0.9rem"
          }}>
            Rolex, Patek Philippe, Audemars Piguet
          </p>
        </button>

        <button
          onClick={() => handleAssetSelect("fahrzeuge")}
          className={styles.glassCard}
          style={{
            padding: "2rem",
            border: selectedAsset === "fahrzeuge" ? "2px solid #2c5a78" : "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "16px",
            background: selectedAsset === "fahrzeuge" 
              ? "linear-gradient(135deg, rgba(44, 90, 120, 0.08) 0%, rgba(199, 167, 112, 0.05) 100%)" 
              : "rgba(255, 255, 255, 0.7)",
            cursor: "pointer"
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚗</div>
          <h3 style={{ 
            fontFamily: "'Playfair Display', serif",
            color: "#102231",
            marginBottom: "0.5rem"
          }}>
            Fahrzeuge
          </h3>
          <p style={{ 
            fontFamily: "'Montserrat', sans-serif",
            color: "#718096",
            fontSize: "0.9rem"
          }}>
            Sportwagen, Luxuslimousinen, SUVs
          </p>
        </button>
      </div>
      )}

      {/* Step 2: Real Estate - Professional Form */}
      {currentStep === 2 && selectedAsset === "real-estate" && (
        <div className={`${styles.glassCard} ${styles.slideInUp}`} style={{
          padding: "2rem",
          borderRadius: "16px"
        }}>
          {/* Natural Language Input */}
          <NaturalLanguageInput
            assetType="immobilien"
            onParsed={handleParsedData}
          />

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem"
          }}>
            {/* Address/Location with Auto-Detection */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                📍 Standort der Immobilie
                <span 
                  title="Geben Sie Stadt und Stadtteil ein. Wir erkennen automatisch die Lagequalität basierend auf Marktdaten."
                  style={{ 
                    cursor: "help",
                    background: "#2c5a78",
                    color: "white",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700
                  }}
                >
                  ?
                </span>
              </label>
              <input
                type="text"
                value={formData.locationAddress}
                onChange={(e) => handleInputChange("locationAddress", e.target.value)}
                placeholder="Stadt, Stadtteil – z.B. München, Schwabing oder 80333 München"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: formData.locationAddress.length > 0 ? "2px solid #2c5a78" : "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem",
                  transition: "border 0.3s ease"
                }}
              />
              {/* Auto-Detection Result */}
              {formData.locationAddress && formData.locationAddress.length >= 3 && (
                <div style={{ marginTop: "0.75rem" }}>
                  {/* Recognized Location Badge */}
                  {(formData.locationAddress.toLowerCase().includes('münchen') ||
                    formData.locationAddress.toLowerCase().includes('hamburg') ||
                    formData.locationAddress.toLowerCase().includes('berlin') ||
                    formData.locationAddress.toLowerCase().includes('frankfurt') ||
                    formData.locationAddress.toLowerCase().includes('stuttgart') ||
                    formData.locationAddress.toLowerCase().includes('düsseldorf') ||
                    formData.locationAddress.toLowerCase().includes('köln') ||
                    formData.locationAddress.toLowerCase().includes('leipzig') ||
                    formData.locationAddress.toLowerCase().includes('dresden') ||
                    formData.locationAddress.toLowerCase().includes('starnberg') ||
                    formData.locationAddress.toLowerCase().includes('grünwald')) ? (
                    <div style={{ 
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      background: formData.locationTier === 1 
                        ? "rgba(199, 167, 112, 0.1)" 
                        : formData.locationTier === 2 
                        ? "rgba(44, 90, 120, 0.1)"
                        : "rgba(113, 128, 150, 0.1)",
                      border: `1px solid ${formData.locationTier === 1 ? '#c7a770' : formData.locationTier === 2 ? '#2c5a78' : '#718096'}`,
                      borderRadius: "8px"
                    }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "0.4rem 0.8rem",
                        background: formData.locationTier === 1 
                          ? "linear-gradient(135deg, #c7a770, #d4b896)" 
                          : formData.locationTier === 2 
                          ? "linear-gradient(135deg, #2c5a78, #4a90a4)"
                          : "linear-gradient(135deg, #718096, #94a3b8)",
                        color: "white",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                      }}>
                        ✓ {formData.locationLabel}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "0.85rem",
                          color: "#102231",
                          fontWeight: 600
                        }}>
                          Standort erkannt
                        </div>
                        <div style={{ 
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "0.75rem",
                          color: "#718096",
                          marginTop: "0.125rem"
                        }}>
                          Bewertung basiert auf Marktdaten für diese Region
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Unknown Location Warning
                    <div style={{ 
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      background: "rgba(245, 158, 11, 0.1)",
                      border: "1px solid #f59e0b",
                      borderRadius: "8px"
                    }}>
                      <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>⚠️</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "0.85rem",
                          color: "#92400e",
                          fontWeight: 600
                        }}>
                          Standort nicht in unserer Datenbank
                        </div>
                        <div style={{ 
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "0.75rem",
                          color: "#78350f",
                          marginTop: "0.25rem"
                        }}>
                          Bewertung basiert auf Durchschnittswerten. Für präzisere Ergebnisse geben Sie eine Stadt aus München, Hamburg, Berlin, Frankfurt, Stuttgart, Düsseldorf, Köln, Leipzig oder Dresden ein.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Format Help */}
              {(!formData.locationAddress || formData.locationAddress.length < 3) && (
                <div style={{ 
                  color: "#9ca3af", 
                  fontSize: "0.85rem", 
                  marginTop: "0.5rem",
                  fontFamily: "'Montserrat', sans-serif",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem"
                }}>
                  <span>💡</span>
                  <div>
                    <strong>Beispiele:</strong> München, Schwabing · Hamburg, Blankenese · Berlin, Mitte · 80333 München
                  </div>
                </div>
              )}
            </div>

            {/* Property Type */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                🏠 Immobilientyp
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => handleInputChange("propertyType", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                <option value="wohnung">🏢 Wohnung</option>
                <option value="haus">🏠 Einfamilienhaus</option>
                <option value="penthouse">🌟 Penthouse</option>
                <option value="reihenhaus">🏘️ Reihenhaus</option>
                <option value="doppelhaushaelfte">🏡 Doppelhaushälfte</option>
              </select>
            </div>

            {/* Area */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                📐 Wohnfläche (m²)
              </label>
              <input
                type="number"
                value={formData.areaSqm}
                onChange={(e) => handleInputChange("areaSqm", Number(e.target.value))}
                min="20"
                max="1000"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: validationErrors.areaSqm ? "2px solid #f59e0b" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem"
                }}
              />
              {validationErrors.areaSqm ? (
                <div style={{ color: "#f59e0b", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  {validationErrors.areaSqm}
                </div>
              ) : (
                <div style={{ color: "#9ca3af", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  💡 Typisch: 80-150 m²
                </div>
              )}
            </div>

            {/* Rooms */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                🚪 Anzahl Zimmer
              </label>
              <input
                type="number"
                value={formData.rooms}
                onChange={(e) => handleInputChange("rooms", Number(e.target.value))}
                min="1"
                max="20"
                step="0.5"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem"
                }}
              />
            </div>

            {/* Build Year - ESSENTIAL! */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                📅 Baujahr
                <span 
                  title="Jahr der Fertigstellung bzw. Erstbezug. Wichtig für die Wertberechnung!"
                  style={{ 
                    cursor: "help",
                    background: "#2c5a78",
                    color: "white",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700
                  }}
                >
                  ?
                </span>
              </label>
              <input
                type="number"
                value={formData.buildYear}
                onChange={(e) => handleInputChange("buildYear", Number(e.target.value))}
                min="1800"
                max={new Date().getFullYear() + 2}
                placeholder="z.B. 1995"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: validationErrors.buildYear ? "2px solid #f59e0b" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem"
                }}
              />
              {validationErrors.buildYear ? (
                <div style={{ color: "#f59e0b", fontSize: "0.85rem", marginTop: "0.25rem", fontFamily: "'Montserrat', sans-serif" }}>
                  {validationErrors.buildYear}
                </div>
              ) : formData.buildYear && formData.buildYear > 0 ? (
                <div style={{ 
                  color: "#2c5a78", 
                  fontSize: "0.85rem", 
                  marginTop: "0.25rem",
                  fontFamily: "'Montserrat', sans-serif"
                }}>
                  ✓ {new Date().getFullYear() - formData.buildYear} Jahre alt {
                    formData.buildYear >= new Date().getFullYear() - 5 ? '(Sehr jung)' :
                    formData.buildYear >= new Date().getFullYear() - 15 ? '(Modern)' :
                    formData.buildYear >= new Date().getFullYear() - 30 ? '(Standard)' : '(Altbau)'
                  }
                </div>
              ) : (
                <div style={{ 
                  color: "#9ca3af", 
                  fontSize: "0.85rem", 
                  marginTop: "0.25rem",
                  fontFamily: "'Montserrat', sans-serif"
                }}>
                  💡 Steht im Grundbuch oder Kaufvertrag
                </div>
              )}
            </div>

            {/* Floor - Only for Wohnung/Penthouse */}
            {(formData.propertyType === "wohnung" || formData.propertyType === "penthouse") && (
              <div>
                <label style={{ 
                  display: "block",
                  fontFamily: "'Montserrat', sans-serif",
                  color: "#102231",
                  fontWeight: 600,
                  marginBottom: "0.5rem"
                }}>
                  🏢 Etage
                </label>
                <select
                  value={formData.floor}
                  onChange={(e) => handleInputChange("floor", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "1rem",
                    cursor: "pointer"
                  }}
                >
                  <option value="">Bitte wählen</option>
                  <option value="EG">Erdgeschoss</option>
                  <option value="1">1. OG</option>
                  <option value="2">2. OG</option>
                  <option value="3">3. OG</option>
                  <option value="4">4. OG</option>
                  <option value="5+">5. OG oder höher</option>
                  <option value="DG">Dachgeschoss</option>
                </select>
              </div>
            )}

            {/* Condition */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                🎨 Zustand
              </label>
              <select
                value={formData.condition}
                onChange={(e) => handleInputChange("condition", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                <option value="new">✨ Neubau/Erstbezug</option>
                <option value="saniert">🏗️ Vollsaniert</option>
                <option value="renovated">🔧 Renoviert</option>
                <option value="needs_renovation">⚠️ Renovierungsbedürftig</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Watches - PREMIUM VERSION */}
      {currentStep === 2 && selectedAsset === "luxusuhren" && (
        <div className={`${styles.glassCard} ${styles.slideInUp}`} style={{
          padding: "2rem",
          borderRadius: "16px"
        }}>
          {/* Natural Language Input */}
          <NaturalLanguageInput
            assetType="luxusuhren"
            onParsed={handleParsedData}
          />

          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.5rem",
            color: "#102231",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            ⌚ Luxusuhr bewerten
          </h3>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem"
          }}>
            {/* Marke */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                👑 Marke *
              </label>
              <input
                type="text"
                value={formData.watchBrand}
                onChange={(e) => handleInputChange("watchBrand", e.target.value)}
                placeholder="z.B. Rolex, Patek Philippe, Audemars Piguet"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem"
                }}
              />
              <div style={{ 
                color: "#9ca3af", 
                fontSize: "0.85rem", 
                marginTop: "0.25rem",
                fontFamily: "'Montserrat', sans-serif"
              }}>
                💡 Wichtig für präzise Bewertung
              </div>
            </div>

            {/* Modell */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                ⭐ Modell *
              </label>
              <input
                type="text"
                value={formData.watchModel}
                onChange={(e) => handleInputChange("watchModel", e.target.value)}
                placeholder="z.B. Submariner, Nautilus, Royal Oak"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem"
                }}
              />
              <div style={{ 
                color: "#9ca3af", 
                fontSize: "0.85rem", 
                marginTop: "0.25rem",
                fontFamily: "'Montserrat', sans-serif"
              }}>
                💡 z.B. "Daytona", "Speedmaster", "Big Pilot"
              </div>
            </div>

            {/* Referenznummer */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                🔢 Referenznummer (optional)
              </label>
              <input
                type="text"
                value={formData.watchReference}
                onChange={(e) => handleInputChange("watchReference", e.target.value)}
                placeholder="z.B. 116610LN, 5711/1A, 15400ST"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem"
                }}
              />
              <div style={{ 
                color: "#9ca3af", 
                fontSize: "0.85rem", 
                marginTop: "0.25rem",
                fontFamily: "'Montserrat', sans-serif"
              }}>
                💡 Steht auf Papieren oder Gehäuseboden
              </div>
            </div>

            {/* Baujahr */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                📅 Herstellungsjahr *
              </label>
              <input
                type="number"
                value={formData.watchYear}
                onChange={(e) => handleInputChange("watchYear", Number(e.target.value))}
                min="1950"
                max={new Date().getFullYear()}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem"
                }}
              />
              <div style={{ 
                color: "#2c5a78", 
                fontSize: "0.85rem", 
                marginTop: "0.25rem",
                fontFamily: "'Montserrat', sans-serif"
              }}>
                ✓ {new Date().getFullYear() - formData.watchYear} Jahre alt {
                  formData.watchYear >= new Date().getFullYear() - 3 ? '(Sehr jung)' :
                  formData.watchYear >= new Date().getFullYear() - 10 ? '(Modern)' : '(Klassiker)'
                }
              </div>
            </div>

            {/* Zustand */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                ✨ Zustand *
              </label>
              <select
                value={formData.watchCondition}
                onChange={(e) => handleInputChange("watchCondition", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                <option value="mint">💎 Mint/Ungetragen (wie neu)</option>
                <option value="very_good">⭐ Sehr gut (kaum Gebrauchsspuren)</option>
                <option value="good">✓ Gut (normale Gebrauchsspuren)</option>
                <option value="fair">○ Gebraucht (sichtbare Spuren)</option>
              </select>
            </div>

            {/* Standort */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                📍 Standort
              </label>
              <input
                type="text"
                value={formData.watchLocation}
                onChange={(e) => handleInputChange("watchLocation", e.target.value)}
                placeholder="z.B. München, Hamburg, Berlin"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem"
                }}
              />
            </div>

            {/* Separator */}
            <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #e5e7eb", margin: "1rem 0" }}></div>

            {/* Box & Papers - SEPARAT */}
            <div style={{ gridColumn: "1 / -1" }}>
              <h4 style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "1.1rem",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "1rem"
              }}>
                📦 Lieferumfang & Zubehör
              </h4>
              
              <div style={{ 
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem"
              }}>
                {/* Box */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.75rem",
                  padding: "1rem",
                  background: formData.hasBox ? "rgba(44, 90, 120, 0.05)" : "transparent",
                  border: formData.hasBox ? "1px solid rgba(44, 90, 120, 0.2)" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  transition: "all 0.3s ease"
                }}>
                  <input
                    type="checkbox"
                    id="hasBox"
                    checked={formData.hasBox}
                    onChange={(e) => handleInputChange("hasBox", e.target.checked)}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: "#2c5a78"
                    }}
                  />
                  <label 
                    htmlFor="hasBox"
                    style={{ 
                      fontFamily: "'Montserrat', sans-serif",
                      color: "#102231",
                      fontWeight: 500,
                      cursor: "pointer",
                      flex: 1
                    }}
                  >
                    📦 Originalbox vorhanden
                    <div style={{ fontSize: "0.85rem", color: "#718096", marginTop: "0.25rem" }}>
                      +8% Wertsteigerung
                    </div>
                  </label>
                </div>

                {/* Papers */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.75rem",
                  padding: "1rem",
                  background: formData.hasPapers ? "rgba(44, 90, 120, 0.05)" : "transparent",
                  border: formData.hasPapers ? "1px solid rgba(44, 90, 120, 0.2)" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  transition: "all 0.3s ease"
                }}> 
                  <input
                    type="checkbox"
                    id="hasPapers"
                    checked={formData.hasPapers}
                    onChange={(e) => handleInputChange("hasPapers", e.target.checked)}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: "#2c5a78"
                    }}
                  />
                  <label 
                    htmlFor="hasPapers"
                    style={{ 
                      fontFamily: "'Montserrat', sans-serif",
                      color: "#102231",
                      fontWeight: 500,
                      cursor: "pointer",
                      flex: 1
                    }}
                  >
                    📄 Papiere/Zertifikat vorhanden
                    <div style={{ fontSize: "0.85rem", color: "#718096", marginTop: "0.25rem" }}>
                      +12% Wertsteigerung
                    </div>
                  </label>
                </div>

                {/* Service History */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.75rem",
                  padding: "1rem",
                  background: formData.hasServiceHistory ? "rgba(44, 90, 120, 0.05)" : "transparent",
                  border: formData.hasServiceHistory ? "1px solid rgba(44, 90, 120, 0.2)" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  transition: "all 0.3s ease"
                }}>
                  <input
                    type="checkbox"
                    id="hasServiceHistory"
                    checked={formData.hasServiceHistory}
                    onChange={(e) => handleInputChange("hasServiceHistory", e.target.checked)}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: "#2c5a78"
                    }}
                  />
                  <label 
                    htmlFor="hasServiceHistory"
                    style={{ 
                      fontFamily: "'Montserrat', sans-serif",
                      color: "#102231",
                      fontWeight: 500,
                      cursor: "pointer",
                      flex: 1
                    }}
                  >
                    🔧 Service-Historie vorhanden
                    <div style={{ fontSize: "0.85rem", color: "#718096", marginTop: "0.25rem" }}>
                      +5% Wertsteigerung
                    </div>
                  </label>
                </div>

                {/* Limited Edition */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.75rem",
                  padding: "1rem",
                  background: formData.isLimitedEdition ? "rgba(199, 167, 112, 0.1)" : "transparent",
                  border: formData.isLimitedEdition ? "1px solid rgba(199, 167, 112, 0.3)" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  transition: "all 0.3s ease"
                }}>
                  <input
                    type="checkbox"
                    id="isLimitedEdition"
                    checked={formData.isLimitedEdition}
                    onChange={(e) => handleInputChange("isLimitedEdition", e.target.checked)}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: "#c7a770"
                    }}
                  />
                  <label 
                    htmlFor="isLimitedEdition"
                    style={{ 
                      fontFamily: "'Montserrat', sans-serif",
                      color: "#102231",
                      fontWeight: 500,
                      cursor: "pointer",
                      flex: 1
                    }}
                  >
                    💎 Limitierte Edition
                    <div style={{ fontSize: "0.85rem", color: "#c7a770", marginTop: "0.25rem" }}>
                      +15-30% Wertsteigerung
                    </div>
                  </label>
                </div>

                {/* Unpolished */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.75rem",
                  padding: "1rem",
                  background: formData.isUnpolished ? "rgba(44, 90, 120, 0.05)" : "transparent",
                  border: formData.isUnpolished ? "1px solid rgba(44, 90, 120, 0.2)" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  transition: "all 0.3s ease"
                }}>
                  <input
                    type="checkbox"
                    id="isUnpolished"
                    checked={formData.isUnpolished}
                    onChange={(e) => handleInputChange("isUnpolished", e.target.checked)}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: "#2c5a78"
                    }}
                  />
                  <label 
                    htmlFor="isUnpolished"
                    style={{ 
                      fontFamily: "'Montserrat', sans-serif",
                      color: "#102231",
                      fontWeight: 500,
                      cursor: "pointer",
                      flex: 1
                    }}
                  >
                    ✨ Original/Unpoliert
                    <div style={{ fontSize: "0.85rem", color: "#718096", marginTop: "0.25rem" }}>
                      +5% Sammler-Bonus
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Vehicles - PREMIUM VERSION */}
      {currentStep === 2 && selectedAsset === "fahrzeuge" && (
        <div className={`${styles.glassCard} ${styles.slideInUp}`} style={{
          padding: "2rem",
          borderRadius: "16px"
        }}>
          {/* Natural Language Input */}
          <NaturalLanguageInput
            assetType="fahrzeuge"
            onParsed={handleParsedData}
          />

          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.5rem",
            color: "#102231",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            🚗 Fahrzeug bewerten
          </h3>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem"
          }}>
            {/* Marke */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                🏎️ Marke *
              </label>
              <input
                type="text"
                value={formData.vehicleBrand}
                onChange={(e) => handleInputChange("vehicleBrand", e.target.value)}
                placeholder="z.B. Porsche, Ferrari, Mercedes"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem"
                }}
              />
              <div style={{ 
                color: "#9ca3af", 
                fontSize: "0.85rem", 
                marginTop: "0.25rem",
                fontFamily: "'Montserrat', sans-serif"
              }}>
                💡 Wichtig für genaue Bewertung
              </div>
            </div>

            {/* Modell */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                ⭐ Modell *
              </label>
              <input
                type="text"
                value={formData.vehicleModel}
                onChange={(e) => handleInputChange("vehicleModel", e.target.value)}
                placeholder="z.B. 911 Turbo S, F8 Tributo, S-Klasse"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem"
                }}
              />
              <div style={{ 
                color: "#9ca3af", 
                fontSize: "0.85rem", 
                marginTop: "0.25rem",
                fontFamily: "'Montserrat', sans-serif"
              }}>
                💡 z.B. "GT3", "Huracán", "AMG GT"
              </div>
            </div>

            {/* Fahrzeugtyp */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                🚙 Fahrzeugtyp *
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => handleInputChange("vehicleType", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                <option value="sportwagen">🏎️ Sportwagen</option>
                <option value="coupe">🚗 Coupé</option>
                <option value="cabrio">🌞 Cabrio</option>
                <option value="suv">🚙 SUV</option>
                <option value="limousine">🚘 Limousine</option>
                <option value="kombi">🚐 Kombi</option>
              </select>
            </div>

            {/* Baujahr */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                📅 Baujahr *
              </label>
              <input
                type="number"
                value={formData.vehicleYear}
                onChange={(e) => handleInputChange("vehicleYear", Number(e.target.value))}
                min="1950"
                max={new Date().getFullYear() + 1}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: validationErrors.vehicleYear ? "2px solid #f59e0b" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem"
                }}
              />
              {validationErrors.vehicleYear ? (
                <div style={{ 
                  color: "#f59e0b", 
                  fontSize: "0.85rem", 
                  marginTop: "0.25rem",
                  fontFamily: "'Montserrat', sans-serif"
                }}>
                  {validationErrors.vehicleYear}
                </div>
              ) : (
                <div style={{ 
                  color: "#2c5a78", 
                  fontSize: "0.85rem", 
                  marginTop: "0.25rem",
                  fontFamily: "'Montserrat', sans-serif"
                }}>
                  ✓ {new Date().getFullYear() - formData.vehicleYear} Jahre alt {
                    formData.vehicleYear >= new Date().getFullYear() - 2 ? '(Neuwertig)' :
                    formData.vehicleYear >= new Date().getFullYear() - 5 ? '(Jung)' : '(Standard)'
                  }
                </div>
              )}
            </div>

            {/* Erstzulassung */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                📋 Erstzulassung (MM/YYYY)
              </label>
              <input
                type="text"
                value={formData.firstRegistration}
                onChange={(e) => handleInputChange("firstRegistration", e.target.value)}
                placeholder="z.B. 03/2022"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem"
                }}
              />
              <div style={{ 
                color: "#9ca3af", 
                fontSize: "0.85rem", 
                marginTop: "0.25rem",
                fontFamily: "'Montserrat', sans-serif"
              }}>
                💡 Steht im Fahrzeugschein (Teil I)
              </div>
            </div>

            {/* Kilometerstand */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                📍 Kilometerstand (km) *
              </label>
              <input
                type="number"
                value={formData.mileageKm}
                onChange={(e) => handleInputChange("mileageKm", Number(e.target.value))}
                min="0"
                max="500000"
                step="1000"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: validationErrors.mileageKm ? "2px solid #f59e0b" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem"
                }}
              />
              {validationErrors.mileageKm ? (
                <div style={{ 
                  color: "#f59e0b", 
                  fontSize: "0.85rem", 
                  marginTop: "0.25rem",
                  fontFamily: "'Montserrat', sans-serif"
                }}>
                  {validationErrors.mileageKm}
                </div>
              ) : (
                <div style={{ 
                  color: "#2c5a78", 
                  fontSize: "0.85rem", 
                  marginTop: "0.25rem",
                  fontFamily: "'Montserrat', sans-serif"
                }}>
                  ✓ Ø {formatNumber(Math.round((new Date().getFullYear() - formData.vehicleYear) * 15000))} km für {new Date().getFullYear() - formData.vehicleYear} Jahre
                </div>
              )}
            </div>

            {/* Vorbesitzer */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                👥 Anzahl Vorbesitzer *
              </label>
              <input
                type="number"
                value={formData.previousOwners}
                onChange={(e) => handleInputChange("previousOwners", Number(e.target.value))}
                min="0"
                max="20"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem"
                }}
              />
              <div style={{ 
                color: "#2c5a78", 
                fontSize: "0.85rem", 
                marginTop: "0.25rem",
                fontFamily: "'Montserrat', sans-serif"
              }}>
                {formData.previousOwners === 0 ? '🏆 Werksneuzustand' :
                 formData.previousOwners === 1 ? '✓ Erstbesitz' :
                 formData.previousOwners <= 3 ? '○ Wenig Besitzer' : '⚠️ Viele Besitzer'}
              </div>
            </div>

            {/* Farbe */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                🎨 Farbe
              </label>
              <input
                type="text"
                value={formData.vehicleColor}
                onChange={(e) => handleInputChange("vehicleColor", e.target.value)}
                placeholder="z.B. Racing Yellow, Nardo Grey, Miami Blue"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem"
                }}
              />
              <div style={{ 
                color: "#9ca3af", 
                fontSize: "0.85rem", 
                marginTop: "0.25rem",
                fontFamily: "'Montserrat', sans-serif"
              }}>
                💡 Seltene Farben können Wert steigern
              </div>
            </div>

            {/* Zustand */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                ✨ Zustand *
              </label>
              <select
                value={formData.vehicleCondition}
                onChange={(e) => handleInputChange("vehicleCondition", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                <option value="excellent">💎 Exzellent/Neuwertig</option>
                <option value="good">⭐ Gut gepflegt</option>
                <option value="used">○ Gebraucht</option>
              </select>
            </div>

            {/* Standort */}
            <div>
              <label style={{ 
                display: "block",
                fontFamily: "'Montserrat', sans-serif",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "0.5rem"
              }}>
                📍 Standort
              </label>
              <input
                type="text"
                value={formData.vehicleLocation}
                onChange={(e) => handleInputChange("vehicleLocation", e.target.value)}
                placeholder="z.B. München, Stuttgart, Frankfurt"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "1rem"
                }}
              />
            </div>

            {/* Separator */}
            <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #e5e7eb", margin: "1rem 0" }}></div>

            {/* Service & Historie */}
            <div style={{ gridColumn: "1 / -1" }}>
              <h4 style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "1.1rem",
                color: "#102231",
                fontWeight: 600,
                marginBottom: "1rem"
              }}>
                📋 Service & Historie
              </h4>
              
              <div style={{ 
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem"
              }}>
                {/* Unfallfrei */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.75rem",
                  padding: "1rem",
                  background: formData.isAccidentFree ? "rgba(22, 163, 74, 0.05)" : "rgba(220, 38, 38, 0.05)",
                  border: formData.isAccidentFree ? "1px solid rgba(22, 163, 74, 0.2)" : "1px solid rgba(220, 38, 38, 0.2)",
                  borderRadius: "8px",
                  transition: "all 0.3s ease"
                }}>
                  <input
                    type="checkbox"
                    id="isAccidentFree"
                    checked={formData.isAccidentFree}
                    onChange={(e) => handleInputChange("isAccidentFree", e.target.checked)}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: "#16a34a"
                    }}
                  />
                  <label 
                    htmlFor="isAccidentFree"
                    style={{ 
                      fontFamily: "'Montserrat', sans-serif",
                      color: "#102231",
                      fontWeight: 500,
                      cursor: "pointer",
                      flex: 1
                    }}
                  >
                    ✅ Unfallfrei
                    <div style={{ fontSize: "0.85rem", color: formData.isAccidentFree ? "#16a34a" : "#dc2626", marginTop: "0.25rem" }}>
                      {formData.isAccidentFree ? "+10% Wertsteigerung" : "-15% bei Unfallschaden"}
                    </div>
                  </label>
                </div>

                {/* Scheckheft */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.75rem",
                  padding: "1rem",
                  background: formData.hasServiceBook ? "rgba(44, 90, 120, 0.05)" : "transparent",
                  border: formData.hasServiceBook ? "1px solid rgba(44, 90, 120, 0.2)" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  transition: "all 0.3s ease"
                }}>
                  <input
                    type="checkbox"
                    id="hasServiceBook"
                    checked={formData.hasServiceBook}
                    onChange={(e) => handleInputChange("hasServiceBook", e.target.checked)}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: "#2c5a78"
                    }}
                  />
                  <label 
                    htmlFor="hasServiceBook"
                    style={{ 
                      fontFamily: "'Montserrat', sans-serif",
                      color: "#102231",
                      fontWeight: 500,
                      cursor: "pointer",
                      flex: 1
                    }}
                  >
                    📖 Scheckheft gepflegt
                    <div style={{ fontSize: "0.85rem", color: "#718096", marginTop: "0.25rem" }}>
                      +8% Wertsteigerung
                    </div>
                  </label>
                </div>

                {/* Garantie */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.75rem",
                  padding: "1rem",
                  background: formData.hasWarranty ? "rgba(199, 167, 112, 0.1)" : "transparent",
                  border: formData.hasWarranty ? "1px solid rgba(199, 167, 112, 0.3)" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  transition: "all 0.3s ease"
                }}>
                  <input
                    type="checkbox"
                    id="hasWarranty"
                    checked={formData.hasWarranty}
                    onChange={(e) => handleInputChange("hasWarranty", e.target.checked)}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: "#c7a770"
                    }}
                  />
                  <label 
                    htmlFor="hasWarranty"
                    style={{ 
                      fontFamily: "'Montserrat', sans-serif",
                      color: "#102231",
                      fontWeight: 500,
                      cursor: "pointer",
                      flex: 1
                    }}
                  >
                    🛡️ Garantie vorhanden
                    <div style={{ fontSize: "0.85rem", color: "#c7a770", marginTop: "0.25rem" }}>
                      +5% Wertsteigerung
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Real Estate - Ausstattung & Details */}
      {currentStep === 3 && selectedAsset === "real-estate" && (
        <div className={`${styles.glassCard} ${styles.slideInUp}`} style={{
          padding: "2rem",
          borderRadius: "16px"
        }}>
          {/* Smart Suggestions & Risk Warnings */}
          <SmartSuggestions assetType="immobilien" formData={formData} />
          <RiskWarnings assetType="immobilien" formData={formData} />

          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              color: "#102231",
              fontSize: "1.5rem",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              ✨ Ausstattung & Merkmale
              <span 
                title="Wählen Sie alle zutreffenden Ausstattungsmerkmale. Jedes Merkmal erhöht den Immobilienwert."
                style={{ 
                  cursor: "help",
                  background: "#2c5a78",
                  color: "white",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 700
                }}
              >
                ?
              </span>
            </h3>
            <p style={{
              fontFamily: "'Montserrat', sans-serif",
              color: "#718096",
              fontSize: "0.9rem",
              marginTop: "0.5rem"
            }}>
              Wählen Sie alle zutreffenden Merkmale. Die Prozent-Angaben zeigen den ungefähren Wertzuwachs.
            </p>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem"
          }}>
            {/* Balkon/Terrasse */}
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem",
              background: formData.hasBalcony ? "rgba(44, 90, 120, 0.1)" : "rgba(255, 255, 255, 0.5)",
              border: formData.hasBalcony ? "2px solid #2c5a78" : "1px solid #e5e7eb",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "'Montserrat', sans-serif"
            }}>
              <input
                type="checkbox"
                checked={formData.hasBalcony}
                onChange={(e) => handleInputChange("hasBalcony", e.target.checked)}
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer"
                }}
              />
              <div>
                <div style={{ fontWeight: 600, color: "#102231" }}>🌿 Balkon/Terrasse</div>
                <div style={{ fontSize: "0.85rem", color: "#718096" }}>+5% Wert</div>
              </div>
            </label>

            {/* Garage/Stellplatz */}
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem",
              background: formData.hasGarage ? "rgba(44, 90, 120, 0.1)" : "rgba(255, 255, 255, 0.5)",
              border: formData.hasGarage ? "2px solid #2c5a78" : "1px solid #e5e7eb",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "'Montserrat', sans-serif"
            }}>
              <input
                type="checkbox"
                checked={formData.hasGarage}
                onChange={(e) => handleInputChange("hasGarage", e.target.checked)}
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer"
                }}
              />
              <div>
                <div style={{ fontWeight: 600, color: "#102231" }}>🚗 Garage/Stellplatz</div>
                <div style={{ fontSize: "0.85rem", color: "#718096" }}>+4% Wert</div>
              </div>
            </label>

            {/* Einbauküche */}
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem",
              background: formData.hasKitchen ? "rgba(44, 90, 120, 0.1)" : "rgba(255, 255, 255, 0.5)",
              border: formData.hasKitchen ? "2px solid #2c5a78" : "1px solid #e5e7eb",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "'Montserrat', sans-serif"
            }}>
              <input
                type="checkbox"
                checked={formData.hasKitchen}
                onChange={(e) => handleInputChange("hasKitchen", e.target.checked)}
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer"
                }}
              />
              <div>
                <div style={{ fontWeight: 600, color: "#102231" }}>🍳 Einbauküche</div>
                <div style={{ fontSize: "0.85rem", color: "#718096" }}>+2% Wert</div>
              </div>
            </label>

            {/* Aufzug */}
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem",
              background: formData.hasElevator ? "rgba(44, 90, 120, 0.1)" : "rgba(255, 255, 255, 0.5)",
              border: formData.hasElevator ? "2px solid #2c5a78" : "1px solid #e5e7eb",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "'Montserrat', sans-serif"
            }}>
              <input
                type="checkbox"
                checked={formData.hasElevator}
                onChange={(e) => handleInputChange("hasElevator", e.target.checked)}
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer"
                }}
              />
              <div>
                <div style={{ fontWeight: 600, color: "#102231" }}>🛗 Aufzug</div>
                <div style={{ fontSize: "0.85rem", color: "#718096" }}>+3% Wert</div>
              </div>
            </label>

            {/* Garten */}
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem",
              background: formData.hasGarden ? "rgba(44, 90, 120, 0.1)" : "rgba(255, 255, 255, 0.5)",
              border: formData.hasGarden ? "2px solid #2c5a78" : "1px solid #e5e7eb",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "'Montserrat', sans-serif"
            }}>
              <input
                type="checkbox"
                checked={formData.hasGarden}
                onChange={(e) => handleInputChange("hasGarden", e.target.checked)}
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer"
                }}
              />
              <div>
                <div style={{ fontWeight: 600, color: "#102231" }}>🌳 Garten</div>
                <div style={{ fontSize: "0.85rem", color: "#718096" }}>+8% Wert</div>
              </div>
            </label>

            {/* Keller */}
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem",
              background: formData.hasCellar ? "rgba(44, 90, 120, 0.1)" : "rgba(255, 255, 255, 0.5)",
              border: formData.hasCellar ? "2px solid #2c5a78" : "1px solid #e5e7eb",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "'Montserrat', sans-serif"
            }}>
              <input
                type="checkbox"
                checked={formData.hasCellar}
                onChange={(e) => handleInputChange("hasCellar", e.target.checked)}
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer"
                }}
              />
              <div>
                <div style={{ fontWeight: 600, color: "#102231" }}>📦 Keller</div>
                <div style={{ fontSize: "0.85rem", color: "#718096" }}>+2% Wert</div>
              </div>
            </label>
          </div>

          {/* Energieeffizienz */}
          <div style={{ marginTop: "2rem" }}>
            <label style={{ 
              display: "block",
              fontFamily: "'Montserrat', sans-serif",
              color: "#102231",
              fontWeight: 600,
              marginBottom: "0.5rem"
            }}>
              ⚡ Energieeffizienzklasse (optional)
            </label>
            <select
              value={formData.energyRating}
              onChange={(e) => handleInputChange("energyRating", e.target.value)}
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "0.75rem",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "1rem",
                cursor: "pointer"
              }}
            >
              <option value="">Keine Angabe</option>
              <option value="A+">A+ (Beste)</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
              <option value="G">G</option>
              <option value="H">H (Schlechteste)</option>
            </select>
            <div style={{ 
              color: "#9ca3af", 
              fontSize: "0.85rem", 
              marginTop: "0.5rem",
              fontFamily: "'Montserrat', sans-serif"
            }}>
              💡 A/A+ erhöht den Wert, E-H mindert ihn
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Watches - Placeholder */}
      {currentStep === 3 && selectedAsset === "luxusuhren" && (
        <div className={`${styles.glassCard} ${styles.slideInUp}`} style={{
          padding: "2rem",
          borderRadius: "16px"
        }}>
          {/* Smart Suggestions & Risk Warnings */}
          <SmartSuggestions assetType="luxusuhren" formData={formData} />
          <RiskWarnings assetType="luxusuhren" formData={formData} />

          <p style={{ 
            fontFamily: "'Montserrat', sans-serif",
            color: "#2c5a78",
            fontSize: "1.1rem"
          }}>
            Weitere Details für Luxusuhren...
          </p>
        </div>
      )}

      {/* Step 3: Vehicles - Placeholder */}
      {currentStep === 3 && selectedAsset === "fahrzeuge" && (
        <div className={`${styles.glassCard} ${styles.slideInUp}`} style={{
          padding: "2rem",
          borderRadius: "16px"
        }}>
          {/* Smart Suggestions & Risk Warnings */}
          <SmartSuggestions assetType="fahrzeuge" formData={formData} />
          <RiskWarnings assetType="fahrzeuge" formData={formData} />

          <p style={{ 
            fontFamily: "'Montserrat', sans-serif",
            color: "#2c5a78",
            fontSize: "1.1rem"
          }}>
            Weitere Details für Fahrzeuge...
          </p>
        </div>
      )}

      {/* Step 4: Results */}
      {currentStep === 4 && (
        <div className={styles.fadeIn}>
          {/* Hero Estimate */}
          <div className={`${styles.glassHero} ${styles.glowEffect}`} style={{
            padding: "3rem 2rem",
            textAlign: "center",
            marginBottom: "2rem",
            position: "relative"
          }}>
            {/* Confidence Badge - Top Right */}
            <div className={styles.pulseAnimation} style={{
              position: "absolute",
              top: "1.5rem",
              right: "1.5rem",
              background: confidenceInfo.bg,
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "0.9rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}>
              {confidenceInfo.emoji} Vertrauen: {confidenceInfo.text} ({confidence}%)
            </div>

            <h2 style={{ 
              fontFamily: "'Playfair Display', serif",
              color: "#102231",
              marginBottom: "1rem",
              fontSize: "1.5rem",
              fontWeight: 500
            }}>
              Geschätzte Bewertung
            </h2>
            <div style={{
              fontSize: "3.5rem",
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg, #2c5a78 0%, #4a90a4 50%, #c7a770 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 700,
              margin: "1rem 0 2rem 0"
            }}>
              {formatPrice(valuation.estimate)}
            </div>

            {/* Range Visualization - Horizontal Bar */}
            <div style={{ marginTop: "2rem", marginBottom: "1rem" }}>
              <div style={{ 
                fontFamily: "'Montserrat', sans-serif", 
                fontSize: "0.9rem", 
                color: "#718096",
                marginBottom: "0.75rem"
              }}>
                Bewertungsspanne
              </div>
              <div style={{
                position: "relative",
                height: "60px",
                background: "rgba(255,255,255,0.5)",
                borderRadius: "12px",
                border: "1px solid rgba(44, 90, 120, 0.1)",
                overflow: "hidden"
              }}>
                {/* Range Bar */}
                <div style={{
                  position: "absolute",
                  left: "10%",
                  right: "10%",
                  top: "50%",
                  height: "8px",
                  transform: "translateY(-50%)",
                  background: "linear-gradient(90deg, #c7a770 0%, #2c5a78 50%, #c7a770 100%)",
                  borderRadius: "4px"
                }} />
                
                {/* Min Marker */}
                <div style={{
                  position: "absolute",
                  left: "10%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "12px",
                  height: "12px",
                  background: "#c7a770",
                  borderRadius: "50%",
                  border: "3px solid white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                }} />
                <div style={{
                  position: "absolute",
                  left: "10%",
                  bottom: "-24px",
                  transform: "translateX(-50%)",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "0.8rem",
                  color: "#718096",
                  whiteSpace: "nowrap"
                }}>
                  {formatPrice(valuation.min)}
                </div>

                {/* Mid/Estimate Marker */}
                <div style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "20px",
                  height: "20px",
                  background: "#2c5a78",
                  borderRadius: "50%",
                  border: "4px solid white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  zIndex: 2
                }} />
                
                {/* Max Marker */}
                <div style={{
                  position: "absolute",
                  right: "10%",
                  top: "50%",
                  transform: "translate(50%, -50%)",
                  width: "12px",
                  height: "12px",
                  background: "#c7a770",
                  borderRadius: "50%",
                  border: "3px solid white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                }} />
                <div style={{
                  position: "absolute",
                  right: "10%",
                  bottom: "-24px",
                  transform: "translateX(50%)",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "0.8rem",
                  color: "#718096",
                  whiteSpace: "nowrap"
                }}>
                  {formatPrice(valuation.max)}
                </div>
              </div>
            </div>

            {/* Methodology Tooltip */}
            <div style={{
              marginTop: "3rem",
              padding: "1rem",
              background: "rgba(255,255,255,0.7)",
              borderRadius: "8px",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "0.85rem",
              color: "#718096",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}>
              💡 <strong>Wie berechnen wir?</strong> Unsere Bewertung basiert auf Marktdaten, Asset-Spezifikationen und aktuellen Trends.
            </div>
          </div>

          {/* Save Valuation Button */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "3rem",
            gap: "1rem"
          }}>
            <button
              onClick={handleSaveValuation}
              disabled={saving || saved}
              className={styles.saveButton}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "16px 32px",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "16px",
                fontWeight: 600,
                color: "white",
                background: saved 
                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  : "linear-gradient(135deg, #2c5a78 0%, #4a90a4 100%)",
                border: "none",
                borderRadius: "12px",
                cursor: saving || saved ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
                transition: "all 0.3s ease",
                boxShadow: "0 4px 16px rgba(44, 90, 120, 0.3)"
              }}
            >
              {saving ? (
                <>
                  <div style={{
                    width: "20px",
                    height: "20px",
                    border: "3px solid rgba(255, 255, 255, 0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }} />
                  Speichert...
                </>
              ) : saved ? (
                <>
                  <svg style={{ width: "20px", height: "20px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Gespeichert!
                </>
              ) : (
                <>
                  <svg style={{ width: "20px", height: "20px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Bewertung speichern
                </>
              )}
            </button>

            <button
              onClick={() => window.location.href = '/valuations'}
              className={styles.dashboardButton}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "16px 24px",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "16px",
                fontWeight: 600,
                color: "#2c5a78",
                background: "white",
                border: "2px solid #2c5a78",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              <svg style={{ width: "20px", height: "20px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </button>
          </div>

          {/* Export & Share Buttons */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "2rem",
            gap: "1rem",
            flexWrap: "wrap"
          }}>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className={styles.secondaryButton}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                color: "#2c5a78",
                background: "white",
                border: "2px solid #2c5a78",
                borderRadius: "10px",
                cursor: exporting ? "not-allowed" : "pointer",
                opacity: exporting ? 0.6 : 1,
                transition: "all 0.3s ease"
              }}
            >
              {exporting ? (
                <>
                  <div style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(44, 90, 120, 0.3)",
                    borderTopColor: "#2c5a78",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }} />
                  Exportiere...
                </>
              ) : (
                <>
                  <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  PDF exportieren
                </>
              )}
            </button>

            <button
              onClick={handleGenerateShareLink}
              disabled={sharing || !savedValuationId}
              className={styles.secondaryButton}
              title={!savedValuationId ? "Bewertung zuerst speichern" : ""}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                color: "#c7a770",
                background: "white",
                border: "2px solid #c7a770",
                borderRadius: "10px",
                cursor: sharing || !savedValuationId ? "not-allowed" : "pointer",
                opacity: sharing || !savedValuationId ? 0.6 : 1,
                transition: "all 0.3s ease"
              }}
            >
              {sharing ? (
                <>
                  <div style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(199, 167, 112, 0.3)",
                    borderTopColor: "#c7a770",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }} />
                  Generiere Link...
                </>
              ) : (
                <>
                  <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share-Link erstellen
                </>
              )}
            </button>
          </div>

          {/* Share Modal */}
          {showShareModal && shareUrl && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(16, 34, 49, 0.7)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              animation: "fadeIn 0.3s ease-in-out"
            }} onClick={() => setShowShareModal(false)}>
              <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "32px",
                maxWidth: "500px",
                width: "90%",
                boxShadow: "0 20px 60px rgba(16, 34, 49, 0.3)",
                animation: "slideIn 0.3s ease-in-out"
              }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#102231",
                  margin: "0 0 16px 0"
                }}>
                  🔗 Share-Link erstellt!
                </h3>
                <p style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "14px",
                  color: "#6b7280",
                  margin: "0 0 20px 0"
                }}>
                  Teilen Sie diese Bewertung mit anderen. Der Link ist 30 Tage gültig.
                </p>
                <div style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "20px"
                }}>
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    style={{
                      flex: 1,
                      padding: "12px",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "13px",
                      color: "#102231",
                      background: "#f4f7fa",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px"
                    }}
                  />
                  <button
                    onClick={handleCopyShareLink}
                    style={{
                      padding: "12px 20px",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "white",
                      background: "#2c5a78",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    Kopieren
                  </button>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#6b7280",
                    background: "#f4f7fa",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                >
                  Schließen
                </button>
              </div>
            </div>
          )}

          {/* Save Error Message */}
          {saveError && (
            <div style={{
              maxWidth: "600px",
              margin: "0 auto 2rem auto",
              padding: "12px 20px",
              background: "rgba(220, 38, 38, 0.1)",
              border: "1px solid #dc2626",
              borderRadius: "10px",
              color: "#991b1b",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "14px",
              textAlign: "center"
            }}>
              ⚠️ {saveError}
            </div>
          )}

          {/* Key Drivers Cards */}
          <div style={{
            marginBottom: "2rem"
          }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              color: "#102231",
              fontSize: "1.5rem",
              marginBottom: "1rem"
            }}>
              🎯 Wichtigste Wertfaktoren
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem"
            }}>
              {keyDrivers.map((driver, idx) => (
                <div 
                  key={idx}
                  className={`${styles.glassCard} ${styles.slideInUp} ${styles.staggerItem}`}
                  style={{
                    padding: "1.5rem",
                    background: driver.positive 
                      ? "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%)" 
                      : "linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%)",
                    borderRadius: "12px",
                    border: driver.positive ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(245, 158, 11, 0.2)",
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                    {driver.icon}
                  </div>
                  <div style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "0.9rem",
                    color: "#718096",
                    marginBottom: "0.25rem"
                  }}>
                    {driver.label}
                  </div>
                  <div style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "1.1rem",
                    color: driver.positive ? "#10b981" : "#f59e0b",
                    fontWeight: 700
                  }}>
                    {driver.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Property Summary */}
          <div className={`${styles.glassCard} ${styles.slideInUp}`} style={{
            padding: "2rem",
            borderRadius: "16px"
          }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              color: "#102231",
              fontSize: "1.5rem",
              marginBottom: "1.5rem"
            }}>
              📋 Ihre Angaben
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              fontFamily: "'Montserrat', sans-serif"
            }}>
              {selectedAsset === "real-estate" && (
                <>
                  <div>
                    <div style={{ color: "#718096", fontSize: "0.9rem" }}>Lage</div>
                    <div style={{ color: "#102231", fontWeight: 600, marginTop: "0.25rem" }}>
                      {formData.locationTier === 1 ? "🏆 Toplage" : formData.locationTier === 2 ? "✓ Gute Lage" : "○ Solide Lage"}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#718096", fontSize: "0.9rem" }}>Wohnfläche</div>
                    <div style={{ color: "#102231", fontWeight: 600, marginTop: "0.25rem" }}>
                      {formData.areaSqm} m²
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#718096", fontSize: "0.9rem" }}>Zimmer</div>
                    <div style={{ color: "#102231", fontWeight: 600, marginTop: "0.25rem" }}>
                      {formData.rooms}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#718096", fontSize: "0.9rem" }}>Zustand</div>
                    <div style={{ color: "#102231", fontWeight: 600, marginTop: "0.25rem" }}>
                      {formData.condition === "new" ? "✨ Neubau" : formData.condition === "renovated" ? "🔧 Renoviert" : "⚠️ Renovierungsbedürftig"}
                    </div>
                  </div>
                </>
              )}
              
              {selectedAsset === "luxusuhren" && (
                <>
                  <div>
                    <div style={{ color: "#718096", fontSize: "0.9rem" }}>Marke</div>
                    <div style={{ color: "#102231", fontWeight: 600, marginTop: "0.25rem" }}>
                      {formData.brandTier === 1 ? "🏆 Premium" : formData.brandTier === 2 ? "✨ Luxus" : "⌚ Qualität"}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#718096", fontSize: "0.9rem" }}>Zustand</div>
                    <div style={{ color: "#102231", fontWeight: 600, marginTop: "0.25rem" }}>
                      {formData.watchCondition === "mint" ? "✨ Mint" : 
                       formData.watchCondition === "very_good" ? "⭐ Sehr gut" : 
                       formData.watchCondition === "good" ? "✓ Gut" : "○ Gebraucht"}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#718096", fontSize: "0.9rem" }}>Full Set</div>
                    <div style={{ color: "#102231", fontWeight: 600, marginTop: "0.25rem" }}>
                      {formData.fullSet ? "✅ Ja (Box + Papers)" : "❌ Nein"}
                    </div>
                  </div>
                </>
              )}
              
              {selectedAsset === "fahrzeuge" && (
                <>
                  <div>
                    <div style={{ color: "#718096", fontSize: "0.9rem" }}>Marke</div>
                    <div style={{ color: "#102231", fontWeight: 600, marginTop: "0.25rem" }}>
                      {formData.brandTier === 1 ? "🏆 Premium" : formData.brandTier === 2 ? "✨ Luxus" : "⚡ Qualität"}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#718096", fontSize: "0.9rem" }}>Baujahr</div>
                    <div style={{ color: "#102231", fontWeight: 600, marginTop: "0.25rem" }}>
                      {formData.vehicleYear}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#718096", fontSize: "0.9rem" }}>Kilometerstand</div>
                    <div style={{ color: "#102231", fontWeight: 600, marginTop: "0.25rem" }}>
                      {formData.mileageKm.toLocaleString('de-DE')} km
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#718096", fontSize: "0.9rem" }}>Zustand</div>
                    <div style={{ color: "#102231", fontWeight: 600, marginTop: "0.25rem" }}>
                      {formData.vehicleCondition === "excellent" ? "✨ Exzellent" : 
                       formData.vehicleCondition === "good" ? "⭐ Gut" : "○ Gebraucht"}
                    </div>
                  </div>
                </>
              )}
            </div>
            <p style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "rgba(44, 90, 120, 0.05)",
              borderRadius: "8px",
              color: "#2c5a78",
              fontSize: "0.9rem",
              fontFamily: "'Montserrat', sans-serif"
            }}>
              💡 Dies ist eine erste Schätzung basierend auf Ihren Angaben. Für eine detaillierte Bewertung empfehlen wir eine professionelle Begutachtung.
            </p>
          </div>

          {/* Price Distribution */}
          {distribution && !loadingComps && (
            <div style={{ marginTop: "2rem" }}>
              <PriceDistribution
                min={distribution.min}
                max={distribution.max}
                avg={distribution.avg}
                median={distribution.median}
                percentile={distribution.percentile}
                userEstimate={valuation.estimate}
              />
            </div>
          )}

          {/* Comparables Section */}
          {comparables.length > 0 && !loadingComps && (
            <div style={{ marginTop: "2rem" }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                color: "#102231",
                fontSize: "1.5rem",
                marginBottom: "1rem"
              }}>
                📊 Vergleichbare Objekte
              </h3>
              <p style={{
                fontFamily: "'Montserrat', sans-serif",
                color: "#718096",
                fontSize: "0.95rem",
                marginBottom: "1.5rem"
              }}>
                Ähnliche Assets aus unserem Marktplatz
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem"
              }}>
                {comparables.map((comp) => (
                  <CompCard
                    key={comp.id}
                    title={comp.title}
                    price={comp.price}
                    specs={comp.specs}
                    location={comp.location}
                    similarity={comp.similarity}
                    listingUrl={comp.listingUrl}
                    image={comp.image}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Market Context */}
          {!loadingComps && selectedAsset && (
            <MarketTrends
              assetType={selectedAsset}
              location={selectedAsset === 'real-estate' ? formData.locationAddress : undefined}
            />
          )}

          {/* Watchlist CTA - Phase 2.3 */}
          {!loadingComps && selectedAsset && (
            <WatchlistCTA
              assetType={selectedAsset}
              estimatedValue={valuation.estimate}
              assetDetails={{
                brand: selectedAsset === 'luxusuhren' ? formData.watchBrand : 
                       selectedAsset === 'fahrzeuge' ? formData.vehicleBrand : undefined,
                model: selectedAsset === 'luxusuhren' ? formData.watchModel : 
                       selectedAsset === 'fahrzeuge' ? formData.vehicleModel : undefined,
                location: selectedAsset === 'real-estate' ? formData.locationAddress : 
                         selectedAsset === 'luxusuhren' ? formData.watchLocation :
                         selectedAsset === 'fahrzeuge' ? formData.vehicleLocation : undefined
              }}
            />
          )}

          {/* Similar Assets - Phase 2.3 */}
          {!loadingComps && selectedAsset && (
            <SimilarAssets
              currentAssetType={selectedAsset}
              estimatedValue={valuation.estimate}
            />
          )}

          {/* Loading Indicator */}
          {loadingComps && (
            <div style={{
              marginTop: "2rem",
              padding: "2rem",
              textAlign: "center",
              fontFamily: "'Montserrat', sans-serif",
              color: "#718096"
            }}>
              <div style={{
                display: "inline-block",
                width: "40px",
                height: "40px",
                border: "4px solid rgba(44, 90, 120, 0.1)",
                borderTop: "4px solid #2c5a78",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }} />
              <p style={{ marginTop: "1rem" }}>
                Suche vergleichbare Objekte...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Missing Fields Error */}
      {missingFieldsError && (
        <div style={{
          marginTop: "2rem",
          padding: "1rem 1.5rem",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid #ef4444",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem"
        }}>
          <span style={{ fontSize: "1.25rem" }}>⚠️</span>
          <div>
            <div style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "0.9rem",
              color: "#991b1b",
              fontWeight: 600
            }}>
              Pflichtfeld fehlt
            </div>
            <div style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "0.85rem",
              color: "#7f1d1d",
              marginTop: "0.25rem"
            }}>
              {missingFieldsError}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "3rem",
        paddingTop: "2rem",
        borderTop: "1px solid #e5e7eb",
        gap: "1rem"
      }}>
        {currentStep === 4 ? (
          <>
            <button
              onClick={goToPrevStep}
              style={{
                padding: "1rem 2rem",
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "1rem",
                cursor: "pointer",
                color: "#2c5a78"
              }}
            >
              ← Zurück
            </button>
            <button
              onClick={resetWizard}
              style={{
                padding: "1rem 2rem",
                background: "linear-gradient(135deg, #c7a770 0%, #d4b896 100%)",
                border: "none",
                borderRadius: "8px",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "1rem",
                color: "white",
                cursor: "pointer"
              }}
            >
              🔄 Neue Bewertung
            </button>
          </>
        ) : (
          <>
            <button
              onClick={goToPrevStep}
              disabled={currentStep === 1}
              style={{
                padding: "1rem 2rem",
                background: currentStep === 1 ? "#e5e7eb" : "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "1rem",
                cursor: currentStep === 1 ? "not-allowed" : "pointer",
                color: currentStep === 1 ? "#a0aec0" : "#2c5a78"
              }}
            >
              ← Zurück
            </button>
            
            <button
              onClick={goToNextStep}
              disabled={currentStep === 1 && !selectedAsset}
              style={{
                padding: "1rem 2rem",
                background: (currentStep === 1 && !selectedAsset) ? "#e5e7eb" : "linear-gradient(135deg, #2c5a78 0%, #4a90a4 100%)",
                border: "none",
                borderRadius: "8px",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "1rem",
                color: "white",
                cursor: (currentStep === 1 && !selectedAsset) ? "not-allowed" : "pointer"
              }}
            >
              Weiter →
            </button>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
