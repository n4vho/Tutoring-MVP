import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { StudentActions } from "./student-actions";
import { SuccessMessage } from "./success-message";
import { StudentDetailTabs } from "./page-with-tabs";
import { PhotoUpload } from "./photo-upload";

type Props = {
  params: Promise<{ id: string }>;
};

// Force dynamic rendering - this page requires database access and authentication
export const dynamic = 'force-dynamic';

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      batch: true,
      assessmentScores: {
        include: {
          assessment: {
            select: {
              id: true,
              title: true,
              subject: true,
              date: true,
              maxMarks: true,
            },
          },
        },
        orderBy: {
          assessment: {
            date: "desc",
          },
        },
      },
    },
  });

  if (!student) {
    notFound();
  }

  // Fetch payments for this student
  const paymentsData = await prisma.payment.findMany({
    where: { studentId: id },
    orderBy: [
      { appliesToMonth: "desc" },
      { paidAt: "desc" },
    ],
    include: {
      createdByUser: {
        select: {
          id: true,
          username: true,
          phone: true,
        },
      },
    },
  });

  // Transform payments for the component
  const payments = paymentsData.map((payment) => ({
    id: payment.id,
    amount: payment.amount,
    category: payment.category as "ADMISSION" | "MONTHLY" | "MODEL_TEST" | "OTHER",
    appliesToMonth: payment.appliesToMonth.toISOString(),
    paidAt: payment.paidAt.toISOString(),
    createdAt: payment.createdAt.toISOString(),
    note: payment.note,
    receiptNo: payment.receiptNo,
    createdByUser: payment.createdByUser,
  }));

  // Transform scores for the component
  const scores = student.assessmentScores.map((score) => ({
    id: score.id,
    score: score.score,
    remarks: score.remarks,
    assessment: {
      id: score.assessment.id,
      title: score.assessment.title,
      subject: score.assessment.subject,
      date: score.assessment.date.toISOString(),
      maxMarks: score.assessment.maxMarks,
    },
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin/students"
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Back to Students
          </Link>
          <h1 className="text-3xl font-bold">{student.fullName}</h1>
        </div>
        <StudentActions studentId={id} currentStatus={student.status} />
      </div>
      <Suspense fallback={null}>
        <SuccessMessage />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <PhotoUpload studentId={id} currentPhotoUrl={student.photoUrl} />
        </div>
        <div className="md:col-span-2">
          <StudentDetailTabs
            student={{
              id: student.id,
              registrationNo: student.registrationNo,
              fullName: student.fullName,
              phone: student.phone,
              school: student.school,
              grade: student.grade,
              status: student.status,
              photoUrl: student.photoUrl,
              createdAt: student.createdAt,
              updatedAt: student.updatedAt,
              batch: student.batch,
            }}
            scores={scores}
            payments={payments}
            monthlyFee={student.batch?.monthlyFee ?? null}
          />
        </div>
      </div>
    </div>
  );
}

