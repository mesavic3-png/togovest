import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAuthToken } from "@/lib/auth-tokens";
import { sendVerificationEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });
const message = "Si ce compte doit être vérifié, un nouvel email vient d’être envoyé.";

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message });

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerifiedAt && user.isActive) {
    const token = await createAuthToken(user.id, "EMAIL_VERIFICATION");
    if (token) await sendVerificationEmail(user.email, token);
  }

  return NextResponse.json({ message });
}
