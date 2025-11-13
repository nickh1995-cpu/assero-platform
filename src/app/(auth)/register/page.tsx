"use client";

import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Header } from "@/components/Header";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    // Validation
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwörter stimmen nicht überein.");
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setMessage("Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      
      // Register user with email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/confirm`,
        },
      });

      if (error) throw error;

      if (data.user && !data.user.email_confirmed_at) {
        setStatus("success");
        setMessage("Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse durch Klicken auf den Link in der E-Mail.");
      } else {
        setStatus("error");
        setMessage("Ein unerwarteter Fehler ist aufgetreten.");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message ?? "Fehler bei der Registrierung");
    }
  }

  return (
    <main style={{ backgroundColor: "#f4f7fa", minHeight: "100vh" }}>
      <Header />
      
      <div style={{ padding: "48px 0" }}>
        <div className="container">
          <div className="auth-container">
            <div className="auth-card">
              <h1 className="auth-title">Registrierung</h1>
              <p className="auth-subtitle">
                Erstellen Sie Ihr ASSERO-Konto und starten Sie mit der Inserierung Ihrer Assets.
              </p>

              {status === "success" && (
                <div className="alert alert-success">
                  <h3>Registrierung erfolgreich!</h3>
                  <p>Bitte bestätigen Sie Ihre E-Mail-Adresse durch Klicken auf den Link in der E-Mail, die wir Ihnen gesendet haben.</p>
                  <p>Nach der Bestätigung können Sie sich <a href="/sign-in" className="text-blue-600 underline">hier anmelden</a>.</p>
                </div>
              )}

              {status !== "success" && (
                <form onSubmit={onSubmit} className="auth-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Vorname *</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="form-input"
                        placeholder="Max"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Nachname *</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="form-input"
                        placeholder="Mustermann"
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label className="form-label">E-Mail-Adresse *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        placeholder="max.mustermann@email.com"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Passwort *</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                        placeholder="Mindestens 6 Zeichen"
                        minLength={6}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Passwort bestätigen *</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-input"
                        placeholder="Passwort wiederholen"
                        minLength={6}
                      />
                    </div>
                  </div>

                  {status === "error" && (
                    <div className="alert alert-error">
                      <p>{message}</p>
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="btn-primary btn-large"
                    >
                      {status === "loading" ? "Registriere..." : "Konto erstellen"}
                    </button>
                  </div>

                  <div className="auth-footer">
                    <p>
                      Bereits registriert? <a href="/sign-in" className="text-blue-600 underline">Hier anmelden</a>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
