import { useEffect, useMemo, useState } from "react"

import { getRecommendation } from "../api/recommendation"
import { getTaxGroups } from "../api/tax-groups"
import { getApiErrorMessage } from "../api/error"
import { createCurrencyFormatter } from "../lib/format"
import { RecommendationForm } from "../components/recommendation/RecommendationForm"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Skeleton } from "../components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import type { RecommendationResponse } from "../types/recommendation"
import type { TaxGroup } from "../types/tax-group"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

export function RecommendationPage() {
  const { t } = useTranslation()
  const [taxGroups, setTaxGroups] = useState<TaxGroup[]>([])
  const [isLoadingTaxGroups, setIsLoadingTaxGroups] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RecommendationResponse | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const defaultTaxGroupName = useMemo(
    () => (taxGroups.length > 0 ? taxGroups[0].name : undefined),
    [taxGroups]
  )

  const formatCurrency = useMemo(() => createCurrencyFormatter(), [])

  useEffect(() => {
    let ignore = false

    async function loadTaxGroups() {
      setIsLoadingTaxGroups(true)
      setError(null)
      try {
        const data = await getTaxGroups()
        if (ignore) return
        setTaxGroups(data)
      } catch (e) {
        if (ignore) return
        setError(getApiErrorMessage(e, t("adminTaxGroups.loadFailFallback")))
      } finally {
        if (ignore) return
        setIsLoadingTaxGroups(false)
      }
    }

    void loadTaxGroups()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className="grid gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("recommendation.pageTitle")}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {t("recommendation.pageSubtitle")}
        </p>
      </header>

      <RecommendationForm
        taxGroups={taxGroups}
        defaultTaxGroupName={defaultTaxGroupName}
        isDisabled={isLoadingTaxGroups}
        isLoading={isSubmitting}
        onSubmit={async (values) => {
          setHasSubmitted(true)
          setError(null)
          setResult(null)
          setIsSubmitting(true)
          try {
            const data = await getRecommendation(values)
            setResult(data)
            toast.success(t("recommendation.toastSuccess"))
          } catch (e) {
            const msg = getApiErrorMessage(e, t("recommendation.toastFailFallback"))
            setError(msg)
            toast.error(msg)
          } finally {
            setIsSubmitting(false)
          }
        }}
      />

      {!isLoadingTaxGroups && taxGroups.length === 0 && !error && (
        <Alert>
          <AlertTitle>{t("recommendation.taxGroupsEmptyTitle")}</AlertTitle>
          <AlertDescription>
            {t("recommendation.taxGroupsEmptyDesc")}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t("common.error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!result && !error && !isSubmitting && !hasSubmitted && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{t("recommendation.howItWorksTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            {(t("recommendation.howItWorksSteps", { returnObjects: true }) as string[]).map(
              (step, index) => (
                <p key={index}>{`${index + 1}. ${step}`}</p>
              )
            )}
          </CardContent>
        </Card>
      )}

      {isSubmitting && !result && (
        <div className="grid gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t("recommendation.recommendedPlanTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Skeleton className="h-6 w-52" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t("recommendation.allPlansTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      )}

      {result && (
        <>
          <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-background">
            <CardHeader>
              <CardTitle>{t("recommendation.recommendedPlanTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-lg font-semibold">
                {result.recommended.planName}
              </div>
              <div className="rounded-lg border bg-background/60 px-3 py-2 text-sm">
                {t("recommendation.grandTotal")}:{" "}
                <span className="font-semibold tabular-nums">
                  {formatCurrency(result.recommended.costs.grandTotal)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{t("recommendation.allPlansTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("recommendation.table.plan")}</TableHead>
                    <TableHead className="text-right">
                      {t("recommendation.table.energy")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("recommendation.table.discount")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("recommendation.table.afterDiscount")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("recommendation.table.ecoTax")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("recommendation.table.vat")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("recommendation.table.grandTotal")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.allPlans.map((p) => (
                    <TableRow
                      key={p.planId}
                      className={
                        p.planId === result.recommended.planId
                          ? "bg-primary/5"
                          : undefined
                      }
                    >
                      <TableCell className="font-medium">{p.planName}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(p.costs.energySubtotal)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(
                          p.costs.energySubtotal - p.costs.energyAfterDiscount
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(p.costs.energyAfterDiscount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(p.costs.ecoTaxTotal)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(p.costs.vatAmount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatCurrency(p.costs.grandTotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

