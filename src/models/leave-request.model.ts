import { Schema, model, models, type Model, type Document, Types } from "mongoose";

export type LeaveType = "SICK" | "PERSONAL";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export type HalfDaySession = "FIRST_HALF" | "SECOND_HALF";

export interface LeaveRequestDocument extends Document {
  userId: Types.ObjectId;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  isHalfDay: boolean;
  halfDaySession?: HalfDaySession | null;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  adminMessage?: string;
  reviewedBy?: Types.ObjectId | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<LeaveRequestDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      enum: ["SICK", "PERSONAL"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isHalfDay: { type: Boolean, default: false },
    halfDaySession: {
      type: String,
      enum: ["FIRST_HALF", "SECOND_HALF"],
      required: false,
    },
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    adminMessage: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

LeaveRequestSchema.index({ createdAt: -1 });

export const LeaveRequestModel: Model<LeaveRequestDocument> =
  (models.LeaveRequest as Model<LeaveRequestDocument>) ||
  model<LeaveRequestDocument>("LeaveRequest", LeaveRequestSchema);

