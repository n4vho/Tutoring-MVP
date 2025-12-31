import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SuccessMessage } from "../success-message";

type Props = {
  params: Promise<{ id: string }>;
};

// Force dynamic rendering - this page requires database access and authentication
export const dynamic = 'force-dynamic';

export default async function BatchAssessmentsPage({ params }: Props) {
  const { id: batchId } = await params;

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!batch) {
    notFound();
  }

  const assessments = await prisma.assessment.findMany({
    where: { batchId },
    orderBy: { date: "desc" },
    select: {
      id: true,
      title: true,
      subject: true,
      date: true,
      maxMarks: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href={`/admin/batches/${batchId}`}
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Back to Batch
          </Link>
          <h1 className="text-3xl font-bold">Assessments</h1>
          <p className="text-muted-foreground mt-1">{batch.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/batches/${batchId}/assessments/new`}>
            <Button>Create Assessment</Button>
          </Link>
          <Link href={`/admin/batches/${batchId}`}>
            <Button variant="outline">Back to Batch</Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={null}>
        <SuccessMessage />
      </Suspense>

      <Card>
        <CardContent className="p-0">
          {assessments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No assessments yet for this batch.
              </p>
              <Link href={`/admin/batches/${batchId}/assessments/new`}>
                <Button>Create First Assessment</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Max Marks
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((assessment) => (
                    <tr
                      key={assessment.id}
                      className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium">
                        {assessment.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {assessment.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(assessment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {assessment.maxMarks}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Link href={`/admin/assessments/${assessment.id}/marks`}>
                            <Button variant="outline" size="sm">
                              Enter Marks
                            </Button>
                          </Link>
                          <Link href={`/admin/assessments/${assessment.id}/results`}>
                            <Button variant="outline" size="sm">
                              View Results
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
