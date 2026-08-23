import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (!subscription?.providerCustomerId) return NextResponse.json({ error: "Aucun abonnement Stripe actif" }, { status: 404 });

  const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin;
  const portal = await getStripe().billingPortal.sessions.create({
    customer: subscription.providerCustomerId,
    return_url: `${origin}/dashboard`,
  });
  return NextResponse.json({ url: portal.url });
}
