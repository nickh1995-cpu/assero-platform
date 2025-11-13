"use client";

/**
 * ASSERO LISTING CREATION - Main Wizard Page
 * Phase 2: Multi-Step Wizard with Auto-Save
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ListingWizard } from "@/components/ListingWizard";
import { ListingFormProvider, useListingForm } from "@/components/ListingWizard";
import { CategoryStep as CategoryStepComponent } from "@/components/ListingWizard/steps/CategoryStep";
import { RealEstateForm } from "@/components/ListingWizard/steps/RealEstateForm";
import { VehicleForm } from "@/components/ListingWizard/steps/VehicleForm";
import { WatchForm } from "@/components/ListingWizard/steps/WatchForm";
import { ImageUpload } from "@/components/ListingWizard/ImageUpload";
import { ListingPreview } from "@/components/ListingWizard/ListingPreview";
import { DraftResumeBanner } from "@/components/ListingWizard/DraftResumeBanner";
import { useAuth } from "@/contexts/AuthContext";

// Loading State Component
function LoadingState() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a1628 0%, #1a2942 50%, #0f1d33 100%)',
      color: '#ffffff',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
        <p style={{ fontSize: '1.125rem' }}>Lädt Listing-Wizard...</p>
      </div>
    </div>
  );
}

// Wizard Content Component (uses context)
function WizardContent() {
  const router = useRouter();
  const {
    formState,
    isLoadingDraft,
    hasDraft,
    nextStep,
    prevStep,
    canGoNext,
    canGoBack,
    isLastStep,
    submitListing,
    startNewListing,
  } = useListingForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  // Show draft banner when draft is loaded
  useEffect(() => {
    if (!isLoadingDraft && hasDraft) {
      setShowDraftBanner(true);
    }
  }, [isLoadingDraft, hasDraft]);

  // Handle Submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await submitListing();
    setIsSubmitting(false);

    if (result.success) {
      // Redirect to success page or dashboard
      router.push(`/list/success?id=${result.listingId}`);
    } else {
      alert(`Fehler: ${result.error}`);
    }
  };

  // Handle Exit
  const handleExit = () => {
    if (confirm('Möchten Sie wirklich abbrechen? Ihre Änderungen werden als Entwurf gespeichert.')) {
      router.push('/dashboard');
    }
  };

  // Handle Draft Banner actions
  const handleContinue = () => {
    setShowDraftBanner(false);
  };

  const handleStartNew = () => {
    if (confirm('Möchten Sie wirklich einen neuen Entwurf beginnen? Der aktuelle Entwurf wird gelöscht.')) {
      startNewListing();
      setShowDraftBanner(false);
    }
  };

  // Show loading while checking for drafts
  if (isLoadingDraft) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2942 50%, #0f1d33 100%)',
        color: '#ffffff',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
          <p style={{ fontSize: '1.125rem' }}>Suche nach Entwürfen...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header Navigation */}
      <Header />

      {/* Main Content Wrapper with padding for fixed header */}
      <div style={{ paddingTop: '68px' }}>
        <ListingWizard
        currentStep={formState.currentStep}
        onNext={nextStep}
        onBack={prevStep}
        onExit={handleExit}
        canGoNext={canGoNext()}
        canGoBack={canGoBack()}
        isLastStep={isLastStep()}
        autoSaveStatus={formState.autoSaveStatus}
        lastSaved={formState.lastSaved}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        {/* Step Content will be rendered here */}
        <StepContent step={formState.currentStep} />
      </ListingWizard>

        {/* Draft Resume Banner - am Ende (bessere UX) */}
        {showDraftBanner && (
          <div style={{ 
            maxWidth: '900px', 
            margin: '32px auto 0 auto',
            padding: '0 20px'
          }}>
            <DraftResumeBanner
              lastSaved={formState.lastSaved}
              currentStep={formState.currentStep}
              onContinue={handleContinue}
              onStartNew={handleStartNew}
            />
          </div>
        )}
      </div>
    </>
  );
}

// Step Content Router
function StepContent({ step }: { step: number }) {
  switch (step) {
    case 1:
      return <CategoryStep />;
    case 2:
      return <DetailsStep />;
    case 3:
      return <ImagesStep />;
    case 4:
      return <PreviewStep />;
    default:
      return <CategoryStep />;
  }
}

// STEP 1: Category Selection
function CategoryStep() {
  const { formState, updateCategory } = useListingForm();
  
  return (
    <CategoryStepComponent
      selectedCategory={formState.category}
      onCategorySelect={updateCategory}
      validationError={formState.validationErrors.category}
    />
  );
}

