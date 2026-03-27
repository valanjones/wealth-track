"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
} from "react";
import type {
  Transaction,
  FinanceState,
  FinanceAction,
  ExpenseCategory,
  IncomeCategory,
} from "@/types";

const STORAGE_KEY = "wealth-tracker-transactions";

export const EXPENSE_COLORS: Record<ExpenseCategory, string> = {
  Food: "#f97316",
  Rent: "#ef4444",
  Transport: "#3b82f6",
  Entertainment: "#a855f7",
  Healthcare: "#06b6d4",
  Shopping: "#ec4899",
  Utilities: "#eab308",
  Other: "#6b7280",
};

export const INCOME_COLORS: Record<IncomeCategory, string> = {
  Salary: "#22c55e",
  Freelance: "#10b981",
  Business: "#14b8a6",
  "Passive Income": "#6366f1",
  "Side Income": "#8b5cf6",
  "Investment Returns": "#f59e0b",
  "Gift / Bonus": "#f472b6",
  Other: "#6b7280",
};

const initialState: FinanceState = {
  transactions: [],
  filter: {
    type: "all",
    category: "all",
    search: "",
  },
  editingTransaction: null,
  isFormOpen: false,
};

function financeReducer(
  state: FinanceState,
  action: FinanceAction
): FinanceState {
  switch (action.type) {
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        isFormOpen: false,
        editingTransaction: null,
      };

    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter(
          (t) => t.id !== action.payload
        ),
      };

    case "EDIT_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
        isFormOpen: false,
        editingTransaction: null,
      };

    case "SET_FILTER":
      return {
        ...state,
        filter: { ...state.filter, ...action.payload },
      };

    case "SET_EDITING":
      return {
        ...state,
        editingTransaction: action.payload,
        isFormOpen: action.payload !== null,
      };

    case "TOGGLE_FORM":
      return {
        ...state,
        isFormOpen: action.payload,
        editingTransaction: action.payload ? state.editingTransaction : null,
      };

    case "LOAD_TRANSACTIONS":
      return {
        ...state,
        transactions: action.payload,
      };

    default:
      return state;
  }
}

interface CategoryBredownItem<T extends string> {
  category: T;
  total: number;
  percentage: number;
  color: string;
}

interface FinanceContextValue {
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  filteredTransactions: Transaction[];
  expenseCategoryBreakdown: CategoryBredownItem<ExpenseCategory>[];
  incomeCategoryBreakdown: CategoryBredownItem<IncomeCategory>[];
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load transactions from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: "LOAD_TRANSACTIONS", payload: parsed });
        }
      }
    } catch (error) {
      console.warn("Failed to parse localStorage data, using empty array:", error);
    }
    setIsLoaded(true);
  }, []);

  // Sync transactions to localStorage on every change
  useEffect(() => {
    if (!isLoaded) return;
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state.transactions)
      );
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }, [state.transactions, isLoaded]);

  const totalIncome = useMemo(
    () =>
      state.transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    [state.transactions]
  );

  const totalExpenses = useMemo(
    () =>
      state.transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [state.transactions]
  );

  const netBalance = useMemo(
    () => totalIncome - totalExpenses,
    [totalIncome, totalExpenses]
  );

  const filteredTransactions = useMemo(() => {
    let filtered = state.transactions;

    if (state.filter.type !== "all") {
      filtered = filtered.filter((t) => t.type === state.filter.type);
    }

    if (state.filter.category !== "all") {
      filtered = filtered.filter(
        (t) => t.category === state.filter.category
      );
    }

    if (state.filter.search.trim()) {
      const search = state.filter.search.toLowerCase().trim();
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [state.transactions, state.filter]);

  const expenseCategoryBreakdown = useMemo(() => {
    const expenseTransactions = state.transactions.filter(
      (t) => t.type === "expense"
    );
    const totalExp = expenseTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const categoryMap = new Map<ExpenseCategory, number>();
    expenseTransactions.forEach((t) => {
      const cat = t.category as ExpenseCategory;
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + t.amount);
    });

    return Array.from(categoryMap.entries())
      .map(([category, total]) => ({
        category,
        total,
        percentage: totalExp > 0 ? Math.round((total / totalExp) * 100) : 0,
        color: EXPENSE_COLORS[category] || "#6b7280",
      }))
      .sort((a, b) => b.total - a.total);
  }, [state.transactions]);

  const incomeCategoryBreakdown = useMemo(() => {
    const incomeTransactions = state.transactions.filter(
      (t) => t.type === "income"
    );
    const totalInc = incomeTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const categoryMap = new Map<IncomeCategory, number>();
    incomeTransactions.forEach((t) => {
      const cat = t.category as IncomeCategory;
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + t.amount);
    });

    return Array.from(categoryMap.entries())
      .map(([category, total]) => ({
        category,
        total,
        percentage: totalInc > 0 ? Math.round((total / totalInc) * 100) : 0,
        color: INCOME_COLORS[category] || "#6b7280",
      }))
      .sort((a, b) => b.total - a.total);
  }, [state.transactions]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      totalIncome,
      totalExpenses,
      netBalance,
      filteredTransactions,
      expenseCategoryBreakdown,
      incomeCategoryBreakdown,
    }),
    [
      state,
      totalIncome,
      totalExpenses,
      netBalance,
      filteredTransactions,
      expenseCategoryBreakdown,
      incomeCategoryBreakdown,
    ]
  );

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
