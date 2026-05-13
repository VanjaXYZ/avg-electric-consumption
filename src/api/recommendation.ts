import { api } from "./client"
import type {
  Recommendation,
  RecommendationEmailRequest,
  RecommendationResponse,
} from "../types/recommendation"

export async function getRecommendation(
  body: Recommendation
): Promise<RecommendationResponse> {
  const { data } = await api.post<RecommendationResponse>("/recommendation", body)
  return data
}

export async function postRecommendationEmail(
  body: RecommendationEmailRequest
): Promise<RecommendationResponse> {
  const { data } = await api.post<RecommendationResponse>("/recommendation/email", body)
  return data
}