// STEP 2: Details
function DetailsStep() {
  const { formState, updateField, updateMetadata } = useListingForm();
  
  // Real Estate Form
  if (formState.category?.slug === 'real-estate') {
    return (
      <RealEstateForm
        title={formState.title}
        description={formState.description}
        price={formState.price}
        currency={formState.currency}
        location={formState.location}
        metadata={formState.metadata}
        onTitleChange={(value) => updateField('title', value)}
        onDescriptionChange={(value) => updateField('description', value)}
        onPriceChange={(value) => updateField('price', value)}
        onCurrencyChange={(value) => updateField('currency', value)}
        onLocationChange={(value) => updateField('location', value)}
        onMetadataChange={updateMetadata}
        validationErrors={formState.validationErrors}
      />
    );
  }
  
  // Vehicle Form (Fahrzeuge)
  if (formState.category?.slug === 'fahrzeuge') {
    return (
      <VehicleForm
        title={formState.title}
        description={formState.description}
        price={formState.price}
        currency={formState.currency}
        location={formState.location}
        metadata={formState.metadata}
        onTitleChange={(value) => updateField('title', value)}
        onDescriptionChange={(value) => updateField('description', value)}
        onPriceChange={(value) => updateField('price', value)}
        onCurrencyChange={(value) => updateField('currency', value)}
        onLocationChange={(value) => updateField('location', value)}
        onMetadataChange={updateMetadata}
        validationErrors={formState.validationErrors}
      />
    );
  }
  
  // Watch Form (Luxusuhren)
  if (formState.category?.slug === 'luxusuhren') {
    return (
      <WatchForm
        title={formState.title}
        description={formState.description}
        price={formState.price}
        currency={formState.currency}
        location={formState.location}
        metadata={formState.metadata}
        onTitleChange={(value) => updateField('title', value)}
        onDescriptionChange={(value) => updateField('description', value)}
        onPriceChange={(value) => updateField('price', value)}
        onCurrencyChange={(value) => updateField('currency', value)}
        onLocationChange={(value) => updateField('location', value)}
        onMetadataChange={updateMetadata}
        validationErrors={formState.validationErrors}
      />
    );
  }
  
  // Placeholder for other categories
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ffffff' }}>
      <h2 style={{ fontSize: '1.875rem', marginBottom: '16px' }}>Details</h2>
      <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.7)' }}>
        Formular für {formState.category?.name || 'diese Kategorie'} ist noch nicht verfügbar.
      </p>
      <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginTop: '24px' }}>
        Bitte wählen Sie Real Estate, Fahrzeuge oder Luxusuhren.
      </p>
    </div>
  );
}

// STEP 3: Images
function ImagesStep() {
  const { formState, addImages, removeImage, setCoverImage } = useListingForm();

  return (
    <ImageUpload
      images={formState.images}
      imageFiles={formState.imageFiles}
      coverImageIndex={formState.coverImageIndex}
      onImagesAdd={addImages}
      onImageRemove={removeImage}
      onCoverImageSet={setCoverImage}
      maxImages={10}
      maxSizeMB={5}
      validationError={formState.validationErrors.images}
    />
  );
}

// STEP 4: Preview & Publish
function PreviewStep() {
  const { formState, goToStep, submitListing } = useListingForm();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    const result = await submitListing();
    setIsPublishing(false);
    
    if (result.success) {
      alert(`✅ Listing erfolgreich eingereicht!\n\nIhr Listing wird nun geprüft und in Kürze veröffentlicht.`);
      // Router push is handled in WizardContent
    } else {
      alert(`❌ Fehler beim Einreichen:\n\n${result.error}`);
    }
  };

  return (
    <ListingPreview
      category={formState.category}
      title={formState.title}
      description={formState.description}
      price={formState.price}
      currency={formState.currency}
      location={formState.location}
      metadata={formState.metadata}
      images={formState.images}
      imageFiles={formState.imageFiles}
      coverImageIndex={formState.coverImageIndex}
      onEditStep={goToStep}
      onPublish={handlePublish}
      isPublishing={isPublishing}
    />
  );
}

// Main Page Component
export default function CreateListingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  // Check Auth
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/sign-in?redirect_to=/list/create');
      return;
    }
    setLoading(false);
  }, [authLoading, user, router]);

  if (loading) {
    return <LoadingState />;
  }

  if (!user) {
    return null;
  }

  return (
    <ListingFormProvider userId={user.id} userEmail={user.email || ''}>
      <WizardContent />
    </ListingFormProvider>
  );
}
