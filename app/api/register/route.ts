import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAuthToken } from "@/lib/auth-tokens";
import { sendVerificationEmail } from "@/lib/email";
import { normalizePhone } from "@/lib/phone";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(8),
  role: z.enum(["USER", "OWNER", "AGENT"]).default("USER"),
}).refine((data) => Boolean(data.email || data.phone), {
  message: "Email ou numéro de téléphone requis",
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const email = parsed.data.email ? parsed.data.email.toLowerCase() : null;
  const phone = parsed.data.phone ? normalizePhone(parsed.data.phone) : null;

  if (phone && !/^\+?\d{8,15}$/.test(phone)) {
    return NextResponse.json({ error: "Numéro de téléphone invalide." }, { status: 400 });
  }

  if (email) {
    const existsByEmail = await prisma.user.findUnique({ where: { email } });
    if (existsByEmail) return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  if (phone) {
    const existsByPhone = await prisma.user.findUnique({ where: { phone } });
    if (existsByPhone) return NextResponse.json({ error: "Un compte existe déjà avec ce numéro de téléphone." }, { status: 409 });
  }

  const passwordHash = await hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      phone,
      passwordHash,
      role: parsed.data.role,
      emailVerifiedAt: email ? null : new Date(),
    },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });

  if (!user.email) {
    return NextResponse.json(
      { ...user, requiresVerification: false, emailSent: false },
      { status: 201 },
    );
  }

  const token = await createAuthToken(user.id, "EMAIL_VERIFICATION");
  const emailSent = token ? await sendVerificationEmail(user.email, token) : false;

  return NextResponse.json(
    { ...user, requiresVerification: true, emailSent },
    { status: 201 },
  );
}
