import type { Transaction, Category } from "@/types";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types";

/**
 * Expected CSV format (matches our export format):
 * Date,Title,Type,Category,Amount (₹),Notes
 * 27/03/2026,"March Salary",Income,Salary,50000.00,"Bonus included"
 * 27/03/2026,"Grocery Shopping",Expense,Food,1500.00,""
 *
 * Rules:
 * - First row is header (skipped)
 * - Date: DD/MM/YYYY format
 * - Type: "Income" or "Expense" (case insensitive)
 * - Category: must match INCOME_CATEGORIES or EXPENSE_CATEGORIES
 * - Amount: positive number
 * - Notes: optional, may be quoted
 */

interface ParseResult {
  valid: Transaction[];
  skipped: number;
}

function parseCSVRow(row: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current.trim());

  return fields.map((f) => {
    if (f.startsWith('"') && f.endsWith('"')) {
      return f.slice(1, -1).replace(/""/g, '"');
    }
    return f;
  });
}

function parseDateDDMMYYYY(dateStr: string): Date | null {
  // Handle DD/MM/YYYY
  const slashParts = dateStr.split("/");
  if (slashParts.length === 3) {
    const day = parseInt(slashParts[0], 10);
    const month = parseInt(slashParts[1], 10) - 1;
    const year = parseInt(slashParts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Fallback: try native Date parsing
  const fallback = new Date(dateStr);
  if (!isNaN(fallback.getTime())) return fallback;

  return null;
}

const ALL_CATEGORIES: string[] = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
];

export function parseCSV(content: string): ParseResult {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) {
    return { valid: [], skipped: 0 };
  }

  // Skip header
  const dataLines = lines.slice(1);
  const valid: Transaction[] = [];
  let skipped = 0;

  for (const line of dataLines) {
    try {
      const fields = parseCSVRow(line);
      if (fields.length < 5) {
        skipped++;
        continue;
      }

      const [dateStr, title, typeStr, categoryStr, amountStr, notesStr] =
        fields;

      // Validate date
      const parsedDate = parseDateDDMMYYYY(dateStr);
      if (!parsedDate) {
        skipped++;
        continue;
      }

      // Validate title
      if (!title || title.trim().length === 0) {
        skipped++;
        continue;
      }

      // Validate type
      const typeLower = typeStr.toLowerCase().trim();
      if (typeLower !== "income" && typeLower !== "expense") {
        skipped++;
        continue;
      }
      const type = typeLower as "income" | "expense";

      // Validate category
      const category = categoryStr.trim();
      if (!ALL_CATEGORIES.includes(category)) {
        skipped++;
        continue;
      }

      // Validate amount
      const amount = parseFloat(amountStr.replace(/[^0-9.]/g, ""));
      if (isNaN(amount) || amount <= 0) {
        skipped++;
        continue;
      }

      const transaction: Transaction = {
        id: crypto.randomUUID(),
        title: title.trim(),
        amount,
        category: category as Category,
        type,
        date: parsedDate.toISOString(),
        notes: notesStr?.trim() || undefined,
      };

      valid.push(transaction);
    } catch {
      skipped++;
    }
  }

  return { valid, skipped };
}
