import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères."),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères."),
  type: z.enum(["HOUSE", "APARTMENT", "LAND", "VILLA", "OFFICE", "SHOP", "WAREHOUSE", "OTHER"]),
  transactionType: z.enum(["SALE", "RENT", "SHORT_TERM"]),
  price: z.coerce.number().positive("Le prix doit être supérieur à 0."),
  nightlyPrice: z.coerce.number().positive().optional(),
  weeklyPrice: z.coerce.number().positive().optional(),
  monthlyPrice: z.coerce.number().positive().optional(),
  cleaningFee: z.coerce.number().nonnegative().optional(),
  securityDeposit: z.coerce.number().nonnegative().optional(),
  minNights: z.coerce.number().int().positive().optional(),
  maxGuests: z.coerce.number().int().positive().optional(),
  checkInTime: z.string().optional().or(z.literal("")),
  checkOutTime: z.string().optional().or(z.literal("")),
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
}).superRefine((data, ctx) => {
  if (data.transactionType === "SHORT_TERM") {
    if (!data.nightlyPrice) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["nightlyPrice"], message: "Le prix par nuit est requis." });
    if (!data.maxGuests) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["maxGuests"], message: "Le nombre maximum de voyageurs est requis." });
    if (!data.minNights) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["minNights"], message: "Le nombre minimum de nuits est requis." });
  }
});

export type PropertyInput = z.infer<typeof propertySchema>;
