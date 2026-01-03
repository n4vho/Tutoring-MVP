"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Payment = {
  id: string;
  amount: number;
  category: "ADMISSION" | "MONTHLY" | "MODEL_TEST" | "OTHER";
  appliesToMonth: string; // ISO date string
  paidAt: string; // ISO date string
  receiptNo: string | null;
  note: string | null;
};

type Props = {
  payments: Payment[];
};

const categoryColors: Record<Payment["category"], string> = {
  ADMISSION: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  MONTHLY: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  MODEL_TEST: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

const categoryLabels: Record<Payment["category"], string> = {
  ADMISSION: "Admission",
  MONTHLY: "Monthly",
  MODEL_TEST: "Model Test",
  OTHER: "Other",
};

export function StudentPaymentsList({ payments }: Props) {
  // Group payments by appliesToMonth (YYYY-MM format)
  const groupedPayments = payments.reduce((acc, payment) => {
    const monthKey = new Date(payment.appliesToMonth).toISOString().slice(0, 7); // YYYY-MM
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(payment);
    return acc;
  }, {} as Record<string, Payment[]>);

  // Sort months descending (most recent first)
  const sortedMonths = Object.keys(groupedPayments).sort((a, b) => b.localeCompare(a));

  // Initialize with first month expanded if any payments exist
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(() => {
    return sortedMonths.length > 0 ? new Set([sortedMonths[0]]) : new Set();
  });

  const toggleMonth = (month: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(month)) {
      newExpanded.delete(month);
    } else {
      newExpanded.add(month);
    }
    setExpandedMonths(newExpanded);
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  if (payments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No payment history found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedMonths.map((monthKey) => {
        const monthPayments = groupedPayments[monthKey];
        const monthTotal = monthPayments.reduce((sum, p) => sum + p.amount, 0);
        const isExpanded = expandedMonths.has(monthKey);

        return (
          <div
            key={monthKey}
            className="border rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleMonth(monthKey)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">{formatMonth(monthKey)}</span>
                <span className="text-sm text-muted-foreground">
                  ({monthPayments.length} payment{monthPayments.length !== 1 ? "s" : ""})
                </span>
              </div>
              <span className="font-semibold">
                ৳{monthTotal.toLocaleString()}
              </span>
            </button>

            {isExpanded && (
              <div className="border-t bg-muted/30">
                <div className="divide-y">
                  {monthPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="px-4 py-3 flex items-start justify-between gap-4 hover:bg-background/50 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                              categoryColors[payment.category]
                            )}
                          >
                            {categoryLabels[payment.category]}
                          </span>
                          <span className="font-semibold">
                            ৳{payment.amount.toLocaleString()}
                          </span>
                          {payment.note && (
                            <span className="text-sm text-muted-foreground">
                              {payment.note}
                            </span>
                          )}
                          {payment.receiptNo && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {payment.receiptNo}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          <span>Paid on {formatDateShort(payment.paidAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 bg-muted/50 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Month Total
                    </span>
                    <span className="font-semibold">
                      ৳{monthTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
