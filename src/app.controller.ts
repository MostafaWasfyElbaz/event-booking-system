import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./DB/connection";
import baseRouterV1 from "./routesV1";
import { IError } from "./common";
import { ApplicationException } from "./utils/errors";
import cookieParser from "cookie-parser";

dotenv.config({
  path: path.resolve("./config/.env"),
});

export async function bootStrap() {
  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());
  await connectDB();

  app.use("/api/v1", baseRouterV1);

  app.use("/{*dummy}", (req: Request, res: Response, next: NextFunction) => {
    next(new ApplicationException("Page not found", 404));
  });

  app.use(
    (
      err: IError,
      req: Request,
      res: Response,
      next: NextFunction,
    ): Response => {
      return res.status(err.statusCode || 500).json({
        message: err.message,
        status: err.statusCode || 500,
        stack: err.stack,
      });
    },
  );

  app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running on port ${process.env.SERVER_PORT}`);
  });
}
