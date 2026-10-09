import { ApplicationException, verifyToken } from "../utils";
import { IUser, TokenType, IPayload, UserRole } from "../common";
import { Request, Response, NextFunction } from "express";
import { HydratedDocument } from "mongoose";
import { UserRepo } from "../DB";

const userModel = new UserRepo();

export const decodeToken = async ({
  authorization,
  tokenType = TokenType.ACCESS,
  roles = [],
}: {
  authorization: string;
  tokenType?: TokenType;
  roles?: UserRole[];
}): Promise<{ user: HydratedDocument<IUser>; decodedToken: IPayload }> => {
  try {
    if (!authorization) {
      throw new ApplicationException("Authorization header is required", 401);
    }

    if (!authorization.startsWith(`Bearer `)) {
      throw new ApplicationException("Invalid authorization header", 401);
    }

    const token = authorization.split(` `)[1];
    if (!token) {
      throw new ApplicationException("Token not found", 401);
    }
    let secret;
    if (tokenType == TokenType.ACCESS) {
      secret = process.env.ACCESS_SIGNITURE as string;
    } else if (tokenType == TokenType.REFRESH) {
      secret = process.env.REFRESH_SIGNITURE as string;
    } else {
      throw new ApplicationException("Invalid token type", 401);
    }
    const decodedToken = verifyToken({
      token,
      secret,
    });
    if (!decodedToken) {
      throw new ApplicationException("Invalid token", 401);
    }
    const user = await userModel.findById({ id: decodedToken.id });
    if (!user) {
      throw new ApplicationException("User not found", 404);
    }
    if (
      user.changedCredentialsAt &&
      user.changedCredentialsAt.getTime() >= decodedToken.iat * 1000
    ) {
      throw new ApplicationException("Invalid credentials", 401);
    }
    if (roles.length > 0 && !roles.includes(user.role)) {
      throw new ApplicationException("Unauthorized", 401);
    }

    return { user, decodedToken };
  } catch (error) {
    throw error
  }
};

export const auth = ({
  tokenType = TokenType.ACCESS,
  roles = [],
}: { tokenType?: TokenType, roles?: UserRole[] } = {}) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { user }: { user: HydratedDocument<IUser> } = await decodeToken({
        authorization: req.headers.authorization as string,
        tokenType,
        roles
      });
      res.locals.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};
