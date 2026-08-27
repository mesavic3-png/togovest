import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Bath, BedDouble, Clock3, MapPin, Maximize, ParkingCircle, Sparkles, Users } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FavoriteButton } from "@/components/FavoriteButton";
import { InquiryForm } from "@/components/InquiryForm";
import { BookingForm } from "@/components/BookingForm";
import { PropertyAmenities } from "@/components/PropertyAmenities";

export const dynamic = "force-dynamic";

function formatPrice(value: { toString(): string }, transaction: string) {
  const amount = Number(value.toString()).toLocaleString("fr-FR");
  if (transaction === "SHORT_TERM") return `${amount} FCFA / nuit`;
  return transaction === "RENT" ? `${amount} FCFA / mois` : `${amount} FCFA`;
}

function effectivePrice(property: { transactionType: string; price: { toString(): string }; nightlyPrice?: { toString(): string } | null }) {
  if (property.transactionType === "SHORT_TERM" && property.nightlyPrice) return Number(property.nightlyPrice.toString());
  return Number(property.price.toString());
}

function similarityScore(current: any, candidate: any) {
  let score = 0;
  if (candidate.transactionType === current.transactionType) score += 8;
  if (candidate.type === current.type) score += 6;
  if (candidate.city.toLowerCase() === current.city.toLowerCase()) score += 5;
  if (current.district && candidate.district && candidate.district.toLowerCase() === current.district.toLowerCase()) score += 4;
  if (current.bedrooms !== null && candidate.bedrooms !== null) score += Math.max(0, 3 - Math.abs(current.bedrooms - candidate.bedrooms));
  if (current.bathrooms !== null && candidate.bathrooms !== null) score += Math.max(0, 2 - Math.abs(current.bathrooms - candidate.bathrooms));
  if (current.furnished === candidate.furnished) score += 1;

  const currentPrice = effectivePrice(current);
  const candidatePrice = effectivePrice(candidate);
  if (currentPrice > 0 && candidatePrice > 0) {
    const gap = Math.abs(candidatePrice - currentPrice) / currentPrice;
    if (gap <= 0.1) score += 5;
    else if (gap <= 0.25) score += 4;
    else if (gap <= 0.5) score += 2;
  }

  if (current.areaSqm && candidate.areaSqm) {
    const areaGap = Math.abs(candidate.areaSqm - current.areaSqm) / current.areaSqm;
    if (areaGap <= 0.2) score += 3;
    else if (areaGap <= 0.4) score += 1;
  }

  return score;
}

