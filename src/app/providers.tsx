"use client";

import { ThemeProvider } from "next-themes";
import { FinanceProvider } from "@/context/FinanceContext";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider delayDuration={200}>
        <FinanceProvider>{children}</FinanceProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
