import { connectToDatabase } from "@/lib/mongoose";
import {
  HolidayModel,
  type HolidayDocument,
} from "@/src/models/holiday.model";
import { Types } from "mongoose";

export interface CreateHolidayInput {
  title: string;
  date: Date;
  description?: string;
  createdBy: Types.ObjectId;
}

export class HolidayRepository {
  async createHoliday(input: CreateHolidayInput): Promise<HolidayDocument> {
    await connectToDatabase();
    const holiday = new HolidayModel({
      title: input.title,
      date: input.date,
      description: input.description,
      createdBy: input.createdBy,
    });
    return holiday.save();
  }

  async listHolidays(): Promise<HolidayDocument[]> {
    await connectToDatabase();
    return HolidayModel.find().sort({ date: 1 }).exec();
  }

  async deleteHoliday(id: string): Promise<void> {
    await connectToDatabase();
    await HolidayModel.findByIdAndDelete(id).exec();
  }
}

