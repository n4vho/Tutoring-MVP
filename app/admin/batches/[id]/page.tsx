import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SuccessMessage } from "./success-message";
import { AddStudentsToBatch } from "./add-students-to-batch";
import { RosterTable } from "./roster-table";

type Props = {
  params: Promise<{ id: string }>;
};

// Force dynamic rendering - this page requires database access and authentication
export const dynamic = 'force-dynamic';

export default async function BatchDetailPage({ params }: Props) {
  const { id } = await params;

  const batch = await prisma.batch.findUnique({
    where: { id },
    include: {
      students: {
        orderBy: { fullName: "asc" },
      },
    },
  });

  if (!batch) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin/batches"
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Back to Batches
          </Link>
          <h1 className="text-3xl font-bold">{batch.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/batches/${id}/assessments`}>
            <Button>Assessments</Button>
          </Link>
          <Link href={`/admin/batches/${id}/assessments/new`}>
            <Button variant="outline">Create Assessment</Button>
          </Link>
        </div>
      </div>
      <Suspense fallback={null}>
        <SuccessMessage />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="text-base font-medium">{batch.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="text-base">{batch.description || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Student Count
              </label>
              <p className="text-base">{batch.students.length}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created At
              </label>
              <p className="text-base">
                {batch.createdAt.toLocaleDateString()} at{" "}
                {batch.createdAt.toLocaleTimeString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Updated At
              </label>
              <p className="text-base">
                {batch.updatedAt.toLocaleDateString()} at{" "}
                {batch.updatedAt.toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Students to Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <AddStudentsToBatch batchId={id} currentStudentIds={batch.students.map(s => s.id)} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <RosterTable students={batch.students} currentBatchId={id} />
      </div>
    </div>
  );
}
