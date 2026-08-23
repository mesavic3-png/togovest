import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function mapStatus(status: Stripe.Subscription.Status) {
  if (status === "active") return "ACTIVE" as const;
  if (status === "trialing") return "TRIALING" as const;
  if (status === "past_due" || status === "unpaid") return "PAST_DUE" as const;
  if (status === "canceled" || status === "incomplete_expired") return "CANCELED" as const;
  return "INACTIVE" as const;
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  const plan = subscription.metadata.plan as "PRO" | "AGENCY" | undefined;
  if (!userId || !plan) return;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan,
      status: mapStatus(subscription.status),
      provider: "stripe",
      providerCustomerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
      providerSubscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.items.data[0]?.current_period_end! * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      plan,
      status: mapStatus(subscription.status),
      providerCustomerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
      providerSubscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.items.data[0]?.current_period_end! * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook non configuré" }, { status: 500 });

  const signature = headers().get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Signature manquante" }, { status: 400 });

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "payment" && session.payment_status === "paid") {
        const propertyId = session.metadata?.propertyId;
        const userId = session.metadata?.userId;
        const product = session.metadata?.product;
        if (propertyId && userId && product) {
          const now = new Date();
          const boostUntil = new Date(now.getTime() + 7 * 86400000);
          const featuredUntil = new Date(now.getTime() + 30 * 86400000);
          await prisma.$transaction([
            prisma.payment.updateMany({ where: { providerPaymentId: session.id }, data: { status: "PAID" } }),
            prisma.property.update({
              where: { id: propertyId },
              data: product === "BOOST_7_DAYS" ? { boostUntil } : { isFeatured: true, featuredUntil },
            }),
          ]);
        }
      }
      break;
    }
  }
  return NextResponse.json({ received: true });
}
