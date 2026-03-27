"use client";

import { useMemo, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import type { Category } from "@/types";

export function FilterBar() {
  const { state, dispatch } = useFinance();
  const { filter } = state;
  const prevTypeRef = useRef(filter.type);

  // Derive category list based on active type filter
  const categoryOptions = useMemo(() => {
    if (filter.type === "income") return INCOME_CATEGORIES;
    if (filter.type === "expense") return EXPENSE_CATEGORIES;
    // "all" — merge both, deduplicate "Other"
    const merged = new Set<string>([
      ...INCOME_CATEGORIES,
      ...EXPENSE_CATEGORIES,
    ]);
    return Array.from(merged) as Category[];
  }, [filter.type]);

  const hasActiveFilters =
    filter.type !== "all" ||
    filter.category !== "all" ||
    filter.search.trim() !== "";

  function handleTypeChange(type: "all" | "income" | "expense") {
    // Reset category when type changes
    dispatch({
      type: "SET_FILTER",
      payload: { type, category: "all" },
    });
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          value={filter.search}
          onChange={(e) =>
            dispatch({
              type: "SET_FILTER",
              payload: { search: e.target.value },
            })
          }
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Type filter buttons */}
        <div className="flex rounded-lg border bg-muted/50 p-0.5">
          {(["all", "income", "expense"] as const).map((type) => (
            <Button
              key={type}
              variant={filter.type === type ? "default" : "ghost"}
              size="sm"
              className={`h-7 px-3 text-xs capitalize transition-all duration-200 ${
                filter.type === type
                  ? type === "income"
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    : type === "expense"
                    ? "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700"
                    : ""
                  : ""
              }`}
              onClick={() => handleTypeChange(type)}
            >
              {type}
            </Button>
          ))}
        </div>

        {/* Category filter */}
        <Select
          value={filter.category}
          onValueChange={(value) =>
            dispatch({
              type: "SET_FILTER",
              payload: { category: value as Category | "all" },
            })
          }
        >
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoryOptions.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() =>
              dispatch({
                type: "SET_FILTER",
                payload: { type: "all", category: "all", search: "" },
              })
            }
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
