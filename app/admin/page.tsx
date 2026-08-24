import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminModeration } from "@/components/AdminModeration";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/connexion");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const properties = await prisma.property.findMany({
    where: { status: "PENDING" },
    include: { owner: true, agency: true },
    orderBy: { createdAt: "asc" },
  });

  return <main className="min-h-screen bg-sand px-5 py-12 text-ink"><div className="mx-auto max-w-6xl"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-widest text-forest/60">Administration</p><h1 className="mt-2 text-4xl font-extrabold">Annonces à valider</h1><p className="mt-2 text-ink/60">Contrôlez les nouvelles annonces avant leur publication sur TOGOVEST.</p></div><div className="flex flex-wrap gap-2"><Link href="/admin/publicites" className="rounded-full bg-forest px-5 py-2.5 text-sm font-bold text-white">Gérer les publicités</Link><Link href="/admin/revenus" className="rounded-full border border-forest/20 px-5 py-2.5 text-sm font-bold text-forest">Voir les revenus</Link></div></div><div className="mt-8 space-y-4">{properties.length===0?<div className="rounded-2xl bg-white p-6">Aucune annonce en attente.</div>:properties.map(property=><article key={property.id} className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><h2 className="text-xl font-extrabold">{property.title}</h2><p className="mt-1 text-sm text-ink/55">{property.city} · {property.type} · {property.transactionType}</p><p className="mt-2 text-sm">Publié par <b>{property.owner.name}</b>{property.agency ? ` · ${property.agency.name}` : ""}</p></div><AdminModeration id={property.id}/></div></article>)}</div></div></main>;
}
