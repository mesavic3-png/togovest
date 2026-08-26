import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAuthToken } from "@/lib/auth-tokens";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });
const message = "Si un compte correspond à cet email, un lien de réinitialisation vient d’être envoyé.";

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (user?.passwordHash && user.isActive && user.email) {
    const token = await createAuthToken(user.id, "PASSWORD_RESET");
    if (token) await sendPasswordResetEmail(user.email, token);
  }

  return NextResponse.json({ message });
}
