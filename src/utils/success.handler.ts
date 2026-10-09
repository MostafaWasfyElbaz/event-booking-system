import { Response } from "express";

export const successHandler = ({
  res,
  msg = "done",
  data,
  status = 200,
}: {
  res: Response;
  msg?: string;
  data?: object | null;
  status?: number;
}): Response => {
  return res.status(status).json({
    status,
    message: msg,
    data,
  });
};
