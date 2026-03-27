"use client";

import { useState, useEffect } from "react";
import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SummaryCards } from "@/components/SummaryCards";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { ExpenseChart } from "@/components/ExpenseChart";
import { FilterBar } from "@/components/FilterBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BudgetTracker } from "@/components/BudgetTracker";
import { QuickStats } from "@/components/QuickStats";
import { useFinance } from "@/context/FinanceContext";

export default function Home() {
  const { dispatch } = useFinance();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Wallet className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">WealthTrack</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="hidden gap-1.5 sm:flex"
              onClick={() => dispatch({ type: "TOGGLE_FORM", payload: true })}
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {/* Summary Cards */}
        <section className="mb-6">
          <SummaryCards />
        </section>

        {/* Budget Tracker */}
        <section className="mb-6">
          <BudgetTracker />
        </section>

        {/* Quick Stats */}
        <section className="mb-6">
          <QuickStats />
        </section>

        <Separator className="mb-6" />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Filters + Transaction List (2/3 width) */}
          <div className="space-y-4 lg:col-span-2">
            <FilterBar />
            <TransactionList />
          </div>

          {/* Right: Charts (1/3 width, sticky on desktop) */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <ExpenseChart />
          </div>
        </div>
      </main>

      {/* Floating Add Button (Mobile) */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg sm:hidden"
        size="icon"
        onClick={() => dispatch({ type: "TOGGLE_FORM", payload: true })}
        aria-label="Add transaction"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Transaction Form Dialog */}
      <TransactionForm />
    </div>
  );
}
