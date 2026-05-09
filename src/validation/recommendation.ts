import { z } from "zod"

export const recommendationFormSchema = z.object({
  kwh: z
    .string()
    .min(1, "kWh is required")
    .refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, {
      message: "kWh must be greater than 0",
    }),
  taxGroup: z.string().min(1, "Tax group is required"),
})

export type RecommendationFormValues = z.infer<typeof recommendationFormSchema>

