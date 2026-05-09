import { z } from "zod"

import { zLocaleNumber } from "./numbers"

export const taxGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  vat: zLocaleNumber(z.number().finite().min(0, "VAT must be non-negative")),
  ecoTax: zLocaleNumber(
    z.number().finite().min(0, "Eco tax must be non-negative")
  ),
})

export type TaxGroupValues = z.infer<typeof taxGroupSchema>