function sortRecommendations(current: any, candidates: any[]) {
  return candidates
    .map((candidate) => ({ candidate, score: similarityScore(current, candidate) }))
    .sort((a, b) => b.score - a.score)
    .map(({ candidate }) => candidate);
}

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const property = await prisma.property.findFirst({
    where: { id: params.id, status: "PUBLISHED" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      owner: true,
      agency: true,
      favorites: userId ? { where: { userId }, select: { userId: true } } : false,
    },
  });

  if (!property) notFound();
  const isFavorite = userId ? (property as any).favorites?.length > 0 : false;
  const isShortTerm = property.transactionType === "SHORT_TERM";
  const contactPhone = property.agency?.phone || property.owner.phone || null;

  const strictCandidates = await prisma.property.findMany({
    where: {
      id: { not: property.id },
      status: "PUBLISHED",
      transactionType: property.transactionType,
    },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 24,
  });

  let recommendations = sortRecommendations(property, strictCandidates).slice(0, 3);

  if (recommendations.length < 3) {
    const existingIds = new Set([property.id, ...recommendations.map((item) => item.id)]);
    const sameCityCandidates = await prisma.property.findMany({
      where: {
        id: { notIn: Array.from(existingIds) },
        status: "PUBLISHED",
        city: { equals: property.city, mode: "insensitive" },
      },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 18,
    });
    recommendations = [...recommendations, ...sortRecommendations(property, sameCityCandidates)].slice(0, 3);
  }

  if (recommendations.length < 3) {
    const existingIds = new Set([property.id, ...recommendations.map((item) => item.id)]);
    const sameTypeCandidates = await prisma.property.findMany({
      where: {
        id: { notIn: Array.from(existingIds) },
        status: "PUBLISHED",
        type: property.type,
      },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 18,
    });
    recommendations = [...recommendations, ...sortRecommendations(property, sameTypeCandidates)].slice(0, 3);
  }

  if (recommendations.length < 3) {
    const existingIds = new Set([property.id, ...recommendations.map((item) => item.id)]);
    const fallbackCandidates = await prisma.property.findMany({
      where: {
        id: { notIn: Array.from(existingIds) },
        status: "PUBLISHED",
      },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 18,
    });
    recommendations = [...recommendations, ...sortRecommendations(property, fallbackCandidates)].slice(0, 3);
  }

  return (
    <main className="min-h-screen bg-sand py-8 sm:py-12">
      <div className="shell">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <Link href="/biens" className="inline-flex items-center gap-2 text-sm font-bold text-forest"><ArrowLeft size={17}/> Tous les biens</Link>
          <FavoriteButton propertyId={property.id} initial={isFavorite}/>
        </div>
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
            <p className="mt-5 text-2xl font-extrabold text-forest">{formatPrice(isShortTerm && property.nightlyPrice ? property.nightlyPrice : property.price, property.transactionType)}</p>
            <div className="mt-7 flex flex-wrap gap-3">{property.bedrooms !== null && <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold"><BedDouble size={17}/>{property.bedrooms} ch.</span>}{property.bathrooms !== null && <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold"><Bath size={17}/>{property.bathrooms} sdb</span>}{property.areaSqm !== null && <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold"><Maximize size={17}/>{property.areaSqm} m²</span>}{property.parkingSpaces !== null && <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold"><ParkingCircle size={17}/>{property.parkingSpaces} parking</span>}{isShortTerm && property.maxGuests && <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold"><Users size={17}/>{property.maxGuests} voyageurs</span>}</div>
            {isShortTerm && <div className="mt-6 rounded-[1.5rem] bg-white p-5 shadow-soft"><h2 className="font-extrabold">Informations du séjour</h2><div className="mt-3 grid gap-2 text-sm text-ink/60 sm:grid-cols-2"><span>Minimum : {property.minNights || 1} nuit(s)</span><span className="flex items-center gap-2"><Clock3 size={15}/> Arrivée {property.checkInTime || "à confirmer"}</span><span>Départ {property.checkOutTime || "à confirmer"}</span>{property.weeklyPrice && <span>Semaine : {Number(property.weeklyPrice.toString()).toLocaleString("fr-FR")} FCFA</span>}</div></div>}
            <div className="mt-10 rounded-[2rem] bg-white p-7 shadow-soft"><h2 className="text-2xl font-extrabold">Description</h2><p className="mt-4 whitespace-pre-line leading-8 text-ink/65">{property.description}</p></div>
            <PropertyAmenities amenities={property.amenities}/>
          </section>

          <aside className="h-fit rounded-[2rem] bg-ink p-7 text-white shadow-soft">
            {isShortTerm && property.nightlyPrice ? <>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-lime">Réserver ce logement</p>
              <h2 className="mt-3 text-2xl font-extrabold">{Number(property.nightlyPrice.toString()).toLocaleString("fr-FR")} FCFA / nuit</h2>
              <p className="mt-2 text-sm text-white/60">Choisissez vos dates. Les réservations en attente ou confirmées bloquent automatiquement les dates qui se chevauchent.</p>
              <BookingForm propertyId={property.id} nightlyPrice={Number(property.nightlyPrice.toString())} cleaningFee={property.cleaningFee ? Number(property.cleaningFee.toString()) : 0} minNights={property.minNights || 1} maxGuests={property.maxGuests || 1}/>
            </> : <>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-lime">Contacter l’annonceur</p><h2 className="mt-3 text-2xl font-extrabold">{property.agency?.name || property.owner.name}</h2><p className="mt-3 text-sm text-white/60">Demandez une visite ou plus d’informations. Votre demande sera enregistrée dans l’espace de l’annonceur.</p><InquiryForm propertyId={property.id} phone={contactPhone} title={property.title}/>
            </>}
          </aside>
        </div>

        {recommendations.length > 0 && <section className="mt-14 border-t border-ink/10 pt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div><p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[.16em] text-forest"><Sparkles size={17}/> Suggestions intelligentes</p><h2 className="mt-2 text-3xl font-extrabold">Des biens qui pourraient vous intéresser</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-ink/55">TOGOVEST privilégie les biens les plus proches de cette annonce. S’il y en a peu, la recherche s’élargit progressivement à la même ville, au même type de bien, puis aux meilleures annonces disponibles.</p></div>
            <Link href="/biens" className="text-sm font-bold text-forest">Voir tous les biens →</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">{recommendations.map((item) => {
            const image = item.images[0];
            const displayedPrice = item.transactionType === "SHORT_TERM" && item.nightlyPrice ? item.nightlyPrice : item.price;
            return <Link key={item.id} href={`/biens/${item.id}`} className="group overflow-hidden rounded-[1.75rem] bg-white shadow-soft transition hover:-translate-y-1">
              <div className="relative h-52 bg-ink/5">{image ? <Image src={image.url} alt={image.alt || item.title} fill className="object-cover transition duration-300 group-hover:scale-[1.03]"/> : <div className="grid h-full place-items-center text-sm text-ink/35">Photo à venir</div>}</div>
              <div className="p-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-forest">Recommandé pour vous</p><h3 className="mt-2 line-clamp-2 text-lg font-extrabold">{item.title}</h3><p className="mt-2 flex items-center gap-1 text-sm text-ink/55"><MapPin size={14}/>{item.district ? `${item.district}, ` : ""}{item.city}</p><p className="mt-4 font-extrabold text-forest">{formatPrice(displayedPrice, item.transactionType)}</p><div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/55">{item.bedrooms !== null && <span>{item.bedrooms} ch.</span>}{item.areaSqm !== null && <span>• {item.areaSqm} m²</span>}{item.furnished && <span>• Meublé</span>}</div></div>
            </Link>;
          })}</div>
        </section>}
      </div>
    </main>
  );
}
