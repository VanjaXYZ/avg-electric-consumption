import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { sanitizeDecimalInput, sanitizeIntegerInput } from "../../lib/input"
import { useTranslation } from "react-i18next"
export type TierDraft = {
  threshold: string
  pricePerKwh: string
}

type Props = {
  tiers: TierDraft[]
  onChange: (tiers: TierDraft[]) => void
  errors?: Record<number, Partial<Record<keyof TierDraft, string>>>
}

export function PricingTiersEditor({ tiers, onChange, errors }: Props) {
  const { t: tr } = useTranslation()
  function update(idx: number, patch: Partial<TierDraft>) {
    const next = tiers.map((t, i) => (i === idx ? { ...t, ...patch } : t))
    onChange(next)
  }

  function add() {
    onChange([...tiers, { threshold: "", pricePerKwh: "" }])
  }

  function remove(idx: number) {
    onChange(tiers.filter((_, i) => i !== idx))
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">{tr("adminPlans.tiersTitle")}</div>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          {tr("adminPlans.addTier")}
        </Button>
      </div>

      <div className="grid gap-3">
        {tiers.map((t, idx) => (
          <div
            key={idx}
            className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <div className="grid gap-2">
              <Label>{tr("adminPlans.thresholdLabel")}</Label>
              <Input
                inputMode="numeric"
                placeholder={tr("adminPlans.thresholdPlaceholder")}
                value={t.threshold}
                onChange={(e) =>
                  update(idx, { threshold: sanitizeIntegerInput(e.target.value) })
                }
              />
              {errors?.[idx]?.threshold && (
                <div className="text-xs text-destructive">{errors[idx]?.threshold}</div>
              )}
            </div>
            <div className="grid gap-2">
              <Label>{tr("adminPlans.pricePerKwhLabel")}</Label>
              <Input
                inputMode="decimal"
                placeholder={tr("adminPlans.pricePerKwhPlaceholder")}
                value={t.pricePerKwh}
                onChange={(e) =>
                  update(idx, { pricePerKwh: sanitizeDecimalInput(e.target.value) })
                }
              />
              {errors?.[idx]?.pricePerKwh && (
                <div className="text-xs text-destructive">
                  {errors[idx]?.pricePerKwh}
                </div>
              )}
            </div>
            <div className="flex items-end justify-end">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => remove(idx)}
                disabled={tiers.length <= 1}
              >
                {tr("adminPlans.removeTier")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground">
        {tr("adminPlans.tiersTip")}
      </div>
    </div>
  )
}

