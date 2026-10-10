import { Request, Response } from "express";

export interface IBookingServices {
  createBooking: (req: Request, res: Response) => Promise<Response>;
  getMyBookings: (req: Request, res: Response) => Promise<Response>;
  cancelBooking: (req: Request, res: Response) => Promise<Response>;
}