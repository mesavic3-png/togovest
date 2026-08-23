import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgencyPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/connexion?callbackUrl=/agence");

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { agency: true } });
  if (!user?.agencyId || !user.agency) redirect("/dashboard");

  const [members, properties, leads] = await Promise.all([
    prisma.user.findMany({ where: { agencyId: user.agencyId }, select: { id: true, name: true, email: true, phone: true, role: true, isActive: true }, orderBy: { name: "asc" } }),
    prisma.property.findMany({ where: { agencyId: user.agencyId }, select: { id: true, title: true, city: true, status: true, price: true }, orderBy: { createdAt: "desc" } }),
    prisma.inquiry.findMany({ where: { property: { agencyId: user.agencyId } }, include: { property: { select: { title: true } } }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return <main className="min-h-screen bg-sand px-5 py-12"><div className="mx-auto max-w-6xl">
    <p className="eyebrow">Espace agence</p><div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-4xl font-extrabold sm:text-5xl">{user.agency.name}</h1><p className="mt-2 text-ink/55">{user.agency.verified ? "Agence vérifiée par TOGOVEST" : "Vérification de l’agence en attente"}</p></div><a href="/publier" className="rounded-full bg-forest px-5 py-3 text-center font-bold text-white">Publier pour l’agence</a></div>
    <section className="mt-10 grid gap-4 sm:grid-cols-3">{[["Membres",members.length],["Biens",properties.length],["Demandes",leads.length]].map(([label,value])=><div key={String(label)} className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-ink/55">{label}</p><p className="mt-2 text-3xl font-extrabold">{value}</p></div>)}</section>
    <div className="mt-8 grid gap-8 lg:grid-cols-2"><section className="rounded-[2rem] bg-white p-6 sm:p-8"><h2 className="text-2xl font-extrabold">Équipe</h2><div className="mt-5 space-y-3">{members.map(member=><div key={member.id} className="rounded-2xl border border-ink/10 p-4"><div className="flex justify-between gap-3"><div><p className="font-bold">{member.name}</p><p className="text-sm text-ink/55">{member.email}</p></div><span className="text-xs font-bold text-forest">{member.role}</span></div></div>)}</div></section><section className="rounded-[2rem] bg-white p-6 sm:p-8"><h2 className="text-2xl font-extrabold">Portefeuille</h2><div className="mt-5 space-y-3">{properties.length===0?<p className="text-ink/55">Aucun bien rattaché à l’agence.</p>:properties.map(property=><div key={property.id} className="rounded-2xl border border-ink/10 p-4"><p className="font-bold">{property.title}</p><p className="mt-1 text-sm text-ink/55">{property.city} · {property.status}</p><p className="mt-2 text-sm font-bold text-forest">{Number(property.price.toString()).toLocaleString("fr-FR")} FCFA</p></div>)}</div></section></div>
    <section className="mt-8 rounded-[2rem] bg-white p-6 sm:p-8"><h2 className="text-2xl font-extrabold">Leads de l’agence</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{leads.length===0?<p className="text-ink/55">Aucune demande reçue.</p>:leads.map(lead=><div key={lead.id} className="rounded-2xl border border-ink/10 p-4"><p className="font-bold">{lead.name || lead.email || "Visiteur"}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-forest/60">{lead.property.title}</p><p className="mt-2 text-sm text-ink/65">{lead.message}</p></div>)}</div></section>
  </div></main>;
}
