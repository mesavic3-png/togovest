"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Ad = { id:string; advertiserName:string; title:string; placement:string; status:string; startsAt:string|null; endsAt:string|null; impressions:number; clicks:number };
type AdRequest = { id:string; companyName:string; contactName:string; email:string; phone:string|null; website:string|null; placement:string; durationWeeks:number; message:string|null; status:string; createdAt:string };
const input = "w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-forest";

export function AdminAdvertisingManager({advertisements,requests}:{advertisements:Ad[];requests:AdRequest[]}){
  const router=useRouter();
  const [busy,setBusy]=useState<string|null>(null);
  const [message,setMessage]=useState<string|null>(null);
  const [imageUrl,setImageUrl]=useState<string|null>(null);
  const [uploadingVisual,setUploadingVisual]=useState(false);

  async function patch(id:string,status:string,kind="advertisement"){
    setBusy(`${kind}-${id}`); setMessage(null);
    const r=await fetch("/api/admin/advertising",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status,kind})});
    const j=await r.json(); setBusy(null); if(!r.ok){setMessage(j.error||"Modification impossible.");return;} router.refresh();
  }

  async function uploadVisual(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];
    if(!file)return;
    setUploadingVisual(true); setMessage(null);
    try{
      const presign=await fetch("/api/uploads/presign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileName:file.name,contentType:file.type,fileSize:file.size})});
      const data=await presign.json();
      if(!presign.ok)throw new Error(data.error||"Impossible de préparer l’upload du visuel.");
      const put=await fetch(data.uploadUrl,{method:"PUT",headers:{"Content-Type":file.type},body:file});
      if(!put.ok)throw new Error("Échec de l’upload du visuel.");
      setImageUrl(data.publicUrl);
    }catch(error){
      setMessage(error instanceof Error?error.message:"Erreur pendant l’upload du visuel.");
    }finally{
      setUploadingVisual(false); event.target.value="";
    }
  }

  async function create(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setBusy("create"); setMessage(null); const f=new FormData(e.currentTarget); const payload={...Object.fromEntries(f.entries()),imageUrl:imageUrl||undefined};
    const r=await fetch("/api/admin/advertising",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}); const j=await r.json(); setBusy(null);
    if(!r.ok){setMessage(j.error||"Création impossible.");return;} e.currentTarget.reset(); setImageUrl(null); setMessage("Campagne créée."); router.refresh();
  }

  return <div className="space-y-10">
    <section className="rounded-[2rem] bg-white p-6 shadow-soft sm:p-8"><h2 className="text-2xl font-extrabold">Créer une campagne</h2><p className="mt-1 text-sm text-ink/55">Définissez l’annonceur, la destination, l’emplacement et la période.</p>
      <form onSubmit={create} className="mt-6 grid gap-4 md:grid-cols-2">
        <input name="advertiserName" required className={input} placeholder="Nom de l’annonceur"/><input name="title" required className={input} placeholder="Titre de la publicité"/>
        <input name="destinationUrl" required type="url" className={input} placeholder="https://exemple.com"/>
        <div className="md:col-span-2 rounded-2xl border border-ink/10 bg-sand/45 p-4">
          <p className="text-sm font-extrabold text-ink">Visuel de la publicité</p>
          <p className="mt-1 text-xs leading-5 text-ink/55">Ajoutez une image JPG, PNG ou WebP. 10 Mo maximum. Format horizontal recommandé pour les bannières.</p>
          <label className="mt-4 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-forest/35 bg-white px-4 py-5 text-sm font-bold text-forest">
            {uploadingVisual?"Upload en cours...":imageUrl?"Remplacer le visuel":"Ajouter le visuel"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadVisual} disabled={uploadingVisual}/>
          </label>
          {imageUrl&&<div className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-white"><img src={imageUrl} alt="Aperçu du visuel publicitaire" className="h-48 w-full object-cover"/><div className="flex items-center justify-between gap-3 p-3"><span className="text-xs font-semibold text-ink/55">Aperçu du visuel</span><button type="button" onClick={()=>setImageUrl(null)} className="rounded-full border border-ink/10 px-3 py-1.5 text-xs font-bold">Supprimer</button></div></div>}
        </div>
        <select name="placement" className={input} defaultValue="HOME_BANNER"><option value="HOME_BANNER">Bannière accueil</option><option value="SEARCH_INLINE">Résultats immobiliers</option><option value="PREMIUM">Premium</option></select>
        <select name="status" className={input} defaultValue="DRAFT"><option value="DRAFT">Brouillon</option><option value="SCHEDULED">Programmée</option><option value="ACTIVE">Active</option><option value="PAUSED">En pause</option></select>
        <label className="text-sm font-bold">Début<input name="startsAt" type="datetime-local" className={`${input} mt-2`}/></label><label className="text-sm font-bold">Fin<input name="endsAt" type="datetime-local" className={`${input} mt-2`}/></label>
        <textarea name="description" rows={3} className={`${input} md:col-span-2`} placeholder="Description optionnelle"/><button disabled={busy==="create"||uploadingVisual} className="rounded-full bg-forest px-6 py-3 font-bold text-white md:col-span-2 disabled:opacity-50">Créer la campagne</button>
      </form>{message&&<p className="mt-4 rounded-xl bg-sand px-4 py-3 text-sm font-semibold">{message}</p>}
    </section>
    <section><h2 className="text-2xl font-extrabold">Demandes des annonceurs</h2><div className="mt-4 space-y-4">{requests.length===0?<div className="rounded-2xl bg-white p-6">Aucune demande.</div>:requests.map(x=><article key={x.id} className="rounded-2xl bg-white p-6 shadow-soft"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div><h3 className="text-xl font-extrabold">{x.companyName}</h3><p className="mt-1 text-sm text-ink/60">{x.contactName} · {x.email}{x.phone?` · ${x.phone}`:""}</p><p className="mt-1 text-sm text-ink/60">{x.placement} · {x.durationWeeks} semaine(s) · {x.status}</p>{x.message&&<p className="mt-3 text-sm text-ink/70">{x.message}</p>}</div><div className="flex flex-wrap gap-2"><button disabled={busy===`request-${x.id}`} onClick={()=>patch(x.id,"CONTACTED","request")} className="rounded-full border px-4 py-2 text-sm font-bold">Contactée</button><button onClick={()=>patch(x.id,"APPROVED","request")} className="rounded-full bg-forest px-4 py-2 text-sm font-bold text-white">Approuver</button><button onClick={()=>patch(x.id,"REJECTED","request")} className="rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-700">Refuser</button></div></div></article>)}</div></section>
    <section><h2 className="text-2xl font-extrabold">Campagnes</h2><div className="mt-4 grid gap-4 lg:grid-cols-2">{advertisements.length===0?<div className="rounded-2xl bg-white p-6">Aucune campagne.</div>:advertisements.map(a=><article key={a.id} className="rounded-2xl bg-white p-6 shadow-soft"><p className="text-xs font-bold uppercase tracking-widest text-forest/60">{a.placement}</p><div className="mt-2 flex items-start justify-between gap-3"><div><h3 className="text-xl font-extrabold">{a.title}</h3><p className="text-sm text-ink/55">{a.advertiserName}</p></div><span className="rounded-full bg-sand px-3 py-1 text-xs font-bold">{a.status}</span></div><div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-sand p-4 text-sm"><div><b>{a.impressions}</b><span className="block text-ink/50">vues</span></div><div><b>{a.clicks}</b><span className="block text-ink/50">clics</span></div></div><div className="mt-4 flex gap-2"><button onClick={()=>patch(a.id,"ACTIVE")} className="rounded-full bg-forest px-4 py-2 text-sm font-bold text-white">Activer</button><button onClick={()=>patch(a.id,"PAUSED")} className="rounded-full border px-4 py-2 text-sm font-bold">Pause</button><button onClick={()=>patch(a.id,"ENDED")} className="rounded-full border px-4 py-2 text-sm font-bold">Terminer</button></div></article>)}</div></section>
  </div>;
}
