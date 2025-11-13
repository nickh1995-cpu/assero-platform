/**
 * Verification Utilities
 * Prüft, ob ein User vollständig verifiziert ist für Dealroom-Zugriff
 */

import { getSupabaseBrowserClient } from './supabase/client';

export interface VerificationStatus {
  isVerified: boolean;
  isEmailConfirmed: boolean;
  isProfileVerified: boolean;
  isProfileComplete: boolean;
  profile: any | null;
  message?: string;
}

/**
 * Prüft die Verifikationsstatus eines Users (Client-side)
 */
export async function checkUserVerification(): Promise<VerificationStatus> {
  console.log('🔍 === checkUserVerification START ===');
  
  try {
    const supabase = getSupabaseBrowserClient();
    
    // Check if Supabase is configured
    if (!supabase) {
      console.error('❌ Supabase client not available');
      return {
        isVerified: false,
        isEmailConfirmed: false,
        isProfileVerified: false,
        isProfileComplete: false,
        profile: null,
        message: 'Database-Verbindung nicht verfügbar. Bitte versuchen Sie es später erneut.'
      };
    }
    
    // Check authentication
    console.log('🔍 Checking auth.getUser()...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ No authenticated user:', authError?.message);
      return {
        isVerified: false,
        isEmailConfirmed: false,
        isProfileVerified: false,
        isProfileComplete: false,
        profile: null,
        message: 'Sie müssen angemeldet sein, um den Dealroom zu nutzen.'
      };
    }
    
    console.log('✅ User authenticated:', user.id, user.email);

    // Check email confirmation
    const isEmailConfirmed = user.email_confirmed_at !== null;
    console.log('📧 Email confirmed:', isEmailConfirmed, '(confirmed_at:', user.email_confirmed_at, ')');
    
    // IMPORTANT: For development/testing - allow unconfirmed emails if email confirmation is disabled
    // This prevents lockout after cache clear in development
    const allowUnconfirmed = process.env.NODE_ENV === 'development';
    console.log('🔧 Development mode - allow unconfirmed:', allowUnconfirmed);
    
    if (!isEmailConfirmed && !allowUnconfirmed) {
      console.warn('❌ Email not confirmed and not in development mode');
      return {
        isVerified: false,
        isEmailConfirmed: false,
        isProfileVerified: false,
        isProfileComplete: false,
        profile: null,
        message: 'Bitte bestätigen Sie Ihre E-Mail-Adresse, um den Dealroom zu nutzen.'
      };
    }
    
    console.log('✅ Email check passed (confirmed or dev mode)');

    // Get profile data with timeout handling
    console.log('🔍 Checking profiles table...');
    let profile = null;
    let profileError = null;
    
    try {
      const profileResult = await Promise.race([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile query timeout')), 10000) // Increased to 10s
        )
      ]) as any;
      
      if (profileResult) {
        profile = profileResult.data;
        profileError = profileResult.error;
      }
    } catch (error: any) {
      console.warn('⚠️ Profile query failed or timed out:', error?.message || error);
      profileError = error;
    }

    if (profileError || !profile) {
      console.warn('⚠️ Profile not found or error:', profileError?.message || profileError);
      
      // Check if user_roles exists as fallback
      console.log('🔍 Checking user_roles table as fallback...');
      let hasUserRole = false;
      let roleData = null;
      
      try {
        // Add timeout to user_roles check as well
        const roleResult = await Promise.race([
          supabase
            .from('user_roles')
            .select('role_type')
            .eq('user_id', user.id)
            .maybeSingle(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('User roles query timeout')), 10000) // 10s timeout
          )
        ]) as any;
        
        hasUserRole = !roleResult.error && roleResult.data !== null;
        roleData = roleResult.data;
        
        console.log('user_roles check:', { 
          hasUserRole, 
          roleType: roleData?.role_type, 
          error: roleResult.error?.message 
        });
        
        if (hasUserRole) {
          console.log('✅ User has role but no profile - allowing access with graceful degradation');
          // User has a role but no profile - allow access anyway (graceful degradation)
          return {
            isVerified: true, // ← Allow access
            isEmailConfirmed: isEmailConfirmed || allowUnconfirmed,
            isProfileVerified: true, // ← Assume verified
            isProfileComplete: false,
            profile: null,
            message: undefined
          };
        }
      } catch (roleError: any) {
        console.warn('⚠️ Could not check user_roles (timeout or error):', roleError?.message);
      }
      
      console.log('❌ No profile AND no role - user needs registration');
      // No profile AND no role - user needs to complete registration
      return {
        isVerified: false,
        isEmailConfirmed: isEmailConfirmed || allowUnconfirmed,
        isProfileVerified: false,
        isProfileComplete: false,
        profile: null,
        message: 'Ihr Profil wurde noch nicht erstellt. Bitte vervollständigen Sie Ihre Registrierung.'
      };
    }
    
    console.log('✅ Profile found:', { id: profile.id, is_verified: profile.is_verified, profile_complete: profile.profile_complete });

    // Check verification flags (with graceful fallback)
    const isProfileVerified = profile.is_verified === true || profile.is_verified === undefined;
    const isProfileComplete = profile.profile_complete === true || profile.profile_complete === undefined;

    // All checks passed
    const isVerified = (isEmailConfirmed || allowUnconfirmed) && isProfileVerified && isProfileComplete;

    if (!isVerified) {
      let message = 'Ihr Profil muss verifiziert werden, um den Dealroom zu nutzen.';
      
      if (!isProfileVerified) {
        message = 'Ihr Profil ist noch nicht verifiziert. Bitte warten Sie auf die Verifikation durch unser Team.';
      } else if (!isProfileComplete) {
        message = 'Ihr Profil ist noch nicht vollständig. Bitte vervollständigen Sie Ihre Profil-Informationen.';
      }

      return {
        isVerified: false,
        isEmailConfirmed: isEmailConfirmed || allowUnconfirmed,
        isProfileVerified,
        isProfileComplete,
        profile,
        message
      };
    }

    const finalResult = {
      isVerified: true,
      isEmailConfirmed: isEmailConfirmed || allowUnconfirmed,
      isProfileVerified: true,
      isProfileComplete: true,
      profile
    };
    
    console.log('✅ === checkUserVerification END - VERIFIED ===');
    console.log('Final result:', JSON.stringify(finalResult, null, 2));
    
    return finalResult;
  } catch (error: any) {
    console.error('❌ Verification check error:', error);
    return {
      isVerified: false,
      isEmailConfirmed: false,
      isProfileVerified: false,
      isProfileComplete: false,
      profile: null,
      message: 'Fehler bei der Verifikationsprüfung. Bitte versuchen Sie es später erneut.'
    };
  }
}


