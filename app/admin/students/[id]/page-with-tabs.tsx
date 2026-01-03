"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StudentInfoTab } from "./student-info-tab";
import { MarksHistoryTab } from "./marks-history";
import { PaymentsTab } from "./payments-tab";

type Student = {
  id: string;
  registrationNo: string;
  fullName: string;
  phone: string | null;
  school: string | null;
  grade: string | null;
  status: string;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  batch: {
    id: string;
    name: string;
  } | null;
};

type AssessmentScore = {
  id: string;
  score: number | null;
  remarks: string | null;
  assessment: {
    id: string;
    title: string;
    subject: string;
    date: string;
    maxMarks: number;
  };
};

type Payment = {
  id: string;
  amount: number;
  category: "ADMISSION" | "MONTHLY" | "MODEL_TEST" | "OTHER";
  appliesToMonth: string; // ISO date string
  paidAt: string; // ISO date string
  note: string | null;
  createdByUser: {
    id: string;
    username: string | null;
    phone: string | null;
  } | null;
};

type Props = {
  student: Student;
  scores: AssessmentScore[];
  payments: Payment[];
  monthlyFee: number | null;
};

export function StudentDetailTabs({ student, scores, payments, monthlyFee }: Props) {
  const [activeTab, setActiveTab] = useState<"info" | "marks" | "payments">("info");

  return (
    <>
      <div className="border-b mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("info")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "info"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Student Information
          </button>
          <button
            onClick={() => setActiveTab("marks")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "marks"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Marks History
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "payments"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Payments
          </button>
        </div>
      </div>

      {activeTab === "info" && <StudentInfoTab student={student} />}
      {activeTab === "marks" && <MarksHistoryTab scores={scores} />}
      {activeTab === "payments" && <PaymentsTab studentId={student.id} payments={payments} monthlyFee={monthlyFee} />}
    </>
  );
}
