import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) {
      return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    }

    const [property, user] = await Promise.all([
      prisma.property.findUnique({ where: { id: params.id }, select: { id: true, ownerId: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { role: true, isActive: true } }),
    ]);

    if (!property) {
      return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
    }

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Compte indisponible." }, { status: 403 });
    }

    const canDelete = property.ownerId === userId || user.role === "ADMIN";
    if (!canDelete) {
      return NextResponse.json({ error: "Vous n'êtes pas autorisé à supprimer cette annonce." }, { status: 403 });
    }

    await prisma.property.delete({ where: { id: property.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Property deletion failed", error);
    return NextResponse.json({ error: "Impossible de supprimer l'annonce." }, { status: 500 });
  }
}
