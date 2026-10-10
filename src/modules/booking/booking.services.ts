import { Request, Response } from "express";
import {
  BookingStatus,
  EventStatus,
  IBookingServices,
  IUser,
  UserRole,
} from "../../common";
import { BookingRepo, EventsRepo } from "../../DB";
import { ApplicationException, successHandler } from "../../utils";
import { BookingIdDTO, CreateBookingDto } from "./booking.DTO";

export default class BookingService implements IBookingServices {
  constructor(
    private readonly bookingRepo: BookingRepo = new BookingRepo(),
    private readonly eventsRepo: EventsRepo = new EventsRepo(),
  ) {}

  createBooking = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id }: BookingIdDTO = req.params as BookingIdDTO;
      const { quantity }: CreateBookingDto = req.body;
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
    } catch (error) {
      throw error;
    }
  };

  getMyBookings = async (req: Request, res: Response): Promise<Response> => {
    const user = res.locals.user;
    const bookings = await this.bookingRepo.find({
      filter: { userId: user._id.toString() },
    });
    return successHandler({
      res,
      data: bookings,
      status: 200,
      msg: "Bookings fetched successfully",
    });
  };

  cancelBooking = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = res.locals.user;
      const { id }: BookingIdDTO = req.params as BookingIdDTO;
      const booking = await this.bookingRepo.findOne({
        filter: {
          _id: id,
          userId: user._id.toString(),
        },
      });

      if (!booking) {
        throw new ApplicationException("Booking not found", 404);
      }

      if (booking.status === BookingStatus.CANCELLED) {
        throw new ApplicationException("Booking is already cancelled", 409);
      }

      const event = await this.eventsRepo.findById({
        id: booking.eventId.toString(),
      });

      if (!event) {
        throw new ApplicationException("Event not found", 404);
      }

      const isPublished = event.status === EventStatus.PUBLISHED;
      const isOwner = event.organizerId.toString() === user._id.toString();

      if (user.role === UserRole.ADMIN) {
      } else if (user.role === UserRole.ORGANIZER) {
        if (!isOwner && !isPublished) {
          throw new ApplicationException(
            "You are not authorized to access this event",
            403,
          );
        }
      } else if (user.role === UserRole.USER) {
        if (!isPublished) {
          throw new ApplicationException("Event not found", 404);
        }
      } else {
        throw new ApplicationException("Forbidden", 403);
      }

      if (Date.now() > event.startDate.getTime() - 24 * 60 * 60 * 1000) {
        throw new ApplicationException(
          "Booking cancellation is allowed only 24 hours before the event",
          400,
        );
      }

      await this.bookingRepo.cancelBooking({
        bookingId: id,
        userId: user._id.toString(),
        eventId: booking.eventId.toString(),
        quantity: booking.quantity,
      });

      return successHandler({
        res,
        status: 200,
        msg: "Booking cancelled successfully",
      });
    } catch (error) {
      throw error;
    }
  };
}
