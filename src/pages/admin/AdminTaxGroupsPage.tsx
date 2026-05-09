import { useEffect, useMemo, useRef, useState } from "react"

import {
  createTaxGroup,
  deleteTaxGroup,
  getTaxGroups,
  updateTaxGroup,
} from "../../api/tax-groups"
import { getApiErrorMessage } from "../../api/error"
import { sanitizeDecimalInput } from "../../lib/input"
import { toast } from "sonner"
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
import type { CreateTaxGroupRequest, TaxGroup } from "../../types/tax-group"
import { taxGroupSchema } from "../../validation/tax-group"

type FormState = {
  id?: number
  name: string
  vat: string
  ecoTax: string
}

type FieldErrors = Partial<Record<keyof Omit<FormState, "id">, string>>

export function AdminTaxGroupsPage() {
  const [items, setItems] = useState<TaxGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const nameRef = useRef<HTMLInputElement | null>(null)
  const initialRef = useRef<FormState | null>(null)

  const [form, setForm] = useState<FormState>({
    name: "",
    vat: "",
    ecoTax: "",
  })

  const isEdit = useMemo(() => typeof form.id === "number", [form.id])
  const isDirty = useMemo(() => {
    const initial = initialRef.current
    if (!isEdit || !initial) return false
    return JSON.stringify(form) !== JSON.stringify(initial)
  }, [form, isEdit])

  function mapIssues(
    issues: { path: readonly PropertyKey[]; message: string }[]
  ): FieldErrors {
    const next: FieldErrors = {}
    for (const issue of issues) {
      const key = issue.path[0] as unknown
      if (key === "name" || key === "vat" || key === "ecoTax") next[key] = issue.message
    }
    return next
  }

  function resetToCreate() {
    setFieldErrors({})
    initialRef.current = null
    setForm({ name: "", vat: "", ecoTax: "" })
    queueMicrotask(() => nameRef.current?.focus())
  }

  function startEdit(next: FormState) {
    setFieldErrors({})
    initialRef.current = next
    setForm(next)
    queueMicrotask(() => nameRef.current?.focus())
  }

  async function refresh() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getTaxGroups()
      setItems(data)
    } catch (e) {
      setError(getApiErrorMessage(e, "Failed to load tax groups"))
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
      const parsed = taxGroupSchema.safeParse({
        name: form.name,
        vat: form.vat,
        ecoTax: form.ecoTax,
      })

      if (!parsed.success) {
        setFieldErrors(mapIssues(parsed.error.issues))
        return
      }

      const body: CreateTaxGroupRequest = parsed.data as CreateTaxGroupRequest

      if (isEdit) {
        await updateTaxGroup(form.id!, body)
        toast.success("Tax group updated")
      } else {
        await createTaxGroup(body)
        toast.success("Tax group created")
      }

      resetToCreate()
      await refresh()
    } catch (e) {
      const msg = getApiErrorMessage(e, "Failed to save tax group")
      setError(msg)
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  async function onDelete(id: number) {
    if (!window.confirm("Delete this tax group?")) return
    setError(null)
    try {
      await deleteTaxGroup(id)
      toast.success("Tax group deleted")
      await refresh()
    } catch (e) {
      const msg = getApiErrorMessage(e, "Failed to delete tax group")
      setError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="grid gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Admin · Tax groups</h1>
        <p className="text-sm text-muted-foreground">
          Manage VAT and environmental taxes per group.
        </p>
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{isEdit ? "Edit tax group" : "Create tax group"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2 sm:col-span-1">
              <Label htmlFor="tg-name">Name</Label>
              <Input
                id="tg-name"
                ref={nameRef}
                value={form.name}
                onChange={(e) => {
                  setFieldErrors((s) => ({ ...s, name: undefined }))
                  setForm((s) => ({ ...s, name: e.target.value }))
                }}
                placeholder="e.g. household"
              />
              {fieldErrors.name && (
                <div className="text-xs text-destructive">{fieldErrors.name}</div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tg-vat">VAT (e.g. 0.17)</Label>
              <Input
                id="tg-vat"
                inputMode="decimal"
                placeholder="e.g. 0.17"
                value={form.vat}
                onChange={(e) => {
                  setFieldErrors((s) => ({ ...s, vat: undefined }))
                  setForm((s) => ({ ...s, vat: sanitizeDecimalInput(e.target.value) }))
                }}
              />
              {fieldErrors.vat && (
                <div className="text-xs text-destructive">{fieldErrors.vat}</div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tg-eco">Eco tax (per kWh)</Label>
              <Input
                id="tg-eco"
                inputMode="decimal"
                placeholder="e.g. 0.01"
                value={form.ecoTax}
                onChange={(e) => {
                  setFieldErrors((s) => ({ ...s, ecoTax: undefined }))
                  setForm((s) => ({
                    ...s,
                    ecoTax: sanitizeDecimalInput(e.target.value),
                  }))
                }}
              />
              {fieldErrors.ecoTax && (
                <div className="text-xs text-destructive">{fieldErrors.ecoTax}</div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              VAT and EcoTax must be non-negative.
            </div>
            <div className="flex items-center gap-2">
              {isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (isDirty && !window.confirm("Discard unsaved changes?")) return
                    resetToCreate()
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              )}
              <Button type="button" onClick={onSave} disabled={isSaving}>
                {isSaving ? "Saving…" : isEdit ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All tax groups</CardTitle>
          <Button type="button" variant="outline" onClick={refresh} disabled={isLoading}>
            {isLoading ? "Refreshing…" : "Refresh"}
          </Button>
        </CardHeader>
        <CardContent>
          {!isLoading && items.length === 0 && (
            <div className="mb-4 rounded-lg border bg-muted/20 p-4">
              <div className="text-sm font-medium">No tax groups yet</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Create your first tax group to enable cost calculations.
              </div>
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" })
                    queueMicrotask(() => nameRef.current?.focus())
                  }}
                >
                  Create first tax group
                </Button>
              </div>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">VAT</TableHead>
                <TableHead className="text-right">Eco tax</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                      <Skeleton className="ml-auto h-4 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-14" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{t.vat}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {t.ecoTax}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (isDirty && !window.confirm("Discard unsaved changes?")) return
                          startEdit({
                            id: t.id,
                            name: t.name,
                            vat: String(t.vat),
                            ecoTax: String(t.ecoTax),
                          })
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(t.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No tax groups found.
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

