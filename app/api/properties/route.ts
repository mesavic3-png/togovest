import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { propertySchema } from "@/lib/validation/property";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const properties = await prisma.property.findMany({
    where: { status: "PUBLISHED" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(properties);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = propertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const owner = await prisma.user.findUnique({
      where: { email: "demo@togovest.com" },
    });

    if (!owner) {
      return NextResponse.json(
        { error: "Le propriétaire de démonstration n'existe pas. Exécutez le seed Prisma." },
        { status: 500 },
      );
    }

    const data = parsed.data;
    const baseSlug = slugify(data.title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const property = await prisma.property.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        type: data.type,
        transactionType: data.transactionType,
        status: "PENDING",
        price: data.price,
        city: data.city,
        district: data.district || null,
        address: data.address || null,
        bedrooms: data.bedrooms ?? null,
        bathrooms: data.bathrooms ?? null,
        areaSqm: data.areaSqm ?? null,
        landAreaSqm: data.landAreaSqm ?? null,
        parkingSpaces: data.parkingSpaces ?? null,
        furnished: data.furnished,
        ownerId: owner.id,
        images: {
          create: data.imageUrls.map((url, index) => ({ url, sortOrder: index })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de créer l'annonce." }, { status: 500 });
  }
}
