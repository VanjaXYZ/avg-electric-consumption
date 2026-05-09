import { useEffect, useMemo, useState } from "react"

import { getRecommendation } from "./api/recommendation"
import { getTaxGroups } from "./api/tax-groups"
import { RecommendationForm } from "./components/recommendation/RecommendationForm"
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table"
import type { RecommendationResponse } from "./types/recommendation"
import type { TaxGroup } from "./types/tax-group"

function App() {
  const [taxGroups, setTaxGroups] = useState<TaxGroup[]>([])
  const [isLoadingTaxGroups, setIsLoadingTaxGroups] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RecommendationResponse | null>(null)

  const defaultTaxGroupName = useMemo(
    () => (taxGroups.length > 0 ? taxGroups[0].name : undefined),
    [taxGroups]
  )

  const formatCurrency = useMemo(() => {
    const currency = import.meta.env.VITE_CURRENCY ?? "BAM"
    const nf = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    })
    return (value: number) => nf.format(value)
  }, [])

  useEffect(() => {
    let ignore = false

    const loadTaxGroups = async (): Promise<void> => {
      setIsLoadingTaxGroups(true)
      setError(null)

      try {
        const data = await getTaxGroups()
        if (ignore) return
        setTaxGroups(data)
      } catch (e: any) {
        if (ignore) return
        setError(
          e?.response?.data?.error ?? e?.message ?? "Failed to load tax groups"
        )
      } finally {
        if (ignore) return
        setIsLoadingTaxGroups(false)
      }
    }

    loadTaxGroups()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-muted/40 to-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <header className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Electricity plan recommendation
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Enter your average monthly consumption and tax group to get the most
            cost-efficient billing plan.
          </p>
        </header>

        <div className="grid gap-6">
          <RecommendationForm
            taxGroups={taxGroups}
            defaultTaxGroupName={defaultTaxGroupName}
            isDisabled={isLoadingTaxGroups}
            isLoading={isSubmitting}
            onSubmit={async (values) => {
              setError(null)
              setResult(null)
              setIsSubmitting(true)
              try {
                const data = await getRecommendation(values)
                setResult(data)
              } catch (e: any) {
                setError(
                  e?.response?.data?.error ??
                  e?.message ??
                  "Recommendation failed"
                )
              } finally {
                setIsSubmitting(false)
              }
            }}
          />

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <>
              <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-background">
                <CardHeader>
                  <CardTitle>Recommended plan</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-lg font-semibold">
                    {result.recommended.planName}
                  </div>
                  <div className="rounded-lg border bg-background/60 px-3 py-2 text-sm">
                    Grand total:{" "}
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(result.recommended.costs.grandTotal)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>All plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan</TableHead>
                        <TableHead className="text-right">Energy</TableHead>
                        <TableHead className="text-right">Discount</TableHead>
                        <TableHead className="text-right">
                          After discount
                        </TableHead>
                        <TableHead className="text-right">Eco tax</TableHead>
                        <TableHead className="text-right">VAT</TableHead>
                        <TableHead className="text-right">Grand total</TableHead>
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
                          <TableCell className="font-medium">
                            {p.planName}
                          </TableCell>
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
      </div>
    </main>
  )
}

export default App

