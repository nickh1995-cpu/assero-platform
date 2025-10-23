"use client";

import { useState } from "react";

export function DevSeedBar({ slug }: { slug: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function call(path: string) {
    try {
      setLoading(path);
      const res = await fetch(path, { method: "POST" });
      const j = await res.json().catch(() => ({}));
      alert(j?.message ?? (res.ok ? "OK" : "Fehler"));
    } finally {
      setLoading(null);
    }
  }

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="dev-seed-bar">
      <button className="btn" onClick={() => call(`/api/dev/seed?slug=${encodeURIComponent(slug)}`)} disabled={!!loading}>
        {loading?.includes("seed") ? "Seeding…" : "Demo-Listings einfügen"}
      </button>
      <button className="btn" onClick={() => call(`/api/dev/clean?slug=${encodeURIComponent(slug)}`)} disabled={!!loading}>
        {loading?.includes("clean") ? "Lösche…" : "Demo-Listings löschen"}
      </button>
    </div>
  );
}


