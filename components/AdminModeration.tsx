"use client";

import { useRouter } from "next/navigation";

export function AdminModeration({ id }: { id: string }) {
  const router = useRouter();
  async function update(status: "PUBLISHED" | "ARCHIVED") {
    await fetch(`/api/admin/properties/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    router.refresh();
  }
  return <div className="flex gap-2"><button onClick={()=>update("PUBLISHED")} className="rounded-full bg-forest px-4 py-2 text-sm font-bold text-white">Approuver</button><button onClick={()=>update("ARCHIVED")} className="rounded-full border border-red-300 px-4 py-2 text-sm font-bold text-red-700">Refuser</button></div>;
}
