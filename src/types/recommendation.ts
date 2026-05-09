
export type Recommendation = {
    kwh: number;
    taxGroup: string;
}

export type CostBreakdown = {
    energySubtotal: number;
    energyAfterDiscount: number;
    ecoTaxTotal: number;
    vatAmount: number;
    grandTotal: number;
}

export type PlanComparison = {
    planId: number;
    planName: string;
    costs: CostBreakdown;
}

export type RecommendationResponse = {
    recommended: PlanComparison;
    allPlans: PlanComparison[];
}

