import mongoose, { ClientSession, Model, Types, UpdateResult } from "mongoose";
import { BookingStatus, IBooking, IBookingRepo } from "../../common";
import DBRepository from "./db.repo";
import { Booking } from "../models/booking.model";
import { ApplicationException } from "../../utils";
import EventsRepo from "./events.repo";

export default class BookingsRepo
  extends DBRepository<IBooking>
  implements IBookingRepo
{
  constructor(
    protected override readonly model: Model<IBooking> = Booking,
    private readonly eventRepo: EventsRepo = new EventsRepo(),
  ) {
    super(model);
  }

  createBooking = async ({
    userId,
    eventId,
    quantity,
  }: {
    userId: string;
    eventId: string;
    quantity: number;
  }): Promise<IBooking> => {
    const session = await mongoose.startSession();

    try {
      let createdBooking: IBooking | undefined;

      await session.withTransaction(async () => {
        const existingBooking = await this.findOne({
          filter: {
            userId: new Types.ObjectId(userId),
            eventId: new Types.ObjectId(eventId),
            status: { $ne: BookingStatus.CANCELLED },
          },
          options: { session },
        });

        if (existingBooking) {
          throw new ApplicationException(
            "You have already booked this event",
            409,
          );
        }

        const event = await this.eventRepo.bookSeats({
          eventId,
          quantity,
          session,
        });

        const [booking] = await this.create({
          data: [
            {
              userId: new Types.ObjectId(userId),
              eventId: new Types.ObjectId(eventId),
              quantity,
              totalPrice: event.price * quantity,
              status: BookingStatus.PENDING,
            },
          ],
          options: { session },
        });

        createdBooking = booking;
      });

      if (!createdBooking) {
        throw new ApplicationException("Failed to create booking", 500);
      }

      return createdBooking;
    } finally {
      await session.endSession();
    }
  };

  cancelBookingsForEvent = async ({
  eventId,
  session,
}: {
  eventId: string;
  session?: ClientSession;
}): Promise<UpdateResult> => {
  return this.updateMany({
    filter: {
      eventId,
      status: { $ne: BookingStatus.CANCELLED },
    },
    data: {
      $set: {
        status: BookingStatus.CANCELLED,
      },
    },
    options: { session },
  });
};
}
