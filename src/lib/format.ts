export function createCurrencyFormatter() {
  const currency = import.meta.env.VITE_CURRENCY ?? "BAM"
  const nf = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  })
  return (value: number) => nf.format(value)
}

