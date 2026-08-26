import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const labels: Record<string, string> = {
  SCAM: "Arnaque ou fraude",
  WRONG_INFO: "Informations incorrectes",
  DUPLICATE: "Annonce en double",
  UNAVAILABLE: "Bien indisponible",
  INAPPROPRIATE: "Contenu inapproprié",
  OTHER: "Autre",
};

function parseReport(message: string) {
  const match = message.match(/^\[SIGNALEMENT:([A-Z_]+)\]\s*([\s\S]*)$/);
  return { reason: match?.[1] || "OTHER", details: match?.[2] || "" };
}

export default async function ReportsAdminPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/connexion");
  const admin = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (admin?.role !== "ADMIN") redirect("/dashboard");

  const reports = await prisma.inquiry.findMany({
    where: { message: { startsWith: "[SIGNALEMENT:" } },
    include: { property: { select: { id: true, title: true, city: true, status: true } }, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return <main className="min-h-screen bg-sand px-5 py-10 text-ink"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-forest/60">Modération</p><h1 className="mt-2 text-4xl font-extrabold">Signalements</h1><p className="mt-2 text-ink/60">Examinez les annonces signalées par les visiteurs.</p></div><Link href="/admin" className="rounded-full border border-forest/20 px-5 py-3 font-bold text-forest">Retour administration</Link></div>
    <div className="mt-8 space-y-4">{reports.length === 0 ? <div className="rounded-2xl bg-white p-6 shadow-sm">Aucun signalement pour le moment.</div> : reports.map((report) => { const parsed = parseReport(report.message); return <article key={report.id} className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-red-700">{labels[parsed.reason] || parsed.reason}</p><h2 className="mt-1 text-xl font-extrabold">{report.property.title}</h2><p className="mt-1 text-sm text-ink/55">{report.property.city} · statut {report.property.status}</p></div><Link href={`/biens/${report.property.id}`} className="text-sm font-bold text-forest">Voir l’annonce →</Link></div>
      {parsed.details && <p className="mt-4 rounded-xl bg-sand p-4 text-sm leading-6">{parsed.details}</p>}
      <div className="mt-4 text-xs text-ink/50">Signalé le {report.createdAt.toLocaleString("fr-FR")} · Contact : {report.user?.email || report.email || "non fourni"}</div>
    </article>; })}</div>
  </div></main>;
}
