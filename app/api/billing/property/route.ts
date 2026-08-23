import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { oneOffProducts } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id || !user.email) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const { propertyId, product } = await request.json() as { propertyId: string; product: keyof typeof oneOffProducts };
  const property = await prisma.property.findFirst({ where: { id: propertyId, ownerId: user.id } });
  if (!property) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  if (!oneOffProducts[product]) return NextResponse.json({ error: "Produit invalide" }, { status: 400 });

  const amount = oneOffProducts[product].priceXof;
  const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin;
  const checkout = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [{ price_data: { currency: "xof", unit_amount: amount, product_data: { name: oneOffProducts[product].name } }, quantity: 1 }],
    success_url: `${origin}/dashboard?promotion=succes`,
    cancel_url: `${origin}/dashboard?promotion=annule`,
    metadata: { userId: user.id, propertyId, product },
  });

  await prisma.payment.create({
    data: {
      type: product === "BOOST_7_DAYS" ? "BOOST" : "FEATURED",
      status: "PENDING",
      amount,
      currency: "XOF",
      provider: "stripe",
      providerPaymentId: checkout.id,
      userId: user.id,
      propertyId,
    },
  });

  return NextResponse.json({ url: checkout.url });
}
