import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WealthTrack — Personal Finance Tracker",
  description:
    "Track your income and expenses, visualize spending patterns, and take control of your personal finances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-background font-sans antialiased">
        <Providers>{children}</Providers>
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-inter)",
              fontSize: "14px",
              fontWeight: "500",
              borderRadius: "12px",
            },
            duration: 3000,
          }}
        />
      </body>
    </html>
  );
}
