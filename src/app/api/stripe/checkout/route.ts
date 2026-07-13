import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/plans";
import { getAppUrl, getStripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
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

    if (!user?.email) {
      return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      interval?: "monthly" | "yearly";
    };
    const interval = body.interval === "yearly" ? "yearly" : "monthly";

    const priceId =
      interval === "yearly"
        ? process.env.STRIPE_PRICE_ID_YEARLY ?? process.env.STRIPE_PRICE_ID_MONTHLY!
        : process.env.STRIPE_PRICE_ID_MONTHLY!;

    const stripe = getStripe();
    const appUrl = getAppUrl();

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id as string | null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/conta?checkout=success`,
      cancel_url: `${appUrl}/precos?checkout=canceled`,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    console.error("[stripe/checkout]", error);
    return NextResponse.json({ ok: false, reason: "checkout-failed" }, { status: 500 });
  }
}
