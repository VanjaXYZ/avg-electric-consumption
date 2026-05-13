import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  getPlanSelectionSummary,
  getPlanSelectionTrends,
  type PlanSelectionSummaryRow,
  type PlanSelectionTrendRow,
} from "../../api/analytics"
import { getApiErrorMessage } from "../../api/error"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Skeleton } from "../../components/ui/skeleton"

const CHART_COLORS = [
  "hsl(221 83% 53%)",
  "hsl(142 71% 45%)",
  "hsl(32 95% 44%)",
  "hsl(262 83% 58%)",
  "hsl(0 72% 51%)",
  "hsl(199 89% 48%)",
]

function calendarMonthRangeIso(): { from: string; to: string } {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const from = new Date(y, m, 1)
  const to = new Date(y, m + 1, 0)
  const fmt = (d: Date) => d.toLocaleDateString("en-CA")
  return { from: fmt(from), to: fmt(to) }
}

function normalizeTrendDate(iso: string): string {
  return iso.slice(0, 10)
}

function pivotTrendsForLineChart(rows: PlanSelectionTrendRow[]) {
  const planIds = [...new Set(rows.map((r) => r.planId))].sort((a, b) => a - b)
  const planNames = new Map<number, string>()
  for (const r of rows) {
    planNames.set(r.planId, r.planName)
  }
  const dates = [...new Set(rows.map((r) => normalizeTrendDate(r.date)))].sort()
  const lookup = new Map<string, number>()
  for (const r of rows) {
    lookup.set(`${normalizeTrendDate(r.date)}|${r.planId}`, r.count)
  }
  const data = dates.map((date) => {
    const point: Record<string, string | number> = { date }
    for (const pid of planIds) {
      point[`p_${pid}`] = lookup.get(`${date}|${pid}`) ?? 0
    }
    return point
  })
  return { data, planIds, planNames }
}

export function AdminAnalyticsPage() {
  const { t } = useTranslation()
  const defaults = useMemo(() => calendarMonthRangeIso(), [])
  const [from, setFrom] = useState(defaults.from)
  const [to, setTo] = useState(defaults.to)
  const [trends, setTrends] = useState<PlanSelectionTrendRow[]>([])
  const [summary, setSummary] = useState<PlanSelectionSummaryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async (fromParam: string, toParam: string) => {
    setLoading(true)
    setError(null)
    try {
      const [trendRows, summaryRows] = await Promise.all([
        getPlanSelectionTrends(fromParam, toParam),
        getPlanSelectionSummary(),
      ])
      setTrends(trendRows)
      setSummary(summaryRows)
    } catch (e) {
      setError(getApiErrorMessage(e, t("adminAnalytics.loadFailFallback")))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void fetchAnalytics(defaults.from, defaults.to)
  }, [defaults.from, defaults.to])

  const linePivot = useMemo(() => pivotTrendsForLineChart(trends), [trends])

  const summaryChartData = useMemo(
    () =>
      summary.map((s) => ({
        name: s.planName,
        count: s.selectionCount,
      })),
    [summary]
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("adminAnalytics.pageTitle")}
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          {t("adminAnalytics.pageSubtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("adminAnalytics.rangeTitle")}</CardTitle>
          <CardDescription>{t("adminAnalytics.rangeDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="grid gap-2">
            <Label htmlFor="analytics-from">{t("adminAnalytics.fromLabel")}</Label>
            <Input
              id="analytics-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-[11rem]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="analytics-to">{t("adminAnalytics.toLabel")}</Label>
            <Input
              id="analytics-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-[11rem]"
            />
          </div>
          <Button
            type="button"
            onClick={() => void fetchAnalytics(from, to)}
            disabled={loading}
          >
            {loading ? t("common.refreshing") : t("common.refresh")}
          </Button>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{t("common.error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("adminAnalytics.trendsChartTitle")}</CardTitle>
          <CardDescription>{t("adminAnalytics.trendsChartDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="h-[340px] w-full min-w-0">
          {loading ? (
            <Skeleton className="h-full w-full rounded-md" />
          ) : linePivot.data.length === 0 || linePivot.planIds.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("adminAnalytics.trendsEmpty")}</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={linePivot.data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                  labelFormatter={(label) => `${t("adminAnalytics.dateLabel")}: ${label}`}
                />
                <Legend />
                {linePivot.planIds.map((pid, i) => (
                  <Line
                    key={pid}
                    type="monotone"
                    dataKey={`p_${pid}`}
                    name={linePivot.planNames.get(pid) ?? `Plan ${pid}`}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("adminAnalytics.summaryChartTitle")}</CardTitle>
          <CardDescription>{t("adminAnalytics.summaryChartDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full min-w-0">
          {loading ? (
            <Skeleton className="h-full w-full rounded-md" />
          ) : summaryChartData.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("adminAnalytics.summaryEmpty")}</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summaryChartData}
                layout="vertical"
                margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    String(v).length > 14 ? `${String(v).slice(0, 14)}…` : String(v)
                  }
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
                <Bar dataKey="count" name={t("adminAnalytics.selections")} fill="hsl(221 83% 53%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
