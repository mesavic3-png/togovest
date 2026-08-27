import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { sendInquiryNotificationEmail } from "@/lib/email";
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

  const property = await prisma.property.findFirst({
    where: { id: body.data.propertyId, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      owner: { select: { email: true } },
      agency: { select: { email: true } },
    },
  });
  if (!property) return NextResponse.json({ error: "Bien introuvable" }, { status: 404 });

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const senderName = body.data.name || session?.user?.name || null;
  const senderEmail = body.data.email || session?.user?.email || null;
  const senderPhone = body.data.phone || null;

  const inquiry = await prisma.inquiry.create({
    data: {
      propertyId: property.id,
      userId: userId || null,
      name: senderName,
      email: senderEmail,
      phone: senderPhone,
      message: body.data.message,
    },
  });

  const recipient = property.agency?.email || property.owner.email;
  const emailSent = await sendInquiryNotificationEmail({
    to: recipient,
    propertyId: property.id,
    propertyTitle: property.title,
    senderName,
    senderEmail,
    senderPhone,
    message: body.data.message,
  }).catch(() => false);

  return NextResponse.json({ id: inquiry.id, emailSent }, { status: 201 });
}
