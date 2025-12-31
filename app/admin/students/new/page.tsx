import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentForm } from "./student-form";

// Force dynamic rendering - this page requires database access and authentication
export const dynamic = 'force-dynamic';

export default async function NewStudentPage() {
  // Fetch batches for dropdown
  const batches = await prisma.batch.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add New Student</h1>
        <Link href="/admin/students">
          <Button variant="outline">Back to Students</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New Student Form</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentForm batches={batches} />
        </CardContent>
      </Card>
    </div>
  );
}
