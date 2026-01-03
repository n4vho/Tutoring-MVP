import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStudentSession } from "@/lib/student-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "./logout-button";
import Link from "next/link";

export default async function StudentDashboardPage() {
  // Require student session - redirects if not authenticated
  let studentId: string;
  try {
    studentId = await requireStudentSession();
  } catch {
    redirect("/student/login");
  }

  // Fetch student data scoped by session studentId
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      batch: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
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
        take: 5, // Top 5 recent assessments
      },
    },
  });

  // This should never happen if session is valid, but handle gracefully
  if (!student) {
    redirect("/student/login");
  }

  // Transform assessment scores for display
  const recentAssessments = student.assessmentScores.map((score) => ({
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

  // Calculate percentage if score exists
  const getPercentage = (score: number | null, maxMarks: number) => {
    if (score === null) return null;
    return Math.round((score / maxMarks) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with logout */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Student Portal</h1>
        <div className="flex items-center gap-3">
          <Link href="/student/profile">
            <Button variant="outline">My Profile</Button>
          </Link>
          <Link href="/student/payments">
            <Button variant="outline">Payment History</Button>
          </Link>
          <Link href="/student/results">
            <Button variant="outline">View Results</Button>
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Student Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="text-lg font-medium">{student.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registration Number</p>
              <p className="text-lg font-medium">{student.registrationNo}</p>
            </div>
            {student.grade && (
              <div>
                <p className="text-sm text-muted-foreground">Grade</p>
                <p className="text-lg font-medium">{student.grade}</p>
              </div>
            )}
            {student.school && (
              <div>
                <p className="text-sm text-muted-foreground">School</p>
                <p className="text-lg font-medium">{student.school}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-medium">
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground">
                  {student.status}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Info Card */}
      {student.batch ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-lg font-medium">{student.batch.name}</p>
              {student.batch.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {student.batch.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Not assigned to any batch</p>
          </CardContent>
        </Card>
      )}

      {/* Recent Assessments Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Assessments</CardTitle>
            <Link href="/student/results">
              <Button variant="outline" size="sm">View All Results</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentAssessments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No assessments found.</p>
              <Link href="/student/results">
                <Button variant="outline">View All Results</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAssessments.map((item) => (
                <Link
                  key={item.id}
                  href={`/student/results/${item.assessment.id}`}
                  className="block"
                >
                  <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.assessment.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.assessment.subject} •{" "}
                          {new Date(item.assessment.date).toLocaleDateString()}
                        </p>
                        {item.remarks && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.remarks}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {item.score !== null ? (
                          <>
                            <p className="text-lg font-semibold">
                              {item.score} / {item.assessment.maxMarks}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {getPercentage(item.score, item.assessment.maxMarks)}%
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">Not graded</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
