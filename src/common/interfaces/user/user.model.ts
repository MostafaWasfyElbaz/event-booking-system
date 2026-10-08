import { Types } from "mongoose";
import { UserRole } from "../../enums/user/user.role";
import { IOtp } from "../auth";

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
  isConfirmed: boolean;
  changedCredentialsAt: Date;
  otp?: IOtp;
  createdAt: Date;
  updatedAt: Date;
}
