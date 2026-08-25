"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeletePropertyButton({ propertyId, propertyTitle }: { propertyId: string; propertyTitle: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(`Voulez-vous vraiment supprimer « ${propertyTitle} » ? Cette action est irréversible.`);
    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Impossible de supprimer l'annonce.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de supprimer l'annonce.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-red-700 transition hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 size={16} />
        {loading ? "Suppression..." : "Supprimer"}
      </button>
      {error && <p className="max-w-52 text-right text-xs text-red-700">{error}</p>}
    </div>
  );
}
