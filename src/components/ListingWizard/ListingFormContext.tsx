"use client";

/**
 * ASSERO LISTING FORM CONTEXT
 * Phase 2: State Management for Wizard
 * 
 * Manages form state, auto-save, validation across all wizard steps
 */

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { uploadListingImages } from '@/lib/imageUploadService';
import type { 
  AssetCategory, 
  ListingDraft, 
  WizardStepId 
} from '@/types/listing';
import type { 
  AssetMetadata, 
  Currency 
} from '@/types/listing-metadata';
import { getEmptyMetadata } from '@/types/listing-metadata';

// Form State Interface
export interface ListingFormState {
  // Wizard
  currentStep: WizardStepId;
  draftId: string | null;
  
  // Step 1: Category
  category: AssetCategory | null;
  
  // Step 2: Details
  title: string;
  description: string;
  price: number | null;
  currency: Currency;
  location: string;
  metadata: Partial<AssetMetadata>;
  
  // Contact
  contactEmail: string;
  contactPhone: string;
  contactName: string;
  
  // Step 3: Images
  images: string[]; // URLs from Supabase Storage
  imageFiles: File[]; // Pending uploads
  coverImageIndex: number;
  
  // State
  isDirty: boolean;
  isSaving: boolean;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  validationErrors: Record<string, string>;
}

// Context Interface
interface ListingFormContextValue {
  formState: ListingFormState;
  
  // Draft State
  isLoadingDraft: boolean;
  hasDraft: boolean;
  
  // Navigation
  goToStep: (step: WizardStepId) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: () => boolean;
  canGoBack: () => boolean;
  isLastStep: () => boolean;
  
  // Form Updates
  updateCategory: (category: AssetCategory | null) => void;
  updateField: (field: keyof ListingFormState, value: any) => void;
  updateMetadata: (metadata: Partial<AssetMetadata>) => void;
  
  // Images
  addImages: (files: File[]) => void;
  removeImage: (index: number) => void;
  setCoverImage: (index: number) => void;
  
  // Save & Submit
  saveDraft: () => Promise<void>;
  submitListing: () => Promise<{ success: boolean; listingId?: string; error?: string }>;
  deleteDraft: () => Promise<void>;
  startNewListing: () => void;
  
  // Validation
  validateCurrentStep: () => boolean;
  clearErrors: () => void;
}

const ListingFormContext = createContext<ListingFormContextValue | undefined>(undefined);

// Provider Props
interface ListingFormProviderProps {
  children: ReactNode;
  userId: string;
  userEmail: string;
}

