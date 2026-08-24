import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/connexion");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const [users, pendingProperties, agencies, unverifiedAgencies, bookings, payments] = await Promise.all([
    prisma.user.count(),
    prisma.property.count({ where: { status: "PENDING" } }),
    prisma.agency.count(),
    prisma.agency.count({ where: { verified: false } }),
    prisma.booking.count(),
    prisma.payment.count(),
  ]);

  const cards = [
    { label: "Utilisateurs", value: users, href: "/admin/utilisateurs", note: "Comptes et rôles" },
    { label: "Annonces à valider", value: pendingProperties, href: "/admin/annonces", note: "Modération" },
    { label: "Agences", value: agencies, href: "/admin/agences", note: `${unverifiedAgencies} à vérifier` },
    { label: "Réservations", value: bookings, href: "/admin/reservations", note: "Courte durée" },
    { label: "Paiements", value: payments, href: "/admin/revenus", note: "Revenus et transactions" },
  ];

  return <main className="min-h-screen bg-sand px-5 py-10 text-ink"><div className="mx-auto max-w-6xl">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-widest text-forest/60">Administration</p><h1 className="mt-2 text-4xl font-extrabold">Centre de contrôle</h1><p className="mt-2 text-ink/60">Gérez les utilisateurs, annonces, agences, réservations et revenus de TOGOVEST.</p></div><Link href="/" className="rounded-full border border-forest/20 px-5 py-3 text-center font-bold text-forest">Voir le site</Link></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(card=><Link key={card.label} href={card.href} className="rounded-[1.5rem] bg-white p-6 shadow-sm transition hover:-translate-y-0.5"><p className="text-sm font-bold text-forest/65">{card.label}</p><p className="mt-2 text-4xl font-extrabold">{card.value}</p><p className="mt-2 text-sm text-ink/50">{card.note}</p></Link>)}</div>
    <div className="mt-8 rounded-[1.5rem] bg-ink p-6 text-white"><h2 className="text-xl font-extrabold">Protections administrateur</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">Les actions sensibles vérifient le rôle ADMIN côté serveur. Un administrateur ne peut pas désactiver son propre compte ni retirer son propre rôle administrateur depuis l’interface.</p></div>
  </div></main>;
}
