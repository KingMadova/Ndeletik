import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Username invalide" }, { status: 400 });
    }

    const { error } = await supabase.rpc("increment_profile_view", {
      p_username: username,
    });

    if (error) {
      console.error("Erreur incrémentation vue:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur API view:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}