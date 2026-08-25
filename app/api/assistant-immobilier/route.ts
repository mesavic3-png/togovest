import { NextResponse } from "next/server";
import { Prisma, PropertyType, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function normalize(input: string) {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function parseBudget(text: string) {
  const normalized = normalize(text).replace(/\s+/g, " ");
  const million = normalized.match(/(?:moins de|max(?:imum)?|budget(?: de)?|jusqu(?:'|’)a|ne depassant pas|plafond(?: de)?)?\s*([0-9]+(?:[.,][0-9]+)?)\s*(?:million|millions|m)\b/);
  if (million) return Math.round(Number(million[1].replace(",", ".")) * 1_000_000);
  const plain = normalized.match(/(?:moins de|max(?:imum)?|budget(?: de)?|jusqu(?:'|’)a|ne depassant pas|plafond(?: de)?)?\s*([0-9][0-9 .]{3,})\s*(?:fcfa|cfa|xof)/);
  if (plain) return Number(plain[1].replace(/[ .]/g, ""));
  return null;
}

function parseBedrooms(text: string) {
  const n = normalize(text);
  const match = n.match(/(?:au moins|min(?:imum)?\s*)?(\d+)\s*(?:chambre|chambres|ch)\b/) || n.match(/(?:t|f)(\d+)\b/);
  return match ? Number(match[1]) : null;
}

function parseBathrooms(text: string) {
  const match = normalize(text).match(/(\d+)\s*(?:salle(?:s)? de bain|sdb|douche|douches)\b/);
  return match ? Number(match[1]) : null;
}

function parseGuests(text: string) {
  const match = normalize(text).match(/(\d+)\s*(?:personne|personnes|voyageur|voyageurs|adulte|adultes)\b/);
  return match ? Number(match[1]) : null;
}

function parseArea(text: string) {
  const n = normalize(text);
  const match = n.match(/(?:au moins|min(?:imum)?(?: de)?|plus de|superficie(?: de)?|surface(?: de)?)?\s*(\d+(?:[.,]\d+)?)\s*(?:m2|m²|metres? carres?)\b/);
  return match ? Number(match[1].replace(",", ".")) : null;
}

function parseParking(text: string) {
  const match = normalize(text).match(/(\d+)\s*(?:place|places)\s*(?:de\s*)?(?:parking|garage)/);
  if (match) return Number(match[1]);
  return /parking|garage/.test(normalize(text)) ? 1 : null;
}

function parseFurnished(text: string) {
  const n = normalize(text);
  if (/non meuble|pas meuble/.test(n)) return false;
  if (/meuble|meublee|furnished/.test(n)) return true;
  return null;
}

function parseTransaction(text: string): TransactionType | null {
  const n = normalize(text);
  if (/court sejour|courte duree|location saisonniere|nuit|nuitee|week[- ]?end|vacances|airbnb/.test(n)) return "SHORT_TERM";
  if (/a louer|en location|location|louer|loyer|par mois|mensuel/.test(n)) return "RENT";
  if (/a vendre|en vente|vente|acheter|achat|acquerir|proprietaire/.test(n)) return "SALE";
  return null;
}

function parseType(text: string): PropertyType | null {
  const n = normalize(text);
  if (/villa/.test(n)) return "VILLA";
  if (/appartement|studio|f\d+|t\d+/.test(n)) return "APARTMENT";
  if (/terrain|parcelle|lot/.test(n)) return "LAND";
  if (/bureau|local professionnel/.test(n)) return "OFFICE";
  if (/boutique|magasin|commerce/.test(n)) return "SHOP";
  if (/entrepot|hangar/.test(n)) return "WAREHOUSE";
  if (/maison|residence/.test(n)) return "HOUSE";
  return null;
}

function parseCityOrDistrict(text: string) {
  const n = normalize(text);
  const knownPlaces = [
    "lome", "agoe", "agoe nyive", "adidogome", "avedji", "sagbakome", "tokoin", "be", "kegue", "hedzranawoe",
    "attiegou", "klikame", "djifa kpota", "totsi", "cassablanca", "nyekonakpoe", "kodjoviakope", "hanoukope",
    "baguida", "avepozo", "kegue", "caisse", "lome 2", "aneho", "kpalime", "kara", "sokode", "atakpame",
    "tsevie", "notse", "dapaong", "bassar", "badou", "vogan", "tabligbo", "aflao"
  ];
  const sorted = [...knownPlaces].sort((a, b) => b.length - a.length);
  return sorted.find((place) => n.includes(normalize(place))) || null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body.message || "").trim();
    if (message.length < 3) return NextResponse.json({ error: "Décrivez le bien recherché." }, { status: 400 });

    const transactionType = parseTransaction(message);
    const type = parseType(message);
    const bedrooms = parseBedrooms(message);
    const bathrooms = parseBathrooms(message);
    const guests = parseGuests(message);
    const areaSqm = parseArea(message);
    const parkingSpaces = parseParking(message);
    const furnished = parseFurnished(message);
    const maxPrice = parseBudget(message);
    const location = parseCityOrDistrict(message);

    const and: Prisma.PropertyWhereInput[] = [];
    const where: Prisma.PropertyWhereInput = { status: "PUBLISHED", AND: and };
    if (transactionType) where.transactionType = transactionType;
    if (type) where.type = type;
    if (bedrooms && type !== "LAND") where.bedrooms = { gte: bedrooms };
    if (bathrooms && type !== "LAND") where.bathrooms = { gte: bathrooms };
    if (guests && transactionType === "SHORT_TERM") where.maxGuests = { gte: guests };
    if (parkingSpaces && type !== "LAND") where.parkingSpaces = { gte: parkingSpaces };
    if (furnished !== null && type !== "LAND") where.furnished = furnished;
    if (maxPrice) {
      if (transactionType === "SHORT_TERM") where.nightlyPrice = { lte: maxPrice };
      else where.price = { lte: maxPrice };
    }
    if (areaSqm) {
      if (type === "LAND") where.landAreaSqm = { gte: areaSqm };
      else and.push({ OR: [{ areaSqm: { gte: areaSqm } }, { landAreaSqm: { gte: areaSqm } }] });
    }
    if (location) and.push({ OR: [
      { city: { contains: location, mode: "insensitive" } },
      { district: { contains: location, mode: "insensitive" } },
      { address: { contains: location, mode: "insensitive" } },
    ] });

    const properties = await prisma.property.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 9,
      select: {
        id: true, title: true, city: true, district: true, price: true, nightlyPrice: true, currency: true,
        transactionType: true, bedrooms: true, bathrooms: true, type: true, areaSqm: true, landAreaSqm: true,
        furnished: true, parkingSpaces: true,
      },
    });

    const understood: string[] = [];
    if (type) understood.push(type === "HOUSE" ? "maison" : type === "APARTMENT" ? "appartement" : type === "LAND" ? "terrain" : type.toLowerCase());
    if (transactionType) understood.push(transactionType === "SALE" ? "à vendre" : transactionType === "RENT" ? "à louer" : "en location courte durée");
    if (bedrooms) understood.push(`${bedrooms} chambre(s) minimum`);
    if (bathrooms) understood.push(`${bathrooms} salle(s) de bain minimum`);
    if (guests) understood.push(`${guests} personne(s)`);
    if (areaSqm) understood.push(`${areaSqm} m² minimum`);
    if (parkingSpaces) understood.push(`${parkingSpaces} place(s) de parking minimum`);
    if (furnished === true) understood.push("meublé");
    if (furnished === false) understood.push("non meublé");
    if (location) understood.push(`à ${location.replace(/\b\w/g, (letter) => letter.toUpperCase())}`);
    if (maxPrice) understood.push(`jusqu’à ${maxPrice.toLocaleString("fr-FR")} FCFA${transactionType === "SHORT_TERM" ? " / nuit" : transactionType === "RENT" ? " / mois" : ""}`);

    const reply = properties.length
      ? `J’ai compris votre recherche${understood.length ? ` : ${understood.join(", ")}` : ""}. J’ai trouvé ${properties.length} annonce(s) correspondante(s).`
      : `J’ai compris votre recherche${understood.length ? ` : ${understood.join(", ")}` : ""}, mais aucune annonce publiée ne correspond exactement pour le moment.`;

    return NextResponse.json({
      reply,
      filters: { transactionType, type, bedrooms, bathrooms, guests, areaSqm, parkingSpaces, furnished, maxPrice, location },
      properties: properties.map((property) => ({
        ...property,
        price: property.price.toString(),
        nightlyPrice: property.nightlyPrice?.toString() ?? null,
      })),
    });
  } catch (error) {
    console.error("assistant-immobilier", error);
    return NextResponse.json({ error: "L’assistant immobilier est temporairement indisponible." }, { status: 500 });
  }
}
