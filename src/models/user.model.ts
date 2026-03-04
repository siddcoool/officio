import { Schema, model, models, type Model, type Document } from "mongoose";

export type UserRole = "ADMIN" | "EMPLOYEE";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "EMPLOYEE"], required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export const UserModel: Model<UserDocument> =
  (models.User as Model<UserDocument>) || model<UserDocument>("User", UserSchema);

