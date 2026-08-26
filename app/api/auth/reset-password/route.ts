import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { consumeAuthToken } from "@/lib/auth-tokens";

const schema = z.object({
  token: z.string().min(32),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const record = await consumeAuthToken(parsed.data.token, "PASSWORD_RESET");
  if (!record) return NextResponse.json({ error: "Ce lien est invalide ou a expiré." }, { status: 400 });

  const passwordHash = await hash(parsed.data.password, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash, emailVerifiedAt: record.user.emailVerifiedAt || new Date() },
    }),
    prisma.authToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return NextResponse.json({ success: true });
}
