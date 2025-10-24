"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Header } from "@/components/Header";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (password !== confirmPassword) {
      setError("❌ Passwörter stimmen nicht überein");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("❌ Passwort muss mindestens 6 Zeichen lang sein");
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("❌ Database-Verbindung fehlgeschlagen");
        setLoading(false);
        return;
      }

      console.log('Attempting registration with:', { email, firstName, lastName });
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      console.log('Registration result:', { data, error });

      if (error) {
        console.error('Registration error:', error);
        setError(`❌ ${error.message}`);
        setLoading(false);
      } else if (data.user) {
        console.log('Registration successful');
        setSuccess("✅ Account erstellt! Bitte prüfen Sie Ihre E-Mail für den Bestätigungslink.");
        // Clear form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFirstName("");
        setLastName("");
        setLoading(false);
      } else {
        setError("❌ Unbekannter Fehler bei der Registrierung");
        setLoading(false);
      }
    } catch (err) {
      console.error('Registration exception:', err);
      setError(`❌ Unerwarteter Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
      setLoading(false);
    }
  };

  return (
    <main>
      <Header />
      
      <div className="section padded light">
        <div className="container">
          <div className="signin-container">
            <div className="signin-card">
              <h1 className="section-title">Neues Konto erstellen</h1>
              <p className="lead">
                Bereits ein Konto?{' '}
                <button
                  onClick={() => router.push('/sign-in')}
                  className="link-button"
                >
                  Hier anmelden
                </button>
              </p>

              <form className="signin-form" onSubmit={handleRegister}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">
                      Vorname
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="form-input"
                      placeholder="Ihr Vorname"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">
                      Nachname
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="form-input"
                      placeholder="Ihr Nachname"
                    />
                  </div>
                </div>

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
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="Mindestens 6 Zeichen"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Passwort bestätigen
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    placeholder="Passwort wiederholen"
                  />
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="success-message">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary full-width"
                >
                  {loading ? "Erstelle Konto..." : "Konto erstellen"}
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
                    setConfirmPassword("demo123");
                    setFirstName("Demo");
                    setLastName("User");
                  }}
                  className="btn-secondary full-width"
                >
                  Demo-Daten verwenden
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
