import { NextResponse } from "next/server";

const TYPE_LABELS: Record<string, string> = {
  HOUSE: "Maison",
  VILLA: "Villa",
  APARTMENT: "Appartement",
  LAND: "Terrain",
  OFFICE: "Bureau",
  SHOP: "Local commercial",
  WAREHOUSE: "Entrepôt",
  OTHER: "Bien immobilier",
};

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function money(value: number | null) {
  return value ? `${value.toLocaleString("fr-FR")} FCFA` : null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const type = TYPE_LABELS[String(body.type || "OTHER")] || "Bien immobilier";
    const transactionType = String(body.transactionType || "SALE");
    const city = String(body.city || "").trim();
    const district = String(body.district || "").trim();
    const bedrooms = number(body.bedrooms);
    const bathrooms = number(body.bathrooms);
    const areaSqm = number(body.areaSqm);
    const landAreaSqm = number(body.landAreaSqm);
    const parkingSpaces = number(body.parkingSpaces);
    const maxGuests = number(body.maxGuests);
    const price = number(body.price);
    const nightlyPrice = number(body.nightlyPrice);
    const furnished = Boolean(body.furnished);

    if (!city) {
      return NextResponse.json({ error: "Ajoutez au moins la ville avant de générer l’annonce." }, { status: 400 });
    }

    const location = district ? `${district}, ${city}` : city;
    const transactionLabel = transactionType === "SALE" ? "à vendre" : transactionType === "RENT" ? "à louer" : "en location courte durée";
    const titleParts = [type];
    if (bedrooms && type !== "Terrain") titleParts.push(`${bedrooms} chambre${bedrooms > 1 ? "s" : ""}`);
    if (furnished && type !== "Terrain") titleParts.push("meublé");
    titleParts.push(transactionLabel, `à ${location}`);
    const title = titleParts.join(" ").replace(/\s+/g, " ");

    const features: string[] = [];
    if (bedrooms && type !== "Terrain") features.push(`${bedrooms} chambre${bedrooms > 1 ? "s" : ""}`);
    if (bathrooms && type !== "Terrain") features.push(`${bathrooms} salle${bathrooms > 1 ? "s" : ""} de bain`);
    if (areaSqm) features.push(`${areaSqm} m² de surface habitable`);
    if (landAreaSqm) features.push(`${landAreaSqm} m² de terrain`);
    if (parkingSpaces) features.push(`${parkingSpaces} place${parkingSpaces > 1 ? "s" : ""} de parking`);
    if (furnished && type !== "Terrain") features.push("vendu/loué meublé");
    if (maxGuests && transactionType === "SHORT_TERM") features.push(`capacité jusqu’à ${maxGuests} voyageurs`);

    const priceText = transactionType === "SHORT_TERM" ? money(nightlyPrice) : money(price);
    const priceSentence = priceText
      ? transactionType === "SALE"
        ? `Le prix de vente est fixé à ${priceText}.`
        : transactionType === "RENT"
          ? `Le loyer demandé est de ${priceText} par mois.`
          : `Le tarif est de ${priceText} par nuit.`
      : "";

    const intro = transactionType === "SALE"
      ? `Découvrez ce ${type.toLowerCase()} disponible à la vente à ${location}.`
      : transactionType === "RENT"
        ? `Découvrez ce ${type.toLowerCase()} disponible à la location à ${location}.`
        : `Profitez de ce ${type.toLowerCase()} à ${location} pour vos séjours de courte durée.`;

    const featureSentence = features.length
      ? `Le bien offre ${features.join(", ")}.`
      : "Une opportunité à découvrir dans un emplacement recherché.";

    const closing = transactionType === "SHORT_TERM"
      ? "Idéal pour un séjour confortable, ce bien convient aussi bien aux voyageurs d’affaires qu’aux séjours en famille. Contactez l’annonceur pour vérifier les disponibilités et réserver."
      : "Ce bien constitue une belle opportunité pour vivre, investir ou développer votre projet immobilier. Contactez l’annonceur pour obtenir plus d’informations et organiser une visite.";

    return NextResponse.json({
      title,
      description: `${intro}\n\n${featureSentence}${priceSentence ? ` ${priceSentence}` : ""}\n\n${closing}`,
    });
  } catch (error) {
    console.error("assistant-annonce", error);
    return NextResponse.json({ error: "La génération de l’annonce est temporairement indisponible." }, { status: 500 });
  }
}
