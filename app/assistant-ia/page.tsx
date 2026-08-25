import Link from "next/link";
import { PropertyAiAssistant } from "@/components/PropertyAiAssistant";

export const dynamic = "force-dynamic";

export default function AiAssistantPage() {
  return (
    <main className="min-h-screen bg-sand">
      <div className="px-5 pt-8"><div className="mx-auto flex max-w-5xl justify-between"><Link href="/" className="rounded-full border border-forest/20 px-5 py-2.5 text-sm font-bold text-forest">← Retour à TOGOVEST</Link></div></div>
      <PropertyAiAssistant />
    </main>
  );
}
