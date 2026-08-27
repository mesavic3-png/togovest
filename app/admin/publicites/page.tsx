import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminAdvertisingManager } from "@/components/AdminAdvertisingManager";

export const dynamic = "force-dynamic";

export default async function AdminAdvertisingPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/connexion");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const [advertisements, requests] = await Promise.all([
    prisma.advertisement.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.advertisingRequest.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <main className="min-h-screen bg-sand px-5 py-12 text-ink">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-sm font-bold uppercase tracking-widest text-forest/60">Administration</p><h1 className="mt-2 text-4xl font-extrabold">Publicités</h1><p className="mt-2 max-w-2xl text-ink/60">Gérez les demandes des annonceurs, créez les campagnes et contrôlez leur diffusion sur TOGOVEST.</p></div>
          <Link href="/admin" className="rounded-full border border-forest/20 px-5 py-2.5 text-sm font-bold text-forest">Retour à l’administration</Link>
        </div>
        <div className="mt-8">
          <AdminAdvertisingManager
            advertisements={advertisements.map((ad) => ({ ...ad, startsAt: ad.startsAt?.toISOString() || null, endsAt: ad.endsAt?.toISOString() || null }))}
            requests={requests.map((request) => ({ ...request, createdAt: request.createdAt.toISOString() }))}
          />
        </div>
      </div>
    </main>
  );
}
