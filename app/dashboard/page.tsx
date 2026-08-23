import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/connexion");

  const [user, properties] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { agency: true } }),
    prisma.property.findMany({ where: { ownerId: userId }, include: { images: { take: 1, orderBy: { sortOrder: "asc" } } }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!user) redirect("/connexion");

  const stats = {
    total: properties.length,
    pending: properties.filter(p => p.status === "PENDING").length,
    published: properties.filter(p => p.status === "PUBLISHED").length,
  };

  return <main className="min-h-screen bg-sand px-5 py-12 text-ink"><div className="mx-auto max-w-6xl"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-sm font-bold uppercase tracking-widest text-forest/60">Espace TOGOVEST</p><h1 className="mt-2 text-4xl font-extrabold">Bonjour {user.name}</h1><p className="mt-2 text-ink/60">Gérez vos annonces et suivez leur validation.</p></div><div className="flex gap-3"><Link href="/publier" className="rounded-full bg-forest px-5 py-3 font-bold text-white">Publier un bien</Link>{user.role === "ADMIN" && <Link href="/admin" className="rounded-full border border-forest px-5 py-3 font-bold text-forest">Administration</Link>}</div></div><section className="mt-10 grid gap-4 sm:grid-cols-3">{[["Annonces",stats.total],["En attente",stats.pending],["Publiées",stats.published]].map(([label,value])=><div key={String(label)} className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-ink/55">{label}</p><p className="mt-2 text-3xl font-extrabold">{value}</p></div>)}</section><section className="mt-10 rounded-[2rem] bg-white p-6 sm:p-8"><h2 className="text-2xl font-extrabold">Mes annonces</h2><div className="mt-6 space-y-3">{properties.length===0?<p className="text-ink/55">Aucune annonce pour le moment.</p>:properties.map(p=><div key={p.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-ink/10 p-4 sm:flex-row sm:items-center"><div><p className="font-bold">{p.title}</p><p className="text-sm text-ink/55">{p.city} · {p.status}</p></div><Link href={`/biens/${p.id}`} className="text-sm font-bold text-forest">Voir le bien</Link></div>)}</div></section></div></main>;
}
