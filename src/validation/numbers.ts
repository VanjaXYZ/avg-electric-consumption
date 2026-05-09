import { z } from "zod"

export function parseLocaleNumber(value: unknown) {
  if (typeof value !== "string") return value
  return value.trim().replace(",", ".")
}

export function zLocaleNumber(schema: z.ZodNumber) {
  return z.preprocess(parseLocaleNumber, z.coerce.number()).pipe(schema)
}

