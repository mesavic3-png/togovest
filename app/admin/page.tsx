import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AlertTriangle, Building2, CalendarCheck2, CircleDollarSign, Home, Megaphone, ShieldCheck, Users } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/connexion");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const [users, pendingProperties, publishedProperties, agencies, unverifiedAgencies, bookings, payments, reports, myProperties, ads, adRequests] = await Promise.all([
    prisma.user.count(),
    prisma.property.count({ where: { status: "PENDING" } }),
    prisma.property.count({ where: { status: "PUBLISHED" } }),
    prisma.agency.count(),
    prisma.agency.count({ where: { verified: false } }),
    prisma.booking.count(),
    prisma.payment.count(),
    prisma.inquiry.count({ where: { message: { startsWith: "[SIGNALEMENT:" } } }),
    prisma.property.count({ where: { ownerId: userId } }),
    prisma.advertisement.count(),
    prisma.advertisingRequest.count({ where: { status: "NEW" } }),
  ]);

  const cards = [
    { label: "Utilisateurs", value: users, href: "/admin/utilisateurs", note: "Comptes et rôles", icon: Users },
    { label: "Annonces à valider", value: pendingProperties, href: "/admin/annonces", note: `${publishedProperties} annonces publiées`, icon: Home },
    { label: "Signalements", value: reports, href: "/admin/signalements", note: "À examiner", icon: AlertTriangle },
    { label: "Agences", value: agencies, href: "/admin/agences", note: `${unverifiedAgencies} à vérifier`, icon: Building2 },
    { label: "Réservations", value: bookings, href: "/admin/reservations", note: "Locations courte durée", icon: CalendarCheck2 },
    { label: "Paiements", value: payments, href: "/admin/revenus", note: "Revenus et transactions", icon: CircleDollarSign },
    { label: "Publicités", value: ads, href: "/admin/publicites", note: `${adRequests} nouvelle(s) demande(s)`, icon: Megaphone },
  ];

  return (
    <main className="min-h-screen bg-sand px-4 py-8 text-ink sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-soft sm:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-lime"><ShieldCheck size={22}/><p className="text-xs font-extrabold uppercase tracking-[.2em]">Administration TOGOVEST</p></div>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Centre de contrôle</h1>
              <p className="mt-3 max-w-2xl text-white/65">Bienvenue, {user.name || "Administrateur"}. Supervisez la plateforme, modérez les annonces, gérez les comptes et pilotez les campagnes publicitaires depuis un espace dédié.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard?mode=personnel" className="rounded-full border border-white/20 px-5 py-3 text-center text-sm font-bold text-white">Mes annonces ({myProperties})</Link>
              <Link href="/" className="rounded-full bg-lime px-5 py-3 text-center text-sm font-extrabold text-ink">Voir le site</Link>
            </div>
          </div>
        </section>

        {(pendingProperties > 0 || reports > 0 || unverifiedAgencies > 0 || adRequests > 0) && (
          <section className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={22}/><div><h2 className="font-extrabold text-amber-950">Éléments nécessitant votre attention</h2><p className="mt-1 text-sm text-amber-900/70">{pendingProperties} annonce(s) à valider · {reports} signalement(s) · {unverifiedAgencies} agence(s) à vérifier · {adRequests} demande(s) publicitaire(s).</p></div></div>
          </section>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return <Link key={card.label} href={card.href} className="group rounded-[1.75rem] border border-ink/8 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex items-start justify-between gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-forest/10 text-forest"><Icon size={23}/></div><span className="text-3xl font-extrabold">{card.value}</span></div>
              <h2 className="mt-5 text-lg font-extrabold group-hover:text-forest">{card.label}</h2>
              <p className="mt-1 text-sm text-ink/50">{card.note}</p>
            </Link>;
          })}
        </div>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.5rem] bg-white p-6 shadow-sm"><h2 className="text-xl font-extrabold">Actions rapides</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><Link href="/admin/annonces" className="rounded-2xl bg-forest px-4 py-3 text-center text-sm font-bold text-white">Modérer les annonces</Link><Link href="/admin/signalements" className="rounded-2xl border border-ink/10 px-4 py-3 text-center text-sm font-bold">Voir les signalements</Link><Link href="/admin/utilisateurs" className="rounded-2xl border border-ink/10 px-4 py-3 text-center text-sm font-bold">Gérer les utilisateurs</Link><Link href="/admin/publicites" className="rounded-2xl border border-ink/10 px-4 py-3 text-center text-sm font-bold">Gérer les publicités</Link></div></div>
          <div className="rounded-[1.5rem] bg-forest/5 p-6"><div className="flex items-center gap-2 text-forest"><ShieldCheck size={20}/><h2 className="text-xl font-extrabold">Sécurité administrateur</h2></div><p className="mt-3 text-sm leading-6 text-ink/60">Toutes les pages sensibles contrôlent le rôle ADMIN côté serveur. Votre compte administrateur conserve aussi la possibilité de gérer ses propres annonces sans mélanger cet usage avec les outils de modération.</p></div>
        </section>
      </div>
    </main>
  );
}
