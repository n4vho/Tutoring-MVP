import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ id: string }>;
};

// Force dynamic rendering - this page requires database access and authentication
export const dynamic = 'force-dynamic';

export default async function AssessmentResultsPage({ params }: Props) {
  const { id: assessmentId } = await params;

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      batch: {
        select: {
          id: true,
          name: true,
        },
      },
      assessmentScores: {
        include: {
          student: {
            select: {
              id: true,
              registrationNo: true,
              fullName: true,
            },
          },
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

  // Calculate statistics
  const scoresWithValues = assessment.assessmentScores.filter(
    (score) => score.score !== null
  );
  const totalStudents = assessment.assessmentScores.length;
  const studentsWithScores = scoresWithValues.length;
  const averageScore =
    scoresWithValues.length > 0
      ? (
          scoresWithValues.reduce((sum, score) => sum + (score.score || 0), 0) /
          scoresWithValues.length
        ).toFixed(2)
      : null;
  const highestScore =
    scoresWithValues.length > 0
      ? Math.max(...scoresWithValues.map((score) => score.score || 0))
      : null;
  const lowestScore =
    scoresWithValues.length > 0
      ? Math.min(...scoresWithValues.map((score) => score.score || 0))
      : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href={`/admin/batches/${assessment.batch.id}/assessments`}
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Back to Assessments
          </Link>
          <h1 className="text-3xl font-bold">Assessment Results</h1>
          <p className="text-muted-foreground mt-1">
            {assessment.title} - {assessment.subject}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/assessments/${assessmentId}/marks`}>
            <Button variant="outline">Enter Marks</Button>
          </Link>
          <Link href={`/admin/batches/${assessment.batch.id}/assessments`}>
            <Button variant="outline">Back to Assessments</Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

      {studentsWithScores > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Students with Scores
              </label>
              <p className="text-base font-medium">
                {studentsWithScores} / {totalStudents}
              </p>
            </div>
            {averageScore !== null && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Average Score
                </label>
                <p className="text-base font-medium">{averageScore}</p>
              </div>
            )}
            {highestScore !== null && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Highest Score
                </label>
                <p className="text-base font-medium">{highestScore}</p>
              </div>
            )}
            {lowestScore !== null && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Lowest Score
                </label>
                <p className="text-base font-medium">{lowestScore}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Student Results</CardTitle>
        </CardHeader>
        <CardContent>
          {assessment.assessmentScores.length === 0 ? (
            <p className="text-muted-foreground">
              No scores entered yet for this assessment.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Reg. No.
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assessment.assessmentScores.map((score) => {
                    const percentage =
                      score.score !== null
                        ? ((score.score / assessment.maxMarks) * 100).toFixed(1)
                        : null;

                    return (
                      <tr
                        key={score.id}
                        className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm">
                          {score.student.registrationNo}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {score.student.fullName}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {score.score !== null ? (
                            <span>
                              {score.score} / {assessment.maxMarks}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Not entered
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {percentage !== null ? (
                            <span>{percentage}%</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {score.remarks || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
