import { Suspense } from "react";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RequestsTable } from "./requests-table";
import { StatusFilters } from "./status-filters";

type Props = {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
};

// Force dynamic rendering - this page requires database access and authentication
export const dynamic = 'force-dynamic';

export default async function AdminRequestsPage({ searchParams }: Props) {
  const params = await searchParams;
  const statusFilter = params.status || "";
  const page = parseInt(params.page || "1", 10);
  const pageSize = 50;
  const skip = (page - 1) * pageSize;

  // Build where clause for Prisma
  const where: any = {};

  // Status filter
  if (
    statusFilter &&
    ["NEW", "CONTACTED", "APPROVED", "REJECTED"].includes(statusFilter)
  ) {
    where.status = statusFilter;
  }

  // Fetch requests with filters and pagination
  const [requests, totalCount, batches] = await Promise.all([
    prisma.enrollmentRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip,
      include: {
        convertedStudent: {
          select: {
            id: true,
            registrationNo: true,
            fullName: true,
          },
        },
      },
    }),
    prisma.enrollmentRequest.count({ where }),
    prisma.batch.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  // Serialize dates for client component
  const serializedRequests = requests.map((request) => ({
    id: request.id,
    studentName: request.studentName,
    phone: request.phone,
    grade: request.grade,
    school: request.school,
    subjects: request.subjects,
    message: request.message,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    convertedStudent: request.convertedStudent
      ? {
          id: request.convertedStudent.id,
          registrationNo: request.convertedStudent.registrationNo,
          fullName: request.convertedStudent.fullName,
        }
      : null,
  }));

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Enrollment Requests</h1>
        <div className="flex gap-2">
          <Link href="/admin/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          <Link href="/admin/students">
            <Button variant="outline">Students</Button>
          </Link>
          <Link href="/logout">
            <Button variant="outline">Logout</Button>
          </Link>
        </div>
      </div>
      <StatusFilters initialStatus={statusFilter} />
      <RequestsTable
        requests={serializedRequests}
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        batches={batches}
      />
    </div>
  );
}
