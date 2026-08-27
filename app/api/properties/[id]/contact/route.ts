import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const property = await prisma.property.findFirst({
    where: { id: params.id, status: "PUBLISHED" },
    select: {
      title: true,
      owner: { select: { phone: true } },
      agency: { select: { phone: true } },
    },
  });

  if (!property) return NextResponse.json({ error: "Bien introuvable" }, { status: 404 });

  const phone = property.agency?.phone || property.owner.phone || null;
  return NextResponse.json({ phone, title: property.title });
}
