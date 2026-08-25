"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AccountSettings({ name, email, phone }: { name: string; email: string; phone: string | null }) {
  const router = useRouter();
  const [profile, setProfile] = useState({ name, phone: phone || "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileMessage("");
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "profile", ...profile }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible de mettre à jour le profil.");
      setProfileMessage(data.message || "Profil mis à jour.");
      router.refresh();
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Impossible de mettre à jour le profil.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordError("");
    setPasswordMessage("");
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "password", ...passwords }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible de modifier le mot de passe.");
      setPasswordMessage(data.message || "Mot de passe modifié.");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Impossible de modifier le mot de passe.");
    } finally {
      setSavingPassword(false);
    }
  }

  const inputClass = "mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-forest";

  return <div className="mt-8 grid gap-8 lg:grid-cols-2">
    <form onSubmit={saveProfile} className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-extrabold">Informations personnelles</h2>
      <p className="mt-2 text-sm text-ink/55">Modifiez le nom affiché et votre numéro de téléphone.</p>
      <label className="mt-6 block text-sm font-bold">Nom
        <input className={inputClass} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} minLength={2} maxLength={80} required />
      </label>
      <label className="mt-5 block text-sm font-bold">Email
        <input className={`${inputClass} bg-ink/[.03] text-ink/55`} value={email} disabled />
      </label>
      <p className="mt-2 text-xs text-ink/45">L’adresse email de connexion n’est pas modifiable depuis cette page.</p>
      <label className="mt-5 block text-sm font-bold">Téléphone
        <input className={inputClass} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} maxLength={30} placeholder="Ex. +228 90 00 00 00" />
      </label>
      {profileError && <p className="mt-4 text-sm font-semibold text-red-700">{profileError}</p>}
      {profileMessage && <p className="mt-4 text-sm font-semibold text-forest">{profileMessage}</p>}
      <button disabled={savingProfile} className="mt-6 rounded-full bg-forest px-6 py-3 font-bold text-white disabled:opacity-50">{savingProfile ? "Enregistrement…" : "Enregistrer"}</button>
    </form>

    <form onSubmit={changePassword} className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-extrabold">Changer le mot de passe</h2>
      <p className="mt-2 text-sm text-ink/55">Le nouveau mot de passe doit contenir au moins 8 caractères.</p>
      <label className="mt-6 block text-sm font-bold">Mot de passe actuel
        <input type="password" autoComplete="current-password" className={inputClass} value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
      </label>
      <label className="mt-5 block text-sm font-bold">Nouveau mot de passe
        <input type="password" autoComplete="new-password" className={inputClass} value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} minLength={8} required />
      </label>
      <label className="mt-5 block text-sm font-bold">Confirmer le nouveau mot de passe
        <input type="password" autoComplete="new-password" className={inputClass} value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} minLength={8} required />
      </label>
      {passwordError && <p className="mt-4 text-sm font-semibold text-red-700">{passwordError}</p>}
      {passwordMessage && <p className="mt-4 text-sm font-semibold text-forest">{passwordMessage}</p>}
      <button disabled={savingPassword} className="mt-6 rounded-full bg-forest px-6 py-3 font-bold text-white disabled:opacity-50">{savingPassword ? "Modification…" : "Modifier le mot de passe"}</button>
    </form>
  </div>;
}
