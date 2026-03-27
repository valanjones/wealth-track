export type TransactionType = "income" | "expense";

export type IncomeCategory =
  | "Salary"
  | "Freelance"
  | "Business"
  | "Passive Income"
  | "Side Income"
  | "Investment Returns"
  | "Gift / Bonus"
  | "Other";

export type ExpenseCategory =
  | "Food"
  | "Rent"
  | "Transport"
  | "Entertainment"
  | "Healthcare"
  | "Shopping"
  | "Utilities"
  | "Other";

export type Category = IncomeCategory | ExpenseCategory;

export const INCOME_CATEGORIES: IncomeCategory[] = [
  "Salary",
  "Freelance",
  "Business",
  "Passive Income",
  "Side Income",
  "Investment Returns",
  "Gift / Bonus",
  "Other",
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Rent",
  "Transport",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Utilities",
  "Other",
];

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: Category;
  type: TransactionType;
  date: string;
  notes?: string;
}

export type DateRange =
  | "all"
  | "today"
  | "this_week"
  | "this_month"
  | "last_month"
  | "last_3_months";

export interface FinanceState {
  transactions: Transaction[];
  filter: {
    type: "all" | TransactionType;
    category: Category | "all";
    search: string;
    dateRange: DateRange;
  };
  editingTransaction: Transaction | null;
  isFormOpen: boolean;
}

export type FinanceAction =
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "EDIT_TRANSACTION"; payload: Transaction }
  | { type: "SET_FILTER"; payload: Partial<FinanceState["filter"]> }
  | { type: "SET_EDITING"; payload: Transaction | null }
  | { type: "TOGGLE_FORM"; payload: boolean }
  | { type: "LOAD_TRANSACTIONS"; payload: Transaction[] };
