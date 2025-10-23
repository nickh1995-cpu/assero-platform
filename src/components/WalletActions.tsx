"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = { assetId: string };

export function WalletActions({ assetId }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function add(relation: "watch" | "own") {
    setBusy(true);
    setMsg(null);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setMsg("Bitte anmelden");
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) {
        setMsg("Bitte anmelden");
        return;
      }
      const { error } = await supabase
        .from("wallet_items")
        .insert({ user_id: userId, asset_id: assetId, relation });
      if (error && !String(error.message).includes("duplicate")) throw error;
      setMsg(relation === "watch" ? "Zur Watchlist hinzugefügt" : "Zum Bestand hinzugefügt");
    } catch (e: any) {
      setMsg(e?.message ?? "Fehler");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button disabled={busy} onClick={() => add("watch")} className="btn">
        Beobachten
      </button>
      <button disabled={busy} onClick={() => add("own")} className="btn-primary">
        Im Bestand
      </button>
      {msg && <span style={{ fontSize: 12, opacity: 0.9 }}>{msg}</span>}
    </div>
  );
}


