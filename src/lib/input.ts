export function sanitizeDecimalInput(raw: string) {
  let v = raw.replace(",", ".")
  v = v.replace(/[^0-9.]/g, "")

  const firstDot = v.indexOf(".")
  if (firstDot === -1) return v

  const before = v.slice(0, firstDot + 1)
  const after = v.slice(firstDot + 1).replace(/\./g, "")
  return before + after
}

export function sanitizeIntegerInput(raw: string) {
  return raw.replace(/[^0-9]/g, "")
}

