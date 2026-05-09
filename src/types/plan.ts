
export type PricingTier = {
    id: number;
    threshold: number | null;
    pricePerKwh: number;
}

export type Plan = {
    id: number;
    name: string;
    discount: number;
    pricingTiers: PricingTier[];
}

export type PlanUpsertRequest = {
    name: string;
    discount: number;
    pricingTiers: Omit<PricingTier, 'id'>[];
}

