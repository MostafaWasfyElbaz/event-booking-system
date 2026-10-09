import { Types } from "mongoose";
import { UserRole } from "../../enums/user/user.role";

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
  changedCredentialsAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
