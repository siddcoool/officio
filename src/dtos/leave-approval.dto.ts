import { z } from "zod";

export const approveLeaveSchema = z.object({
  adminMessage: z.string().optional(),
});

export const rejectLeaveSchema = z.object({
  adminMessage: z.string().min(1),
});

export type ApproveLeaveInput = z.infer<typeof approveLeaveSchema>;
export type RejectLeaveInput = z.infer<typeof rejectLeaveSchema>;

