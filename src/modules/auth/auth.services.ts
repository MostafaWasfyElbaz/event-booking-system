import { Request, Response } from "express";
import { IUserRepo, IAuthServices, IPayload } from "../../common";
import { UserRepo } from "../../DB";
import { loginDTO, registerDTO } from "./auth.DTO";
import {
  ApplicationException,
  successHandler,
  compareHash,
  createHash,
  generateToken,
} from "../../utils";

export default class AuhtServices implements IAuthServices {
  constructor(private readonly userRepo: IUserRepo = new UserRepo()) {}

  register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, email, password, phone }: registerDTO = req.body;
      const hashedPassword = await createHash(password);
      const user = await this.userRepo.create({
        data: [
          {
            name,
            email,
            password: hashedPassword,
            phone,
          },
        ],
      });

      if (!user) {
        throw new ApplicationException("User creation failed", 400);
      }

      return successHandler({
        res,
        msg: "User created successfully",
        status: 201,
      });
    } catch (error: unknown) {
      if (error instanceof Error && "code" in error && error.code === 11000) {
        throw new ApplicationException("Email already exists", 409);
      }

      throw error;
    }
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password }: loginDTO = req.body;
      const user = await this.userRepo.findUserByEmail(email);
      if (!user) {
        throw new ApplicationException("Invalid Credentials", 401);
      }

      const isPasswordValid = await compareHash(password, user.password);

      if (!isPasswordValid) {
        throw new ApplicationException("Invalid Credentials", 401);
      }

      const payload: Partial<IPayload> = {
        id: user._id.toString(),
        role: user.role,
      };

      const { accessToken, refreshToken } = generateToken({ payload });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      return successHandler({
        res,
        msg: "User logged in successfully",
        data: { accessToken },
        status: 200,
      });
    } catch (error: unknown) {
      throw error;
    }
  };

  me = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { password, ...rest } = res.locals.user.toObject();
      return successHandler({
        res,
        msg: "User fetched successfully",
        data: rest,
        status: 200,
      });
    } catch (error: unknown) {
      throw error;
    }
  };
}
