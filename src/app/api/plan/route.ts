import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/plans";
import { isStripeConfigured } from "@/lib/stripe";

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
      .select(
        "plan, email, subscription_status, premium_source, stripe_subscription_id"
      )
      .eq("id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      plan: data.plan,
      email: data.email,
      subscriptionStatus: data.subscription_status,
      premiumSource: data.premium_source,
      hasSubscription: Boolean(data.stripe_subscription_id),
      stripeEnabled: isStripeConfigured(),
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
      .update({
        plan: "premium",
        premium_source: "promo",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true, plan: "premium" });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
