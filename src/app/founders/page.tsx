"use client";

import { useState, FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function FoundersForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get("email") || ""),
      first_name: String(form.get("firstName") || ""),
      last_name: String(form.get("lastName") || ""),
      company: String(form.get("company") || ""),
      role: String(form.get("role") || "other"),
      motivation: String(form.get("motivation") || ""),
      source: "founders_form",
    };
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("founders_applications")
        .insert(payload);
      if (error) throw error;
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setStatus("error");
      setError(err?.message ?? "Fehler beim Senden der Bewerbung");
    }
  }

  return (
    <main id="contact" className="section cta light">
      <div className="container">
        <h2 className="section-title">Founders Circle bewerben.</h2>
        <p className="lead">Bewerben Sie sich für einen der letzten Plätze.</p>

        <form className="founders-form" onSubmit={onSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Vorname *</label>
              <input id="firstName" name="firstName" required placeholder="Ihr Vorname" />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Nachname *</label>
              <input id="lastName" name="lastName" required placeholder="Ihr Nachname" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">E‑Mail *</label>
              <input id="email" name="email" type="email" required placeholder="Ihre E‑Mail" />
            </div>
            <div className="form-group">
              <label htmlFor="company">Unternehmen</label>
              <input id="company" name="company" placeholder="Ihr Unternehmen" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="role">Position/Rolle *</label>
            <select id="role" name="role" required defaultValue="">
              <option value="" disabled>
                Bitte wählen
              </option>
              <option value="entrepreneur">Unternehmer/in</option>
              <option value="investor">Investor/Family Office</option>
              <option value="broker">Makler/Berater</option>
              <option value="advisor">Berater</option>
              <option value="other">Sonstiges</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="motivation">Warum möchten Sie im Founders Circle dabei sein? *</label>
            <textarea id="motivation" name="motivation" required rows={4} placeholder="Beschreiben Sie Ihre Motivation und Ziele..." />
          </div>
          <button type="submit" className="founders-submit" disabled={status === "loading"}>
            {status === "loading" ? "Sende…" : "Bewerbung absenden"}
          </button>
        </form>

        {status === "success" && (
          <div role="status" className="success-message" aria-live="polite">
            <div className="success-content">
              <div className="success-icon">✓</div>
              <h4>Vielen Dank!</h4>
              <p>Wir melden uns innerhalb von 24 Stunden.</p>
            </div>
          </div>
        )}
        {status === "error" && (
          <div role="alert" className="error-message">
            <div className="error-content">
              <div className="error-icon">!</div>
              <h4>Fehler</h4>
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


