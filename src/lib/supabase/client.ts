"use client";

import { createBrowserClient, type SupabaseClient } from "@supabase/ssr";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  // Return cached client if available
  if (browserClient) return browserClient;
  
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Validate URL and key
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Missing Supabase configuration");
      return null;
    }
    
    console.log("Creating Supabase browser client...");
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
    return browserClient;
  } catch (error) {
    console.warn("Error creating Supabase browser client:", error);
    return null;
  }
}


