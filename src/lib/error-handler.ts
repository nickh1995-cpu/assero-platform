// Error handling utilities for robust runtime behavior

export function safeCall<T>(
  fn: () => T,
  fallback: T,
  errorMessage?: string
): T {
  try {
    return fn();
  } catch (error) {
    if (errorMessage) {
      console.warn(errorMessage, error);
    }
    return fallback;
  }
}

export async function safeAsyncCall<T>(
  fn: () => Promise<T>,
  fallback: T,
  errorMessage?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (errorMessage) {
      console.warn(errorMessage, error);
    }
    return fallback;
  }
}

export function safeFormatPrice(
  price: number | null | undefined,
  currency: string | null | undefined
): string {
  if (!price) return "Preis auf Anfrage";
  
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency || "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  } catch (error) {
    console.warn("Error formatting price:", error);
    return `${price} ${currency || "EUR"}`;
  }
}

export function safeGetImageSrc(asset: any): string | null {
  try {
    // Check for images array first
    if (asset?.images && Array.isArray(asset.images) && asset.images.length > 0) {
      const primaryImage = asset.images.find((img: any) => img?.is_primary) || asset.images[0];
      return primaryImage?.url || null;
    }
    
    // Check metadata image
    if (asset?.metadata?.image && typeof asset.metadata.image === 'string' && !asset.metadata.image.includes("/api/image-proxy")) {
      return asset.metadata.image;
    }
    
    // Fallback to title-based logic
    const title = asset?.title?.toLowerCase() || '';
    if (title.includes("penthouse") || title.includes("gendarmenmarkt")) {
      return "/images/assets/penthouse-NEW.jpg";
    } else if (title.includes("porsche") || title.includes("911")) {
      return "/images/assets/100900_Marco-Porsche-992-Turbo-S_6_klein.webp";
    } else if (title.includes("rolex") || title.includes("submariner")) {
      return "/images/assets/rolex-submariner-NEW.jpg";
    } else if (title.includes("eigentum") || title.includes("neubau")) {
      return "/images/assets/eigentumswohnung-NEW.jpg";
    } else if (title.includes("altbau")) {
      return "/images/assets/altbau-wohnung-NEW.jpg";
    } else if (title.includes("eppendorf") || title.includes("reihenhaus")) {
      return "/images/assets/eppendorf-stadhaus-NEW.jpg";
    } else if (title.includes("frankfurt") || title.includes("bürogebäude")) {
      return "/images/assets/schillerportal-frankfurt-NEW.jpg";
    }
    
    return null;
  } catch (error) {
    console.warn("Error getting image source:", error);
    return null;
  }
}

export function validateAsset(asset: any): boolean {
  return asset && 
         typeof asset === 'object' && 
         asset.id && 
         typeof asset.id === 'string' &&
         asset.title && 
         typeof asset.title === 'string';
}

export function validateCategorySlug(slug: any): boolean {
  return slug && 
         typeof slug === 'string' && 
         slug.length > 0;
}
