"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function DealroomButton({ assetId, sellerId }: { assetId: string; sellerId: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    try {
      setLoading(true);
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        router.push("/sign-in");
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) {
        router.push("/sign-in");
        return;
      }
      // Resume existing
      const { data: existing, error: selectErr } = await supabase
        .from("dealroom")
        .select("id")
        .eq("asset_id", assetId)
        .eq("buyer_id", userId)
        .maybeSingle();
      if (selectErr) throw selectErr;
      if (existing?.id) {
        router.push(`/dealroom?id=${existing.id}`);
        return;
      }
      // Create new
      const payload: any = { asset_id: assetId, buyer_id: userId, status: "initial" };
      if (sellerId) payload.seller_id = sellerId;
      const { data: created, error: insertErr } = await supabase
        .from("dealroom")
        .insert(payload)
        .select("id")
        .single();
      if (insertErr) throw insertErr;
      router.push(`/dealroom?id=${created.id}`);
    } catch (err) {
      console.error(err);
      alert("Anfrage konnte nicht erstellt werden. Bitte später erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="btn-primary" onClick={onClick} disabled={loading}>
      {loading ? "Öffne…" : "Anfrage stellen"}
    </button>
  );
}


