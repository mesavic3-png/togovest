import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  Bell,
  Building2,
  CheckCircle2,
  Clock3,
  Heart,
  Home,
  List,
  MessageSquare,
  Plus,
  Search,
  UserRound,
  CalendarCheck2,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeletePropertyButton } from "@/components/DeletePropertyButton";
import { DashboardAlertCount } from "@/components/DashboardAlertCount";

const sellerRoles = ["OWNER", "AGENT", "AGENCY_ADMIN", "ADMIN"];

function StatCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-sand p-3 text-forest">{icon}</div>
        <div>
          <p className="text-sm font-semibold text-ink/65">{label}</p>
          <p className="mt-1 text-3xl font-extrabold text-ink">{value}</p>
          <p className="mt-1 text-xs text-ink/45">{helper}</p>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ isSeller }: { isSeller: boolean }) {
  return (
    <aside className="rounded-[2rem] bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:self-start">
      <nav className="space-y-2 text-sm font-semibold">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-2xl bg-forest/10 px-4 py-3 text-forest">
          <Home size={19} /> Tableau de bord
        </Link>
        <Link href="/biens" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-ink/70 hover:bg-sand">
          <Search size={19} /> Rechercher un bien
        </Link>
        <Link href="/favoris" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-ink/70 hover:bg-sand">
          <Heart size={19} /> Mes favoris
        </Link>
        <Link href="/alertes" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-ink/70 hover:bg-sand">
          <Bell size={19} /> Alertes
        </Link>
        {isSeller && (
          <Link href="/publier" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-ink/70 hover:bg-sand">
            <Plus size={19} /> Publier un bien
          </Link>
        )}
        <div className="my-3 border-t border-ink/10" />
        <Link href="/compte" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-ink/70 hover:bg-sand">
          <UserRound size={19} /> Mon compte
        </Link>
      </nav>
    </aside>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/connexion");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { agency: true },
  });
  if (!user) redirect("/connexion");

  const isSeller = sellerRoles.includes(user.role);

  if (!isSeller) {
    const [favoriteCount, inquiryCount, bookingCount] = await Promise.all([
      prisma.favorite.count({ where: { userId } }),
      prisma.inquiry.count({ where: { userId } }),
      prisma.booking.count({ where: { userId } }),
    ]);

    return (
      <main className="min-h-screen bg-sand px-4 py-8 text-ink sm:px-6 sm:py-12">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <Sidebar isSeller={false} />

          <div>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.18em] text-forest/60">Espace TOGOVEST</p>
                <h1 className="mt-2 text-4xl font-extrabold">Tableau de bord</h1>
                <p className="mt-2 text-ink/60">Bienvenue, {user.name} ! Voici un aperçu de votre activité.</p>
              </div>
              <Link href="/biens" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-forest px-6 py-3 font-bold text-white">
                <Search size={19} /> Rechercher un bien
              </Link>
            </div>

            <section className="mt-8 rounded-[2rem] bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><UserRound size={24} /></div>
                <div>
                  <h2 className="text-xl font-extrabold">Compte acheteur / Locataire</h2>
                  <p className="text-sm text-ink/50">Acheteur / Locataire</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Favoris" value={favoriteCount} helper="Biens enregistrés" icon={<Heart size={22} />} />
                <StatCard label="Demandes" value={inquiryCount} helper="Vos messages et demandes" icon={<MessageSquare size={22} />} />
                <StatCard label="Réservations" value={bookingCount} helper="Vos réservations" icon={<CalendarCheck2 size={22} />} />
                <StatCard label="Alertes" value={<DashboardAlertCount />} helper="Recherches enregistrées" icon={<Bell size={22} />} />
              </div>

              <div className="mt-7 border-t border-ink/10 pt-6">
                <h3 className="font-extrabold">Accès rapides</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Link href="/biens" className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 font-semibold"><Search size={18} /> Rechercher un bien</Link>
                  <Link href="/favoris" className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 font-semibold"><Heart size={18} /> Mes favoris</Link>
                  <Link href="/alertes" className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 font-semibold"><Bell size={18} /> Mes alertes</Link>
                  <Link href="/compte" className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 font-semibold"><UserRound size={18} /> Mon compte</Link>
                </div>
              </div>
            </section>

            <div className="mt-6 rounded-2xl border border-forest/10 bg-forest/5 p-5 text-sm text-ink/65">
              <strong className="text-forest">Bon à savoir :</strong> ce tableau de bord est réservé à votre activité d’acheteur ou de locataire. Les statistiques de publication ne sont pas affichées ici.
            </div>
          </div>
        </div>
      </main>
    );
  }

  const [properties, inquiries] = await Promise.all([
    prisma.property.findMany({
      where: { ownerId: userId },
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inquiry.findMany({
      where: { property: { ownerId: userId } },
      include: { property: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const stats = {
    total: properties.length,
    pending: properties.filter((p) => p.status === "PENDING").length,
    published: properties.filter((p) => p.status === "PUBLISHED").length,
    leads: inquiries.length,
  };

  return (
    <main className="min-h-screen bg-sand px-4 py-8 text-ink sm:px-6 sm:py-12">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Sidebar isSeller />

        <div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.18em] text-forest/60">Espace TOGOVEST</p>
              <h1 className="mt-2 text-4xl font-extrabold">Tableau de bord</h1>
              <p className="mt-2 text-ink/60">Bienvenue, {user.name} ! Gérez vos biens et vos demandes.</p>
            </div>
            <Link href="/publier" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-forest px-6 py-3 font-bold text-white">
              <Plus size={19} /> Publier un bien
            </Link>
          </div>

          <section className="mt-8 rounded-[2rem] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-forest/10 p-3 text-forest"><Building2 size={24} /></div>
              <div>
                <h2 className="text-xl font-extrabold">Compte vendeur / Agence</h2>
                <p className="text-sm text-ink/50">Propriétaire / Agent / Agence</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Annonces" value={stats.total} helper="Tous vos biens" icon={<Home size={22} />} />
              <StatCard label="En attente" value={stats.pending} helper="En cours de vérification" icon={<Clock3 size={22} />} />
              <StatCard label="Publiées" value={stats.published} helper="Visibles par les utilisateurs" icon={<CheckCircle2 size={22} />} />
              <StatCard label="Demandes" value={stats.leads} helper="Messages et demandes reçues" icon={<MessageSquare size={22} />} />
            </div>

            <div className="mt-7 border-t border-ink/10 pt-6">
              <h3 className="font-extrabold">Accès rapides</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <a href="#mes-annonces" className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 font-semibold"><List size={18} /> Mes annonces</a>
                <a href="#demandes-recues" className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 font-semibold"><MessageSquare size={18} /> Demandes reçues</a>
                <Link href="/publier" className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 font-semibold"><Plus size={18} /> Ajouter un bien</Link>
                {user.agency ? (
                  <Link href="/agence" className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 font-semibold"><Building2 size={18} /> Mon agence</Link>
                ) : (
                  <Link href="/compte" className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 font-semibold"><UserRound size={18} /> Mon compte</Link>
                )}
              </div>
            </div>
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section id="mes-annonces" className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-extrabold">Mes annonces</h2>
              <div className="mt-6 space-y-3">
                {properties.length === 0 ? (
                  <p className="text-ink/55">Aucune annonce pour le moment.</p>
                ) : properties.map((p) => (
                  <div key={p.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-ink/10 p-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-bold">{p.title}</p>
                      <p className="text-sm text-ink/55">{p.city} · {p.status}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <Link href={`/biens/${p.id}`} className="text-sm font-bold text-forest">Voir</Link>
                      <DeletePropertyButton propertyId={p.id} propertyTitle={p.title} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="demandes-recues" className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-extrabold">Demandes récentes</h2>
              <div className="mt-6 space-y-3">
                {inquiries.length === 0 ? (
                  <p className="text-ink/55">Aucune demande reçue.</p>
                ) : inquiries.map((i) => (
                  <div key={i.id} className="rounded-2xl border border-ink/10 p-4">
                    <p className="font-bold">{i.name || i.email || "Visiteur"}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-forest/60">{i.property.title}</p>
                    <p className="mt-2 text-sm text-ink/65">{i.message}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink/50">
                      {i.email && <span>{i.email}</span>}
                      {i.phone && <span>{i.phone}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-6 rounded-2xl border border-forest/10 bg-forest/5 p-5 text-sm text-ink/65">
            <strong className="text-forest">Bon à savoir :</strong> ce tableau de bord est adapté aux propriétaires, agents et agences. Les acheteurs et locataires voient une interface différente centrée sur leurs recherches, favoris, demandes et alertes.
          </div>
        </div>
      </div>
    </main>
  );
}
