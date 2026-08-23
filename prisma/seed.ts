import { PrismaClient, PropertyStatus, PropertyType, TransactionType, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: "demo@togovest.com" },
    update: {},
    create: {
      name: "Propriétaire Démo",
      email: "demo@togovest.com",
      phone: "+22890000000",
      role: UserRole.OWNER,
    },
  });

  const samples = [
    {
      title: "Villa contemporaine avec piscine",
      slug: "villa-contemporaine-cite-oua",
      description: "Grande villa moderne avec piscine, jardin, parking et espaces lumineux dans un quartier recherché de Lomé.",
      type: PropertyType.VILLA,
      transactionType: TransactionType.SALE,
      status: PropertyStatus.PUBLISHED,
      price: 185000000,
      city: "Lomé",
      district: "Cité OUA",
      bedrooms: 4,
      bathrooms: 3,
      areaSqm: 420,
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
    },
    {
      title: "Appartement lumineux à Bè",
      slug: "appartement-lumineux-be",
      description: "Appartement spacieux et lumineux, idéal pour une famille, proche des commerces et des principaux axes de Lomé.",
      type: PropertyType.APARTMENT,
      transactionType: TransactionType.RENT,
      status: PropertyStatus.PUBLISHED,
      price: 650000,
      city: "Lomé",
      district: "Bè",
      bedrooms: 3,
      bathrooms: 2,
      areaSqm: 160,
      image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
    },
  ];

  for (const item of samples) {
    await prisma.property.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        type: item.type,
        transactionType: item.transactionType,
        status: item.status,
        price: item.price,
        city: item.city,
        district: item.district,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        areaSqm: item.areaSqm,
        ownerId: owner.id,
        images: { create: [{ url: item.image, alt: item.title }] },
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
