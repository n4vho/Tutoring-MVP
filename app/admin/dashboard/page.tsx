import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Force dynamic rendering - this page requires database access and authentication
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Fetch stats in parallel
  const [
    totalStudents,
    activeBatches,
    pendingRequests,
    recentAssessments,
    recentEnrollmentRequests,
    recentApprovals,
    recentAssessmentsCreated,
    recentScoreUpdates,
  ] = await Promise.all([
    // Total students
    prisma.student.count(),

    // Active batches
    prisma.batch.count(),

    // Pending enrollment requests (NEW or CONTACTED status)
    prisma.enrollmentRequest.count({
      where: { 
        status: { in: ["NEW", "CONTACTED"] }
      },
    }),

    // Assessments created in last 30 days
    prisma.assessment.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),

    // Recent enrollment requests (last 10)
    prisma.enrollmentRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        studentName: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    }),

    // Recent approvals (last 5)
    prisma.enrollmentRequest.findMany({
      where: {
        status: "APPROVED",
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        studentName: true,
        phone: true,
        updatedAt: true,
        convertedStudent: {
          select: {
            registrationNo: true,
          },
        },
      },
    }),

    // Recent assessments created (last 5)
    prisma.assessment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        batch: {
          select: {
            name: true,
          },
        },
      },
    }),

    // Recent score updates (last 5)
    prisma.assessmentScore.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        assessment: {
          select: {
            title: true,
            subject: true,
          },
        },
        student: {
          select: {
            fullName: true,
            registrationNo: true,
          },
        },
      },
    }),
  ]);

  // Combine and sort recent activity
  const recentActivity = [
    ...recentEnrollmentRequests.map((req) => ({
      type: "enrollment_request" as const,
      id: req.id,
      title: `New enrollment request from ${req.studentName}`,
      description: `Phone: ${req.phone}`,
      timestamp: req.createdAt,
      status: req.status,
    })),
    ...recentApprovals.map((approval) => ({
      type: "approval" as const,
      id: approval.id,
      title: `Approved enrollment: ${approval.studentName}`,
      description: approval.convertedStudent
        ? `Student ID: ${approval.convertedStudent.registrationNo}`
        : "Student created",
      timestamp: approval.updatedAt,
    })),
    ...recentAssessmentsCreated.map((assessment) => ({
      type: "assessment_created" as const,
      id: assessment.id,
      title: `New assessment: ${assessment.title}`,
      description: `${assessment.subject} - ${assessment.batch.name}`,
      timestamp: assessment.createdAt,
    })),
    ...recentScoreUpdates.map((score) => ({
      type: "score_update" as const,
      id: score.id,
      title: `Score updated: ${score.student.fullName}`,
      description: `${score.assessment.title} - ${score.score !== null ? `${score.score} marks` : "Not graded"}`,
      timestamp: score.updatedAt,
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "enrollment_request":
        return "📝";
      case "approval":
        return "✅";
      case "assessment_created":
        return "📊";
      case "score_update":
        return "✏️";
      default:
        return "📌";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200";
      case "CONTACTED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/logout">
          <Button variant="outline">Logout</Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/students">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <span className="text-2xl">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                All registered students
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/batches">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
              <span className="text-2xl">📚</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBatches}</div>
              <p className="text-xs text-muted-foreground">
                Total batches created
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/requests?status=NEW">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <div className="relative">
                <span className="text-2xl">⏳</span>
                {pendingRequests > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background dark:ring-background">
                    {pendingRequests > 99 ? "99+" : pendingRequests}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/batches">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Assessments</CardTitle>
              <span className="text-2xl">📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentAssessments}</div>
              <p className="text-xs text-muted-foreground">
                Created in last 30 days
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/students/new" className="block">
              <Button className="w-full justify-start" variant="outline">
                ➕ Add Student
              </Button>
            </Link>
            <Link href="/admin/batches/new" className="block">
              <Button className="w-full justify-start" variant="outline">
                ➕ Create Batch
              </Button>
            </Link>
            <Link href="/admin/requests" className="block relative">
              <Button className="w-full justify-start" variant="outline">
                📋 View Requests
                {pendingRequests > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {pendingRequests > 99 ? "99+" : pendingRequests}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/admin/students" className="block">
              <Button className="w-full justify-start" variant="outline">
                👥 Manage Students
              </Button>
            </Link>
            <Link href="/admin/batches" className="block">
              <Button className="w-full justify-start" variant="outline">
                📚 Manage Batches
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="flex items-start gap-3 border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="text-2xl">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.timestamp.toLocaleDateString()} at{" "}
                        {activity.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {"status" in activity && activity.status && (
                        <span
                          className={`mt-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                            activity.status
                          )}`}
                        >
                          {activity.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
