import { useEffect, useMemo, useRef, useState } from "react"

import { createPlan, deletePlan, getPlans, updatePlan } from "../../api/plans"
import { getApiErrorMessage } from "../../api/error"
import { sanitizeDecimalInput } from "../../lib/input"
import {
  PricingTiersEditor,
  type TierDraft,
} from "../../components/admin/PricingTiersEditor"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { Skeleton } from "../../components/ui/skeleton"
import type { Plan, PlanUpsertRequest } from "../../types/plan"
import { planUpsertSchema } from "../../validation/plan"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

type FormDraft = {
  id?: number
  name: string
  discount: string
  pricingTiers: TierDraft[]
}

type FieldErrors = {
  name?: string
  discount?: string
  pricingTiers?: Record<number, { threshold?: string; pricePerKwh?: string }>
}

function toDraft(plan: Plan): FormDraft {
  return {
    id: plan.id,
    name: plan.name,
    discount: String(plan.discount),
    pricingTiers: plan.pricingTiers.map((t) => ({
      threshold: t.threshold === null ? "" : String(t.threshold),
      pricePerKwh: String(t.pricePerKwh),
    })),
  }
}

export function AdminPlansPage() {
  const { t: tr } = useTranslation()
  const [items, setItems] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const nameRef = useRef<HTMLInputElement | null>(null)
  const initialDraftRef = useRef<FormDraft | null>(null)

  const [form, setForm] = useState<FormDraft>({
    name: "",
    discount: "",
    pricingTiers: [{ threshold: "", pricePerKwh: "" }],
  })

  const isEdit = useMemo(() => typeof form.id === "number", [form.id])

  const isDirty = useMemo(() => {
    const initial = initialDraftRef.current
    if (!isEdit || !initial) return false
    return JSON.stringify(form) !== JSON.stringify(initial)
  }, [form, isEdit])

  function mapIssuesToFieldErrors(
    issues: { path: readonly PropertyKey[]; message: string }[]
  ) {
    const next: FieldErrors = {}
    for (const issue of issues) {
      const [p0, p1, p2] = issue.path as readonly (string | number | symbol)[]
      if (p0 === "name") next.name = issue.message
      if (p0 === "discount") next.discount = issue.message
      if (p0 === "pricingTiers" && typeof p1 === "number") {
        next.pricingTiers ??= {}
        next.pricingTiers[p1] ??= {}
        if (p2 === "threshold") next.pricingTiers[p1].threshold = issue.message
        if (p2 === "pricePerKwh") next.pricingTiers[p1].pricePerKwh = issue.message
        if (typeof p2 === "undefined") {
          // array-level error (e.g. min length). show it on first tier price field.
          next.pricingTiers[p1].pricePerKwh ??= issue.message
        }
      }
    }
    return next
  }

  function resetToCreate() {
    setFieldErrors({})
    initialDraftRef.current = null
    setForm({
      name: "",
      discount: "",
      pricingTiers: [{ threshold: "", pricePerKwh: "" }],
    })
    queueMicrotask(() => nameRef.current?.focus())
  }

  function startEdit(nextDraft: FormDraft) {
    setFieldErrors({})
    initialDraftRef.current = nextDraft
    setForm(nextDraft)
    queueMicrotask(() => nameRef.current?.focus())
  }

  async function refresh() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getPlans()
      setItems(data)
    } catch (e) {
      setError(getApiErrorMessage(e, tr("adminPlans.loadFailFallback")))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function onSave() {
    setIsSaving(true)
    setError(null)
    setFieldErrors({})
    try {
      const parsed = planUpsertSchema.safeParse({
        name: form.name,
        discount: form.discount,
        pricingTiers: form.pricingTiers.map((t) => ({
          threshold: t.threshold,
          pricePerKwh: t.pricePerKwh,
        })),
      })

      if (!parsed.success) {
        setFieldErrors(mapIssuesToFieldErrors(parsed.error.issues))
        return
      }

      const body: PlanUpsertRequest = parsed.data as PlanUpsertRequest

      if (isEdit) {
        await updatePlan(form.id!, body)
        toast.success(tr("adminPlans.toastUpdated"))
      } else {
        await createPlan(body)
        toast.success(tr("adminPlans.toastCreated"))
      }

      resetToCreate()
      await refresh()
    } catch (e) {
      const msg = getApiErrorMessage(e, tr("adminPlans.saveFailFallback"))
      setError(msg)
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  async function onDelete(id: number) {
    if (!window.confirm(tr("adminPlans.confirmDelete"))) return
    setError(null)
    try {
      await deletePlan(id)
      toast.success(tr("adminPlans.toastDeleted"))
      await refresh()
    } catch (e) {
      const msg = getApiErrorMessage(e, tr("adminPlans.deleteFailFallback"))
      setError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="grid gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{tr("adminPlans.pageTitle")}</h1>
        <p className="text-sm text-muted-foreground">
          {tr("adminPlans.pageSubtitle")}
        </p>
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>{tr("common.error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>
            {isEdit ? tr("adminPlans.formTitleEdit") : tr("adminPlans.formTitleCreate")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="plan-name">{tr("adminPlans.nameLabel")}</Label>
              <Input
                id="plan-name"
                ref={nameRef}
                value={form.name}
                placeholder={tr("adminPlans.namePlaceholder")}
                onChange={(e) => {
                  setFieldErrors((s) => ({ ...s, name: undefined }))
                  setForm((s) => ({ ...s, name: e.target.value }))
                }}
              />
              {fieldErrors.name && (
                <div className="text-xs text-destructive">{fieldErrors.name}</div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plan-discount">{tr("adminPlans.discountLabel")}</Label>
              <Input
                id="plan-discount"
                inputMode="decimal"
                placeholder={tr("adminPlans.discountPlaceholder")}
                value={form.discount}
                onChange={(e) => {
                  setFieldErrors((s) => ({ ...s, discount: undefined }))
                  setForm((s) => ({
                    ...s,
                    discount: sanitizeDecimalInput(e.target.value),
                  }))
                }}
              />
              {fieldErrors.discount && (
                <div className="text-xs text-destructive">{fieldErrors.discount}</div>
              )}
            </div>
          </div>

          <PricingTiersEditor
            tiers={form.pricingTiers}
            onChange={(tiers) => setForm((s) => ({ ...s, pricingTiers: tiers }))}
            errors={fieldErrors.pricingTiers}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {tr("adminPlans.discountHelpText")}
            </div>
            <div className="flex items-center gap-2">
              {isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (isDirty && !window.confirm(tr("common.discardUnsavedChangesConfirm"))) return
                    resetToCreate()
                  }}
                  disabled={isSaving}
                >
                  {tr("common.cancel")}
                </Button>
              )}
              <Button type="button" onClick={onSave} disabled={isSaving}>
                {isSaving
                  ? tr("common.saving")
                  : isEdit
                    ? tr("common.update")
                    : tr("common.create")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{tr("adminPlans.listTitle")}</CardTitle>
          <Button type="button" variant="outline" onClick={refresh} disabled={isLoading}>
            {isLoading ? tr("common.refreshing") : tr("common.refresh")}
          </Button>
        </CardHeader>
        <CardContent>
          {!isLoading && items.length === 0 && (
            <div className="mb-4 rounded-lg border bg-muted/20 p-4">
              <div className="text-sm font-medium">{tr("adminPlans.emptyTitle")}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {tr("adminPlans.emptyDesc")}
              </div>
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" })
                    queueMicrotask(() => nameRef.current?.focus())
                  }}
                >
                  {tr("adminPlans.emptyCta")}
                </Button>
              </div>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tr("adminPlans.table.name")}</TableHead>
                <TableHead className="text-right">{tr("adminPlans.table.discount")}</TableHead>
                <TableHead className="text-right">{tr("adminPlans.table.tiers")}</TableHead>
                <TableHead className="text-right">{tr("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-4 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-4 w-10" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-14" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.discount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.pricingTiers.length}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (isDirty && !window.confirm(tr("common.discardUnsavedChangesConfirm"))) return
                          startEdit(toDraft(p))
                        }}
                      >
                        {tr("common.edit")}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(p.id)}
                      >
                        {tr("common.delete")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    {tr("adminPlans.table.emptyRow")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

