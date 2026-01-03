import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPaymentSchema } from "@/lib/validators/payment";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Get payments sorted by appliesToMonth DESC then paidAt DESC
    const payments = await prisma.payment.findMany({
      where: { studentId },
      orderBy: [
        { appliesToMonth: "desc" },
        { paidAt: "desc" },
      ],
      include: {
        createdByUser: {
          select: {
            id: true,
            username: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Get payments error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching payments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Check admin authentication
    const adminSession = request.cookies.get("admin_session");
    if (!adminSession || adminSession.value !== "1") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: studentId } = await params;

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate with Zod
    const validationResult = createPaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          issues: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { amount, category, appliesToMonth, note } = validationResult.data;

    // Convert YYYY-MM string to Date (first day of month)
    const [year, month] = appliesToMonth.split("-").map(Number);
    const appliesToMonthDate = new Date(year, month - 1, 1);

    // TODO: Get createdByUserId from auth session when proper auth is implemented
    // For now, find the first admin user or create a system user
    // TEMP: Using first admin user as placeholder
    let createdByUserId: string;
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (!adminUser) {
      // If no admin user exists, this is a critical error
      console.error("No admin user found. Cannot create payment.");
      return NextResponse.json(
        { error: "System configuration error" },
        { status: 500 }
      );
    }

    createdByUserId = adminUser.id;

    // Generate receipt number atomically using a transaction
    // Format: MA-{YYYY}{MM}-{####} (e.g., MA-202601-0007)
    // 
    // Testing Note: No formal test framework is currently set up in this project.
    // To test receipt generation:
    // 1. Create multiple payments for the same month concurrently
    // 2. Verify each receives a unique, sequential receipt number
    // 3. Verify receipt numbers follow the format MA-YYYYMM-####
    // 4. Verify counter increments correctly across months
    const monthKey = `${year}${String(month).padStart(2, "0")}`; // YYYYMM format
    const receiptMonthKey = `${year}-${String(month).padStart(2, "0")}`; // YYYY-MM for ReceiptCounter

    // Use transaction to ensure atomic receipt number generation
    // This ensures uniqueness even under concurrent inserts
    const payment = await prisma.$transaction(async (tx) => {
      // Atomically get or create counter and increment
      // For existing counter: increment atomically in DB (atomic operation)
      // For new counter: create with lastNumber: 1 (first receipt)
      // If concurrent creates happen, PostgreSQL unique constraint ensures only one succeeds
      let counter;
      try {
        counter = await tx.receiptCounter.upsert({
          where: { monthKey: receiptMonthKey },
          update: {
            lastNumber: { increment: 1 },
          },
          create: {
            monthKey: receiptMonthKey,
            lastNumber: 1, // First receipt for this month
          },
        });
      } catch (error: any) {
        // Handle race condition: if counter was created between our check and create
        // Retry with update (counter now exists)
        if (error.code === "P2002" || error.code === "23505") {
          // Unique constraint violation - counter was created by another transaction
          // Now update it atomically
          counter = await tx.receiptCounter.update({
            where: { monthKey: receiptMonthKey },
            data: {
              lastNumber: { increment: 1 },
            },
          });
        } else {
          throw error;
        }
      }

      // Generate receipt number: MA-{YYYY}{MM}-{####}
      // For new counters (lastNumber: 1), receipt will be 0001
      // For updated counters, lastNumber is already incremented atomically
      const receiptNo = `MA-${monthKey}-${String(counter.lastNumber).padStart(4, "0")}`;

      // Create payment with receipt number
      return await tx.payment.create({
        data: {
          studentId,
          amount,
          category,
          appliesToMonth: appliesToMonthDate,
          note: note?.trim() || null,
          createdByUserId,
          receiptNo,
          receiptIssuedAt: new Date(),
          // paidAt and createdAt are set automatically by Prisma defaults
        },
        include: {
          createdByUser: {
            select: {
              id: true,
              username: true,
              phone: true,
            },
          },
        },
      });
    });

    return NextResponse.json(
      { success: true, payment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create payment error:", error);

    // Handle foreign key constraint violations
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid student or user reference" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while creating the payment" },
      { status: 500 }
    );
  }
}
