import { api } from "./client";
import type { Plan, PlanUpsertRequest } from "../types/plan";

export async function getPlans(): Promise<Plan[]> {
    const { data } = await api.get<Plan[]>('/plans');
    return data;
};

export async function getPlanById(id: number): Promise<Plan> {
    const { data } = await api.get<Plan>(`/plans/${id}`);
    return data;
};

export async function createPlan(body: PlanUpsertRequest): Promise<Plan> {
    const { data } = await api.post<Plan>('/plans', body);
    return data;
};

export async function updatePlan(id: number, body: PlanUpsertRequest): Promise<Plan> {
    const { data } = await api.put<Plan>(`/plans/${id}`, body);
    return data;
};

export async function deletePlan(id: number): Promise<void> {
    await api.delete(`/plans/${id}`);
};

