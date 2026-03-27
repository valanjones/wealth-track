"use client";

import { PiggyBank, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/context/FinanceContext";

export function EmptyState() {
  const { dispatch } = useFinance();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-6">
        <PiggyBank className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No transactions yet</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        Get started by adding your first transaction to track your income and
        expenses.
      </p>
      <Button
        onClick={() => dispatch({ type: "TOGGLE_FORM", payload: true })}
        className="gap-2"
        size="lg"
      >
        <Plus className="h-4 w-4" />
        Add Transaction
      </Button>
    </div>
  );
}
