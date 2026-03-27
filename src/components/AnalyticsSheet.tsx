"use client";

import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { EXPENSE_COLORS, INCOME_COLORS } from "@/context/FinanceContext";
import { formatCurrency } from "@/utils/formatCurrency";
import CategoryBadge from "@/components/CategoryBadge";
import {
  type ChartDateRange,
  CHART_DATE_OPTIONS,
  filterByChartDateRange,
  getPeriodLabel,
  getShiftAmount,
  computeCategoryBreakdown,
  computeMonthlyTrend,
} from "@/utils/chartUtils";

interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { category: string; total: number; percentage: number };
  }>;
}

function PieTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="font-medium text-sm">{d.category}</p>
      <p className="text-sm text-muted-foreground">{formatCurrency(d.total)}</p>
      <p className="text-xs text-muted-foreground">{d.percentage}%</p>
    </div>
  );
}

interface BarTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function BarTooltip({ active, payload, label }: BarTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="font-medium text-sm mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground capitalize">{entry.name}:</span>
          <span className="font-medium">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

interface AnalyticsSheetProps {
  open: boolean;
  onClose: () => void;
}

export function AnalyticsSheet({ open, onClose }: AnalyticsSheetProps) {
  const { state } = useFinance();
  const [dateRange, setDateRange] = useState<ChartDateRange>("all");
  const [offset, setOffset] = useState(0);

  const canNavigate = dateRange !== "all";
  const shiftAmount = getShiftAmount(dateRange);
  const periodLabel = getPeriodLabel(dateRange, offset);

  const filtered = useMemo(
    () => filterByChartDateRange(state.transactions, dateRange, offset),
    [state.transactions, dateRange, offset]
  );

  const expenseBreakdown = useMemo(
    () => computeCategoryBreakdown(filtered, "expense", EXPENSE_COLORS),
    [filtered]
  );

  const incomeBreakdown = useMemo(
    () => computeCategoryBreakdown(filtered, "income", INCOME_COLORS),
    [filtered]
  );

  const monthlyData = useMemo(
    () => computeMonthlyTrend(filtered, 6),
    [filtered]
  );

  const modalIncome = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0),
    [filtered]
  );
  const modalExpenses = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0),
    [filtered]
  );
  const modalBalance = modalIncome - modalExpenses;

  const expensePieData = expenseBreakdown.map((item) => ({
    ...item,
    name: item.category,
    fill: item.color,
  }));

  const incomePieData = incomeBreakdown.map((item) => ({
    ...item,
    name: item.category,
    fill: item.color,
  }));

  function handleRangeChange(range: ChartDateRange) {
    setDateRange(range);
    setOffset(0);
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-[75vw] max-w-[900px] overflow-y-auto p-0 sm:max-w-[900px]"
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <SheetHeader className="mb-3">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">Analytics</SheetTitle>
            </div>
          </SheetHeader>

          {/* Date range pills */}
          <div className="flex items-center gap-1 flex-wrap">
            {CHART_DATE_OPTIONS.map(({ value, label }) => (
              <Button
                key={value}
                size="sm"
                variant={dateRange === value ? "default" : "outline"}
                className="text-xs h-7"
                onClick={() => handleRangeChange(value)}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Timeline navigation */}
          {canNavigate && (
            <div className="flex items-center justify-center gap-4 mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOffset((o) => o - shiftAmount)}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm font-semibold min-w-[160px] text-center">
                {periodLabel}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOffset((o) => o + shiftAmount)}
                disabled={offset === 0}
                className="gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b bg-muted/20">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Income</p>
            <p className="text-base font-bold text-emerald-500">
              {formatCurrency(modalIncome)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Expenses</p>
            <p className="text-base font-bold text-rose-500">
              {formatCurrency(modalExpenses)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Net Balance</p>
            <p
              className={`text-base font-bold ${
                modalBalance >= 0 ? "text-blue-500" : "text-rose-500"
              }`}
            >
              {formatCurrency(modalBalance)}
            </p>
          </div>
        </div>

        {/* Charts — single column layout */}
        <div className="flex flex-col gap-6 p-6">
          {/* Expense Pie */}
          <div className="bg-card rounded-xl border p-5">
            <h3 className="font-semibold mb-4">Expense Breakdown</h3>
            {expensePieData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                No expenses in this period
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="total"
                      animationDuration={800}
                    >
                      {expensePieData.map((e, i) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-3">
                  {expensePieData.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-muted-foreground">
                        {item.category} ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Income Pie */}
          <div className="bg-card rounded-xl border p-5">
            <h3 className="font-semibold mb-4">Income Breakdown</h3>
            {incomePieData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                No income in this period
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={incomePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="total"
                      animationDuration={800}
                    >
                      {incomePieData.map((e, i) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-3">
                  {incomePieData.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-muted-foreground">
                        {item.category} ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Monthly Trend */}
          <div className="bg-card rounded-xl border p-5">
            <h3 className="font-semibold mb-4">Monthly Trend</h3>
            {monthlyData.every(
              (m) => m.income === 0 && m.expense === 0
            ) ? (
              <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                No data in this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={monthlyData}
                  margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <RechartsTooltip content={<BarTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                  <Bar
                    dataKey="income"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                  />
                  <Bar
                    dataKey="expense"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category Breakdown Table */}
          <div className="bg-card rounded-xl border p-5">
            <h3 className="font-semibold mb-4">Category Breakdown</h3>

            {expenseBreakdown.length === 0 && incomeBreakdown.length === 0 ? (
              <div className="flex items-center justify-center h-[100px] text-sm text-muted-foreground">
                No data in this period
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left pb-2 font-medium">Category</th>
                    <th className="text-right pb-2 font-medium">Count</th>
                    <th className="text-right pb-2 font-medium">Amount</th>
                    <th className="text-right pb-2 font-medium">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Expense categories */}
                  {expenseBreakdown.length > 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                      >
                        Expenses
                      </td>
                    </tr>
                  )}
                  {expenseBreakdown.map((item, i) => (
                    <tr
                      key={`exp-${item.category}`}
                      className={`border-b last:border-0 ${
                        i === 0 ? "bg-muted/40" : ""
                      }`}
                    >
                      <td className="py-2">
                        <CategoryBadge category={item.category} />
                      </td>
                      <td className="py-2 text-right text-muted-foreground">
                        {item.count}
                      </td>
                      <td className="py-2 text-right font-medium text-rose-600 dark:text-rose-400">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="py-2 text-right text-muted-foreground">
                        {item.percentage}%
                      </td>
                    </tr>
                  ))}

                  {/* Divider */}
                  {expenseBreakdown.length > 0 &&
                    incomeBreakdown.length > 0 && (
                      <tr>
                        <td colSpan={4}>
                          <Separator className="my-2" />
                        </td>
                      </tr>
                    )}

                  {/* Income categories */}
                  {incomeBreakdown.length > 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                      >
                        Income
                      </td>
                    </tr>
                  )}
                  {incomeBreakdown.map((item, i) => (
                    <tr
                      key={`inc-${item.category}`}
                      className={`border-b last:border-0 ${
                        i === 0 ? "bg-muted/40" : ""
                      }`}
                    >
                      <td className="py-2">
                        <CategoryBadge category={item.category} />
                      </td>
                      <td className="py-2 text-right text-muted-foreground">
                        {item.count}
                      </td>
                      <td className="py-2 text-right font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="py-2 text-right text-muted-foreground">
                        {item.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
