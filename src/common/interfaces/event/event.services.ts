import { Request, Response } from "express";

export interface IEventServices {
  createEvent: (req: Request, res: Response) => Promise<Response>;
  updateEvent: (req: Request, res: Response) => Promise<Response>;
  deleteEvent: (req: Request, res: Response) => Promise<Response>;
  getAllEvents: (req: Request, res: Response) => Promise<Response>;
  getEventById: (req: Request, res: Response) => Promise<Response>;
  getEventBookings: (req: Request, res: Response) => Promise<Response>;
}