export function ListingFormProvider({ children, userId, userEmail }: ListingFormProviderProps) {
  
  // Initial State
  const [formState, setFormState] = useState<ListingFormState>({
    currentStep: 1,
    draftId: null,
    category: null,
    title: '',
    description: '',
    price: null,
    currency: 'EUR',
    location: '',
    metadata: {},
    contactEmail: userEmail,
    contactPhone: '',
    contactName: '',
    images: [],
    imageFiles: [],
    coverImageIndex: 0,
    isDirty: false,
    isSaving: false,
    autoSaveStatus: 'idle',
    lastSaved: null,
    validationErrors: {},
  });

  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [hasDraft, setHasDraft] = useState(false);

  // Load existing draft on mount
  useEffect(() => {
    loadExistingDraft();
  }, [userId]);

  // Load Existing Draft Function
  const loadExistingDraft = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setIsLoadingDraft(false);
      return;
    }

    try {
      // Fetch most recent draft for this user
      const { data: draft, error } = await supabase
        .from('listing_drafts')
        .select('*, asset_categories(*)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (draft) {
        console.log('📝 Found existing draft:', draft.id);
        
        // Load category if exists
        let category = null;
        if (draft.category_id) {
          const { data: catData } = await supabase
            .from('asset_categories')
            .select('*')
            .eq('id', draft.category_id)
            .single();
          category = catData;
        }

        setFormState({
          currentStep: draft.current_step || 1,
          draftId: draft.id,
          category: category,
          title: draft.title || '',
          description: draft.description || '',
          price: draft.price || null,
          currency: draft.currency || 'EUR',
          location: draft.location || '',
          metadata: draft.metadata || {},
          contactEmail: draft.contact_email || userEmail,
          contactPhone: draft.contact_phone || '',
          contactName: draft.contact_name || '',
          images: draft.images || [],
          imageFiles: [],
          coverImageIndex: 0,
          isDirty: false,
          isSaving: false,
          autoSaveStatus: 'idle',
          lastSaved: draft.last_saved_at ? new Date(draft.last_saved_at) : null,
          validationErrors: {},
        });

        setHasDraft(true);
      }

      setIsLoadingDraft(false);
    } catch (error) {
      console.error('Error loading draft:', error);
      setIsLoadingDraft(false);
    }
  }, [userId, userEmail]);

  // Auto-Save: Save draft every 30 seconds if dirty
  useEffect(() => {
    if (!formState.isDirty || formState.isSaving) return;

    const autoSaveTimer = setTimeout(() => {
      saveDraft();
    }, 30000); // 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [formState.isDirty, formState.isSaving]);

  // Navigation
  const goToStep = useCallback((step: WizardStepId) => {
    setFormState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    // Validate inline without causing re-render
    const errors: Record<string, string> = {};

    switch (formState.currentStep) {
      case 1: // Category
        if (!formState.category) {
          errors.category = 'Bitte wählen Sie eine Kategorie';
        }
        break;

      case 2: // Details
        // Basic Fields (all categories)
        if (!formState.title || formState.title.trim().length < 10) {
          errors.title = 'Titel muss mindestens 10 Zeichen haben';
        }
        if (formState.title && formState.title.length > 100) {
          errors.title = 'Titel darf maximal 100 Zeichen haben';
        }
        if (!formState.description || formState.description.trim().length < 50) {
          errors.description = 'Beschreibung muss mindestens 50 Zeichen haben';
        }
        if (formState.description && formState.description.length > 2000) {
          errors.description = 'Beschreibung darf maximal 2000 Zeichen haben';
        }
        if (!formState.price || formState.price <= 0) {
          errors.price = 'Bitte geben Sie einen gültigen Preis ein';
        }
        if (!formState.location || formState.location.trim().length < 2) {
          errors.location = 'Bitte geben Sie einen Standort ein';
        }

        // Category-specific validation
        if (formState.category?.slug === 'real-estate') {
          const metadata = formState.metadata as any;

          // Required: Property Type
          if (!metadata.property_type) {
            errors.property_type = 'Bitte wählen Sie einen Immobilientyp';
          }

          // Required: Condition
          if (!metadata.condition) {
            errors.condition = 'Bitte wählen Sie den Zustand der Immobilie';
          }

          // Required: Year Built
          if (!metadata.year_built) {
            errors.year_built = 'Bitte geben Sie das Baujahr ein';
          } else if (metadata.year_built < 1800 || metadata.year_built > new Date().getFullYear() + 2) {
            errors.year_built = 'Baujahr muss zwischen 1800 und ' + (new Date().getFullYear() + 2) + ' liegen';
          }

          // Required: Area (m²)
          if (!metadata.area_sqm || metadata.area_sqm <= 0) {
            errors.area_sqm = 'Bitte geben Sie die Wohnfläche ein';
          } else if (metadata.area_sqm > 10000) {
            errors.area_sqm = 'Wohnfläche erscheint unrealistisch groß (max. 10.000 m²)';
          }

          // Required: Rooms
          if (!metadata.rooms || metadata.rooms < 0.5) {
            errors.rooms = 'Bitte geben Sie die Anzahl der Zimmer ein';
          } else if (metadata.rooms > 50) {
            errors.rooms = 'Anzahl der Zimmer erscheint unrealistisch (max. 50)';
          }

          // Optional but validate if provided: Land Area
          if (metadata.land_area_sqm && metadata.land_area_sqm < 0) {
            errors.land_area_sqm = 'Grundstücksfläche kann nicht negativ sein';
          }

          // Optional but validate if provided: Bedrooms
          if (metadata.bedrooms && metadata.bedrooms < 0) {
            errors.bedrooms = 'Anzahl Schlafzimmer kann nicht negativ sein';
          }

          // Optional but validate if provided: Bathrooms
          if (metadata.bathrooms && metadata.bathrooms < 0) {
            errors.bathrooms = 'Anzahl Badezimmer kann nicht negativ sein';
          }

          // Floor validation
          if (metadata.floor !== undefined && metadata.floor !== null) {
            if (metadata.floor < -5 || metadata.floor > 200) {
              errors.floor = 'Etage muss zwischen -5 und 200 liegen';
            }
          }

          // Total floors validation
          if (metadata.total_floors && (metadata.total_floors < 0 || metadata.total_floors > 200)) {
            errors.total_floors = 'Gesamtanzahl Etagen muss zwischen 0 und 200 liegen';
          }

          // Parking spots validation
          if (metadata.parking_spots && metadata.parking_spots < 0) {
            errors.parking_spots = 'Anzahl Stellplätze kann nicht negativ sein';
          }

          // Investment data validation
          if (metadata.rental_income_monthly && metadata.rental_income_monthly < 0) {
            errors.rental_income_monthly = 'Mieteinnahmen können nicht negativ sein';
          }
          if (metadata.operating_costs_monthly && metadata.operating_costs_monthly < 0) {
            errors.operating_costs_monthly = 'Nebenkosten können nicht negativ sein';
          }
          if (metadata.yield_pct && (metadata.yield_pct < 0 || metadata.yield_pct > 100)) {
            errors.yield_pct = 'Rendite muss zwischen 0 und 100% liegen';
          }
        }

        // VEHICLE VALIDATION
        if (formState.category?.slug === 'fahrzeuge') {
          const metadata = formState.metadata as any;

          // Required: Vehicle Type
          if (!metadata.vehicle_type) {
            errors.vehicle_type = 'Bitte wählen Sie einen Fahrzeugtyp';
          }

          // Required: Make
          if (!metadata.make || metadata.make.trim().length < 2) {
            errors.make = 'Bitte wählen Sie eine Marke';
          }

          // Required: Model
          if (!metadata.model || metadata.model.trim().length < 2) {
            errors.model = 'Bitte geben Sie ein Modell ein';
          }

          // Required: Year
          if (!metadata.year) {
            errors.year = 'Bitte geben Sie das Baujahr ein';
          } else if (metadata.year < 1900 || metadata.year > new Date().getFullYear() + 1) {
            errors.year = 'Baujahr muss zwischen 1900 und ' + (new Date().getFullYear() + 1) + ' liegen';
          }

          // Required: Mileage
          if (metadata.mileage_km === undefined || metadata.mileage_km === null) {
            errors.mileage_km = 'Bitte geben Sie den Kilometerstand ein';
          } else if (metadata.mileage_km < 0) {
            errors.mileage_km = 'Kilometerstand kann nicht negativ sein';
          } else if (metadata.mileage_km > 1000000) {
            errors.mileage_km = 'Kilometerstand erscheint unrealistisch (max. 1.000.000 km)';
          }

          // Required: Fuel Type
          if (!metadata.fuel_type) {
            errors.fuel_type = 'Bitte wählen Sie die Kraftstoffart';
          }

          // Required: Transmission
          if (!metadata.transmission) {
            errors.transmission = 'Bitte wählen Sie das Getriebe';
          }

          // Required: Horsepower
          if (!metadata.horsepower || metadata.horsepower <= 0) {
            errors.horsepower = 'Bitte geben Sie die Leistung in PS ein';
          } else if (metadata.horsepower > 2000) {
            errors.horsepower = 'Leistung erscheint unrealistisch (max. 2000 PS)';
          }

          // Optional: Displacement
          if (metadata.displacement_liters && (metadata.displacement_liters < 0 || metadata.displacement_liters > 20)) {
            errors.displacement_liters = 'Hubraum muss zwischen 0 und 20 Liter liegen';
          }

          // Required: Exterior Color
          if (!metadata.exterior_color || metadata.exterior_color.trim().length < 2) {
            errors.exterior_color = 'Bitte geben Sie die Außenfarbe ein';
          }

          // Optional: Doors & Seats
          if (metadata.doors && (metadata.doors < 2 || metadata.doors > 5)) {
            errors.doors = 'Anzahl Türen muss zwischen 2 und 5 liegen';
          }
          if (metadata.seats && (metadata.seats < 1 || metadata.seats > 9)) {
            errors.seats = 'Anzahl Sitze muss zwischen 1 und 9 liegen';
          }

          // Required: Condition
          if (!metadata.condition) {
            errors.condition = 'Bitte wählen Sie den Zustand des Fahrzeugs';
          }

          // Optional: Previous Owners
          if (metadata.previous_owners && (metadata.previous_owners < 0 || metadata.previous_owners > 10)) {
            errors.previous_owners = 'Anzahl Vorbesitzer muss zwischen 0 und 10 liegen';
          }
        }

        // WATCH VALIDATION
        if (formState.category?.slug === 'luxusuhren') {
          const metadata = formState.metadata as any;

          // Required: Brand
          if (!metadata.brand || metadata.brand.trim().length < 2) {
            errors.brand = 'Bitte wählen Sie eine Marke';
          }

          // Required: Model
          if (!metadata.model || metadata.model.trim().length < 2) {
            errors.model = 'Bitte geben Sie ein Modell ein';
          }

          // Required: Reference Number
          if (!metadata.reference_number || metadata.reference_number.trim().length < 2) {
            errors.reference_number = 'Bitte geben Sie die Referenznummer ein';
          }

          // Required: Year
          if (!metadata.year) {
            errors.year = 'Bitte geben Sie das Baujahr ein';
          } else if (metadata.year < 1800 || metadata.year > new Date().getFullYear() + 1) {
            errors.year = 'Baujahr muss zwischen 1800 und ' + (new Date().getFullYear() + 1) + ' liegen';
          }

          // Required: Movement
          if (!metadata.movement) {
            errors.movement = 'Bitte wählen Sie das Uhrwerk';
          }

          // Required: Case Material
          if (!metadata.case_material) {
            errors.case_material = 'Bitte wählen Sie das Gehäusematerial';
          }

          // Required: Case Diameter
          if (!metadata.case_diameter_mm || metadata.case_diameter_mm <= 0) {
            errors.case_diameter_mm = 'Bitte geben Sie den Gehäusedurchmesser ein';
          } else if (metadata.case_diameter_mm < 20 || metadata.case_diameter_mm > 100) {
            errors.case_diameter_mm = 'Gehäusedurchmesser muss zwischen 20 und 100 mm liegen';
          }

          // Optional: Water Resistance
          if (metadata.water_resistance_m && (metadata.water_resistance_m < 0 || metadata.water_resistance_m > 5000)) {
            errors.water_resistance_m = 'Wasserdichtigkeit muss zwischen 0 und 5000m liegen';
          }

          // Optional: Power Reserve
          if (metadata.power_reserve_hours && (metadata.power_reserve_hours < 0 || metadata.power_reserve_hours > 1000)) {
            errors.power_reserve_hours = 'Gangreserve muss zwischen 0 und 1000 Stunden liegen';
          }

          // Required: Condition
          if (!metadata.condition) {
            errors.condition = 'Bitte wählen Sie den Zustand der Uhr';
          }

          // Optional: Warranty
          if (metadata.warranty_remaining_months && (metadata.warranty_remaining_months < 0 || metadata.warranty_remaining_months > 120)) {
            errors.warranty_remaining_months = 'Restgarantie muss zwischen 0 und 120 Monaten liegen';
          }

          // Optional: Last Service Year
          if (metadata.last_service_year && (metadata.last_service_year < 1900 || metadata.last_service_year > new Date().getFullYear())) {
            errors.last_service_year = 'Letzter Service Jahr muss zwischen 1900 und ' + new Date().getFullYear() + ' liegen';
          }
        }
        break;

      case 3: // Images
        if (formState.images.length === 0 && formState.imageFiles.length === 0) {
          errors.images = 'Bitte fügen Sie mindestens ein Bild hinzu';
        }
        break;
    }

    if (Object.keys(errors).length > 0) {
      setFormState(prev => ({ ...prev, validationErrors: errors }));
      return;
    }

    // Move to next step
    if (formState.currentStep < 4) {
      setFormState(prev => ({ 
        ...prev, 
        currentStep: (prev.currentStep + 1) as WizardStepId,
        validationErrors: {} // Clear errors on successful navigation
      }));
    }
  }, [formState]);

  const prevStep = useCallback(() => {
    if (formState.currentStep > 1) {
      setFormState(prev => ({ ...prev, currentStep: (prev.currentStep - 1) as WizardStepId }));
    }
  }, [formState.currentStep]);

  const canGoNext = useCallback(() => {
    // Don't call validateCurrentStep here as it causes setState during render
    // Just check basic conditions without side effects
    switch (formState.currentStep) {
      case 1: // Category
        return formState.category !== null;
      
      case 2: // Details
        // Basic validation for all categories
        const basicValid = 
          formState.title.trim().length >= 10 && 
          formState.title.length <= 100 &&
          formState.description.trim().length >= 50 &&
          formState.description.length <= 2000 &&
          formState.price !== null && 
          formState.price > 0 &&
          formState.location.trim().length >= 2;
        
        if (!basicValid) return false;

        // Category-specific validation
        if (formState.category?.slug === 'real-estate') {
          const metadata = formState.metadata as any;
          return (
            metadata.property_type !== undefined &&
            metadata.condition !== undefined &&
            metadata.year_built !== undefined &&
            metadata.year_built >= 1800 &&
            metadata.year_built <= new Date().getFullYear() + 2 &&
            metadata.area_sqm !== undefined &&
            metadata.area_sqm > 0 &&
            metadata.area_sqm <= 10000 &&
            metadata.rooms !== undefined &&
            metadata.rooms >= 0.5 &&
            metadata.rooms <= 50
          );
        }

        // VEHICLE canGoNext validation
        if (formState.category?.slug === 'fahrzeuge') {
          const metadata = formState.metadata as any;
          return (
            metadata.vehicle_type !== undefined &&
            metadata.make !== undefined &&
            metadata.make.trim().length >= 2 &&
            metadata.model !== undefined &&
            metadata.model.trim().length >= 2 &&
            metadata.year !== undefined &&
            metadata.year >= 1900 &&
            metadata.year <= new Date().getFullYear() + 1 &&
            metadata.mileage_km !== undefined &&
            metadata.mileage_km >= 0 &&
            metadata.mileage_km <= 1000000 &&
            metadata.fuel_type !== undefined &&
            metadata.transmission !== undefined &&
            metadata.horsepower !== undefined &&
            metadata.horsepower > 0 &&
            metadata.horsepower <= 2000 &&
            metadata.exterior_color !== undefined &&
            metadata.exterior_color.trim().length >= 2 &&
            metadata.condition !== undefined
          );
        }

        // WATCH canGoNext validation
        if (formState.category?.slug === 'luxusuhren') {
          const metadata = formState.metadata as any;
          return (
            metadata.brand !== undefined &&
            metadata.brand.trim().length >= 2 &&
            metadata.model !== undefined &&
            metadata.model.trim().length >= 2 &&
            metadata.reference_number !== undefined &&
            metadata.reference_number.trim().length >= 2 &&
            metadata.year !== undefined &&
            metadata.year >= 1800 &&
            metadata.year <= new Date().getFullYear() + 1 &&
            metadata.movement !== undefined &&
            metadata.case_material !== undefined &&
            metadata.case_diameter_mm !== undefined &&
            metadata.case_diameter_mm >= 20 &&
            metadata.case_diameter_mm <= 100 &&
            metadata.condition !== undefined
          );
        }
        
        return true; // For other categories, basic validation is enough
      
      case 3: // Images
        return formState.images.length > 0 || formState.imageFiles.length > 0;
      
      case 4: // Preview
        return formState.category !== null && 
               formState.title.trim().length >= 10 && 
               formState.price !== null;
      
      default:
        return false;
    }
  }, [formState]);

  const canGoBack = useCallback(() => {
    return formState.currentStep > 1;
  }, [formState.currentStep]);

  const isLastStep = useCallback(() => {
    return formState.currentStep === 4;
  }, [formState.currentStep]);

  // Form Updates
  const updateCategory = useCallback((category: AssetCategory | null) => {
    setFormState(prev => ({
      ...prev,
      category,
      metadata: category ? getEmptyMetadata(category.slug) : {},
      isDirty: true,
    }));
  }, []);

  const updateField = useCallback((field: keyof ListingFormState, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
      isDirty: true,
    }));
  }, []);

  const updateMetadata = useCallback((metadata: Partial<AssetMetadata>) => {
    setFormState(prev => ({
      ...prev,
      metadata: { ...prev.metadata, ...metadata },
      isDirty: true,
    }));
  }, []);

  // Images
  const addImages = useCallback((files: File[]) => {
    setFormState(prev => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...files],
      isDirty: true,
    }));
  }, []);

  const removeImage = useCallback((index: number) => {
    setFormState(prev => {
      const newImages = [...prev.images];
      const newImageFiles = [...prev.imageFiles];
      
      if (index < newImages.length) {
        newImages.splice(index, 1);
      } else {
        newImageFiles.splice(index - newImages.length, 1);
      }
      
      return {
        ...prev,
        images: newImages,
        imageFiles: newImageFiles,
        coverImageIndex: prev.coverImageIndex >= index ? Math.max(0, prev.coverImageIndex - 1) : prev.coverImageIndex,
        isDirty: true,
      };
    });
  }, []);

  const setCoverImage = useCallback((index: number) => {
    setFormState(prev => ({
      ...prev,
      coverImageIndex: index,
      isDirty: true,
    }));
  }, []);

  // Save Draft
  const saveDraft = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setFormState(prev => ({ ...prev, isSaving: true, autoSaveStatus: 'saving' }));

    try {
      const draftData: Partial<ListingDraft> = {
        user_id: userId,
        current_step: formState.currentStep,
        category_id: formState.category?.id || null,
        title: formState.title || null,
        description: formState.description || null,
        price: formState.price || null,
        currency: formState.currency,
        location: formState.location || null,
        metadata: formState.metadata,
        images: formState.images.length > 0 ? formState.images : null,
        contact_email: formState.contactEmail || null,
        contact_phone: formState.contactPhone || null,
        contact_name: formState.contactName || null,
        is_complete: false,
        last_saved_at: new Date().toISOString(),
      };

      let result;
      if (formState.draftId) {
        // Update existing draft
        result = await supabase
          .from('listing_drafts')
          .update(draftData)
          .eq('id', formState.draftId)
          .select()
          .single();
      } else {
        // Create new draft
        result = await supabase
          .from('listing_drafts')
          .insert(draftData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setFormState(prev => ({
        ...prev,
        draftId: result.data.id,
        isDirty: false,
        isSaving: false,
        autoSaveStatus: 'saved',
        lastSaved: new Date(),
      }));

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setFormState(prev => ({ ...prev, autoSaveStatus: 'idle' }));
      }, 3000);

    } catch (error) {
      console.error('Draft save error:', error);
      setFormState(prev => ({
        ...prev,
        isSaving: false,
        autoSaveStatus: 'error',
      }));
    }
  }, [userId, formState]);

  // Submit Listing
  const submitListing = useCallback(async (): Promise<{ success: boolean; listingId?: string; error?: string }> => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return { success: false, error: 'Supabase nicht verfügbar' };
    }

    try {
      // Final validation
      if (!formState.category) {
        return { success: false, error: 'Kategorie fehlt' };
      }
      if (!formState.title) {
        return { success: false, error: 'Titel fehlt' };
      }
      if (!formState.price) {
        return { success: false, error: 'Preis fehlt' };
      }

      // Generate temporary listing ID for image upload
      const tempListingId = formState.draftId || `temp-${Date.now()}`;
      let uploadedImageUrls: string[] = [...formState.images]; // Existing URLs

      // Upload new image files (if any)
      if (formState.imageFiles.length > 0) {
        console.log(`📸 Uploading ${formState.imageFiles.length} images...`);
        
        const { urls, errors } = await uploadListingImages(
          formState.imageFiles,
          userId,
          tempListingId
        );

        if (errors.length > 0) {
          console.warn('Some images failed to upload:', errors);
          // Continue anyway with uploaded images
        }

        uploadedImageUrls = [...uploadedImageUrls, ...urls];
        console.log(`✅ Uploaded ${urls.length} images successfully`);
      }

      // Reorder images based on cover image index
      if (uploadedImageUrls.length > 0 && formState.coverImageIndex > 0 && formState.coverImageIndex < uploadedImageUrls.length) {
        const coverImage = uploadedImageUrls[formState.coverImageIndex];
        uploadedImageUrls.splice(formState.coverImageIndex, 1);
        uploadedImageUrls.unshift(coverImage);
      }

      // Create asset
      const { data: asset, error: assetError } = await supabase
        .from('assets')
        .insert({
          title: formState.title,
          description: formState.description || null,
          category_id: formState.category.id,
          price: formState.price,
          currency: formState.currency,
          location: formState.location || null,
          metadata: formState.metadata,
          images: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
          contact_email: formState.contactEmail || null,
          contact_phone: formState.contactPhone || null,
          contact_name: formState.contactName || null,
          created_by: userId,
          status: 'pending_review',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (assetError) throw assetError;

      // Delete draft if exists
      if (formState.draftId) {
        await supabase
          .from('listing_drafts')
          .delete()
          .eq('id', formState.draftId);
      }

      return { success: true, listingId: asset.id };

    } catch (error: any) {
      console.error('Submit error:', error);
      return { success: false, error: error.message || 'Fehler beim Einreichen' };
    }
  }, [userId, formState]);

  // Validation
  const validateCurrentStep = useCallback(() => {
    const errors: Record<string, string> = {};

    switch (formState.currentStep) {
      case 1: // Category
        if (!formState.category) {
          errors.category = 'Bitte wählen Sie eine Kategorie';
        }
        break;

      case 2: // Details
        if (!formState.title || formState.title.trim().length < 5) {
          errors.title = 'Titel muss mindestens 5 Zeichen haben';
        }
        if (!formState.price || formState.price <= 0) {
          errors.price = 'Bitte geben Sie einen gültigen Preis ein';
        }
        if (!formState.location || formState.location.trim().length < 2) {
          errors.location = 'Bitte geben Sie einen Standort ein';
        }
        break;

      case 3: // Images
        if (formState.images.length === 0 && formState.imageFiles.length === 0) {
          errors.images = 'Bitte fügen Sie mindestens ein Bild hinzu';
        }
        break;

      case 4: // Preview
        // Final validation before submit
        if (!formState.category || !formState.title || !formState.price) {
          errors.complete = 'Bitte füllen Sie alle Pflichtfelder aus';
        }
        break;
    }

    setFormState(prev => ({ ...prev, validationErrors: errors }));
    return Object.keys(errors).length === 0;
  }, [formState]);

  const clearErrors = useCallback(() => {
    setFormState(prev => ({ ...prev, validationErrors: {} }));
  }, []);

  // Delete Draft
  const deleteDraft = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !formState.draftId) return;

    try {
      await supabase
        .from('listing_drafts')
        .delete()
        .eq('id', formState.draftId);
      
      console.log('🗑️ Draft deleted:', formState.draftId);
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  }, [formState.draftId]);

  // Start New Listing (reset form)
  const startNewListing = useCallback(() => {
    setFormState({
      currentStep: 1,
      draftId: null,
      category: null,
      title: '',
      description: '',
      price: null,
      currency: 'EUR',
      location: '',
      metadata: {},
      contactEmail: userEmail,
      contactPhone: '',
      contactName: '',
      images: [],
      imageFiles: [],
      coverImageIndex: 0,
      isDirty: false,
      isSaving: false,
      autoSaveStatus: 'idle',
      lastSaved: null,
      validationErrors: {},
    });
    setHasDraft(false);
  }, [userEmail]);

  // Context Value
  const contextValue: ListingFormContextValue = {
    formState,
    isLoadingDraft,
    hasDraft,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoBack,
    isLastStep,
    updateCategory,
    updateField,
    updateMetadata,
    addImages,
    removeImage,
    setCoverImage,
    saveDraft,
    submitListing,
    deleteDraft,
    startNewListing,
    validateCurrentStep,
    clearErrors,
  };

  return (
    <ListingFormContext.Provider value={contextValue}>
      {children}
    </ListingFormContext.Provider>
  );
}

// Hook to use context
export function useListingForm() {
  const context = useContext(ListingFormContext);
  if (!context) {
    throw new Error('useListingForm must be used within ListingFormProvider');
  }
  return context;
}

