import { Suspense } from "react";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StudentsTable } from "./students-table";
import { SuccessMessage } from "./success-message";
import { SearchFilters } from "./search-filters";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    batch?: string;
    page?: string;
  }>;
};

// Force dynamic rendering - this page requires database access and authentication
export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const searchQuery = params.q || "";
  const statusFilter = params.status || "";
  const batchFilter = params.batch || "";
  const page = parseInt(params.page || "1", 10);
  const pageSize = 50;
  const skip = (page - 1) * pageSize;

  // Build where clause for Prisma
  const where: any = {};

  // Search filter (fullName, registrationNo, phone contains)
  if (searchQuery.trim()) {
    where.OR = [
      { fullName: { contains: searchQuery, mode: "insensitive" } },
      { registrationNo: { contains: searchQuery, mode: "insensitive" } },
      { phone: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  // Status filter
  if (statusFilter && ["ACTIVE", "PAUSED", "GRADUATED", "DROPPED"].includes(statusFilter)) {
    where.status = statusFilter;
  }

  // Batch filter
  if (batchFilter) {
    where.batchId = batchFilter;
  }

  // Fetch students with filters and pagination
  const [students, totalCount] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip,
      include: {
        batch: true,
      },
    }),
    prisma.student.count({ where }),
  ]);

  // Fetch batches for filter dropdown
  const batches = await prisma.batch.findMany({
    orderBy: { name: "asc" },
  });

  // Serialize dates for client component
  const serializedStudents = students.map((student) => ({
    id: student.id,
    registrationNo: student.registrationNo,
    fullName: student.fullName,
    phone: student.phone,
    grade: student.grade,
    school: student.school,
    status: student.status,
    createdAt: student.createdAt.toISOString(),
    batch: student.batch ? { id: student.batch.id, name: student.batch.name } : null,
  }));

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Students</h1>
        <div className="flex gap-2">
          <Link href="/admin/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          <Link href="/admin/students/new">
            <Button>Add Student</Button>
          </Link>
          <Link href="/logout">
            <Button variant="outline">Logout</Button>
          </Link>
        </div>
      </div>
      <Suspense fallback={null}>
        <SuccessMessage />
      </Suspense>
      <SearchFilters
        initialQuery={searchQuery}
        initialStatus={statusFilter}
        initialBatch={batchFilter}
        batches={batches}
      />
      <StudentsTable
        students={serializedStudents}
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
      />
    </div>
  );
}
