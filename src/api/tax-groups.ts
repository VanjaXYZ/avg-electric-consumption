import { api } from "./client";
import type { TaxGroup, CreateTaxGroupRequest } from "../types/tax-group";

export async function getTaxGroups(): Promise<TaxGroup[]> {
    const { data } = await api.get<TaxGroup[]>('/tax-groups');
    return data;
};

export async function getTaxGroupById(id: number): Promise<TaxGroup> {
    const { data } = await api.get<TaxGroup>(`/tax-groups/${id}`);
    return data;
};

export async function createTaxGroup(body: CreateTaxGroupRequest): Promise<TaxGroup> {
    const { data } = await api.post<TaxGroup>('/tax-groups', body);
    return data;
};

export async function updateTaxGroup(id: number, body: CreateTaxGroupRequest): Promise<TaxGroup> {
    const { data } = await api.put<TaxGroup>(`/tax-groups/${id}`, body);
    return data;
};

export async function deleteTaxGroup(id: number): Promise<void> {
    await api.delete(`/tax-groups/${id}`);
};
