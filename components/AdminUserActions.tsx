"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";

const roles=["USER","OWNER","AGENT","AGENCY_ADMIN","ADMIN"];
export function AdminUserActions({userId,currentRole,isActive,isSelf}:{userId:string;currentRole:string;isActive:boolean;isSelf:boolean}){
  const router=useRouter(); const[busy,setBusy]=useState(false); const[role,setRole]=useState(currentRole);
  async function update(body:Record<string,unknown>){setBusy(true);try{const r=await fetch(`/api/admin/users/${userId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});if(!r.ok){const data=await r.json().catch(()=>({}));alert(data.error||"Action impossible");return;}router.refresh();}finally{setBusy(false)}}
  return <div className="flex flex-col gap-2 sm:flex-row sm:items-center"><select value={role} disabled={busy||isSelf} onChange={e=>{const v=e.target.value;setRole(v);update({role:v})}} className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm font-bold">{roles.map(r=><option key={r}>{r}</option>)}</select><button disabled={busy||isSelf} onClick={()=>update({isActive:!isActive})} className={`rounded-xl px-4 py-2 text-sm font-bold ${isActive?"bg-red-50 text-red-700":"bg-forest text-white"}`}>{isSelf?"Votre compte":isActive?"Désactiver":"Réactiver"}</button></div>;
}
