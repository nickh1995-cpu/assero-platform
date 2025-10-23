import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug") ?? "default";

    // Placeholder: implement real seeding against Supabase later
    return NextResponse.json({ ok: true, message: `Demo-Listings für "${slug}" eingefügt.` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}


