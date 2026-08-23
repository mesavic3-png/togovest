import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bath, BedDouble, MapPin, Maximize, ParkingCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatPrice(value: { toString(): string }, transaction: string) {
  const amount = Number(value.toString()).toLocaleString("fr-FR");
  return transaction === "RENT" ? `${amount} FCFA / mois` : `${amount} FCFA`;
}

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = await prisma.property.findFirst({
    where: { id: params.id, status: "PUBLISHED" },
    include: { images: { orderBy: { sortOrder: "asc" } }, owner: true, agency: true },
  });

  if (!property) notFound();

  return (
    <main className="min-h-screen bg-sand py-8 sm:py-12">
      <div className="shell">
        <Link href="/biens" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-forest"><ArrowLeft size={17}/> Tous les biens</Link>
        <div className="grid gap-3 lg:grid-cols-[1.6fr_.8fr]">
          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-ink/5 sm:min-h-[560px]">
            {property.images[0] ? <Image src={property.images[0].url} alt={property.images[0].alt || property.title} fill priority className="object-cover"/> : <div className="grid h-full min-h-[420px] place-items-center text-ink/35">Photo à venir</div>}
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">{property.images.slice(1, 3).map((image) => <div key={image.id} className="relative min-h-48 overflow-hidden rounded-[1.5rem] bg-ink/5"><Image src={image.url} alt={image.alt || property.title} fill className="object-cover"/></div>)}</div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_.7fr]">
          <section>
            <p className="flex items-center gap-2 text-sm text-ink/55"><MapPin size={17}/>{property.district ? `${property.district}, ` : ""}{property.city}</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{property.title}</h1>
            <p className="mt-5 text-2xl font-extrabold text-forest">{formatPrice(property.price, property.transactionType)}</p>
            <div className="mt-7 flex flex-wrap gap-3">{property.bedrooms !== null && <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold"><BedDouble size={17}/>{property.bedrooms} ch.</span>}{property.bathrooms !== null && <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold"><Bath size={17}/>{property.bathrooms} sdb</span>}{property.areaSqm !== null && <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold"><Maximize size={17}/>{property.areaSqm} m²</span>}{property.parkingSpaces !== null && <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold"><ParkingCircle size={17}/>{property.parkingSpaces} parking</span>}</div>
            <div className="mt-10 rounded-[2rem] bg-white p-7 shadow-soft"><h2 className="text-2xl font-extrabold">Description</h2><p className="mt-4 whitespace-pre-line leading-8 text-ink/65">{property.description}</p></div>
          </section>

          <aside className="h-fit rounded-[2rem] bg-ink p-7 text-white shadow-soft"><p className="text-xs font-bold uppercase tracking-[.2em] text-lime">Contacter l’annonceur</p><h2 className="mt-3 text-2xl font-extrabold">{property.agency?.name || property.owner.name}</h2><p className="mt-3 text-sm text-white/60">Vous êtes intéressé par ce bien ? Contactez l’annonceur pour organiser une visite ou obtenir plus d’informations.</p>{property.owner.phone && <a href={`tel:${property.owner.phone}`} className="mt-6 block rounded-full bg-lime px-5 py-3 text-center font-bold text-ink">Appeler {property.owner.phone}</a>}</aside>
        </div>
      </div>
    </main>
  );
}
