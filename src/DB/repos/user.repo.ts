import { HydratedDocument, Model } from "mongoose";
import { IUser, IUserRepo } from "../../common";
import { User } from "../models";
import DBRepository from "./db.repo";

export default class UserRepo extends DBRepository<IUser> implements IUserRepo {
  constructor(protected override readonly model: Model<IUser> = User) {
    super(model);
  }

  findUserByEmail = async (
    email: string,
  ): Promise<HydratedDocument<IUser> | null> => {
    const user = await this.findOne({ filter: { email } });
    return user;
  };
}
