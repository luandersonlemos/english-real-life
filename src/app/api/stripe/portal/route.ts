import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/plans";
import { getAppUrl, getStripe, isStripeConfigured } from "@/lib/stripe";

export async function POST() {
  if (!isSupabaseConfigured() || !isStripeConfigured()) {
    return NextResponse.json(
      { ok: false, reason: "payments-not-configured" },
      { status: 503 }
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    const customerId = profile?.stripe_customer_id as string | null;
    if (!customerId) {
      return NextResponse.json(
        { ok: false, reason: "no-subscription" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getAppUrl()}/conta`,
    });

    return NextResponse.json({ ok: true, url: portal.url });
  } catch (error) {
    console.error("[stripe/portal]", error);
    return NextResponse.json({ ok: false, reason: "portal-failed" }, { status: 500 });
  }
}
