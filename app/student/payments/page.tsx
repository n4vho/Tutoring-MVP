import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStudentSession } from "@/lib/student-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StudentPaymentsList } from "./payments-list";

export default async function StudentPaymentsPage() {
  // Require student session - redirects if not authenticated
  let studentId: string;
  try {
    studentId = await requireStudentSession();
  } catch {
    redirect("/student/login");
  }

  // Fetch payments for this student
  const paymentsData = await prisma.payment.findMany({
    where: { studentId },
    orderBy: [
      { appliesToMonth: "desc" },
      { paidAt: "desc" },
    ],
    select: {
      id: true,
      amount: true,
      category: true,
      appliesToMonth: true,
      paidAt: true,
      receiptNo: true,
      note: true,
    },
  });

  // Transform payments for the component
  const payments = paymentsData.map((payment) => ({
    id: payment.id,
    amount: payment.amount,
    category: payment.category as "ADMISSION" | "MONTHLY" | "MODEL_TEST" | "OTHER",
    appliesToMonth: payment.appliesToMonth.toISOString(),
    paidAt: payment.paidAt.toISOString(),
    receiptNo: payment.receiptNo,
    note: payment.note,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payment History</h1>
        <Link href="/student/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentPaymentsList payments={payments} />
        </CardContent>
      </Card>
    </div>
  );
}
