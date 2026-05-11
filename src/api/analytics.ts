import { api } from "./client"

export type PlanSelectionTrendRow = {
  date: string
  planId: number
  planName: string
  count: number
}

export type PlanSelectionSummaryRow = {
  planId: number
  planName: string
  selectionCount: number
}

export async function getPlanSelectionTrends(
  from: string,
  to: string
): Promise<PlanSelectionTrendRow[]> {
  const { data } = await api.get<PlanSelectionTrendRow[]>(
    "analytics/plan-selections/trends",
    { params: { from, to } }
  )
  return data
}

export async function getPlanSelectionSummary(): Promise<PlanSelectionSummaryRow[]> {
  const { data } = await api.get<PlanSelectionSummaryRow[]>(
    "analytics/plan-selections/summary"
  )
  return data
}
