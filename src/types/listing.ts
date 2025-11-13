/**
 * ASSERO LISTING SYSTEM - Core Type Definitions
 * Phase 1.2: Main Listing Types
 */

import type { 
  AssetStatus, 
  Currency, 
  AssetMetadata,
  RealEstateMetadata,
  VehicleMetadata,
  WatchMetadata
} from './listing-metadata';

// ===============================================
// CORE ASSET/LISTING TYPES
// ===============================================

/**
 * Main Asset/Listing interface
 * Represents a listing in the database
 */
export interface Asset {
  id: string;
  
  // Basic Info
  title: string;
  description: string | null;
  category_id: string;
  
  // Pricing
  price: number;
  currency: Currency;
  
  // Location
  location: string | null;
  
  // Metadata (category-specific)
  metadata: AssetMetadata;
  
  // User-Generated Fields
  created_by: string | null;          // User ID (NULL for admin-created)
  status: AssetStatus;
  
  // Images
  images: string[] | null;            // Array of image URLs
  
  // Contact
  contact_email: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  
  // Stats
  views_count: number;
  favorites_count: number;
  is_featured: boolean;
  
  // Timestamps
  created_at: string;                 // ISO date
  updated_at: string;                 // ISO date
  submitted_at: string | null;        // ISO date
  published_at: string | null;        // ISO date
  rejected_at: string | null;         // ISO date
  rejection_reason: string | null;
}

/**
 * Listing Draft (for auto-save)
 * Stored in listing_drafts table
 */
export interface ListingDraft {
  id: string;
  user_id: string;
  asset_id: string | null;           // NULL for new listings
  
  // Wizard State
  current_step: 1 | 2 | 3 | 4;
  
  // Category Selection (Step 1)
  category_id: string | null;
  
  // Basic Info (Step 2)
  title: string | null;
  description: string | null;
  price: number | null;
  currency: Currency;
  location: string | null;
  
  // Metadata (Step 2 - category-specific)
  metadata: Partial<AssetMetadata>;
  
  // Images (Step 3)
  images: string[] | null;
  
  // Contact Info
  contact_email: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  
  // State
  is_complete: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  last_saved_at: string;
}

/**
 * User Favorite/Watchlist
 */
export interface UserFavorite {
  id: string;
  user_id: string;
  asset_id: string;
  created_at: string;
}

/**
 * Listing View (Analytics)
 */
export interface ListingView {
  id: string;
  asset_id: string;
  user_id: string | null;            // NULL for anonymous
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  created_at: string;
}

/**
 * Asset Category
 */
export interface AssetCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

/**
 * User Listings Summary (from view)
 */
export interface UserListingSummary {
  id: string;
  title: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  price: number;
  currency: Currency;
  location: string | null;
  status: AssetStatus;
  status_label: string;              // Localized status
  created_by: string;
  views_count: number;
  favorites_count: number;
  images_count: number;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  published_at: string | null;
}

// ===============================================
// FORM DATA TYPES (for UI)
// ===============================================

/**
 * Wizard Step Enum
 */
export enum WizardStep {
  CATEGORY = 1,
  DETAILS = 2,
  IMAGES = 3,
  PREVIEW = 4,
}

/**
 * Form State for Listing Creation
 */
export interface ListingFormState {
  // Wizard
  currentStep: WizardStep;
  draftId: string | null;
  
  // Category
  category: AssetCategory | null;
  
  // Basic Info
  title: string;
  description: string;
  price: number | null;
  currency: Currency;
  location: string;
  
  // Metadata
  metadata: Partial<AssetMetadata>;
  
  // Images
  images: File[] | string[];         // Files or URLs
  coverImageIndex: number;
  
  // Contact
  contactEmail: string;
  contactPhone: string;
  contactName: string;
  
  // State
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  validationErrors: Record<string, string>;
}

// ===============================================
// API RESPONSE TYPES
// ===============================================

/**
 * Generic API Response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Listing Creation Response
 */
export interface CreateListingResponse {
  success: boolean;
  listingId?: string;
  draftId?: string;
  message?: string;
  error?: string;
}

/**
 * Image Upload Response
 */
export interface ImageUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Validation Response
 */
export interface ValidationResponse {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

// ===============================================
// FILTER & SEARCH TYPES
// ===============================================

/**
 * Listing Filters (for Browse/Search)
 */
export interface ListingFilters {
  category?: string;                 // Category slug
  status?: AssetStatus[];
  minPrice?: number;
  maxPrice?: number;
  currency?: Currency;
  location?: string;
  
  // Sorting
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'views' | 'favorites';
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Search
  query?: string;
}

/**
 * My Listings Filters
 */
export interface MyListingsFilters {
  status?: AssetStatus | 'all';
  category?: string;
  sortBy?: 'newest' | 'oldest' | 'views' | 'favorites';
}

// ===============================================
// UTILITY TYPES
// ===============================================

/**
 * Partial Asset for Updates
 */
export type AssetUpdate = Partial<Omit<Asset, 'id' | 'created_at' | 'created_by'>>;

/**
 * Status Labels (for UI)
 */
export const STATUS_LABELS: Record<AssetStatus, string> = {
  draft: 'Entwurf',
  pending_review: 'In Prüfung',
  active: 'Aktiv',
  inactive: 'Inaktiv',
  rejected: 'Abgelehnt',
};

/**
 * Status Colors (for UI)
 */
export const STATUS_COLORS: Record<AssetStatus, string> = {
  draft: '#6b7280',       // Gray
  pending_review: '#f59e0b', // Amber
  active: '#10b981',      // Green
  inactive: '#6b7280',    // Gray
  rejected: '#ef4444',    // Red
};

// ===============================================
// TYPE EXPORTS
// ===============================================

export type {
  // Re-export metadata types for convenience
  AssetStatus,
  Currency,
  AssetMetadata,
  RealEstateMetadata,
  VehicleMetadata,
  WatchMetadata,
} from './listing-metadata';

