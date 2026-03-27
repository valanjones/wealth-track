"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinance } from "@/context/FinanceContext";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types";
import type { Category, TransactionType, Transaction } from "@/types";
import { parseAmount } from "@/utils/formatCurrency";
import { CATEGORY_COLORS } from "@/components/CategoryBadge";

interface FormErrors {
  title?: string;
  amount?: string;
  category?: string;
  date?: string;
}

const emptyForm = {
  title: "",
  amount: "",
  category: "" as Category | "",
  type: "expense" as TransactionType,
  date: new Date().toISOString().split("T")[0],
  notes: "",
};

export function TransactionForm() {
  const { state, dispatchWithToast, dispatch } = useFinance();
  const { isFormOpen, editingTransaction } = state;

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive categories based on selected type
  const categories =
    form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Pre-fill form when editing
  useEffect(() => {
    if (editingTransaction) {
      const validCategories =
        editingTransaction.type === "income"
          ? INCOME_CATEGORIES
          : EXPENSE_CATEGORIES;
      const categoryIsValid = validCategories.includes(
        editingTransaction.category as any
      );

      setForm({
        title: editingTransaction.title,
        amount: editingTransaction.amount.toString(),
        category: categoryIsValid ? editingTransaction.category : "",
        type: editingTransaction.type,
        date: editingTransaction.date.split("T")[0],
        notes: editingTransaction.notes || "",
      });
      setErrors({});
    } else {
      setForm(emptyForm);
      setErrors({});
    }
  }, [editingTransaction, isFormOpen]);

  // Reset category when type changes
  function handleTypeChange(newType: TransactionType) {
    if (newType !== form.type) {
      setForm({ ...form, type: newType, category: "" });
      if (errors.category) setErrors({ ...errors, category: undefined });
    }
  }

  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};

    if (!form.title.trim()) {
      errs.title = "Title is required";
    } else if (form.title.trim().length > 50) {
      errs.title = "Title must be 50 characters or less";
    }

    const amount = parseAmount(form.amount);
    if (!form.amount.trim()) {
      errs.amount = "Amount is required";
    } else if (amount <= 0) {
      errs.amount = "Amount must be greater than 0";
    } else if (form.amount.replace(/[^0-9]/g, "").length > 10) {
      errs.amount = "Amount is too large (max 10 digits)";
    }

    if (!form.category) {
      errs.category = "Category is required";
    }

    if (!form.date) {
      errs.date = "Date is required";
    } else {
      const selected = new Date(form.date + "T23:59:59");
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selected > today) {
        errs.date = "Date cannot be in the future";
      }
    }

    return errs;
  }, [form]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);

      const amount = parseAmount(form.amount);
      const transaction: Transaction = {
        id: editingTransaction?.id || crypto.randomUUID(),
        title: form.title.trim(),
        amount,
        category: form.category as Category,
        type: form.type,
        date: new Date(form.date).toISOString(),
        notes: form.notes.trim() || undefined,
      };

      if (editingTransaction) {
        dispatchWithToast({ type: "EDIT_TRANSACTION", payload: transaction });
      } else {
        dispatchWithToast({ type: "ADD_TRANSACTION", payload: transaction });
      }

      setForm(emptyForm);
      setErrors({});
      setIsSubmitting(false);
    },
    [form, editingTransaction, validate, dispatchWithToast]
  );

  function handleClose(open: boolean) {
    if (!open) {
      dispatch({ type: "TOGGLE_FORM", payload: false });
      dispatch({ type: "SET_EDITING", payload: null });
      setForm(emptyForm);
      setErrors({});
    }
  }

  return (
    <Dialog open={isFormOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {editingTransaction ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Type Toggle */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex rounded-lg border bg-muted/50 p-0.5">
              <Button
                type="button"
                variant={form.type === "income" ? "default" : "ghost"}
                size="sm"
                className={`flex-1 h-8 transition-all duration-200 ${
                  form.type === "income"
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    : ""
                }`}
                onClick={() => handleTypeChange("income")}
              >
                Income
              </Button>
              <Button
                type="button"
                variant={form.type === "expense" ? "default" : "ghost"}
                size="sm"
                className={`flex-1 h-8 transition-all duration-200 ${
                  form.type === "expense"
                    ? "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700"
                    : ""
                }`}
                onClick={() => handleTypeChange("expense")}
              >
                Expense
              </Button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder={
                form.type === "income"
                  ? "e.g. March Salary, Freelance Project"
                  : "e.g. Grocery Shopping, Netflix Bill"
              }
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              maxLength={50}
            />
            {errors.title && (
              <p className="text-xs text-rose-500">{errors.title}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => {
                setForm({ ...form, amount: e.target.value });
                if (errors.amount) setErrors({ ...errors, amount: undefined });
              }}
              inputMode="decimal"
            />
            {errors.amount && (
              <p className="text-xs text-rose-500">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(value) => {
                setForm({ ...form, category: value as Category });
                if (errors.category)
                  setErrors({ ...errors, category: undefined });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] ?? "#6b7280" }}
                      />
                      {cat}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-rose-500">{errors.category}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => {
                setForm({ ...form, date: e.target.value });
                if (errors.date) setErrors({ ...errors, date: undefined });
              }}
            />
            {errors.date && (
              <p className="text-xs text-rose-500">{errors.date}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              placeholder={
                form.type === "income"
                  ? "e.g. Bonus from Q1 appraisal"
                  : "e.g. Bought from Big Bazaar"
              }
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              rows={2}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={
                form.type === "income"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-600 dark:hover:bg-rose-700"
              }
            >
              {isSubmitting
                ? "Saving..."
                : editingTransaction
                ? "Update"
                : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
