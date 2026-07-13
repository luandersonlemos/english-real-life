import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  getStripe,
  isPremiumSubscriptionStatus,
  isStripeConfigured,
} from "@/lib/stripe";

export const runtime = "nodejs";

async function syncSubscription(
  userId: string,
  subscription: Stripe.Subscription
) {
  const admin = createAdminClient();
  const status = subscription.status;
  const premium = isPremiumSubscriptionStatus(status);

  await admin
    .from("profiles")
    .update({
      plan: premium ? "premium" : "free",
      stripe_subscription_id: subscription.id,
      subscription_status: status,
      premium_source: premium ? "stripe" : "free",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

async function resolveUserId(
  subscription: Stripe.Subscription
): Promise<string | null> {
  const fromMeta = subscription.metadata.supabase_user_id;
  if (fromMeta) return fromMeta;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  return data?.id ?? null;
}

export async function POST(request: Request) {
  if (!isStripeConfigured() || !isSupabaseAdminConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!signature) {
    return NextResponse.json({ ok: false, reason: "no-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe/webhook] assinatura inválida", error);
    return NextResponse.json({ ok: false, reason: "invalid-signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.client_reference_id ??
          session.metadata?.supabase_user_id ??
          null;

        if (userId && session.subscription) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;

          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await syncSubscription(userId, subscription);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(subscription);
        if (userId) {
          await syncSubscription(userId, subscription);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ ok: true, received: true });
  } catch (error) {
    console.error("[stripe/webhook]", event.type, error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
