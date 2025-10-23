"use client";

import { useState } from "react";
import { Header } from "@/components/Header";

export default function TestEmailPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function testEmail() {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(`✅ Test-E-Mail erfolgreich gesendet an ${email}!`);
      } else {
        setStatus("error");
        setMessage(`❌ Fehler: ${data.error}`);
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(`❌ Netzwerk-Fehler: ${error.message}`);
    }
  }

  async function checkConfig() {
    try {
      const response = await fetch("/api/test-email");
      const data = await response.json();
      
      setMessage(`Konfiguration: ${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      setMessage(`Konfigurations-Fehler: ${error.message}`);
    }
  }

  return (
    <main style={{ backgroundColor: "#f4f7fa", minHeight: "100vh" }}>
      <Header />
      
      <div style={{ padding: "48px 0" }}>
        <div className="container">
          <div className="auth-container">
            <div className="auth-card">
              <h1 className="auth-title">E-Mail-Test</h1>
              <p className="auth-subtitle">
                Teste die Supabase E-Mail-Konfiguration
              </p>

              <div className="form-group">
                <label className="form-label">E-Mail-Adresse zum Testen</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="test@example.com"
                />
              </div>

              <div className="form-actions">
                <button
                  onClick={testEmail}
                  disabled={status === "loading" || !email}
                  className="btn-primary btn-large"
                >
                  {status === "loading" ? "Teste..." : "E-Mail senden"}
                </button>
                
                <button
                  onClick={checkConfig}
                  className="btn-secondary btn-large"
                >
                  Konfiguration prüfen
                </button>
              </div>

              {message && (
                <div className={`alert ${status === "success" ? "alert-success" : "alert-error"}`}>
                  <pre style={{ whiteSpace: "pre-wrap", fontSize: "14px" }}>
                    {message}
                  </pre>
                </div>
              )}

              <div className="auth-footer">
                <h3>Debugging-Informationen:</h3>
                <ul style={{ textAlign: "left", fontSize: "14px" }}>
                  <li><strong>Site URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</li>
                  <li><strong>Confirm URL:</strong> {typeof window !== 'undefined' ? `${window.location.origin}/confirm` : 'N/A'}</li>
                  <li><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Konfiguriert" : "❌ Fehlt"}</li>
                </ul>
                
                <h3>Nächste Schritte:</h3>
                <ol style={{ textAlign: "left", fontSize: "14px" }}>
                  <li>1. E-Mail-Adresse eingeben und "E-Mail senden" klicken</li>
                  <li>2. E-Mail-Postfach prüfen (auch Spam-Ordner)</li>
                  <li>3. Falls keine E-Mail ankommt: Supabase SMTP konfigurieren</li>
                  <li>4. In Supabase Dashboard: Authentication → Settings → Email</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
