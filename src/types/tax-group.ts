export type TaxGroup = {
    id: number;
    name: string;
    vat: number;
    ecoTax: number;
}

export type CreateTaxGroupRequest = {
    name: string;
    vat: number;
    ecoTax: number;
}