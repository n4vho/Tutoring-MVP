"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

type Payment = {
  id: string;
  amount: number;
  category: string;
  appliesToMonth: Date;
  paidAt: Date;
  receiptNo: string | null;
  receiptIssuedAt: Date | null;
  note: string | null;
  student: {
    id: string;
    registrationNo: string;
    fullName: string;
    phone: string | null;
    school: string | null;
    grade: string | null;
    batch: {
      id: string;
      name: string;
    } | null;
  };
  createdByUser: {
    id: string;
    username: string | null;
    phone: string | null;
  } | null;
};

type InstitutionInfo = {
  name: string;
  address: string;
  phone: string;
  email: string;
};

type Props = {
  payment: Payment;
  institutionInfo: InstitutionInfo;
};

const categoryLabels: Record<string, string> = {
  ADMISSION: "Admission Fee",
  MONTHLY: "Monthly Fee",
  MODEL_TEST: "Model Test Fee",
  OTHER: "Other",
};

function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="no-print mb-4 flex justify-end">
      <Button onClick={handlePrint} className="gap-2">
        <Printer className="h-4 w-4" />
        Print Receipt
      </Button>
    </div>
  );
}

export function ReceiptContent({ payment, institutionInfo }: Props) {
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatMonth = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const getCreatedByLabel = () => {
    if (payment.createdByUser?.username) {
      return payment.createdByUser.username;
    }
    if (payment.createdByUser?.phone) {
      return payment.createdByUser.phone;
    }
    return "Admin";
  };

  return (
    <div className="min-h-screen bg-white p-8 print:p-0 receipt-container">
      <PrintButton />

      <div className="mx-auto max-w-2xl bg-white p-8 print:p-0 receipt-section">
        {/* Header */}
        <div className="mb-6 border-b-2 border-blue-800 pb-4">
          <div className="text-center">
            <div className="mb-3 flex justify-center">
              <Image
                src="/math-academy-logo.jpeg"
                alt="Math Academy Logo"
                width={80}
                height={80}
                className="h-20 w-auto"
                priority
              />
            </div>
            <h1 className="mb-2 text-3xl font-bold">{institutionInfo.name}</h1>
            <p className="text-sm text-gray-600">{institutionInfo.address}</p>
            <p className="text-sm text-gray-600">
              Phone: {institutionInfo.phone} | Email: {institutionInfo.email}
            </p>
          </div>
        </div>

        {/* Receipt Number Section */}
        <div className="mb-4 border-b border-gray-300 pb-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Receipt No:</p>
              <p className="font-mono text-xl font-bold">
                {payment.receiptNo || "N/A"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Date:</p>
              <p className="font-semibold">
                {formatDate(payment.receiptIssuedAt || payment.paidAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Received From Section */}
        <div className="mb-4 border-b border-gray-300 pb-3">
          <p className="text-sm text-gray-600 mb-1">Received from:</p>
          <p className="text-lg font-semibold">{payment.student.fullName}</p>
          <p className="text-sm text-gray-600">
            Registration No: {payment.student.registrationNo}
          </p>
          {payment.student.batch && (
            <p className="text-sm text-gray-600">
              Batch/Class: {payment.student.batch.name}
            </p>
          )}
          {payment.student.grade && (
            <p className="text-sm text-gray-600">Grade: {payment.student.grade}</p>
          )}
        </div>

        {/* Payment Details */}
        <div className="mb-4 border-b border-gray-300 pb-3">
          <p className="text-sm text-gray-600 mb-1">Payment Category:</p>
          <p className="font-semibold">
            {categoryLabels[payment.category] || payment.category}
          </p>
          <p className="text-sm text-gray-600 mt-2 mb-1">Applies to Month:</p>
          <p className="font-semibold">{formatMonth(payment.appliesToMonth)}</p>
          <p className="text-sm text-gray-600 mt-2 mb-1">Amount:</p>
          <p className="text-2xl font-bold">৳{payment.amount.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
