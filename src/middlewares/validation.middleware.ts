import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { validationError } from "../utils";

export const validationMiddleware = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = {
      ...req.body,
      ...req.query,
      ...req.params,
    };
    const result = schema.safeParse(data);
    if (!result.success) {
      const errors: string[] = result.error.issues.map((error) => {
        return `${error.path} ==> ${error.message}`;
      });
      throw new validationError(errors, 400);
    }
    next();
  };
};

