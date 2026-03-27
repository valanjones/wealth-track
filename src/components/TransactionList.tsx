"use client";

import { Pencil, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency } from "@/utils/formatCurrency";
import { EmptyState } from "./EmptyState";
import type { Transaction } from "@/types";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const { dispatch } = useFinance();
  const isIncome = transaction.type === "income";

  return (
    <div className="group flex items-center gap-3 rounded-lg border p-3 transition-all duration-200 hover:shadow-sm hover:bg-muted/30">
      {/* Type icon */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
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

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="font-medium text-sm truncate max-w-[180px]">
                {transaction.title}
              </p>
            </TooltipTrigger>
            {transaction.title.length > 25 && (
              <TooltipContent>
                <p>{transaction.title}</p>
              </TooltipContent>
            )}
          </Tooltip>
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-4 shrink-0"
          >
            {transaction.category}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDate(transaction.date)}
        </p>
      </div>

      {/* Amount */}
      <p
        className={`font-semibold text-sm shrink-0 ${
          isIncome
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400"
        }`}
      >
        {isIncome ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </p>

      {/* Actions */}
      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() =>
            dispatch({ type: "SET_EDITING", payload: transaction })
          }
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
                onClick={() =>
                  dispatch({
                    type: "DELETE_TRANSACTION",
                    payload: transaction.id,
                  })
                }
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

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
    <ScrollArea className="h-[calc(100vh-420px)] min-h-[300px]">
      <div className="space-y-2 pr-3">
        {filteredTransactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </ScrollArea>
  );
}
