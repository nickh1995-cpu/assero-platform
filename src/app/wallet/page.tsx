import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function WalletLanding() {
  const supabase = await getSupabaseServerClient();
  let user = null;
  let wallet: any[] = [];
  
  if (supabase) {
    try {
      const { data: auth } = await supabase.auth.getUser();
      user = auth.user;
      if (user) {
        const { data: walletData } = await supabase
          .from("wallet_items")
          .select("asset_id, relation, assets:title,assets(price,currency)")
          .eq("user_id", user.id);
        wallet = walletData || [];
      }
    } catch (error) {
      console.warn("Error fetching wallet data:", error);
    }
  }

  return (
    <main className="section padded">
      <div className="container">
        <h1 className="section-title">Wallet</h1>
        <p className="lead">Alle Assets an einem Ort. Beobachten, besitzen, Wertentwicklung verfolgen.</p>
        {!user ? (
          <p className="mt-4"><a className="slide-cta" href="/sign-in">Anmelden, um die Wallet zu nutzen →</a></p>
        ) : (
          <div className="feature-grid mt-6">
            {wallet.map((w: any) => (
              <div key={w.asset_id} className="feature">
                <h3>{w.assets?.title ?? "Asset"}</h3>
                <p>Beziehung: {w.relation}</p>
              </div>
            ))}
            {wallet.length === 0 && (
              <div className="feature"><p>Noch keine Assets in der Wallet.</p></div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}


