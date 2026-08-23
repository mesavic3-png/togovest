export const plans = {
  FREE: { name: "Gratuit", priceXof: 0, listingLimit: 2, featuredCredits: 0, agencySeats: 1 },
  PRO: { name: "Pro", priceXof: 15000, listingLimit: 25, featuredCredits: 2, agencySeats: 1 },
  AGENCY: { name: "Agence", priceXof: 50000, listingLimit: 150, featuredCredits: 10, agencySeats: 10 },
} as const;

export type PlanCode = keyof typeof plans;

export const oneOffProducts = {
  BOOST_7_DAYS: { name: "Boost 7 jours", priceXof: 5000, days: 7 },
  FEATURED_30_DAYS: { name: "Annonce Premium 30 jours", priceXof: 12000, days: 30 },
} as const;
