import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Prisma, PropertyType, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AdSlot } from "@/components/AdSlot";

export const dynamic = "force-dynamic";

function formatPrice(value: { toString(): string }, transaction: string) {
  const amount = Number(value.toString()).toLocaleString("fr-FR");
  if (transaction === "SHORT_TERM") return `${amount} FCFA / nuit`;
  return transaction === "RENT" ? `${amount} FCFA / mois` : `${amount} FCFA`;
}

type SearchParams = { transactionType?: string; propertyType?: string; city?: string; checkIn?: string; checkOut?: string; guests?: string };

export default async function PropertiesPage({ searchParams }: { searchParams?: SearchParams }) {
  const and: Prisma.PropertyWhereInput[] = [];
  const where: Prisma.PropertyWhereInput = { status: "PUBLISHED", AND: and };
  if (searchParams?.transactionType && Object.values(TransactionType).includes(searchParams.transactionType as TransactionType)) where.transactionType = searchParams.transactionType as TransactionType;
  if (searchParams?.propertyType && Object.values(PropertyType).includes(searchParams.propertyType as PropertyType)) where.type = searchParams.propertyType as PropertyType;
  if (searchParams?.city?.trim()) and.push({ OR: [{ city: { contains: searchParams.city.trim(), mode: "insensitive" } },{ district: { contains: searchParams.city.trim(), mode: "insensitive" } }] });
  const guests = Number(searchParams?.guests || 0);
  if (searchParams?.transactionType === "SHORT_TERM" && guests > 0) and.push({ maxGuests: { gte: guests } });
  if (searchParams?.transactionType === "SHORT_TERM" && searchParams.checkIn && searchParams.checkOut) { const checkIn = new Date(`${searchParams.checkIn}T00:00:00`); const checkOut = new Date(`${searchParams.checkOut}T00:00:00`); if (!Number.isNaN(checkIn.getTime()) && !Number.isNaN(checkOut.getTime()) && checkOut > checkIn) and.push({ bookings: { none: { status: { in: ["PENDING", "CONFIRMED"] }, checkIn: { lt: checkOut }, checkOut: { gt: checkIn } } } }); }
  const properties = await prisma.property.findMany({ where, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } }, orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }] });
  const filters = [searchParams?.transactionType === "SALE" ? "À vendre" : null,searchParams?.transactionType === "RENT" ? "À louer" : null,searchParams?.transactionType === "SHORT_TERM" ? "Location courte durée" : null,searchParams?.propertyType === "LAND" ? "Terrains" : null,searchParams?.city?.trim() || null,searchParams?.checkIn && searchParams?.checkOut ? `${searchParams.checkIn} → ${searchParams.checkOut}` : null,guests > 0 ? `${guests} voyageur(s)` : null].filter(Boolean);
  return <main className="min-h-screen bg-sand py-10 sm:py-16"><div className="shell"><div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">TOGOVEST</p><h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Biens disponibles</h1><p className="mt-3 text-ink/60">{filters.length ? `Filtres : ${filters.join(" · ")}` : "Annonces publiées et disponibles sur la plateforme."}</p></div><div className="flex flex-wrap gap-3">{filters.length > 0 && <Link href="/biens" className="rounded-full border border-forest/20 px-6 py-3 text-center font-bold text-forest">Effacer les filtres</Link>}<Link href="/publier" className="rounded-full bg-forest px-6 py-3 text-center font-bold text-white">Publier une annonce</Link></div></div><div className="mb-8"><AdSlot compact placement="SEARCH_INLINE"/></div>{properties.length === 0 ? <div className="rounded-[2rem] bg-white p-10 text-center shadow-soft"><h2 className="text-2xl font-bold">Aucun bien ne correspond à cette recherche.</h2><p className="mt-3 text-ink/60">Essayez une autre localisation, d’autres dates ou retirez certains filtres.</p><Link href="/biens" className="mt-5 inline-flex rounded-full bg-forest px-6 py-3 font-bold text-white">Voir tous les biens</Link></div> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{properties.map((property) => { const image = property.images[0]?.url; return <Link key={property.id} href={`/biens/${property.id}`} className="overflow-hidden rounded-[1.75rem] bg-white shadow-soft transition hover:-translate-y-1"><div className="relative h-64 bg-ink/5">{image ? <Image src={image} alt={property.title} fill className="object-cover" /> : <div className="grid h-full place-items-center text-ink/35">Photo à venir</div>}{property.transactionType === "SHORT_TERM" && <span className="absolute left-4 top-4 rounded-full bg-lime px-3 py-1.5 text-xs font-extrabold text-ink">Court séjour</span>}</div><div className="p-6"><p className="flex items-center gap-1.5 text-sm text-ink/55"><MapPin size={15}/>{property.district ? `${property.district}, ` : ""}{property.city}</p><h2 className="mt-3 text-xl font-extrabold">{property.title}</h2><p className="mt-4 font-extrabold text-forest">{formatPrice(property.price, property.transactionType)}</p></div></Link>})}</div>}</div></main>;
}
