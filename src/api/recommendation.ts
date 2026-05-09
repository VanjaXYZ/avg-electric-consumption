import { api } from "./client";
import type { Recommendation, RecommendationResponse } from "../types/recommendation";

export async function getRecommendation(body: Recommendation): Promise<RecommendationResponse> {
    const { data } = await api.post<RecommendationResponse>('/recommendation', body);
    return data;
};