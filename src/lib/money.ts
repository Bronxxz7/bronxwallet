
export function toCents(value: string): number {
  const clean = value.trim().replace(",", ".");

  if (!/^\d+(\.\d{1,2})?$/.test(clean)) {
    throw new Error("Ingresa un monto válido.");
  }

  const [whole, decimal = ""] = clean.split(".");
  const cents =
    Number(whole) * 100 +
    Number(decimal.padEnd(2, "0"));

  if (!Number.isSafeInteger(cents) || cents <= 0) {
    throw new Error("El monto debe ser mayor a cero.");
  }

  return cents;
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
