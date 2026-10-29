
const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

export function solesToCents(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Monto inválido.");
  }

  const cents = Math.round(value * 100);

  if (!Number.isSafeInteger(cents)) {
    throw new Error("Monto demasiado grande.");
  }

  return cents;
}

export function centsToSoles(cents: number): number {
  return cents / 100;
}
