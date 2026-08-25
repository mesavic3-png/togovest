import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  type: z.literal("profile"),
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(80),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

const passwordSchema = z.object({
  type: z.literal("password"),
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis."),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères.").max(128),
  confirmPassword: z.string().min(1),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Les nouveaux mots de passe ne correspondent pas.",
});

const accountSchema = z.union([profileSchema, passwordSchema]);

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

    const parsed = accountSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Données invalides." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) return NextResponse.json({ error: "Compte indisponible." }, { status: 403 });

    if (parsed.data.type === "profile") {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { name: parsed.data.name, phone: parsed.data.phone || null },
        select: { id: true, name: true, email: true, phone: true },
      });
      return NextResponse.json({ message: "Profil mis à jour.", user: updated });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: "Ce compte n’utilise pas de mot de passe local." }, { status: 400 });
    }

    const valid = await compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 400 });

    if (await compare(parsed.data.newPassword, user.passwordHash)) {
      return NextResponse.json({ error: "Le nouveau mot de passe doit être différent de l’ancien." }, { status: 400 });
    }

    const passwordHash = await hash(parsed.data.newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return NextResponse.json({ message: "Mot de passe modifié avec succès." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de mettre à jour le compte." }, { status: 500 });
  }
}
