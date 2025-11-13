"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Header } from "@/components/Header";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [confirmedMessage, setConfirmedMessage] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user just confirmed their email
    const confirmed = searchParams.get("confirmed");
    if (confirmed === "true") {
      setConfirmedMessage("✅ E-Mail erfolgreich bestätigt! Sie können sich jetzt anmelden.");
    }
  }, [searchParams]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      
      if (!supabase) {
        throw new Error("Supabase Client konnte nicht initialisiert werden. Bitte prüfen Sie die Umgebungsvariablen.");
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user email is confirmed
      if (data.user && !data.user.email_confirmed_at) {
        setStatus("error");
        setMessage("Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Prüfen Sie Ihr E-Mail-Postfach.");
        return;
      }

      // Success - redirect to dealroom (not dashboard)
      router.push("/dealroom");
      
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setStatus("error");
      setMessage(err?.message ?? "Fehler bei der Anmeldung");
    }
  }

  return (
    <main style={{ backgroundColor: "#f4f7fa", minHeight: "100vh" }}>
      <Header />
      
      <div style={{ padding: "48px 0" }}>
        <div className="container">
          <div className="auth-container">
            <div className="auth-card">
              <h1 className="auth-title">Anmelden</h1>
              <p className="auth-subtitle">
                Melden Sie sich mit Ihrem ASSERO-Konto an.
              </p>

              {confirmedMessage && (
                <div className="alert alert-success">
                  <p>{confirmedMessage}</p>
                </div>
              )}

              <form onSubmit={onSubmit} className="auth-form">
                <div className="form-grid">
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
                  
                  <div className="form-group full-width">
                    <label className="form-label">Passwort *</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      placeholder="Ihr Passwort"
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
                    {status === "loading" ? "Melde an..." : "Anmelden"}
                  </button>
                </div>

                <div className="auth-footer">
                  <p>
                    Noch kein Konto? <a href="/register" className="text-blue-600 underline">Hier registrieren</a>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <a href="#" className="text-blue-600 underline">Passwort vergessen?</a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}


