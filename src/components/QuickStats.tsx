"use client";

import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, TrendingDown, Trophy } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency } from "@/utils/formatCurrency";
import { CATEGORY_COLORS } from "@/components/CategoryBadge";

function QuickStatsInner() {
  const { state } = useFinance();

  const todaySpending = useMemo(() => {
    const today = new Date().toDateString();
    return state.transactions
      .filter(
        (t) => t.type === "expense" && new Date(t.date).toDateString() === today
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }, [state.transactions]);

  const weekSpending = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    return state.transactions
      .filter((t) => t.type === "expense" && new Date(t.date) >= weekAgo)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [state.transactions]);

  const topCategory = useMemo(() => {
    const now = new Date();
    const thisMonthExpenses = state.transactions.filter((t) => {
      if (t.type !== "expense") return false;
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    if (thisMonthExpenses.length === 0) return null;

    const categoryMap = new Map<string, number>();
    thisMonthExpenses.forEach((t) => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });

    let topCat = "";
    let topAmount = 0;
    categoryMap.forEach((amount, category) => {
      if (amount > topAmount) {
        topAmount = amount;
        topCat = category;
      }
    });

    return { category: topCat, amount: topAmount };
  }, [state.transactions]);

  const topCategoryColor = topCategory
    ? CATEGORY_COLORS[topCategory.category] ?? "#6b7280"
    : "#6b7280";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Today's Spending */}
      <Card className="shadow-sm">
        <CardContent className="flex items-center gap-3 py-3 px-4">
          <div className="rounded-lg bg-rose-500/10 p-2 shrink-0">
            <ShoppingCart className="h-4 w-4 text-rose-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Today&apos;s Spending</p>
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400 truncate">
              {formatCurrency(todaySpending)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* This Week's Spending */}
      <Card className="shadow-sm">
        <CardContent className="flex items-center gap-3 py-3 px-4">
          <div className="rounded-lg bg-orange-500/10 p-2 shrink-0">
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">This Week</p>
            <p className="text-sm font-bold text-orange-600 dark:text-orange-400 truncate">
              {formatCurrency(weekSpending)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top Category This Month */}
      <Card className="shadow-sm">
        <CardContent className="flex items-center gap-3 py-3 px-4">
          <div
            className="rounded-lg p-2 shrink-0"
            style={{ backgroundColor: `${topCategoryColor}1A` }}
          >
            <Trophy className="h-4 w-4" style={{ color: topCategoryColor }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Top Category</p>
            {topCategory ? (
              <p
                className="text-sm font-bold truncate"
                style={{ color: topCategoryColor }}
              >
                {topCategory.category} · {formatCurrency(topCategory.amount)}
              </p>
            ) : (
              <p className="text-sm font-bold text-muted-foreground">
                No data yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const QuickStats = React.memo(QuickStatsInner);
