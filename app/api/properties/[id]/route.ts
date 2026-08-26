import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().min(5).max(160),
  description: z.string().min(20).max(5000),
  type: z.enum(["HOUSE", "APARTMENT", "LAND", "VILLA", "OFFICE", "SHOP", "WAREHOUSE", "OTHER"]),
  transactionType: z.enum(["SALE", "RENT", "SHORT_TERM"]),
  price: z.number().positive().optional(),
  nightlyPrice: z.number().positive().optional(),
  weeklyPrice: z.number().positive().optional().nullable(),
  monthlyPrice: z.number().positive().optional().nullable(),
  cleaningFee: z.number().min(0).optional().nullable(),
  securityDeposit: z.number().min(0).optional().nullable(),
  minNights: z.number().int().min(1).optional().nullable(),
  maxGuests: z.number().int().min(1).optional().nullable(),
  checkInTime: z.string().optional().nullable(),
  checkOutTime: z.string().optional().nullable(),
  city: z.string().min(2).max(100),
  district: z.string().max(120).optional().nullable(),
  address: z.string().max(250).optional().nullable(),
  bedrooms: z.number().int().min(0).optional().nullable(),
  bathrooms: z.number().int().min(0).optional().nullable(),
  areaSqm: z.number().positive().optional().nullable(),
  landAreaSqm: z.number().positive().optional().nullable(),
  parkingSpaces: z.number().int().min(0).optional().nullable(),
  furnished: z.boolean().default(false),
});

async function getAuthorizedProperty(id: string, userId: string) {
  const [property, user] = await Promise.all([
    prisma.property.findUnique({ where: { id }, select: { id: true, ownerId: true, status: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { role: true, isActive: true } }),
  ]);
  if (!property) return { error: NextResponse.json({ error: "Annonce introuvable." }, { status: 404 }) };
  if (!user || !user.isActive) return { error: NextResponse.json({ error: "Compte indisponible." }, { status: 403 }) };
  if (property.ownerId !== userId && user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Vous n'êtes pas autorisé à modifier cette annonce." }, { status: 403 }) };
  }
  return { property, user };
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

    const auth = await getAuthorizedProperty(params.id, userId);
    if (auth.error) return auth.error;

    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Données invalides.", details: parsed.error.flatten() }, { status: 400 });

    const data = parsed.data;
    const shortTerm = data.transactionType === "SHORT_TERM";
    const updated = await prisma.property.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        transactionType: data.transactionType,
        price: shortTerm ? data.nightlyPrice! : data.price!,
        nightlyPrice: shortTerm ? data.nightlyPrice : null,
        weeklyPrice: shortTerm ? data.weeklyPrice ?? null : null,
        monthlyPrice: shortTerm ? data.monthlyPrice ?? null : null,
        cleaningFee: shortTerm ? data.cleaningFee ?? null : null,
        securityDeposit: shortTerm ? data.securityDeposit ?? null : null,
        minNights: shortTerm ? data.minNights ?? null : null,
        maxGuests: shortTerm ? data.maxGuests ?? null : null,
        checkInTime: shortTerm ? data.checkInTime || null : null,
        checkOutTime: shortTerm ? data.checkOutTime || null : null,
        city: data.city,
        district: data.district || null,
        address: data.address || null,
        bedrooms: data.bedrooms ?? null,
        bathrooms: data.bathrooms ?? null,
        areaSqm: data.areaSqm ?? null,
        landAreaSqm: data.landAreaSqm ?? null,
        parkingSpaces: data.parkingSpaces ?? null,
        furnished: data.furnished,
        status: auth.user!.role === "ADMIN" ? auth.property!.status : "PENDING",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Property update failed", error);
    return NextResponse.json({ error: "Impossible de modifier l'annonce." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) {
      return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    }

    const auth = await getAuthorizedProperty(params.id, userId);
    if (auth.error) return auth.error;

    await prisma.property.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Property deletion failed", error);
    return NextResponse.json({ error: "Impossible de supprimer l'annonce." }, { status: 500 });
  }
}
