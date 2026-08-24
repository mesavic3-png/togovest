import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminUserActions } from "@/components/AdminUserActions";

export default async function AdminUsersPage(){
  const session=await getServerSession(authOptions); const currentId=(session?.user as any)?.id as string|undefined;
  if(!currentId) redirect("/connexion");
  const current=await prisma.user.findUnique({where:{id:currentId}}); if(!current||current.role!=="ADMIN") redirect("/dashboard");
  const users=await prisma.user.findMany({orderBy:{createdAt:"desc"},take:100});
  return <main className="min-h-screen bg-sand px-5 py-10 text-ink"><div className="mx-auto max-w-6xl"><div className="flex items-center justify-between gap-4"><div><p className="eyebrow">Administration</p><h1 className="mt-2 text-4xl font-extrabold">Utilisateurs</h1></div><Link href="/admin" className="font-bold text-forest">← Centre de contrôle</Link></div><div className="mt-8 space-y-3">{users.map(u=><div key={u.id} className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="font-extrabold">{u.name}</h2><p className="text-sm text-ink/55">{u.email}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-forest/60">{u.role} · {u.isActive?"ACTIF":"DÉSACTIVÉ"}</p></div><AdminUserActions userId={u.id} currentRole={u.role} isActive={u.isActive} isSelf={u.id===currentId}/></div></div>)}</div></div></main>;
}
