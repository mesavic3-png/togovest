import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  propertyId: z.string().min(1),
  reason: z.enum(["SCAM", "WRONG_INFO", "DUPLICATE", "UNAVAILABLE", "INAPPROPRIATE", "OTHER"]),
  details: z.string().max(1000).optional().default(""),
  email: z.union([z.string().email(), z.literal("")]).optional().default(""),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Signalement invalide." }, { status: 400 });

  const property = await prisma.property.findUnique({ where: { id: parsed.data.propertyId }, select: { id: true } });
  if (!property) return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const details = parsed.data.details.trim();

  await prisma.inquiry.create({
    data: {
      propertyId: parsed.data.propertyId,
      userId: userId || null,
      email: parsed.data.email || null,
      message: `[SIGNALEMENT:${parsed.data.reason}]${details ? ` ${details}` : ""}`,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
