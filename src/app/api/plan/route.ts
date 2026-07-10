import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/plans";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, plan: "premium", reason: "not-configured" });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("plan, email")
      .eq("id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      plan: data.plan,
      email: data.email,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, reason: "not-configured" });
  }

  try {
    const { code } = (await request.json()) as { code?: string };
    const promo = process.env.PROMO_CODE ?? "EBRL2026";

    if (!code || code.trim().toUpperCase() !== promo.toUpperCase()) {
      return NextResponse.json({ ok: false, reason: "invalid-code" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ plan: "premium", updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true, plan: "premium" });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
