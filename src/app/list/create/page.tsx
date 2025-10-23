"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Category = { id: string; name: string; slug: string };

export default function CreateListingPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!supabase) {
          // Fallback categories if Supabase is not available
          const fallbackCategories: Category[] = [
            { id: "1", name: "Real Estate", slug: "real-estate" },
            { id: "2", name: "Luxusuhren", slug: "luxusuhren" },
            { id: "3", name: "Fahrzeuge", slug: "fahrzeuge" }
          ];
          setCategories(fallbackCategories);
          setLoading(false);
          return;
        }

        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) {
          router.push("/sign-in");
          return;
        }
        const { data } = await supabase
          .from("asset_categories")
          .select("id, name, slug")
          .eq("is_active", true)
          .order("sort_order");
        setCategories((data ?? []) as Category[]);
        setLoading(false);
      } catch (error) {
        console.warn("Error fetching categories:", error);
        // Fallback categories on error
        const fallbackCategories: Category[] = [
          { id: "1", name: "Real Estate", slug: "real-estate" },
          { id: "2", name: "Luxusuhren", slug: "luxusuhren" },
          { id: "3", name: "Fahrzeuge", slug: "fahrzeuge" }
        ];
        setCategories(fallbackCategories);
        setLoading(false);
      }
    })();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    
    if (!supabase) {
      setError("Plattform wird konfiguriert. Bitte versuchen Sie es später erneut.");
      return;
    }
    
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim();
    const category_id = String(form.get("category_id") || "");
    if (!title || !category_id) {
      setError("Titel und Kategorie sind erforderlich");
      return;
    }
    
    try {
      const { data: auth } = await supabase.auth.getUser();
      const owner_id = auth.user?.id;
      const payload = {
        title,
        description,
        category_id,
        owner_id,
        status: "draft",
      };
      const { data, error } = await supabase.from("assets").insert(payload).select("id, category_id").single();
      if (error) {
        setError(error.message);
        return;
      }
      const createdId = (data as any)?.id as string;
      const category = categories.find(c => c.id === category_id);
      if (category?.slug === "real-estate") {
        router.push(`/list/create/real-estate/${createdId}`);
      } else {
        router.push(`/dashboard`);
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      setError("Fehler beim Erstellen des Inserats. Bitte versuchen Sie es erneut.");
    }
  }

  if (loading) {
    return (
      <main className="section padded">
        <div className="container">
          <p>Lädt…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section padded light">
      <div className="container">
        <h1 className="section-title">Listing erstellen</h1>
        <form onSubmit={onSubmit} className="feature-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="feature">
            <label className="block text-sm font-medium">Titel</label>
            <input name="title" required placeholder="Kurzer Titel" className="w-full rounded-md border px-4 py-3" />
          </div>
          <div className="feature">
            <label className="block text-sm font-medium">Beschreibung</label>
            <textarea name="description" rows={4} placeholder="Beschreibung" className="w-full rounded-md border px-4 py-3" />
          </div>
          <div className="feature">
            <label className="block text-sm font-medium">Kategorie</label>
            <select name="category_id" required className="w-full rounded-md border px-4 py-3" defaultValue="">
              <option value="" disabled>
                Bitte wählen
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {error ? <p className="text-sm" style={{ color: "#b91c1c" }}>{error}</p> : null}
          <div>
            <button className="slide-cta" type="submit">Als Entwurf speichern</button>
          </div>
        </form>
      </div>
    </main>
  );
}


