"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Header } from "@/components/Header";

export default function ConfirmPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    async function confirmEmail() {
      try {
        const supabase = getSupabaseBrowserClient();
        
        // Get the code from URL params using window.location
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        
        if (!code) {
          throw new Error("Bestätigungslink ist ungültig oder unvollständig.");
        }

        // Use the correct method for email confirmation with PKCE
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: code,
          type: 'signup'
        });

        if (error) {
          // Check if it's an expired/invalid code error
          if (error.message.includes('invalid') || error.message.includes('expired')) {
            // Try to get current session to see if user is already confirmed
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session?.user?.email_confirmed_at) {
              // User is already confirmed, redirect to dashboard
              setStatus("success");
              setMessage("Ihre E-Mail-Adresse wurde bereits bestätigt! Sie werden zum Dashboard weitergeleitet.");
              setTimeout(() => {
                router.push("/dashboard");
              }, 2000);
              return;
            }
          }
          throw error;
        }

        // Create user role and profile if they don't exist
        if (data.user) {
          const userType = data.user.user_metadata?.user_type || 'buyer';
          const firstName = data.user.user_metadata?.first_name || '';
          const lastName = data.user.user_metadata?.last_name || '';
          
          console.log('Creating user role and profile for:', data.user.id, 'Type:', userType);
          
          // Create user role
          const { error: roleError } = await supabase
            .from('user_roles')
            .upsert({
              user_id: data.user.id,
              role_type: userType,
              is_primary_role: true
            }, {
              onConflict: 'user_id,is_primary_role'
            });

          if (roleError) {
            console.error("Role creation error:", roleError);
            // Don't throw - continue to create profile
          }

          // Create buyer or seller profile based on user type
          if (userType === 'buyer') {
            const { error: profileError } = await supabase
              .from('buyer_profiles')
              .upsert({
                user_id: data.user.id,
                contact_person: `${firstName} ${lastName}`.trim() || 'Unbekannt',
                verification_status: 'pending'
              }, {
                onConflict: 'user_id'
              });

            if (profileError) {
              console.error("Buyer profile creation error:", profileError);
            }
          } else if (userType === 'seller') {
            const { error: profileError } = await supabase
              .from('seller_profiles')
              .upsert({
                user_id: data.user.id,
                company_name: 'Nicht angegeben',
                contact_person: `${firstName} ${lastName}`.trim() || 'Unbekannt',
                verification_status: 'pending'
              }, {
                onConflict: 'user_id'
            });

          if (profileError) {
              console.error("Seller profile creation error:", profileError);
            }
          }
        }

        setStatus("success");
        setMessage("Ihre E-Mail-Adresse wurde erfolgreich bestätigt! Sie können sich jetzt anmelden.");
        
        // Get redirect target from URL params (if provided by registration flow)
        const redirectTo = urlParams.get("redirect_to") || "/dealroom";
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push(redirectTo);
        }, 2000);

      } catch (err: any) {
        console.error("Email confirmation error:", err);
        setStatus("error");
        setMessage(err?.message ?? "Fehler bei der E-Mail-Bestätigung");
      }
    }

    confirmEmail();
  }, [router]);

  return (
    <main style={{ backgroundColor: "#f4f7fa", minHeight: "100vh" }}>
      <Header />
      
      <div style={{ padding: "48px 0" }}>
        <div className="container">
          <div className="auth-container">
            <div className="auth-card">
              <h1 className="auth-title">E-Mail-Bestätigung</h1>
              
              {status === "loading" && (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Bestätige Ihre E-Mail-Adresse...</p>
                </div>
              )}

              {status === "success" && (
                <div className="alert alert-success">
                  <div className="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"/>
                      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                    </svg>
                  </div>
                  <h3>Bestätigung erfolgreich!</h3>
                  <p>{message}</p>
                  <p>Sie werden automatisch zu Ihrem Dashboard weitergeleitet...</p>
                  <div className="auth-actions">
                    <a href="/dashboard" className="btn-primary">Zum Dashboard</a>
                    <a href="/" className="btn-secondary">Zur Startseite</a>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="alert alert-error">
                  <div className="error-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <h3>Bestätigung fehlgeschlagen</h3>
                  <p>{message}</p>
                  <div className="auth-actions">
                    <a href="/register" className="btn-primary">Neu registrieren</a>
                    <a href="/sign-in" className="btn-secondary">Anmelden</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
