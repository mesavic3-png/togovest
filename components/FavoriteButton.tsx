"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

export function FavoriteButton({ propertyId, initial = false }: { propertyId: string; initial?: boolean }) {
  const [favorite, setFavorite] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/favorites/${propertyId}`, { method: favorite ? "DELETE" : "POST" });
    if (res.status === 401) {
      window.location.href = `/connexion?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (res.ok) setFavorite(!favorite);
    setLoading(false);
  }

  return <button onClick={toggle} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm font-bold"><Heart size={18} fill={favorite ? "currentColor" : "none"}/>{favorite ? "Enregistré" : "Ajouter aux favoris"}</button>;
}
