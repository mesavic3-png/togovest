import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountSettings } from "@/components/AccountSettings";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/connexion");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, phone: true, isActive: true },
  });
  if (!user || !user.isActive) redirect("/connexion");

  return <main className="min-h-screen bg-sand px-5 py-12 text-ink">
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-forest/60">Espace TOGOVEST</p>
          <h1 className="mt-2 text-4xl font-extrabold">Mon compte</h1>
          <p className="mt-2 text-ink/60">Gérez vos informations personnelles et la sécurité de votre compte.</p>
        </div>
        <Link href="/dashboard" className="rounded-full border border-forest px-5 py-3 font-bold text-forest">Retour au tableau de bord</Link>
      </div>
      <AccountSettings name={user.name} email={user.email} phone={user.phone}/>
    </div>
  </main>;
}
