import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: { propertyId: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  await prisma.favorite.upsert({
    where: { userId_propertyId: { userId, propertyId: params.propertyId } },
    create: { userId, propertyId: params.propertyId },
    update: {},
  });
  return NextResponse.json({ favorite: true });
}

export async function DELETE(_: Request, { params }: { params: { propertyId: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  await prisma.favorite.deleteMany({ where: { userId, propertyId: params.propertyId } });
  return NextResponse.json({ favorite: false });
}
