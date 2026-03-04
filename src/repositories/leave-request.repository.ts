import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";
import {
  LeaveRequestModel,
  type LeaveRequestDocument,
  type LeaveStatus,
} from "@/src/models/leave-request.model";

export interface CreateLeaveRequestInput {
  userId: Types.ObjectId;
  leaveType: "SICK" | "PERSONAL";
  startDate: Date;
  endDate: Date;
  isHalfDay: boolean;
  halfDaySession?: "FIRST_HALF" | "SECOND_HALF" | null;
  totalDays: number;
  reason: string;
}

export class LeaveRequestRepository {
  async createRequest(input: CreateLeaveRequestInput): Promise<LeaveRequestDocument> {
    await connectToDatabase();
    const request = new LeaveRequestModel({
      userId: input.userId,
      leaveType: input.leaveType,
      startDate: input.startDate,
      endDate: input.endDate,
      isHalfDay: input.isHalfDay,
      halfDaySession: input.halfDaySession,
      totalDays: input.totalDays,
      reason: input.reason,
    });
    return request.save();
  }

  async listByUser(userId: Types.ObjectId): Promise<LeaveRequestDocument[]> {
    await connectToDatabase();
    return LeaveRequestModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async listRecent(limit = 10): Promise<LeaveRequestDocument[]> {
    await connectToDatabase();
    return LeaveRequestModel.find().sort({ createdAt: -1 }).limit(limit).exec();
  }

  async listPending(limit = 50): Promise<LeaveRequestDocument[]> {
    await connectToDatabase();
    return LeaveRequestModel.find({ status: "PENDING" })
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
  }

  async updateStatus(
    id: string,
    status: LeaveStatus,
    options: {
      adminMessage?: string;
      reviewedBy?: Types.ObjectId;
      reviewedAt?: Date;
    },
  ): Promise<LeaveRequestDocument | null> {
    await connectToDatabase();
    return LeaveRequestModel.findByIdAndUpdate(
      id,
      {
        status,
        adminMessage: options.adminMessage,
        reviewedBy: options.reviewedBy,
        reviewedAt: options.reviewedAt ?? new Date(),
      },
      { new: true },
    ).exec();
  }

  async countPending(): Promise<number> {
    await connectToDatabase();
    return LeaveRequestModel.countDocuments({ status: "PENDING" }).exec();
  }

  async countApprovedInMonth(monthStart: Date, monthEnd: Date): Promise<number> {
    await connectToDatabase();
    return LeaveRequestModel.countDocuments({
      status: "APPROVED",
      reviewedAt: { $gte: monthStart, $lte: monthEnd },
    }).exec();
  }
}

