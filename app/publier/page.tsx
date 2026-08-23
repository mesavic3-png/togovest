import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PropertyForm } from "@/components/PropertyForm";

export default function PublishPage() {
  return (
    <main className="min-h-screen bg-sand py-10 sm:py-16">
      <div className="shell max-w-4xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-forest"><ArrowLeft size={17}/> Retour à l’accueil</Link>
        <div className="mb-8">
          <p className="eyebrow">Propriétaires & agences</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Publier un bien sur TOGOVEST</h1>
          <p className="mt-4 max-w-2xl leading-7 text-ink/60">Renseignez les informations essentielles. Pour cette phase, les nouvelles annonces sont enregistrées avec le statut « en attente » avant publication.</p>
        </div>
        <PropertyForm />
      </div>
    </main>
  );
}
