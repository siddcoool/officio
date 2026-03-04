import { z } from "zod";

export const createEmployeeLeaveSchema = z.object({
  leaveType: z.enum(["SICK", "PERSONAL"]),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  isHalfDay: z.boolean().default(false),
  halfDaySession: z.enum(["FIRST_HALF", "SECOND_HALF"]).optional(),
  reason: z.string().min(1),
});

export type CreateEmployeeLeaveInput = z.infer<typeof createEmployeeLeaveSchema>;

