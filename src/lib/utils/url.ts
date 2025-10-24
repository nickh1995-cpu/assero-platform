/**
 * URL utility functions for handling different environments
 */

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    return window.location.origin;
  }
  
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://assero.io';
}

export function getApiUrl(): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/api`;
}

export function getAuthCallbackUrl(): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/auth/callback`;
}

export function isProduction(): boolean {
  if (typeof window !== 'undefined') {
    return !window.location.hostname.includes('localhost');
  }
  
  return process.env.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  if (typeof window !== 'undefined') {
    return window.location.hostname.includes('localhost');
  }
  
  return process.env.NODE_ENV === 'development';
}
