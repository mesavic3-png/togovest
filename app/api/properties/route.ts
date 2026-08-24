import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { propertySchema } from "@/lib/validation/property";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET() {
  const properties = await prisma.property.findMany({ where: { status: "PUBLISHED" }, include: { images: { orderBy: { sortOrder: "asc" } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(properties);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) return NextResponse.json({ error: "Compte indisponible." }, { status: 403 });
    if (!["OWNER", "AGENT", "AGENCY_ADMIN", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Votre compte n'est pas autorisé à publier une annonce." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = propertySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });

    const data = parsed.data;
    const slug = `${slugify(data.title)}-${Date.now().toString(36)}`;
    const isShortTerm = data.transactionType === "SHORT_TERM";

    const property = await prisma.property.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        type: data.type,
        transactionType: data.transactionType,
        status: "PENDING",
        price: isShortTerm ? data.nightlyPrice! : data.price!,
        nightlyPrice: isShortTerm ? data.nightlyPrice : null,
        weeklyPrice: isShortTerm ? data.weeklyPrice ?? null : null,
        monthlyPrice: isShortTerm ? data.monthlyPrice ?? null : null,
        cleaningFee: isShortTerm ? data.cleaningFee ?? null : null,
        securityDeposit: isShortTerm ? data.securityDeposit ?? null : null,
        minNights: isShortTerm ? data.minNights ?? null : null,
        maxGuests: isShortTerm ? data.maxGuests ?? null : null,
        checkInTime: isShortTerm ? data.checkInTime || null : null,
        checkOutTime: isShortTerm ? data.checkOutTime || null : null,
        city: data.city,
        district: data.district || null,
        address: data.address || null,
        bedrooms: data.bedrooms ?? null,
        bathrooms: data.bathrooms ?? null,
        areaSqm: data.areaSqm ?? null,
        landAreaSqm: data.landAreaSqm ?? null,
        parkingSpaces: data.parkingSpaces ?? null,
        furnished: data.furnished,
        ownerId: user.id,
        agencyId: user.agencyId || null,
        images: { create: data.imageUrls.map((url, index) => ({ url, sortOrder: index })) },
      },
      include: { images: true },
    });
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de créer l'annonce." }, { status: 500 });
  }
}
