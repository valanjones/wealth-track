"use client";

import React, { useMemo, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { EXPENSE_COLORS, INCOME_COLORS } from "@/context/FinanceContext";
import { formatCurrency } from "@/utils/formatCurrency";
import { AnalyticsModal } from "@/components/AnalyticsModal";
import {
  computeCategoryBreakdown,
  computeMonthlyTrend,
} from "@/utils/chartUtils";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      category: string;
      total: number;
      percentage: number;
    };
  }>;
}

function PieCustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="font-medium text-sm">{data.category}</p>
      <p className="text-sm text-muted-foreground">
        {formatCurrency(data.total)}
      </p>
      <p className="text-xs text-muted-foreground">{data.percentage}%</p>
    </div>
  );
}

interface BarTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function BarCustomTooltip({ active, payload, label }: BarTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="font-medium text-sm mb-1">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
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

function ExpenseChartInner() {
  const { state } = useFinance();
  const [pieView, setPieView] = useState<"expenses" | "income">("expenses");
  const [modalOpen, setModalOpen] = useState(false);

  // Use ALL transactions — no date filtering in compact view
  const expenseBreakdown = useMemo(
    () => computeCategoryBreakdown(state.transactions, "expense", EXPENSE_COLORS),
    [state.transactions]
  );

  const incomeBreakdown = useMemo(
    () => computeCategoryBreakdown(state.transactions, "income", INCOME_COLORS),
    [state.transactions]
  );

  const activeBreakdown =
    pieView === "expenses" ? expenseBreakdown : incomeBreakdown;

  const pieData = activeBreakdown.map((item) => ({
    ...item,
    name: item.category,
    fill: item.color,
  }));

  const emptyMessage =
    pieView === "expenses"
      ? "No expenses recorded yet"
      : "No income recorded yet";

  const monthlyData = useMemo(
    () => computeMonthlyTrend(state.transactions),
    [state.transactions]
  );

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Analytics</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setModalOpen(true)}
              aria-label="Expand analytics"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="category">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="category" className="text-xs">
                By Category
              </TabsTrigger>
              <TabsTrigger value="trend" className="text-xs">
                Trend
              </TabsTrigger>
            </TabsList>

            <TabsContent value="category">
              <div className="flex justify-center mb-4">
                <div className="flex rounded-lg border bg-muted/50 p-0.5">
                  <Button
                    variant={pieView === "expenses" ? "default" : "ghost"}
                    size="sm"
                    className={`h-7 px-4 text-xs transition-all duration-200 ${
                      pieView === "expenses"
                        ? "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700"
                        : ""
                    }`}
                    onClick={() => setPieView("expenses")}
                  >
                    Expenses
                  </Button>
                  <Button
                    variant={pieView === "income" ? "default" : "ghost"}
                    size="sm"
                    className={`h-7 px-4 text-xs transition-all duration-200 ${
                      pieView === "income"
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                        : ""
                    }`}
                    onClick={() => setPieView("income")}
                  >
                    Income
                  </Button>
                </div>
              </div>

              {pieData.length === 0 ? (
                <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="total"
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<PieCustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {pieData.map((item) => (
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
            </TabsContent>

            <TabsContent value="trend">
              {monthlyData.every(
                (m) => m.income === 0 && m.expense === 0
              ) ? (
                <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                  No transaction data to display
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
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
                    <RechartsTooltip content={<BarCustomTooltip />} />
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AnalyticsModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

export const ExpenseChart = React.memo(ExpenseChartInner);
