import { z } from "zod"

import { zLocaleNumber } from "./numbers"

export const pricingTierSchema = z.object({
  threshold: z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim())
    .refine((v) => v === "" || Number.isFinite(Number(v.replace(",", "."))), {
      message: "Threshold must be empty or a number",
    })
    .transform((v) => (v === "" ? null : Number(v.replace(",", "."))))
    .refine((v) => v === null || v >= 0, {
      message: "Threshold must be null or >= 0",
    }),
  pricePerKwh: zLocaleNumber(
    z.number().finite().positive("Price per kWh must be positive")
  ),
})

export const planUpsertSchema = z.object({
  name: z.string().min(1, "Name is required"),
  discount: zLocaleNumber(
    z
      .number()
      .finite()
      .min(0, "Discount must be between 0 and 1")
      .max(1, "Discount must be between 0 and 1")
  ),
  pricingTiers: z
    .array(pricingTierSchema)
    .min(1, "At least one pricing tier is required"),
})

export type PlanUpsertValues = z.infer<typeof planUpsertSchema>

