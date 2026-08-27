"use client";

import { ChangeEvent, useState } from "react";
import { Loader2, Video, X } from "lucide-react";

export function VideoUploader({ videoUrl, onChange }: { videoUrl: string | null; onChange: (url: string | null) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadVideo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const presign = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, fileSize: file.size }),
      });
      const data = await presign.json();
      if (!presign.ok) throw new Error(data.error || "Impossible de préparer l’upload de la vidéo.");
      const put = await fetch(data.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!put.ok) throw new Error("Échec de l’upload de la vidéo.");
      onChange(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur pendant l’upload de la vidéo.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="md:col-span-2">
      <span className="mb-2 block text-sm font-bold">Vidéo du bien <span className="font-normal text-ink/45">(optionnel)</span></span>
      {!videoUrl ? (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-forest/35 bg-sand px-4 py-6 font-bold text-forest">
          {uploading ? <Loader2 className="animate-spin" size={20}/> : <Video size={20}/>}
          {uploading ? "Upload de la vidéo..." : "Ajouter une vidéo"}
          <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={uploadVideo} disabled={uploading}/>
        </label>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-sand">
          <video src={videoUrl} controls preload="metadata" className="aspect-video w-full bg-black object-contain" />
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span className="font-semibold text-forest">Vidéo ajoutée</span>
            <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-1 font-bold text-red-700"><X size={16}/> Supprimer</button>
          </div>
        </div>
      )}
      <small className="mt-2 block text-ink/50">1 vidéo MP4, WebM ou MOV, 80 Mo maximum.</small>
      {error && <p className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
    </div>
  );
}
