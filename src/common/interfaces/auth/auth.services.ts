import { Request, Response } from "express";

export interface IAuthServices {
  login(req: Request, res: Response): Promise<Response>;
  register(req: Request, res: Response): Promise<Response>;
  me(req: Request, res: Response): Promise<Response>;
}
