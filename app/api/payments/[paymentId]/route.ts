import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    // SECURITY: Check admin authentication
    // TODO: Add proper admin authorization check when auth is fully implemented
    const adminSession = request.cookies.get("admin_session");
    if (!adminSession || adminSession.value !== "1") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { paymentId } = await params;

    // Verify payment exists
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { id: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Delete payment
    await prisma.payment.delete({
      where: { id: paymentId },
    });

    return NextResponse.json(
      { success: true, message: "Payment deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete payment error:", error);

    return NextResponse.json(
      { error: "An error occurred while deleting the payment" },
      { status: 500 }
    );
  }
}
