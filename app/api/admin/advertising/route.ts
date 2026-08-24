import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === "ADMIN" ? userId : null;
}

function optionalDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
    const body = await request.json();
    const advertiserName = String(body.advertiserName || "").trim();
    const title = String(body.title || "").trim();
    const destinationUrl = String(body.destinationUrl || "").trim();
    const placement = String(body.placement || "");
    const status = String(body.status || "DRAFT");

    if (!advertiserName || !title || !destinationUrl) {
      return NextResponse.json({ error: "Annonceur, titre et lien de destination sont requis." }, { status: 400 });
    }
    if (!["HOME_BANNER", "SEARCH_INLINE", "PREMIUM"].includes(placement)) {
      return NextResponse.json({ error: "Emplacement publicitaire invalide." }, { status: 400 });
    }
    if (!["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "ENDED"].includes(status)) {
      return NextResponse.json({ error: "Statut publicitaire invalide." }, { status: 400 });
    }

    const startsAt = optionalDate(body.startsAt);
    const endsAt = optionalDate(body.endsAt);
    if (startsAt && endsAt && endsAt <= startsAt) {
      return NextResponse.json({ error: "La date de fin doit être après la date de début." }, { status: 400 });
    }

    const advertisement = await prisma.advertisement.create({
      data: {
        advertiserName,
        title,
        description: body.description ? String(body.description).trim() : null,
        imageUrl: body.imageUrl ? String(body.imageUrl).trim() : null,
        destinationUrl,
        placement: placement as any,
        status: status as any,
        startsAt,
        endsAt,
      },
    });
    return NextResponse.json(advertisement, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de créer la campagne." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
    const body = await request.json();
    const kind = String(body.kind || "advertisement");
    const id = String(body.id || "");
    if (!id) return NextResponse.json({ error: "Identifiant requis." }, { status: 400 });

    if (kind === "request") {
      const status = String(body.status || "");
      if (!["NEW", "CONTACTED", "APPROVED", "REJECTED"].includes(status)) {
        return NextResponse.json({ error: "Statut de demande invalide." }, { status: 400 });
      }
      const updated = await prisma.advertisingRequest.update({ where: { id }, data: { status: status as any } });
      return NextResponse.json(updated);
    }

    const status = String(body.status || "");
    if (!["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "ENDED"].includes(status)) {
      return NextResponse.json({ error: "Statut publicitaire invalide." }, { status: 400 });
    }
    const updated = await prisma.advertisement.update({ where: { id }, data: { status: status as any } });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de modifier l’élément." }, { status: 500 });
  }
}
