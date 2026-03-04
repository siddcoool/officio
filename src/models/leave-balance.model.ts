import { Schema, model, models, type Model, type Document, Types } from "mongoose";

export interface LeaveBalanceDocument extends Document {
  userId: Types.ObjectId;
  sickLeave: number;
  personalLeave: number;
  updatedAt: Date;
}

const LeaveBalanceSchema = new Schema<LeaveBalanceDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    sickLeave: { type: Number, required: true, default: 0 },
    personalLeave: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  },
);

export const LeaveBalanceModel: Model<LeaveBalanceDocument> =
  (models.LeaveBalance as Model<LeaveBalanceDocument>) ||
  model<LeaveBalanceDocument>("LeaveBalance", LeaveBalanceSchema);

