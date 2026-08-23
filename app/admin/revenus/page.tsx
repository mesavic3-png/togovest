import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function RevenueAdminPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) redirect("/connexion");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [payments, activeSubscriptions, featuredCount] = await Promise.all([
    prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { user: true, property: true } }),
    prisma.subscription.count({ where: { status: { in: ["ACTIVE", "TRIALING"] } } }),
    prisma.property.count({ where: { isFeatured: true, featuredUntil: { gt: new Date() } } }),
  ]);
  const paid = payments.filter(p => p.status === "PAID");
  const revenue = paid.reduce((sum, p) => sum + p.amount, 0);

  return <main className="min-h-screen bg-sand px-5 py-12 text-ink"><div className="mx-auto max-w-6xl"><div><p className="eyebrow">Administration</p><h1 className="mt-2 text-4xl font-extrabold">Revenus TOGOVEST</h1></div><section className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-white p-6"><p className="text-sm text-ink/55">Encaissements suivis</p><p className="mt-2 text-3xl font-extrabold">{revenue.toLocaleString("fr-FR")} FCFA</p></div><div className="rounded-2xl bg-white p-6"><p className="text-sm text-ink/55">Abonnements actifs</p><p className="mt-2 text-3xl font-extrabold">{activeSubscriptions}</p></div><div className="rounded-2xl bg-white p-6"><p className="text-sm text-ink/55">Annonces Premium actives</p><p className="mt-2 text-3xl font-extrabold">{featuredCount}</p></div></section><section className="mt-8 rounded-[2rem] bg-white p-6"><h2 className="text-2xl font-extrabold">Derniers paiements</h2><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b border-ink/10"><th className="py-3">Date</th><th>Client</th><th>Type</th><th>Statut</th><th>Montant</th></tr></thead><tbody>{payments.map(p=><tr key={p.id} className="border-b border-ink/5"><td className="py-3">{p.createdAt.toLocaleDateString("fr-FR")}</td><td>{p.user?.email || "—"}</td><td>{p.type}</td><td>{p.status}</td><td>{p.amount.toLocaleString("fr-FR")} {p.currency}</td></tr>)}</tbody></table></div></section></div></main>;
}
