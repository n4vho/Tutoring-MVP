import { z } from "zod";

export const PaymentCategory = z.enum([
  "ADMISSION",
  "MONTHLY",
  "MODEL_TEST",
  "OTHER",
]);

export const createPaymentSchema = z.object({
  amount: z.number().int().positive("Amount must be a positive integer"),
  category: PaymentCategory,
  appliesToMonth: z.string().regex(/^\d{4}-\d{2}$/, {
    message: "appliesToMonth must be in YYYY-MM format",
  }),
  note: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
