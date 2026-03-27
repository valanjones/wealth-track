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
    <span
      style={{
        borderColor: `${color}60`,
        color: color,
      }}
      className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-medium border w-36 bg-zinc-100 dark:bg-zinc-800"
    >
      {category}
    </span>
  );
}
