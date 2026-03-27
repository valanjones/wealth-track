"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Pencil, Check, X } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency, parseAmount } from "@/utils/formatCurrency";
import { toast } from "sonner";

const BUDGET_KEY = "wealth-tracker-budget";

function BudgetTrackerInner() {
  const { state } = useFinance();
  const [budget, setBudget] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const warned80Ref = useRef(false);
  const warned100Ref = useRef(false);

  // Load budget from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(BUDGET_KEY);
      if (stored) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed > 0) setBudget(parsed);
      }
    } catch {}
  }, []);

  // Calculate current month's expenses
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    return state.transactions
      .filter((t) => {
        if (t.type !== "expense") return false;
        const d = new Date(t.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [state.transactions]);

  const percentage = budget > 0 ? Math.round((currentMonthExpenses / budget) * 100) : 0;
  const remaining = budget - currentMonthExpenses;

  // Budget warning toasts (once per session)
  useEffect(() => {
    if (budget <= 0) return;

    if (percentage >= 100 && !warned100Ref.current) {
      warned100Ref.current = true;
      warned80Ref.current = true;
      toast.error("Monthly budget exceeded!");
    } else if (percentage >= 80 && percentage < 100 && !warned80Ref.current) {
      warned80Ref.current = true;
      toast.warning("You've used 80% of your monthly budget");
    }
  }, [percentage, budget]);

  function getProgressColor() {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 86) return "bg-orange-500";
    if (percentage >= 61) return "bg-yellow-500";
    return "bg-emerald-500";
  }

  function handleSave() {
    const amount = parseAmount(editValue);
    if (amount <= 0) {
      toast.error("Budget must be greater than 0");
      return;
    }

    setBudget(amount);
    try {
      window.localStorage.setItem(BUDGET_KEY, String(amount));
    } catch {}

    // Reset warning flags when budget changes
    warned80Ref.current = false;
    warned100Ref.current = false;

    setIsEditing(false);
    toast.success("Budget updated");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setIsEditing(false);
  }

  if (budget === 0 && !isEditing) {
    return (
      <Card className="shadow-sm">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Set a monthly budget to track your spending
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditValue("");
              setIsEditing(true);
            }}
          >
            Set Budget
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4" />
          Monthly Budget
        </CardTitle>
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setEditValue(budget.toString());
              setIsEditing(true);
            }}
            aria-label="Edit budget"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter budget amount"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              inputMode="decimal"
              className="h-8"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 text-emerald-600"
              onClick={handleSave}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 text-rose-600"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatCurrency(currentMonthExpenses)}
              </span>{" "}
              spent of{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(budget)}
              </span>{" "}
              budget
            </p>

            {/* Progress bar */}
            <div className="relative">
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor()} ${
                    percentage >= 100 ? "animate-pulse" : ""
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-muted-foreground">
                  {percentage}%
                </span>
                <span
                  className={`text-xs font-medium ${
                    remaining >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {remaining >= 0
                    ? `${formatCurrency(remaining)} remaining`
                    : `${formatCurrency(Math.abs(remaining))} over budget`}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export const BudgetTracker = React.memo(BudgetTrackerInner);
