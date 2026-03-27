import { toast } from "sonner";
import type { Transaction } from "@/types";

function formatDateDDMMYYYY(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return `"${value}"`;
}

export function exportToCSV(transactions: Transaction[]): void {
  try {
    if (!transactions || transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const headers = "Date,Title,Type,Category,Amount (₹),Notes";

    const rows = transactions.map((t) => {
      const date = formatDateDDMMYYYY(t.date);
      const title = escapeCSV(t.title);
      const type = t.type === "income" ? "Income" : "Expense";
      const category = t.category;
      const amount = t.amount.toFixed(2);
      const notes = escapeCSV(t.notes || "");
      return `${date},${title},${type},${category},${amount},${notes}`;
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const filename = `wealthtrack-transactions-${day}-${month}-${year}.csv`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${transactions.length} transactions`);
  } catch (error) {
    console.error("Export failed:", error);
    toast.error("Export failed, please try again");
  }
}
