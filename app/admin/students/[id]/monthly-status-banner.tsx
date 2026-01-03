"use client";

import { cn } from "@/lib/utils";

type Payment = {
  id: string;
  amount: number;
  category: "ADMISSION" | "MONTHLY" | "MODEL_TEST" | "OTHER";
  appliesToMonth: string; // ISO date string
};

type Props = {
  payments: Payment[];
  monthlyFee: number | null;
};

type MonthStatus = {
  month: string; // YYYY-MM
  total: number;
  status: "Paid" | "Partial" | "Unpaid";
};

export function MonthlyStatusBanner({ payments, monthlyFee }: Props) {
  // If no monthlyFee, don't show status banner
  if (!monthlyFee) {
    return null;
  }

  // Get last 6 months
  const now = new Date();
  const months: string[] = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    months.push(monthKey);
  }

  // Calculate monthly totals for MONTHLY category payments
  const monthlyTotals = new Map<string, number>();
  payments
    .filter((p) => p.category === "MONTHLY")
    .forEach((payment) => {
      const monthKey = new Date(payment.appliesToMonth).toISOString().slice(0, 7); // YYYY-MM
      const current = monthlyTotals.get(monthKey) || 0;
      monthlyTotals.set(monthKey, current + payment.amount);
    });

  // Build status array for last 6 months
  const statuses: MonthStatus[] = months.map((month) => {
    const total = monthlyTotals.get(month) || 0;
    let status: "Paid" | "Partial" | "Unpaid";
    if (total >= monthlyFee) {
      status = "Paid";
    } else if (total > 0) {
      status = "Partial";
    } else {
      status = "Unpaid";
    }
    return { month, total, status };
  });

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  };

  const getStatusColor = (status: MonthStatus["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800";
      case "Partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800";
      case "Unpaid":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800";
    }
  };

  return (
    <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Monthly Status:</span>
        {statuses.map(({ month, status }) => (
          <div
            key={month}
            className={cn(
              "px-2 py-1 rounded-md text-xs font-medium border",
              getStatusColor(status)
            )}
          >
            {formatMonth(month)}: {status}
          </div>
        ))}
      </div>
    </div>
  );
}
