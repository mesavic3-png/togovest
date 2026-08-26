import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditPropertyForm } from "@/components/EditPropertyForm";

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect(`/connexion?callbackUrl=${encodeURIComponent(`/dashboard/annonces/${params.id}/modifier`)}`);

  const [property, user] = await Promise.all([
    prisma.property.findUnique({ where: { id: params.id } }),
    prisma.user.findUnique({ where: { id: userId }, select: { role: true, isActive: true } }),
  ]);
  if (!property) notFound();
  if (!user?.isActive) redirect("/dashboard");
  if (property.ownerId !== userId && user.role !== "ADMIN") redirect("/dashboard");

  const values = {
    id: property.id,
    title: property.title,
    description: property.description,
    type: property.type,
    transactionType: property.transactionType,
    price: Number(property.price.toString()),
    nightlyPrice: property.nightlyPrice ? Number(property.nightlyPrice.toString()) : null,
    weeklyPrice: property.weeklyPrice ? Number(property.weeklyPrice.toString()) : null,
    monthlyPrice: property.monthlyPrice ? Number(property.monthlyPrice.toString()) : null,
    cleaningFee: property.cleaningFee ? Number(property.cleaningFee.toString()) : null,
    securityDeposit: property.securityDeposit ? Number(property.securityDeposit.toString()) : null,
    minNights: property.minNights,
    maxGuests: property.maxGuests,
    checkInTime: property.checkInTime,
    checkOutTime: property.checkOutTime,
    city: property.city,
    district: property.district,
    address: property.address,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaSqm: property.areaSqm,
    landAreaSqm: property.landAreaSqm,
    parkingSpaces: property.parkingSpaces,
    furnished: property.furnished,
  };

  return <main className="min-h-screen bg-sand py-10 sm:py-16">
    <div className="shell max-w-4xl">
      <Link href="/dashboard#mes-annonces" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-forest"><ArrowLeft size={17}/> Retour à mes annonces</Link>
      <div className="mb-8"><p className="eyebrow">Gestion de l’annonce</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Modifier votre annonce</h1><p className="mt-4 max-w-2xl leading-7 text-ink/60">Mettez à jour les informations du bien. Pour la sécurité des visiteurs, une annonce modifiée repasse en attente de validation avant d’être republiée.</p></div>
      <EditPropertyForm property={values}/>
    </div>
  </main>;
}
