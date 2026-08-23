import { NextResponse } from "next/server";
import { getKprimePaymentStatus } from "@/lib/kprimepay";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as any;
  const transactionId = payload?.data?.transaction_id;
  if (!transactionId) return NextResponse.json({ error: "Transaction manquante" }, { status: 400 });

  const payment = await prisma.payment.findUnique({ where: { providerPaymentId: transactionId } });
  if (!payment || payment.provider !== "kprimepay") return NextResponse.json({ received: true });
  if (payment.status === "PAID") return NextResponse.json({ received: true });

  // KPRIMEPAY v2 ne documente pas de signature de webhook. On ne fait donc
  // jamais confiance au payload seul : on revalide le paiement via leur API.
  const verified = await getKprimePaymentStatus(transactionId);
  if (verified.status === "pending") return NextResponse.json({ received: true });

  if (verified.status !== "success" || verified.transaction_amount !== payment.amount) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return NextResponse.json({ received: true });
  }

  if (payment.type === "SUBSCRIPTION" && payment.userId && payment.plan) {
    const existing = await prisma.subscription.findUnique({ where: { userId: payment.userId } });
    const now = new Date();
    const base = existing?.currentPeriodEnd && existing.currentPeriodEnd > now ? existing.currentPeriodEnd : now;
    const currentPeriodEnd = new Date(base.getTime() + 30 * 86400000);

    await prisma.$transaction([
      prisma.payment.update({ where: { id: payment.id }, data: { status: "PAID" } }),
      prisma.subscription.upsert({
        where: { userId: payment.userId },
        create: {
          userId: payment.userId,
          plan: payment.plan,
          status: "ACTIVE",
          provider: "kprimepay",
          providerSubscriptionId: transactionId,
          currentPeriodEnd,
        },
        update: {
          plan: payment.plan,
          status: "ACTIVE",
          provider: "kprimepay",
          providerSubscriptionId: transactionId,
          currentPeriodEnd,
          cancelAtPeriodEnd: true,
        },
      }),
    ]);
  } else if (payment.propertyId) {
    const now = new Date();
    const propertyData = payment.type === "BOOST"
      ? { boostUntil: new Date(now.getTime() + 7 * 86400000) }
      : { isFeatured: true, featuredUntil: new Date(now.getTime() + 30 * 86400000) };

    await prisma.$transaction([
      prisma.payment.update({ where: { id: payment.id }, data: { status: "PAID" } }),
      prisma.property.update({ where: { id: payment.propertyId }, data: propertyData }),
    ]);
  }

  return NextResponse.json({ received: true });
}
