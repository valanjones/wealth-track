"use client";

import { useRef, useState, useCallback } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency } from "@/utils/formatCurrency";
import { parseCSV } from "@/utils/importCSV";
import { toast } from "sonner";
import type { Transaction } from "@/types";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ImportCSV() {
  const { dispatchWithToast } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{
    valid: Transaction[];
    skipped: number;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (!file.name.endsWith(".csv")) {
        toast.error("Please select a .csv file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (!content) {
          toast.error("Failed to read file");
          return;
        }

        const result = parseCSV(content);

        if (result.valid.length === 0) {
          toast.error("No valid transactions found in file", {
            description:
              result.skipped > 0
                ? `${result.skipped} rows were skipped due to errors`
                : "File may be empty or in wrong format",
          });
          return;
        }

        setPreview(result);
        setIsOpen(true);
      };

      reader.onerror = () => {
        toast.error("Failed to read file");
      };

      reader.readAsText(file);
    },
    []
  );

  const handleImport = useCallback(() => {
    if (!preview) return;

    // Use regular dispatch (not toast) for bulk, then show one summary toast
    preview.valid.forEach((transaction) => {
      dispatchWithToast({
        type: "ADD_TRANSACTION",
        payload: transaction,
      });
    });

    toast.success(`Successfully imported ${preview.valid.length} transactions`);
    setIsOpen(false);
    setPreview(null);
  }, [preview, dispatchWithToast]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setPreview(null);
  }, []);

  const previewRows = preview?.valid.slice(0, 5) ?? [];

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-3 w-3" />
        Import CSV
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Import Preview</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Found{" "}
              <span className="font-semibold text-foreground">
                {preview?.valid.length ?? 0}
              </span>{" "}
              valid transactions
              {(preview?.skipped ?? 0) > 0 && (
                <>
                  ,{" "}
                  <span className="font-semibold text-rose-500">
                    {preview?.skipped}
                  </span>{" "}
                  skipped
                </>
              )}
            </p>

            <ScrollArea className="max-h-[240px]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-3 font-medium">Date</th>
                    <th className="pb-2 pr-3 font-medium">Title</th>
                    <th className="pb-2 pr-3 font-medium">Type</th>
                    <th className="pb-2 pr-3 font-medium">Category</th>
                    <th className="pb-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((t, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-3 whitespace-nowrap">
                        {formatDate(t.date)}
                      </td>
                      <td className="py-2 pr-3 truncate max-w-[120px]">
                        {t.title}
                      </td>
                      <td className="py-2 pr-3 capitalize">{t.type}</td>
                      <td className="py-2 pr-3">{t.category}</td>
                      <td
                        className={`py-2 text-right font-medium ${
                          t.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(preview?.valid.length ?? 0) > 5 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  ...and {(preview?.valid.length ?? 0) - 5} more
                </p>
              )}
            </ScrollArea>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleImport}>
              Import All ({preview?.valid.length ?? 0})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
