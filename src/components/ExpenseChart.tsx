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
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency } from "@/utils/formatCurrency";

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
  const { state, expenseCategoryBreakdown, incomeCategoryBreakdown } =
    useFinance();
  const [pieView, setPieView] = useState<"expenses" | "income">("expenses");

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { month: string; income: number; expense: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toLocaleString("en-IN", {
        month: "short",
        year: "2-digit",
      });
      months.push({ month: monthKey, income: 0, expense: 0 });
    }

    state.transactions.forEach((t) => {
      const tDate = new Date(t.date);
      for (const m of months) {
        const tKey = tDate.toLocaleString("en-IN", {
          month: "short",
          year: "2-digit",
        });
        if (tKey === m.month) {
          if (t.type === "income") m.income += t.amount;
          else m.expense += t.amount;
          break;
        }
      }
    });

    return months;
  }, [state.transactions]);

  const activeBreakdown =
    pieView === "expenses" ? expenseCategoryBreakdown : incomeCategoryBreakdown;

  const pieData = activeBreakdown.map((item) => ({
    ...item,
    name: item.category,
    fill: item.color,
  }));

  const emptyMessage =
    pieView === "expenses"
      ? "No expenses recorded yet"
      : "No income recorded yet";

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Analytics</CardTitle>
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
            {monthlyData.every((m) => m.income === 0 && m.expense === 0) ? (
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
  );
}

export const ExpenseChart = React.memo(ExpenseChartInner);
