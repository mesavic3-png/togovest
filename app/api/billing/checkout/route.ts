import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { plans, type PlanCode } from "@/lib/plans";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id || !user.email) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  const { plan } = await request.json() as { plan: PlanCode };
  if (!plan || plan === "FREE" || !plans[plan]) return NextResponse.json({ error: "Offre invalide" }, { status: 400 });
  const priceId = process.env[`STRIPE_PRICE_${plan}`];
  if (!priceId) return NextResponse.json({ error: `STRIPE_PRICE_${plan} manquant` }, { status: 500 });
  const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin;
  const checkout = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?paiement=succes`,
    cancel_url: `${origin}/tarifs?paiement=annule`,
    metadata: { userId: user.id, plan },
    subscription_data: { metadata: { userId: user.id, plan } },
  });
  return NextResponse.json({ url: checkout.url });
}
