import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatPrice(value: { toString(): string }, transaction: string) {
  const amount = Number(value.toString()).toLocaleString("fr-FR");
  return transaction === "RENT" ? `${amount} FCFA / mois` : `${amount} FCFA`;
}

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    where: { status: "PUBLISHED" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-sand py-10 sm:py-16">
      <div className="shell">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="eyebrow">TOGOVEST</p><h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Biens disponibles</h1><p className="mt-3 text-ink/60">Annonces publiées et disponibles sur la plateforme.</p></div>
          <Link href="/publier" className="rounded-full bg-forest px-6 py-3 text-center font-bold text-white">Publier une annonce</Link>
        </div>
        {properties.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-soft"><h2 className="text-2xl font-bold">Aucune annonce publiée pour le moment.</h2><p className="mt-3 text-ink/60">Lancez le seed Prisma ou publiez votre première annonce.</p></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{properties.map((property) => {
            const image = property.images[0]?.url;
            return <Link key={property.id} href={`/biens/${property.id}`} className="overflow-hidden rounded-[1.75rem] bg-white shadow-soft transition hover:-translate-y-1">
              <div className="relative h-64 bg-ink/5">{image ? <Image src={image} alt={property.title} fill className="object-cover" /> : <div className="grid h-full place-items-center text-ink/35">Photo à venir</div>}</div>
              <div className="p-6"><p className="flex items-center gap-1.5 text-sm text-ink/55"><MapPin size={15}/>{property.district ? `${property.district}, ` : ""}{property.city}</p><h2 className="mt-3 text-xl font-extrabold">{property.title}</h2><p className="mt-4 font-extrabold text-forest">{formatPrice(property.price, property.transactionType)}</p></div>
            </Link>})}</div>
        )}
      </div>
    </main>
  );
}
