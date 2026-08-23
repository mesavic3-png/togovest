import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ status: z.enum(["PUBLISHED", "ARCHIVED"]) });

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const admin = await prisma.user.findUnique({ where: { id: userId } });
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Statut invalide." }, { status: 400 });

  const property = await prisma.property.update({ where: { id: params.id }, data: { status: parsed.data.status } });
  return NextResponse.json(property);
}
