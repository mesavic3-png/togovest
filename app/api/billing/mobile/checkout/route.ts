import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createKprimeCheckout } from "@/lib/kprimepay";
import { plans, oneOffProducts, type PlanCode } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const body = await request.json() as { plan?: PlanCode; propertyId?: string; product?: keyof typeof oneOffProducts };
  const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin;
  const transactionId = `TG_${user.id.slice(-8)}_${Date.now()}`;

  let amount = 0;
  let type: "SUBSCRIPTION" | "BOOST" | "FEATURED";
  let description = "Paiement TOGOVEST";
  const metadata: Record<string, string> = { userId: user.id };

  if (body.plan && body.plan !== "FREE") {
    amount = plans[body.plan].priceXof;
    type = "SUBSCRIPTION";
    description = `Abonnement TOGOVEST ${plans[body.plan].name} - 30 jours`;
    metadata.plan = body.plan;
  } else if (body.propertyId && body.product && oneOffProducts[body.product]) {
    const property = await prisma.property.findFirst({ where: { id: body.propertyId, ownerId: user.id } });
    if (!property) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    amount = oneOffProducts[body.product].priceXof;
    type = body.product === "BOOST_7_DAYS" ? "BOOST" : "FEATURED";
    description = oneOffProducts[body.product].name;
    metadata.propertyId = body.propertyId;
    metadata.product = body.product;
  } else {
    return NextResponse.json({ error: "Paiement invalide" }, { status: 400 });
  }

  const checkout = await createKprimeCheckout({
    transactionId,
    amount,
    description,
    returnUrl: `${origin}/dashboard?mobile_money=retour`,
    metadata,
  });

  await prisma.payment.create({
    data: {
      type,
      status: "PENDING",
      amount,
      currency: "XOF",
      provider: "kprimepay",
      providerPaymentId: transactionId,
      userId: user.id,
      propertyId: metadata.propertyId || null,
    },
  });

  return NextResponse.json({ url: checkout.checkout_url, transactionId });
}
