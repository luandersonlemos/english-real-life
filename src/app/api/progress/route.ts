import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserProgress } from "@/types";
import { isSupabaseConfigured } from "@/lib/plans";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, reason: "not-configured" });
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
      .from("user_progress")
      .select("progress, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      progress: data?.progress ?? null,
      updatedAt: data?.updated_at ?? null,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, reason: "not-configured" });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
    }

    const progress = (await request.json()) as UserProgress;

    const { error } = await supabase.from("user_progress").upsert({
      user_id: user.id,
      progress,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
