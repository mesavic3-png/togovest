import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SearchBox } from "./SearchBox";

export async function Hero() {
  const [propertyCount, agencyCount, latestProperties] = await Promise.all([
    prisma.property.count({ where: { status: "PUBLISHED" } }),
    prisma.agency.count({ where: { verified: true } }),
    prisma.property.findMany({
      where: { status: "PUBLISHED" },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <section id="accueil" className="relative overflow-hidden bg-ink pb-12 pt-28 text-white sm:pt-32 lg:pb-16">
      <Image src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=2200&q=90" alt="Villa moderne" fill priority className="object-cover opacity-45"/>
      <div className="absolute inset-0 bg-gradient-to-r from-[#081d16] via-[#10281f]/92 to-[#10281f]/45"/>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/10"/>

      <div className="shell relative z-10">
        <div className="grid min-h-[630px] items-center gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-14">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[.18em] text-lime backdrop-blur"><BadgeCheck size={15}/> Immobilier au Togo, plus simplement</div>
            <h1 className="text-4xl font-extrabold leading-[1.02] tracking-[-.055em] sm:text-6xl lg:text-[4.65rem]">Trouvez un bien qui correspond vraiment à votre projet.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">Achetez, louez ou investissez grâce à une plateforme immobilière claire, moderne et conçue pour le marché togolais.</p>
            <div className="mt-7 flex flex-wrap items-center gap-5 text-sm font-semibold text-white/70"><span className="flex items-center gap-2"><ShieldCheck size={18} className="text-lime"/> Recherche plus simple</span><Link href="/biens" className="flex items-center gap-2 text-white hover:text-lime">Voir tous les biens <ArrowRight size={17}/></Link></div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-[2rem] border border-white/15 bg-white/[.08] p-4 shadow-[0_30px_90px_rgba(0,0,0,.28)] backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between px-1"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-lime">Nouveautés</p><h2 className="mt-1 text-xl font-extrabold tracking-tight">Biens récemment publiés</h2></div><Link href="/biens" className="text-xs font-bold text-white/65 hover:text-white">Tout voir</Link></div>
              <div className="space-y-3">{latestProperties.length===0?<div className="rounded-2xl bg-white/10 p-5 text-sm text-white/60">Les premières annonces arrivent bientôt.</div>:latestProperties.map((property)=>{
                const image=property.images[0]?.url;
                return <Link key={property.id} href={`/biens/${property.id}`} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.08] p-3 hover:bg-white/[.13]">
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-white/10">{image?<Image src={image} alt={property.title} fill className="object-cover transition duration-500 group-hover:scale-105"/>:<div className="grid h-full place-items-center text-[10px] text-white/35">Photo</div>}</div>
                  <div className="min-w-0"><p className="flex items-center gap-1 text-[11px] font-semibold text-white/50"><MapPin size={12}/>{property.city}</p><h3 className="mt-1 line-clamp-2 text-sm font-extrabold leading-snug tracking-normal text-white">{property.title}</h3><p className="mt-1 text-xs font-bold text-lime">{Number(property.price.toString()).toLocaleString("fr-FR")} FCFA</p></div>
                  <ArrowRight className="ml-auto shrink-0 text-white/35 transition group-hover:translate-x-1 group-hover:text-lime" size={17}/>
                </Link>})}</div>
            </div>
          </div>
        </div>

        <div className="-mt-5 lg:-mt-8"><SearchBox/></div>

        <div className="mt-7 grid max-w-2xl grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[.07] backdrop-blur-md">
          <div className="p-4 sm:p-5"><b className="block text-xl text-white sm:text-2xl">{propertyCount}</b><span className="text-xs text-white/50 sm:text-sm">biens publiés</span></div>
          <div className="border-x border-white/10 p-4 sm:p-5"><b className="block text-xl text-white sm:text-2xl">{agencyCount}</b><span className="text-xs text-white/50 sm:text-sm">agences vérifiées</span></div>
          <div className="p-4 sm:p-5"><b className="block text-xl text-white sm:text-2xl">Togo</b><span className="text-xs text-white/50 sm:text-sm">couverture nationale</span></div>
        </div>
      </div>
    </section>
  );
}
