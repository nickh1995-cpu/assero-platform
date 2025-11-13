"use client";

import { createBrowserClient, type SupabaseClient } from "@supabase/ssr";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  // Return cached client if available
  if (browserClient) return browserClient;
  
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    console.warn("getSupabaseBrowserClient called on server-side - returning null");
    return null;
  }
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Validate URL and key
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase configuration:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
      });
      return null;
    }
    
    console.log("Creating Supabase browser client with cookie handling...");
    
    // Create client with proper cookie handling for SSR
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          try {
            return document.cookie.split(';').map(cookie => {
              const [name, ...rest] = cookie.split('=');
              return { name: name.trim(), value: rest.join('=') };
            }).filter(c => c.name);
          } catch (e) {
            console.warn('Error reading cookies:', e);
            return [];
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              let cookieString = `${name}=${value}`;
              if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`;
              if (options?.path) cookieString += `; path=${options.path || '/'}`;
              if (options?.domain) cookieString += `; domain=${options.domain}`;
              if (options?.sameSite) {
                const sameSite = options.sameSite.toLowerCase();
                cookieString += `; samesite=${sameSite}`;
              }
              if (options?.secure) cookieString += `; secure`;
              // Note: httpOnly cannot be set from JavaScript
              document.cookie = cookieString;
              console.log(`Cookie set: ${name} (path: ${options?.path || '/'})`);
            });
          } catch (e) {
            console.warn('Error setting cookies:', e);
          }
        },
      },
    });
    
    return browserClient;
  } catch (error) {
    console.warn("Error creating Supabase browser client:", error);
    return null;
  }
}


