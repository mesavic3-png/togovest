import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  website: z.string().trim().url().max(300).optional().or(z.literal("")),
  placement: z.enum(["HOME_BANNER", "SEARCH_INLINE", "PREMIUM"]),
  durationWeeks: z.coerce.number().int().min(1).max(52),
  message: z.string().trim().max(1500).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Veuillez vérifier les informations envoyées.", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const advertisingRequest = await prisma.advertisingRequest.create({
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone || null,
        website: data.website || null,
        placement: data.placement,
        durationWeeks: data.durationWeeks,
        message: data.message || null,
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, request: advertisingRequest }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible d'enregistrer votre demande pour le moment." }, { status: 500 });
  }
}
