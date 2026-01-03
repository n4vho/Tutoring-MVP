import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ReceiptContent } from "./receipt-content";

type Props = {
  params: Promise<{ paymentId: string }>;
};

// Force dynamic rendering - this page requires database access
export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: Props) {
  const { paymentId } = await params;

  // Fetch payment with all related data
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      student: {
        include: {
          batch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      createdByUser: {
        select: {
          id: true,
          username: true,
          phone: true,
        },
      },
    },
  });

  if (!payment) {
    notFound();
  }

  // Institution information
  const institutionInfo = {
    name: "Math Academy",
    address: "10 Zilla School Road, Mymensingh",
    phone: "+8801914070418",
    email: "kabir0718@gmail.com",
  };

  return (
    <ReceiptContent
      payment={payment}
      institutionInfo={institutionInfo}
    />
  );
}
