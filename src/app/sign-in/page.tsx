"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Header } from "@/components/Header";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("❌ Database-Verbindung fehlgeschlagen");
        setLoading(false);
        return;
      }

      console.log('Attempting sign in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      console.log('Sign in result:', { data, error });

      if (error) {
        console.error('Sign in error:', error);
        if (error.message.includes('email not confirmed')) {
          setError(`📧 E-Mail noch nicht bestätigt!\n\nBitte überprüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den Bestätigungslink.`);
        } else {
          setError(`❌ ${error.message}`);
        }
        setLoading(false);
      } else if (data.user) {
        // Check if email is confirmed
        if (data.user.email_confirmed_at === null) {
          setError(`📧 E-Mail noch nicht bestätigt!\n\nBitte überprüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den Bestätigungslink.`);
          setLoading(false);
          return;
        }
        
        console.log('Sign in successful, redirecting to dashboard');
        setError("✅ Anmeldung erfolgreich! Weiterleitung...");
        
        // Small delay to show success message
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setError("❌ Unbekannter Fehler bei der Anmeldung");
        setLoading(false);
      }
    } catch (err) {
      console.error('Sign in exception:', err);
      setError(`❌ Unerwarteter Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  return (
    <main>
      <Header />
      
      <div className="section padded light">
        <div className="container">
          <div className="signin-container">
            <div className="signin-card">
              <h1 className="section-title">Bei Ihrem Konto anmelden</h1>
              <p className="lead">
                Oder{' '}
                <button
                  onClick={handleSignUp}
                  className="link-button"
                >
                  neues Konto erstellen
                </button>
              </p>

              <form className="signin-form" onSubmit={handleSignIn}>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    E-Mail-Adresse
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="Ihre E-Mail-Adresse eingeben"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Passwort
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="Ihr Passwort eingeben"
                  />
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary full-width"
                >
                  {loading ? "Anmelden..." : "Anmelden"}
                </button>
              </form>

              <div className="demo-section">
                <div className="divider">
                  <span>Demo-Konto</span>
                </div>

                <button
                  onClick={() => {
                    setEmail("demo@assero.com");
                    setPassword("demo123");
                  }}
                  className="btn-secondary full-width"
                >
                  Demo-Konto verwenden
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
