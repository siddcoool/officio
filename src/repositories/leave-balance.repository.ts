import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";
import {
  LeaveBalanceModel,
  type LeaveBalanceDocument,
} from "@/src/models/leave-balance.model";

export interface CreateDefaultBalanceInput {
  userId: Types.ObjectId;
  sickLeave: number;
  personalLeave: number;
}

export class LeaveBalanceRepository {
  async getByUser(userId: Types.ObjectId): Promise<LeaveBalanceDocument | null> {
    await connectToDatabase();
    return LeaveBalanceModel.findOne({ userId }).exec();
  }

  async createDefault(input: CreateDefaultBalanceInput): Promise<LeaveBalanceDocument> {
    await connectToDatabase();
    const balance = new LeaveBalanceModel({
      userId: input.userId,
      sickLeave: input.sickLeave,
      personalLeave: input.personalLeave,
    });
    return balance.save();
  }

  async increment(
    userId: Types.ObjectId,
    sickIncrement: number,
    personalIncrement: number,
  ): Promise<LeaveBalanceDocument | null> {
    await connectToDatabase();
    return LeaveBalanceModel.findOneAndUpdate(
      { userId },
      {
        $inc: {
          sickLeave: sickIncrement,
          personalLeave: personalIncrement,
        },
      },
      { new: true },
    ).exec();
  }

  async deductIfSufficient(
    userId: Types.ObjectId,
    leaveType: "SICK" | "PERSONAL",
    totalDays: number,
  ): Promise<LeaveBalanceDocument | null> {
    await connectToDatabase();

    const field = leaveType === "SICK" ? "sickLeave" : "personalLeave";

    const query: Record<string, unknown> = {
      userId,
    };
    query[field] = { $gte: totalDays };

    const update: Record<string, unknown> = {
      $inc: {
        [field]: -totalDays,
      },
    };

    return LeaveBalanceModel.findOneAndUpdate(query, update, {
      new: true,
    }).exec();
  }
}

