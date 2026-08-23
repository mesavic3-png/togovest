import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const inquirySchema = z.object({
  propertyId: z.string().min(1),
  name: z.string().trim().min(2).max(120).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
});

export async function POST(request: Request) {
  const body = inquirySchema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const property = await prisma.property.findFirst({ where: { id: body.data.propertyId, status: "PUBLISHED" }, select: { id: true } });
  if (!property) return NextResponse.json({ error: "Bien introuvable" }, { status: 404 });

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const inquiry = await prisma.inquiry.create({
    data: {
      propertyId: property.id,
      userId: userId || null,
      name: body.data.name || session?.user?.name || null,
      email: body.data.email || session?.user?.email || null,
      phone: body.data.phone || null,
      message: body.data.message,
    },
  });
  return NextResponse.json({ id: inquiry.id }, { status: 201 });
}
