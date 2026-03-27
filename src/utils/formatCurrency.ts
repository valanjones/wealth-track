const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const MAX_DISPLAY_AMOUNT = 1_000_000_000;

export function formatCurrency(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount) || !isFinite(amount)) {
    return "₹0.00";
  }

  if (Math.abs(amount) > MAX_DISPLAY_AMOUNT) {
    return amount > 0 ? "₹100,00,00,000+" : "-₹100,00,00,000+";
  }

  return formatter.format(amount);
}

export function isAmountOverflow(amount: number): boolean {
  return Math.abs(amount) > MAX_DISPLAY_AMOUNT;
}

export function parseAmount(value: string): number {
  if (!value || typeof value !== "string") return 0;

  const stripped = value.replace(/[^0-9.]/g, "");

  const parts = stripped.split(".");
  const sanitized =
    parts.length > 2
      ? parts[0] + "." + parts.slice(1).join("")
      : stripped;

  const parsed = parseFloat(sanitized);

  if (isNaN(parsed) || !isFinite(parsed)) return 0;

  return Math.round(parsed * 100) / 100;
}
