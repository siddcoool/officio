import { Schema, model, models, type Model, type Document, Types } from "mongoose";

export interface HolidayDocument extends Document {
  title: string;
  date: Date;
  description?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const HolidaySchema = new Schema<HolidayDocument>(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

HolidaySchema.index({ date: 1 });

export const HolidayModel: Model<HolidayDocument> =
  (models.Holiday as Model<HolidayDocument>) ||
  model<HolidayDocument>("Holiday", HolidaySchema);

