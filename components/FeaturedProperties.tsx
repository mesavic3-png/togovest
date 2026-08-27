import { ArrowRight, Bath, BedDouble, MapPin, Maximize } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatPrice(value: { toString(): string }, transactionType: string) {
  const amount = Number(value.toString()).toLocaleString("fr-FR");
  return transactionType === "RENT" ? `${amount} FCFA / mois` : `${amount} FCFA`;
}

export async function FeaturedProperties() {
  const properties = await prisma.property.findMany({ where: { status: "PUBLISHED" }, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } }, orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }], take: 3 });
  return (
    <section id="biens" className="py-20 sm:py-28"><div className="shell">
      <div className="mb-10 flex flex-col justify-between gap-5 sm:mb-14 sm:flex-row sm:items-end"><div><p className="eyebrow">Biens à découvrir</p><h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">Une sélection immobilière présentée avec clarté.</h2><p className="mt-4 max-w-xl leading-7 text-ink/55">Parcourez les dernières opportunités disponibles et trouvez plus rapidement le bien adapté à votre projet.</p></div><Link href="/biens" className="flex items-center gap-2 font-bold text-forest hover:gap-3">Voir tous les biens <ArrowRight size={19}/></Link></div>
      {properties.length===0?<div className="premium-card p-8 text-center"><h3 className="text-xl font-extrabold">Les premières annonces arrivent bientôt.</h3><p className="mt-2 text-ink/60">Vous êtes propriétaire ou agence ? Publiez votre bien dès maintenant.</p><Link href="/publier" className="premium-button mt-5">Publier une annonce</Link></div>:
      <div className="grid gap-6 lg:grid-cols-3">{properties.map((property)=>{const image=property.images[0]?.url;const area=property.type==="LAND"?property.landAreaSqm:property.areaSqm;return <Link key={property.id} href={`/biens/${property.id}`} className="group overflow-hidden rounded-[1.75rem] border border-ink/[.06] bg-white shadow-[0_16px_55px_rgba(16,40,31,.07)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_65px_rgba(16,40,31,.12)]">
        <div className="relative h-72 overflow-hidden bg-ink/5">{image?<Image src={image} alt={property.title} fill className="object-cover transition duration-700 group-hover:scale-105"/>:<div className="grid h-full place-items-center text-ink/35">Photo à venir</div>}<div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent"/><span className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/90 px-3 py-1.5 text-xs font-extrabold shadow-sm backdrop-blur">{property.transactionType==="RENT"?"À louer":property.transactionType==="SHORT_TERM"?"Court séjour":"À vendre"}</span></div>
        <div className="p-6"><p className="flex items-center gap-1.5 text-sm font-medium text-ink/50"><MapPin size={15} className="text-forest"/>{property.district?`${property.district}, `:""}{property.city}</p><h3 className="mt-3 line-clamp-2 text-xl font-extrabold leading-snug">{property.title}</h3><p className="mt-4 text-lg font-extrabold text-forest">{formatPrice(property.price,property.transactionType)}</p><div className="mt-5 flex gap-5 border-t border-ink/10 pt-5 text-sm font-semibold text-ink/55">{property.bedrooms!=null&&property.bedrooms>0&&<span className="flex gap-1.5"><BedDouble size={17}/>{property.bedrooms}</span>}{property.bathrooms!=null&&property.bathrooms>0&&<span className="flex gap-1.5"><Bath size={17}/>{property.bathrooms}</span>}{area!=null&&<span className="flex gap-1.5"><Maximize size={16}/>{area} m²</span>}</div></div>
      </Link>})}</div>}
    </div></section>
  );
}
