import { ClientSession } from "mongoose";
import DBRepository from "../../../DB/repos/db.repo";
import { IBooking } from "./booking.model";
import { UpdateResult } from "mongoose";

export interface IBookingRepo extends DBRepository<IBooking> {
  createBooking: ({
    userId,
    eventId,
    quantity,
  }: {
    userId: string;
    eventId: string;
    quantity: number;
  }) => Promise<IBooking>;

  cancelBookingsForEvent: ({
    eventId,
    session,
  }: {
    eventId: string;
    session?: ClientSession;
  }) => Promise<UpdateResult>;

  cancelBooking: ({
    bookingId,
    userId,
    eventId,
    quantity
  }: {
    bookingId: string;
    userId: string;
    eventId: string;
    quantity: number;
  }) => Promise<void>;

}
