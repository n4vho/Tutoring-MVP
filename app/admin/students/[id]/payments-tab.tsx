"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AddPaymentModal } from "./add-payment-modal";
import { DeletePaymentDialog } from "./delete-payment-dialog";
import { MonthlyStatusBanner } from "./monthly-status-banner";
import { Toast } from "@/components/ui/toast";

type Payment = {
  id: string;
  amount: number;
  category: "ADMISSION" | "MONTHLY" | "MODEL_TEST" | "OTHER";
  appliesToMonth: string; // ISO date string
  paidAt: string; // ISO date string
  createdAt: string; // ISO date string
  note: string | null;
  receiptNo: string | null;
  createdByUser: {
    id: string;
    username: string | null;
    phone: string | null;
  } | null;
};

type Props = {
  studentId: string;
  payments: Payment[];
  monthlyFee: number | null;
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

async function deletePayment(paymentId: string) {
  const response = await fetch(`/api/payments/${paymentId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete payment");
  }

  return response.json();
}

export function PaymentsTab({ studentId, payments, monthlyFee }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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

  const handleDeleteClick = (paymentId: string) => {
    setPaymentToDelete(paymentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;

    setDeletingId(paymentToDelete);
    setDeleteDialogOpen(false);
    
    try {
      await deletePayment(paymentToDelete);
      setToast({ message: "Payment deleted successfully", type: "success" });
      router.refresh();
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "Failed to delete payment",
        type: "error",
      });
      setDeletingId(null);
    } finally {
      setPaymentToDelete(null);
    }
  };

  const handlePaymentSuccess = () => {
    setToast({ message: "Payment added successfully", type: "success" });
    router.refresh();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCreatedByLabel = (payment: Payment): string => {
    if (payment.createdByUser?.username) {
      return payment.createdByUser.username;
    }
    if (payment.createdByUser?.phone) {
      return payment.createdByUser.phone;
    }
    return "Admin";
  };

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payments</CardTitle>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <MonthlyStatusBanner payments={payments} monthlyFee={monthlyFee} />
        
        {payments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No payments recorded yet.
          </p>
        ) : (
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
                                {!payment.receiptNo && (
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    )}
                                  >
                                    <AlertCircle className="h-3 w-3" />
                                    No receipt
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                                <span>Paid on {formatDateShort(payment.paidAt)}</span>
                                <span>
                                  Entered {formatDateShort(payment.createdAt)} by {getCreatedByLabel(payment)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {payment.receiptNo ? (
                                <Link href={`/admin/receipts/${payment.id}`} target="_blank">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0"
                                  >
                                    Receipt
                                  </Button>
                                </Link>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shrink-0"
                                  disabled
                                  title="Receipt not available for this payment"
                                >
                                  Receipt
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(payment.id)}
                                disabled={deletingId === payment.id || deleteDialogOpen}
                                className="shrink-0"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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
        )}
      </CardContent>

      <AddPaymentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        studentId={studentId}
        onSuccess={handlePaymentSuccess}
      />

      <DeletePaymentDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setPaymentToDelete(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={deletingId !== null}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Card>
  );
}
