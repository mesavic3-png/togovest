import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères."),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères."),
  type: z.enum(["HOUSE", "APARTMENT", "LAND", "VILLA", "OFFICE", "SHOP", "WAREHOUSE", "OTHER"]),
  transactionType: z.enum(["SALE", "RENT"]),
  price: z.coerce.number().positive("Le prix doit être supérieur à 0."),
  city: z.string().min(2),
  district: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  bathrooms: z.coerce.number().int().nonnegative().optional(),
  areaSqm: z.coerce.number().positive().optional(),
  landAreaSqm: z.coerce.number().positive().optional(),
  parkingSpaces: z.coerce.number().int().nonnegative().optional(),
  furnished: z.coerce.boolean().default(false),
  imageUrls: z.array(z.string().url()).max(12).default([]),
});

export type PropertyInput = z.infer<typeof propertySchema>;
