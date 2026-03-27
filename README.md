# 💰 WealthTrack

A modern personal finance tracker built with Next.js, React, and Tailwind CSS. Track income and expenses, set budgets, visualize spending trends, and gain insights — all from a single dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)

---

## ✨ Features

### Core
- **Add / Edit / Delete Transactions** — income and expenses with category, date, amount, and optional notes
- **Category System** — 8 expense categories (Food, Rent, Transport, etc.) and 8 income categories (Salary, Freelance, etc.) with consistent color-coding throughout the app
- **Persistent Storage** — all data saved to `localStorage`, no backend required

### Dashboard
- **Summary Cards** — total income, expenses, and net balance at a glance
- **Quick Stats Bar** — today's spending, this week's spending, and top category this month
- **Budget Tracker** — set monthly budget goals and track progress with a visual progress bar

### Filtering & Search
- **Search** — filter transactions by title
- **Type Filter** — show All, Income only, or Expenses only
- **Category Filter** — dropdown with color-coded category dots
- **Date Range Filter** — presets: Today, This Week, This Month, Last Month, and custom range

### Analytics
- **Pie Charts** — expense and income breakdown by category with interactive tooltips
- **Trend Chart** — monthly income vs. expense bar chart
- **Expense / Income Toggle** — switch between views in the compact sidebar chart
- **Expanded Analytics Modal** — full-screen modal (95vw) with:
  - Date range filter pills (All Time, This Month, Last Month, 3 Months, 6 Months, This Year)
  - Timeline navigation (Previous / Next period)
  - Summary strip (Income, Expenses, Net Balance)
  - Side-by-side expense and income pie charts
  - Full-width monthly trend bar chart
  - Category breakdown table with counts, amounts, and percentages

### Data Management
- **CSV Import** — bulk import transactions from CSV files with row-level validation and preview
  - Expected format: `Date (DD/MM/YYYY), Title, Type, Category, Amount, Notes`
- **Light / Dark Mode** — system-aware theme toggle with `next-themes`
- **Toast Notifications** — feedback on every action via Sonner

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| UI Library | [React 19](https://react.dev/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Components | [shadcn/ui](https://ui.shadcn.com/) (Dialog, Select, Tabs, Tooltip, Sheet, etc.) |
| Charts | [Recharts 3](https://recharts.org/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) |
| Toasts | [Sonner](https://sonner.emilkowal.dev/) |
| State | React Context + `useReducer` with `localStorage` persistence |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone <repo-url>
cd wealth-tracker
npm install
```

### Development

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router (page.tsx, layout.tsx, globals.css)
├── components/
│   ├── ui/               # shadcn/ui primitives (Button, Dialog, Select, etc.)
│   ├── AnalyticsModal.tsx # Full-screen analytics with charts and tables
│   ├── BudgetTracker.tsx  # Monthly budget goal and progress bar
│   ├── CategoryBadge.tsx  # Colored dot + label for category display
│   ├── ExpenseChart.tsx   # Compact sidebar chart (pie + trend tabs)
│   ├── FilterBar.tsx      # Search, type, category, and date range filters
│   ├── ImportCSV.tsx      # CSV import dialog with preview and validation
│   ├── QuickStats.tsx     # Today / This Week / Top Category stat cards
│   ├── SummaryCards.tsx   # Income / Expense / Balance overview cards
│   ├── ThemeToggle.tsx    # Light / Dark mode switcher
│   ├── TransactionForm.tsx# Add / Edit transaction dialog
│   └── TransactionList.tsx# Transaction rows with edit and delete
├── context/
│   └── FinanceContext.tsx # Global state (useReducer + localStorage)
├── hooks/                # Custom hooks
├── types/
│   └── index.ts          # TypeScript types & category constants
└── utils/
    ├── chartUtils.ts      # Date filtering, category breakdowns, trend computation
    ├── formatCurrency.ts  # ₹ currency formatting and amount parsing
    └── importCSV.ts       # CSV parsing and row validation logic
```

---

## 📊 Category Colors

| Expense | Color | Income | Color |
|---|---|---|---|
| Food | 🟠 `#f97316` | Salary | 🟢 `#22c55e` |
| Rent | 🔴 `#ef4444` | Freelance | 🟢 `#10b981` |
| Transport | 🔵 `#3b82f6` | Business | 🟢 `#14b8a6` |
| Entertainment | 🟣 `#a855f7` | Passive Income | 🟣 `#6366f1` |
| Healthcare | 🔵 `#06b6d4` | Side Income | 🟣 `#8b5cf6` |
| Shopping | 🩷 `#ec4899` | Investment Returns | 🟠 `#f59e0b` |
| Utilities | 🟡 `#eab308` | Gift / Bonus | 🩷 `#ec4899` |
| Other | ⚫ `#6b7280` | Other | ⚫ `#6b7280` |

---

## 📜 License

This project is for personal use.
