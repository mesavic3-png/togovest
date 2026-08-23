import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function nightsBetween(checkIn: Date, checkOut: Date) {
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) return NextResponse.json({ error: "Connexion requise pour réserver." }, { status: 401 });

    const body = await request.json();
    const propertyId = String(body.propertyId || "");
    const checkIn = new Date(body.checkIn);
    const checkOut = new Date(body.checkOut);
    const guests = Number(body.guests || 1);
    const guestName = body.guestName ? String(body.guestName) : null;
    const guestPhone = body.guestPhone ? String(body.guestPhone) : null;
    const notes = body.notes ? String(body.notes) : null;

    if (!propertyId || Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      return NextResponse.json({ error: "Dates de réservation invalides." }, { status: 400 });
    }

    const property = await prisma.property.findFirst({
      where: { id: propertyId, status: "PUBLISHED", transactionType: "SHORT_TERM" },
    });
    if (!property || !property.nightlyPrice) return NextResponse.json({ error: "Cette location n'est pas disponible à la réservation." }, { status: 404 });

    const nights = nightsBetween(checkIn, checkOut);
    if (property.minNights && nights < property.minNights) {
      return NextResponse.json({ error: `Séjour minimum : ${property.minNights} nuit(s).` }, { status: 400 });
    }
    if (property.maxGuests && guests > property.maxGuests) {
      return NextResponse.json({ error: `Maximum ${property.maxGuests} voyageur(s).` }, { status: 400 });
    }

    const conflict = await prisma.booking.findFirst({
      where: {
        propertyId,
        status: { in: ["PENDING", "CONFIRMED"] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      select: { id: true },
    });
    if (conflict) return NextResponse.json({ error: "Ces dates ne sont plus disponibles." }, { status: 409 });

    const nightly = Number(property.nightlyPrice.toString());
    const cleaning = property.cleaningFee ? Number(property.cleaningFee.toString()) : 0;
    const totalAmount = nightly * nights + cleaning;

    const booking = await prisma.booking.create({
      data: {
        propertyId,
        userId,
        checkIn,
        checkOut,
        guests,
        nights,
        totalAmount,
        currency: property.currency,
        guestName,
        guestPhone,
        notes,
      },
    });

    return NextResponse.json({ booking, totalAmount }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de créer la réservation." }, { status: 500 });
  }
}
