/**
 * ASSERO IMAGE UPLOAD SERVICE
 * Phase 6.2: Supabase Storage Integration
 */

import { getSupabaseBrowserClient } from './supabase/client';

// =====================================================
// TYPES
// =====================================================

export interface UploadProgress {
  filename: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// =====================================================
// VALIDATION
// =====================================================

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function validateImageFile(file: File): string | null {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return `Dateityp nicht erlaubt: ${file.type}. Nur JPG, PNG und WebP sind erlaubt.`;
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return `Datei zu groß: ${sizeMB}MB. Maximal 5MB erlaubt.`;
  }

  return null; // Valid
}

// =====================================================
// UPLOAD SINGLE IMAGE
// =====================================================

export async function uploadListingImage(
  file: File,
  userId: string,
  listingId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client nicht verfügbar' };
  }

  try {
    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      return { success: false, error: validationError };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${userId}/${listingId}/${timestamp}.${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: `Upload fehlgeschlagen: ${error.message}` };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('listing-images')
      .getPublicUrl(data.path);

    if (onProgress) {
      onProgress(100);
    }

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error: any) {
    console.error('Unexpected upload error:', error);
    return { success: false, error: error.message || 'Unbekannter Fehler' };
  }
}

// =====================================================
// UPLOAD MULTIPLE IMAGES
// =====================================================

export async function uploadListingImages(
  files: File[],
  userId: string,
  listingId: string,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    const result = await uploadListingImage(
      file,
      userId,
      listingId,
      (progress) => onProgress?.(i, progress)
    );

    if (result.success && result.url) {
      urls.push(result.url);
    } else {
      errors.push(`${file.name}: ${result.error || 'Upload fehlgeschlagen'}`);
    }
  }

  return { urls, errors };
}

// =====================================================
// DELETE IMAGE
// =====================================================

export async function deleteListingImage(
  imageUrl: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client nicht verfügbar' };
  }

  try {
    // Extract path from URL
    // URL format: https://{project}.supabase.co/storage/v1/object/public/listing-images/{path}
    const urlParts = imageUrl.split('/listing-images/');
    if (urlParts.length < 2) {
      return { success: false, error: 'Ungültige Bild-URL' };
    }

    const filePath = urlParts[1];

    // Verify user owns this image (path starts with userId)
    if (!filePath.startsWith(userId)) {
      return { success: false, error: 'Keine Berechtigung, dieses Bild zu löschen' };
    }

    // Delete from storage
    const { error } = await supabase.storage
      .from('listing-images')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: `Löschen fehlgeschlagen: ${error.message}` };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected delete error:', error);
    return { success: false, error: error.message || 'Unbekannter Fehler' };
  }
}

// =====================================================
// GENERATE THUMBNAIL (Optional - for future enhancement)
// =====================================================

/**
 * Compress and resize image before upload
 * Can be used to generate thumbnails for faster loading
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if needed
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Komprimierung fehlgeschlagen'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
    reader.readAsDataURL(file);
  });
}

