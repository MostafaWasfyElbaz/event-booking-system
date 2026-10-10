import { Request, Response } from "express";
import {  IBookingServices, IUser } from "../../common";
import { BookingRepo } from "../../DB";
import { successHandler } from "../../utils";
import { CreateBookingBodyDto, CreateBookingParamsDto } from "./booking.DTO";

export default class BookingService implements IBookingServices {

    constructor(private readonly bookingRepo: BookingRepo = new BookingRepo()) {}

  createBooking = async (req: Request, res: Response): Promise<Response> => {
    try{
      const { id } = req.params as CreateBookingParamsDto;
      const { quantity } = req.body as CreateBookingBodyDto;
      const user: IUser = res.locals.user;
      const booking = await this.bookingRepo.createBooking({
        userId: user._id.toString(),
        eventId: id,
        quantity: quantity,
      });

    return successHandler({
      res,
      data: booking,
      status: 201,
      msg: "Event Booked successfully",
    });
  }catch(error){
    throw error
  }
  };

  getMyBookings = async (req: Request, res: Response): Promise<Response> => {
    throw new Error("Method not implemented.");
  };

  cancelBooking = async (req: Request, res: Response): Promise<Response> => {
    throw new Error("Method not implemented.");
  };
}