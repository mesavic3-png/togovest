import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { consumeAuthToken } from "@/lib/auth-tokens";

const schema = z.object({ token: z.string().min(32) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Lien invalide." }, { status: 400 });

  const record = await consumeAuthToken(parsed.data.token, "EMAIL_VERIFICATION");
  if (!record) return NextResponse.json({ error: "Ce lien est invalide ou a expiré." }, { status: 400 });

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.authToken.deleteMany({ where: { userId: record.userId, type: "EMAIL_VERIFICATION" } }),
  ]);

  return NextResponse.json({ success: true });
}
