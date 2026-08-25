import { NextResponse } from "next/server";
import { Prisma, PropertyType, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function normalize(input: string) {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function parseBudget(text: string) {
  const normalized = normalize(text).replace(/\s+/g, " ");
  const million = normalized.match(/(?:moins de|max(?:imum)?|budget(?: de)?|jusqu(?:'|’)a)?\s*([0-9]+(?:[.,][0-9]+)?)\s*(?:million|millions|m)\b/);
  if (million) return Math.round(Number(million[1].replace(",", ".")) * 1_000_000);
  const plain = normalized.match(/(?:moins de|max(?:imum)?|budget(?: de)?|jusqu(?:'|’)a)?\s*([0-9][0-9 .]{3,})\s*(?:fcfa|xof)/);
  if (plain) return Number(plain[1].replace(/[ .]/g, ""));
  return null;
}

function parseBedrooms(text: string) {
  const match = normalize(text).match(/(\d+)\s*(?:chambre|chambres|ch)/);
  return match ? Number(match[1]) : null;
}

function parseGuests(text: string) {
  const match = normalize(text).match(/(\d+)\s*(?:personne|personnes|voyageur|voyageurs)/);
  return match ? Number(match[1]) : null;
}

function parseTransaction(text: string): TransactionType | null {
  const n = normalize(text);
  if (/court sejour|courte duree|nuit|nuitee|vacances|airbnb/.test(n)) return "SHORT_TERM";
  if (/a louer|location|louer|par mois|mensuel/.test(n)) return "RENT";
  if (/a vendre|vente|acheter|achat|acquerir/.test(n)) return "SALE";
  return null;
}

function parseType(text: string): PropertyType | null {
  const n = normalize(text);
  if (/villa/.test(n)) return "VILLA";
  if (/appartement|studio/.test(n)) return "APARTMENT";
  if (/terrain|parcelle/.test(n)) return "LAND";
  if (/bureau/.test(n)) return "OFFICE";
  if (/boutique|magasin/.test(n)) return "SHOP";
  if (/entrepot/.test(n)) return "WAREHOUSE";
  if (/maison/.test(n)) return "HOUSE";
  return null;
}

function parseCityOrDistrict(text: string) {
  const n = normalize(text);
  const knownPlaces = ["lome", "agoe", "adidogome", "begué", "bague", "tokoin", "be", "kegue", "baguida", "avepozo", "aneho", "kpalime", "kara", "sokode", "atakpame", "tsévié", "tsevie"];
  return knownPlaces.find((place) => n.includes(normalize(place))) || null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body.message || "").trim();
    if (message.length < 3) return NextResponse.json({ error: "Décrivez le bien recherché." }, { status: 400 });

    const transactionType = parseTransaction(message);
    const type = parseType(message);
    const bedrooms = parseBedrooms(message);
    const guests = parseGuests(message);
    const maxPrice = parseBudget(message);
    const location = parseCityOrDistrict(message);

    const and: Prisma.PropertyWhereInput[] = [];
    const where: Prisma.PropertyWhereInput = { status: "PUBLISHED", AND: and };
    if (transactionType) where.transactionType = transactionType;
    if (type) where.type = type;
    if (bedrooms && type !== "LAND") where.bedrooms = { gte: bedrooms };
    if (guests && transactionType === "SHORT_TERM") where.maxGuests = { gte: guests };
    if (maxPrice) where.price = { lte: maxPrice };
    if (location) and.push({ OR: [
      { city: { contains: location, mode: "insensitive" } },
      { district: { contains: location, mode: "insensitive" } },
    ] });

    const properties = await prisma.property.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 9,
      select: { id: true, title: true, city: true, district: true, price: true, currency: true, transactionType: true, bedrooms: true, type: true },
    });

    const understood: string[] = [];
    if (type) understood.push(type === "HOUSE" ? "maison" : type === "APARTMENT" ? "appartement" : type === "LAND" ? "terrain" : type.toLowerCase());
    if (transactionType) understood.push(transactionType === "SALE" ? "à vendre" : transactionType === "RENT" ? "à louer" : "en location courte durée");
    if (bedrooms) understood.push(`${bedrooms} chambre(s) minimum`);
    if (guests) understood.push(`${guests} personne(s)`);
    if (location) understood.push(`à ${location.charAt(0).toUpperCase() + location.slice(1)}`);
    if (maxPrice) understood.push(`jusqu’à ${maxPrice.toLocaleString("fr-FR")} FCFA`);

    const reply = properties.length
      ? `J’ai compris votre recherche${understood.length ? ` : ${understood.join(", ")}` : ""}. J’ai trouvé ${properties.length} annonce(s) correspondante(s).`
      : `J’ai compris votre recherche${understood.length ? ` : ${understood.join(", ")}` : ""}, mais aucune annonce publiée ne correspond exactement pour le moment.`;

    return NextResponse.json({
      reply,
      filters: { transactionType, type, bedrooms, guests, maxPrice, location },
      properties: properties.map((property) => ({ ...property, price: property.price.toString() })),
    });
  } catch (error) {
    console.error("assistant-immobilier", error);
    return NextResponse.json({ error: "L’assistant immobilier est temporairement indisponible." }, { status: 500 });
  }
}
