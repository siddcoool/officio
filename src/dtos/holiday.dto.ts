import { z } from "zod";

export const createHolidaySchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1), // ISO string from client
  description: z.string().optional(),
});

export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;

