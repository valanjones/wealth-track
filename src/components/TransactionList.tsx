"use client";

import React, { useCallback } from "react";
import { Pencil, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency } from "@/utils/formatCurrency";
import { EmptyState } from "./EmptyState";
import CategoryBadge from "./CategoryBadge";
import type { Transaction } from "@/types";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const TransactionRow = React.memo(function TransactionRow({
  transaction,
}: {
  transaction: Transaction;
}) {
  const { dispatchWithToast, dispatch } = useFinance();
  const isIncome = transaction.type === "income";

  const handleEdit = useCallback(() => {
    dispatch({ type: "SET_EDITING", payload: transaction });
  }, [dispatch, transaction]);

  const handleDelete = useCallback(() => {
    dispatchWithToast({
      type: "DELETE_TRANSACTION",
      payload: transaction.id,
    });
  }, [dispatchWithToast, transaction.id]);

  return (
    <div className="group flex items-center gap-4 w-full rounded-lg border p-3 transition-all duration-200 hover:shadow-sm hover:bg-muted/30">
      {/* Left: Icon */}
      <div className="shrink-0">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            isIncome
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          }`}
        >
          {isIncome ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
        </div>
      </div>

      {/* Title + Category (stacked on mobile) */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{transaction.title}</p>
        {/* Category badge visible only on mobile */}
        <div className="mt-1 md:hidden">
          <CategoryBadge category={transaction.category} />
        </div>
      </div>

      {/* Category Badge — desktop only */}
      <div className="hidden md:flex w-36 justify-center shrink-0">
        <CategoryBadge category={transaction.category} />
      </div>

      {/* Date — desktop only */}
      <div className="hidden md:block w-28 text-center shrink-0 text-sm text-muted-foreground">
        {formatDate(transaction.date)}
      </div>

      {/* Amount */}
      <div className="w-28 md:w-32 text-right shrink-0">
        <p
          className={`font-semibold text-sm ${
            isIncome
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </p>
      </div>

      {/* Actions */}
      <div className="w-16 flex justify-end gap-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleEdit}
          aria-label="Edit transaction"
        >
          <Pencil className="h-3 w-3" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              aria-label="Delete transaction"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{transaction.title}&quot;?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
});

export function TransactionList() {
  const { state, filteredTransactions } = useFinance();
  const { transactions } = state;

  if (transactions.length === 0) {
    return <EmptyState />;
  }

  if (filteredTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-muted-foreground text-center">
          No transactions match your filter. Try adjusting your search or
          filters.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-480px)] min-h-[300px]">
      <div className="space-y-2 pr-3">
        {filteredTransactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </ScrollArea>
  );
}
