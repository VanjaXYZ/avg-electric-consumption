import { useEffect, useMemo, useState } from "react"

import {
  createTaxGroup,
  deleteTaxGroup,
  getTaxGroups,
  updateTaxGroup,
} from "../../api/tax-groups"
import { getApiErrorMessage } from "../../api/error"
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
import type { CreateTaxGroupRequest, TaxGroup } from "../../types/tax-group"
import { taxGroupSchema } from "../../validation/tax-group"

type FormState = {
  id?: number
  name: string
  vat: string
  ecoTax: string
}

export function AdminTaxGroupsPage() {
  const [items, setItems] = useState<TaxGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    name: "",
    vat: "",
    ecoTax: "",
  })

  const isEdit = useMemo(() => typeof form.id === "number", [form.id])

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
    try {
      const parsed = taxGroupSchema.safeParse({
        name: form.name,
        vat: form.vat,
        ecoTax: form.ecoTax,
      })

      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Invalid tax group")
        return
      }

      const body: CreateTaxGroupRequest = parsed.data as CreateTaxGroupRequest

      if (isEdit) {
        await updateTaxGroup(form.id!, body)
      } else {
        await createTaxGroup(body)
      }

      setForm({ name: "", vat: "", ecoTax: "" })
      await refresh()
    } catch (e) {
      setError(getApiErrorMessage(e, "Failed to save tax group"))
    } finally {
      setIsSaving(false)
    }
  }

  async function onDelete(id: number) {
    if (!window.confirm("Delete this tax group?")) return
    setError(null)
    try {
      await deleteTaxGroup(id)
      await refresh()
    } catch (e) {
      setError(getApiErrorMessage(e, "Failed to delete tax group"))
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
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                placeholder="e.g. household"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tg-vat">VAT (e.g. 0.17)</Label>
              <Input
                id="tg-vat"
                inputMode="decimal"
                placeholder="e.g. 0.17"
                value={form.vat}
                onChange={(e) =>
                  setForm((s) => ({ ...s, vat: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tg-eco">Eco tax (per kWh)</Label>
              <Input
                id="tg-eco"
                inputMode="decimal"
                placeholder="e.g. 0.01"
                value={form.ecoTax}
                onChange={(e) =>
                  setForm((s) => ({ ...s, ecoTax: e.target.value }))
                }
              />
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
                  onClick={() => setForm({ name: "", vat: "", ecoTax: "" })}
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
                        onClick={() =>
                          setForm({
                            id: t.id,
                            name: t.name,
                            vat: String(t.vat),
                            ecoTax: String(t.ecoTax),
                          })
                        }
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
              {items.length === 0 && (
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

