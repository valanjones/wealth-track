"use client";

import { EXPENSE_COLORS, INCOME_COLORS } from "@/context/FinanceContext";

export const CATEGORY_COLORS: Record<string, string> = {
  ...EXPENSE_COLORS,
  ...INCOME_COLORS,
};

interface CategoryBadgeProps {
  category: string;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category] ?? "#6b7280";

  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium whitespace-nowrap">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span style={{ color }}>{category}</span>
    </span>
  );
}
