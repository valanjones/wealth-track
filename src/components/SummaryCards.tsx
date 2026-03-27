"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency } from "@/utils/formatCurrency";

function useCountUp(target: number, duration = 600) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);

  useEffect(() => {
    startValueRef.current = current;
    startTimeRef.current = null;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value =
        startValueRef.current + (target - startValueRef.current) * eased;

      setCurrent(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return current;
}

export function SummaryCards() {
  const { totalIncome, totalExpenses, netBalance } = useFinance();

  const animatedIncome = useCountUp(totalIncome);
  const animatedExpenses = useCountUp(totalExpenses);
  const animatedBalance = useCountUp(netBalance);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total Income */}
      <Card className="relative overflow-hidden border-emerald-500/20 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/10" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Income
          </CardTitle>
          <div className="rounded-lg bg-emerald-500/10 p-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(animatedIncome)}
          </p>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card className="relative overflow-hidden border-rose-500/20 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-rose-500/10" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Expenses
          </CardTitle>
          <div className="rounded-lg bg-rose-500/10 p-2">
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(animatedExpenses)}
          </p>
        </CardContent>
      </Card>

      {/* Net Balance */}
      <Card
        className={`relative overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md sm:col-span-2 lg:col-span-1 ${
          netBalance >= 0
            ? "border-blue-500/20"
            : "border-rose-500/20"
        }`}
      >
        <div
          className={`absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full ${
            netBalance >= 0 ? "bg-blue-500/10" : "bg-rose-500/10"
          }`}
        />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net Balance
          </CardTitle>
          <div
            className={`rounded-lg p-2 ${
              netBalance >= 0 ? "bg-blue-500/10" : "bg-rose-500/10"
            }`}
          >
            <Wallet
              className={`h-4 w-4 ${
                netBalance >= 0 ? "text-blue-500" : "text-rose-500"
              }`}
            />
          </div>
        </CardHeader>
        <CardContent>
          <p
            className={`text-2xl font-bold ${
              netBalance >= 0
                ? "text-blue-600 dark:text-blue-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatCurrency(animatedBalance)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
