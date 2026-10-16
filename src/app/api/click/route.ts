import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const { linkId } = await request.json();

    if (!linkId || typeof linkId !== "string") {
      return NextResponse.json({ error: "linkId invalide" }, { status: 400 });
    }

    const { error } = await supabase.rpc("increment_clicks", {
      link_id: linkId,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}