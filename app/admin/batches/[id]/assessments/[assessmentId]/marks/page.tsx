import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ id: string; assessmentId: string }>;
};

// Force dynamic rendering - this page requires database access and authentication
export const dynamic = 'force-dynamic';

export default async function MarksEntryPage({ params }: Props) {
  const { id: batchId, assessmentId } = await params;

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      batch: true,
      assessmentScores: {
        include: {
          student: true,
        },
        orderBy: {
          student: {
            fullName: "asc",
          },
        },
      },
    },
  });

  if (!assessment) {
    notFound();
  }

  // Verify assessment belongs to the batch
  if (assessment.batchId !== batchId) {
    notFound();
  }

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
          <h1 className="text-3xl font-bold">Enter Marks</h1>
          <p className="text-muted-foreground mt-1">
            {assessment.title} - {assessment.subject}
          </p>
        </div>
        <Link href={`/admin/batches/${batchId}`}>
          <Button variant="outline">Back to Batch</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Title
            </label>
            <p className="text-base font-medium">{assessment.title}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Subject
            </label>
            <p className="text-base">{assessment.subject}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Date
            </label>
            <p className="text-base">
              {new Date(assessment.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Max Marks
            </label>
            <p className="text-base">{assessment.maxMarks}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Batch
            </label>
            <p className="text-base">{assessment.batch.name}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Marks Entry</CardTitle>
        </CardHeader>
        <CardContent>
          {assessment.assessmentScores.length === 0 ? (
            <p className="text-muted-foreground">
              No marks entered yet. Marks entry functionality will be implemented here.
            </p>
          ) : (
            <div className="space-y-2">
              {assessment.assessmentScores.map((score) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <span>{score.student.fullName}</span>
                  <span>
                    {score.score !== null ? `${score.score}/${assessment.maxMarks}` : "Not entered"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
