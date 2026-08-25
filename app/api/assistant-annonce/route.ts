import { NextResponse } from "next/server";

type PropertyMeta = {
  label: string;
  article: "un" | "une";
  feminine: boolean;
};

const PROPERTY_TYPES: Record<string, PropertyMeta> = {
  HOUSE: { label: "maison", article: "une", feminine: true },
  VILLA: { label: "villa", article: "une", feminine: true },
  APARTMENT: { label: "appartement", article: "un", feminine: false },
  LAND: { label: "terrain", article: "un", feminine: false },
  OFFICE: { label: "bureau", article: "un", feminine: false },
  SHOP: { label: "local commercial", article: "un", feminine: false },
  WAREHOUSE: { label: "entrepôt", article: "un", feminine: false },
  OTHER: { label: "bien immobilier", article: "un", feminine: false },
};

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function money(value: number | null) {
  return value ? `${value.toLocaleString("fr-FR")} FCFA` : null;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function joinFrench(items: string[]) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} et ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const meta = PROPERTY_TYPES[String(body.type || "OTHER")] || PROPERTY_TYPES.OTHER;
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

    const isLand = meta.label === "terrain";
    const location = district ? `${district}, ${city}` : city;
    const furnishedLabel = meta.feminine ? "meublée" : "meublé";

    const titleDetails: string[] = [];
    if (bedrooms && !isLand) titleDetails.push(`${bedrooms} chambre${bedrooms > 1 ? "s" : ""}`);
    if (furnished && !isLand) titleDetails.push(furnishedLabel);

    const transactionLabel = transactionType === "SALE"
      ? "à vendre"
      : transactionType === "RENT"
        ? "à louer"
        : "en location courte durée";

    const title = `${capitalize(meta.label)}${titleDetails.length ? ` ${titleDetails.join(" • ")}` : ""} ${transactionLabel} à ${location}`
      .replace(/\s+/g, " ")
      .trim();

    const features: string[] = [];
    if (bedrooms && !isLand) features.push(`${bedrooms} chambre${bedrooms > 1 ? "s" : ""}`);
    if (bathrooms && !isLand) features.push(`${bathrooms} salle${bathrooms > 1 ? "s" : ""} de bain`);
    if (areaSqm && !isLand) features.push(`une surface habitable de ${areaSqm} m²`);
    if (landAreaSqm) features.push(`un terrain de ${landAreaSqm} m²`);
    if (parkingSpaces) features.push(`${parkingSpaces === 1 ? "une" : parkingSpaces} place${parkingSpaces > 1 ? "s" : ""} de parking`);
    if (furnished && !isLand) features.push(`un aménagement ${furnishedLabel}`);
    if (maxGuests && transactionType === "SHORT_TERM") features.push(`une capacité d’accueil allant jusqu’à ${maxGuests} voyageur${maxGuests > 1 ? "s" : ""}`);

    const priceText = transactionType === "SHORT_TERM" ? money(nightlyPrice) : money(price);
    const priceSentence = priceText
      ? transactionType === "SALE"
        ? `Le prix de vente est fixé à ${priceText}.`
        : transactionType === "RENT"
          ? `Le loyer mensuel est de ${priceText}.`
          : `Le tarif est de ${priceText} par nuit.`
      : "";

    const intro = transactionType === "SALE"
      ? `Découvrez ${meta.article} ${meta.label} proposé${meta.feminine ? "e" : ""} à la vente à ${location}.`
      : transactionType === "RENT"
        ? `Découvrez ${meta.article} ${meta.label} proposé${meta.feminine ? "e" : ""} à la location à ${location}.`
        : `Découvrez ${meta.article} ${meta.label} idéal${meta.feminine ? "e" : ""} pour un séjour de courte durée à ${location}.`;

    const featureSentence = features.length
      ? `${capitalize(meta.article)} ${meta.label} comprend ${joinFrench(features)}.`
      : `Ce bien bénéficie d’un emplacement à découvrir à ${location}.`;

    let closing: string;
    if (isLand) {
      closing = "Ce terrain peut convenir à un projet résidentiel, commercial ou d’investissement, sous réserve des règles d’urbanisme applicables. Contactez l’annonceur pour obtenir davantage d’informations et organiser une visite.";
    } else if (transactionType === "SHORT_TERM") {
      closing = "Ce logement est adapté aux séjours professionnels, aux vacances ou aux déplacements en famille. Contactez l’annonceur pour connaître les disponibilités et les conditions de réservation.";
    } else if (transactionType === "SALE") {
      closing = "Ce bien représente une opportunité intéressante pour une résidence principale ou un investissement immobilier. Contactez l’annonceur pour obtenir davantage d’informations et organiser une visite.";
    } else {
      closing = "Ce bien offre un cadre adapté à une location longue durée. Contactez l’annonceur pour obtenir davantage d’informations et organiser une visite.";
    }

    return NextResponse.json({
      title,
      description: `${intro}\n\n${featureSentence}${priceSentence ? ` ${priceSentence}` : ""}\n\n${closing}`,
    });
  } catch (error) {
    console.error("assistant-annonce", error);
    return NextResponse.json({ error: "La génération de l’annonce est temporairement indisponible." }, { status: 500 });
  }
}
