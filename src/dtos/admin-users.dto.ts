import { z } from "zod";

export const createEmployeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  sickLeave: z.number().min(0).default(10),
  personalLeave: z.number().min(0).default(12),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

