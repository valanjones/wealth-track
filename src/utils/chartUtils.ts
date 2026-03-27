import type { Transaction } from "@/types";

export type ChartDateRange =
  | "all"
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "last_6_months"
  | "this_year";

export const CHART_DATE_OPTIONS: { value: ChartDateRange; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_3_months", label: "3 Months" },
  { value: "last_6_months", label: "6 Months" },
  { value: "this_year", label: "This Year" },
];

export function filterByChartDateRange(
  transactions: Transaction[],
  range: ChartDateRange,
  offsetMonths = 0
): Transaction[] {
  if (range === "all" && offsetMonths === 0) return transactions;

  const now = new Date();
  if (offsetMonths !== 0) {
    now.setMonth(now.getMonth() + offsetMonths);
  }

  return transactions.filter((t) => {
    const date = new Date(t.date);
    switch (range) {
      case "this_month":
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      case "last_month": {
        const lm = new Date(now);
        lm.setMonth(now.getMonth() - 1);
        return (
          date.getMonth() === lm.getMonth() &&
          date.getFullYear() === lm.getFullYear()
        );
      }
      case "last_3_months": {
        const t3 = new Date(now);
        t3.setMonth(now.getMonth() - 3);
        t3.setHours(0, 0, 0, 0);
        return date >= t3;
      }
      case "last_6_months": {
        const t6 = new Date(now);
        t6.setMonth(now.getMonth() - 6);
        t6.setHours(0, 0, 0, 0);
        return date >= t6;
      }
      case "this_year":
        return date.getFullYear() === now.getFullYear();
      case "all":
        return true;
      default:
        return true;
    }
  });
}

export function getPeriodLabel(
  range: ChartDateRange,
  offsetMonths: number
): string {
  const now = new Date();
  now.setMonth(now.getMonth() + offsetMonths);

  switch (range) {
    case "this_month":
      return now.toLocaleString("en-IN", { month: "long", year: "numeric" });
    case "last_month": {
      const lm = new Date(now);
      lm.setMonth(now.getMonth() - 1);
      return lm.toLocaleString("en-IN", { month: "long", year: "numeric" });
    }
    case "last_3_months": {
      const start = new Date(now);
      start.setMonth(now.getMonth() - 3);
      return `${start.toLocaleString("en-IN", {
        month: "short",
        year: "numeric",
      })} — ${now.toLocaleString("en-IN", {
        month: "short",
        year: "numeric",
      })}`;
    }
    case "last_6_months": {
      const start = new Date(now);
      start.setMonth(now.getMonth() - 6);
      return `${start.toLocaleString("en-IN", {
        month: "short",
        year: "numeric",
      })} — ${now.toLocaleString("en-IN", {
        month: "short",
        year: "numeric",
      })}`;
    }
    case "this_year":
      return now.getFullYear().toString();
    case "all":
      return "All Time";
    default:
      return "All Time";
  }
}

export function getShiftAmount(range: ChartDateRange): number {
  switch (range) {
    case "this_month":
    case "last_month":
      return 1;
    case "last_3_months":
      return 3;
    case "last_6_months":
      return 6;
    case "this_year":
      return 12;
    default:
      return 0;
  }
}

export interface CategoryBreakdownItem {
  category: string;
  total: number;
  percentage: number;
  color: string;
  count: number;
}

export function computeCategoryBreakdown(
  transactions: Transaction[],
  type: "income" | "expense",
  colorMap: Record<string, string>
): CategoryBreakdownItem[] {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const map = new Map<string, { amount: number; count: number }>();
  filtered.forEach((t) => {
    const existing = map.get(t.category) || { amount: 0, count: 0 };
    existing.amount += t.amount;
    existing.count += 1;
    map.set(t.category, existing);
  });

  return Array.from(map.entries())
    .map(([category, { amount, count }]) => ({
      category,
      total: amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      color: colorMap[category] || "#6b7280",
      count,
    }))
    .sort((a, b) => b.total - a.total);
}

export function computeMonthlyTrend(
  transactions: Transaction[],
  range: ChartDateRange = "all",
  offset = 0
): { month: string; income: number; expense: number }[] {
  const now = new Date();
  if (offset !== 0) {
    now.setMonth(now.getMonth() + offset);
  }

  // Determine the start and end months based on the selected range
  let startDate: Date;
  let endDate: Date;

  switch (range) {
    case "this_month": {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case "last_month": {
      const lm = new Date(now);
      lm.setMonth(now.getMonth() - 1);
      startDate = new Date(lm.getFullYear(), lm.getMonth(), 1);
      endDate = new Date(lm.getFullYear(), lm.getMonth(), 1);
      break;
    }
    case "last_3_months": {
      const s = new Date(now);
      s.setMonth(now.getMonth() - 2);
      startDate = new Date(s.getFullYear(), s.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case "last_6_months": {
      const s = new Date(now);
      s.setMonth(now.getMonth() - 5);
      startDate = new Date(s.getFullYear(), s.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case "this_year": {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 1);
      break;
    }
    case "all":
    default: {
      // Default: rolling 6 months ending at current month
      const s = new Date(now);
      s.setMonth(now.getMonth() - 5);
      startDate = new Date(s.getFullYear(), s.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
  }

  // Build month buckets from startDate to endDate
  const months: { month: string; key: string; income: number; expense: number }[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    const monthKey = `${cursor.getFullYear()}-${cursor.getMonth()}`;
    const label = cursor.toLocaleString("en-IN", {
      month: "short",
      year: "2-digit",
    });
    months.push({ month: label, key: monthKey, income: 0, expense: 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  // Fill in data
  transactions.forEach((t) => {
    const tDate = new Date(t.date);
    const tKey = `${tDate.getFullYear()}-${tDate.getMonth()}`;
    const m = months.find((m) => m.key === tKey);
    if (m) {
      if (t.type === "income") m.income += t.amount;
      else m.expense += t.amount;
    }
  });

  return months.map(({ month, income, expense }) => ({ month, income, expense }));
}

