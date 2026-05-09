import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { sanitizeDecimalInput } from "../../lib/input"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import type { Recommendation } from "../../types/recommendation"
import type { TaxGroup } from "../../types/tax-group"
import {
  recommendationFormSchema,
  type RecommendationFormValues,
} from "../../validation/recommendation"
import { useTranslation } from "react-i18next"

type Props = {
  taxGroups: TaxGroup[]
  defaultTaxGroupName?: string
  isLoading?: boolean
  isDisabled?: boolean
  onSubmit: (values: Recommendation) => void | Promise<void>
}

export function RecommendationForm({
  taxGroups,
  defaultTaxGroupName,
  isLoading = false,
  isDisabled = false,
  onSubmit,
}: Props) {
  const { t } = useTranslation()
  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationFormSchema),
    defaultValues: {
      kwh: "",
      taxGroup: defaultTaxGroupName ?? "",
    },
    mode: "onSubmit",
  })

  const kwhError = form.formState.errors.kwh?.message
  const taxError = form.formState.errors.taxGroup?.message

  return (
    <Card className="border-foreground/10 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle>{t("recommendationForm.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("recommendationForm.subtitle")}
        </p>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-6"
          onSubmit={form.handleSubmit((values) =>
            onSubmit({ kwh: Number(values.kwh), taxGroup: values.taxGroup })
          )}
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_minmax(240px,320px)]">
            <div className="grid gap-2">
              <Label htmlFor="kwh">{t("recommendationForm.kwhLabel")}</Label>
              <Input
                id="kwh"
                inputMode="decimal"
                placeholder={t("recommendationForm.kwhPlaceholder")}
                disabled={isDisabled || isLoading}
                aria-invalid={!!kwhError}
                {...form.register("kwh", {
                  onChange: (e) => {
                    e.target.value = sanitizeDecimalInput(e.target.value)
                  },
                })}
              />
              <div className="min-h-4 text-xs">
                {kwhError ? (
                  <span className="text-destructive">{kwhError}</span>
                ) : (
                  <span className="text-muted-foreground">
                    {t("recommendationForm.kwhTip")}
                  </span>
                )}
              </div>
            </div>

            <div className="grid min-w-0 gap-2">
              <Label>{t("recommendationForm.taxGroupLabel")}</Label>
              <Controller
                name="taxGroup"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isDisabled || isLoading || taxGroups.length === 0}
                  >
                    <SelectTrigger
                      className="w-full min-w-0"
                      aria-invalid={!!taxError}
                    >
                      <SelectValue placeholder={t("recommendationForm.taxGroupPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
                      {taxGroups.map((g) => (
                        <SelectItem key={g.id} value={g.name}>
                          <div className="flex w-full items-center justify-between gap-3">
                            <span>{g.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {t("recommendationForm.taxGroupVatHint", {
                                percent: Math.round(g.vat * 100),
                              })}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <div className="min-h-4 text-xs">
                {taxError ? (
                  <span className="text-destructive">{taxError}</span>
                ) : (
                  <span className="text-muted-foreground">
                    {t("recommendationForm.taxGroupTip")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">

            <Button
              type="submit"
              className="sm:min-w-44"
              disabled={isDisabled || isLoading}
            >
              {isLoading ? t("recommendationForm.submitting") : t("recommendationForm.submit")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}