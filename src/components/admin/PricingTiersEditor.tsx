import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
export type TierDraft = {
  threshold: string
  pricePerKwh: string
}

type Props = {
  tiers: TierDraft[]
  onChange: (tiers: TierDraft[]) => void
}

export function PricingTiersEditor({ tiers, onChange }: Props) {
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
        <div className="text-sm font-medium">Pricing tiers</div>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          Add tier
        </Button>
      </div>

      <div className="grid gap-3">
        {tiers.map((t, idx) => (
          <div
            key={idx}
            className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <div className="grid gap-2">
              <Label>Threshold (kWh, optional)</Label>
              <Input
                inputMode="numeric"
                placeholder="e.g. 300"
                value={t.threshold}
                onChange={(e) => update(idx, { threshold: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Price per kWh</Label>
              <Input
                inputMode="decimal"
                placeholder="e.g. 0.12"
                value={t.pricePerKwh}
                onChange={(e) => update(idx, { pricePerKwh: e.target.value })}
              />
            </div>
            <div className="flex items-end justify-end">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => remove(idx)}
                disabled={tiers.length <= 1}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground">
        Tip: Keep one tier with empty threshold to act as the “default” tier.
      </div>
    </div>
  )
}

