import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/connexion?callbackUrl=/favoris");

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { property: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
    orderBy: { createdAt: "desc" },
  });

  return <main className="min-h-screen bg-sand py-10 sm:py-16"><div className="shell">
    <p className="eyebrow">Votre sélection</p><h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Mes favoris</h1>
    {favorites.length === 0 ? <div className="mt-10 rounded-[2rem] bg-white p-8 shadow-soft"><p className="text-ink/60">Vous n’avez pas encore enregistré de bien.</p><Link href="/biens" className="mt-5 inline-block rounded-full bg-forest px-5 py-3 font-bold text-white">Explorer les biens</Link></div> :
    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{favorites.map(({ property }) => <Link href={`/biens/${property.id}`} key={property.id} className="overflow-hidden rounded-[1.75rem] bg-white shadow-soft"><div className="relative h-56 bg-ink/5">{property.images[0] ? <Image src={property.images[0].url} alt={property.title} fill className="object-cover"/> : null}</div><div className="p-5"><p className="text-sm text-ink/50">{property.district ? `${property.district}, ` : ""}{property.city}</p><h2 className="mt-2 text-xl font-extrabold">{property.title}</h2><p className="mt-3 font-extrabold text-forest">{Number(property.price.toString()).toLocaleString("fr-FR")} FCFA</p></div></Link>)}</div>}
  </div></main>;
}
