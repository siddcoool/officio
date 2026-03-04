import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";
import { UserModel, type UserDocument, type UserRole } from "@/src/models/user.model";

export interface CreateEmployeeInput {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export class UserRepository {
  async findByEmail(email: string): Promise<UserDocument | null> {
    await connectToDatabase();
    return UserModel.findOne({ email }).exec();
  }

  async findById(id: string | Types.ObjectId): Promise<UserDocument | null> {
    await connectToDatabase();
    return UserModel.findById(id).exec();
  }

  async createEmployee(input: CreateEmployeeInput): Promise<UserDocument> {
    await connectToDatabase();
    const user = new UserModel({
      name: input.name,
      email: input.email,
      password: input.passwordHash,
      role: input.role,
      isActive: true,
    });
    return user.save();
  }

  async listEmployees(): Promise<UserDocument[]> {
    await connectToDatabase();
    return UserModel.find({ role: "EMPLOYEE" }).sort({ createdAt: -1 }).exec();
  }

  async countEmployees(): Promise<number> {
    await connectToDatabase();
    return UserModel.countDocuments({ role: "EMPLOYEE" }).exec();
  }

  async hasAdmin(): Promise<boolean> {
    await connectToDatabase();
    const count = await UserModel.countDocuments({ role: "ADMIN" }).exec();
    return count > 0;
  }
}

