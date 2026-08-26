import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAuthToken } from "@/lib/auth-tokens";
import { sendVerificationEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["USER", "OWNER", "AGENT"]).default("USER"),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });

  const passwordHash = await hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      role: parsed.data.role,
      emailVerifiedAt: null,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  const token = await createAuthToken(user.id, "EMAIL_VERIFICATION");
  const emailSent = token ? await sendVerificationEmail(user.email, token) : false;

  return NextResponse.json(
    { ...user, requiresVerification: true, emailSent },
    { status: 201 },
  );
}
