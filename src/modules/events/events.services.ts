import { Request, Response } from "express";
import {
  EventStatus,
  IBookingRepo,
  IEvent,
  IEventRepo,
  IEventServices,
  IUser,
  UserRole,
} from "../../common";
import { BookingRepo, EventsRepo } from "../../DB";
import {
  createEventDTO,
  getAllEventsDTO,
  EventIdDTO,
  updateEventDTO,
} from "./events.DTO";
import { ApplicationException, successHandler } from "../../utils";
import mongoose, { Types } from "mongoose";

export default class EventsServices implements IEventServices {
  constructor(
    private readonly eventsRepo: IEventRepo = new EventsRepo(),
    private readonly bookingRepo: IBookingRepo = new BookingRepo(),
  ) {}

  createEvent = async (req: Request, res: Response): Promise<Response> => {
    try {
      const {
        title,
        description,
        category,
        locationType,
        location,
        startDate,
        endDate,
        capacity,
        price,
      }: createEventDTO = req.body;
      const user: IUser = res.locals.user;
      const [event] = await this.eventsRepo.create({
        data: [
          {
            organizerId: user._id,
            title,
            description,
            category,
            locationType,
            location,
            startDate,
            endDate,
            capacity,
            price,
            status: EventStatus.PUBLISHED,
          },
        ],
      });

      if (!event) {
        throw new ApplicationException("Event not created", 500);
      }

      return successHandler({
        res,
        data: event,
        status: 201,
        msg: "Event created successfully",
      });
    } catch (error: any) {
      throw error;
    }
  };

  updateEvent = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = res.locals.user;
      const { id }: EventIdDTO = req.params as EventIdDTO;
      const { capacity, ...data }: updateEventDTO = req.body;
      let filter;
      if (user.role == UserRole.ADMIN) {
        filter = {
          _id: id,
        };
      } else {
        filter = {
          _id: id,
          organizerId: user._id,
        };
      }
      const event = await this.eventsRepo.findOne({ filter });

      if (!event) {
        throw new ApplicationException("Event not found or unavailable", 409);
      }
      if (capacity && capacity < event.bookedSeats) {
        throw new ApplicationException(
          "Capacity cannot be less than booked seats",
          400,
        );
      }
      await this.eventsRepo.updateOne({
        filter,
        data: {
          ...data,
          capacity,
        },
      });
      return successHandler({
        res,
        status: 200,
        msg: "Event updated successfully",
      });
    } catch (error) {
      throw error;
    }
  };

  deleteEvent = async (req: Request, res: Response): Promise<Response> => {
    const session = await mongoose.startSession();

    try {
      const user: IUser = res.locals.user;
      const { id }: EventIdDTO = req.params as EventIdDTO;
      let filter;
      if (user.role == UserRole.ADMIN) {
        filter = {
          _id: new Types.ObjectId(id),
        };
      } else if (user.role == UserRole.ORGANIZER) {
        filter = {
          _id: new Types.ObjectId(id),
          organizerId: user._id,
        };
      } else {
        throw new ApplicationException("Forbidden", 403);
      }

      await session.withTransaction(async () => {
        const event = await this.eventsRepo.getEventsWithBookings({
          filter,
          session,
        });

        if (event.status === EventStatus.CANCELLED) {
          throw new ApplicationException("Event is already cancelled", 409);
        }

        await this.eventsRepo.cancelEvent({ filter, session });

        await this.bookingRepo.cancelBookingsForEvent({
          eventId: id,
          session,
        });
      });

      return successHandler({
        res,
        status: 200,
        msg: "Event cancelled successfully",
      });
    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
  };

  getAllEvents = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user: IUser = res.locals.user;
      const {
        page = 1,
        limit = 10,
        sortBy,
        sortOrder,
        startDate,
        endDate,
        category,
        title,
      } = req.query as unknown as getAllEventsDTO;

      let filter: Record<string, unknown> = {};

      if (user.role === UserRole.ADMIN) {
        filter = {};
      } else if (user.role === UserRole.ORGANIZER) {
        filter = {
          $or: [{ organizerId: user._id }, { status: EventStatus.PUBLISHED }],
        };
      } else if (user.role === UserRole.USER) {
        filter = { status: EventStatus.PUBLISHED };
      } else {
        throw new ApplicationException("Forbidden", 403);
      }

      if (title) {
        filter = {
          $and: [filter, { title: { $regex: title, $options: "i" } }],
        };
      }

      if (category) {
        filter = {
          $and: [filter, { category: { $regex: category, $options: "i" } }],
        };
      }

      if (startDate || endDate) {
        filter = {
          $and: [
            filter,
            {
              startDate: {
                ...(startDate && { $gte: startDate }),
                ...(endDate && { $lte: endDate }),
              },
            },
          ],
        };
      }
      const data = await this.eventsRepo.getAllEvents({
        page: Number(page),
        limit: Number(limit),
        sortBy,
        sortOrder,
        filter,
      });

      return successHandler({
        res,
        data,
        status: 200,
        msg: "Events fetched successfully",
      });
    } catch (error) {
      throw error;
    }
  };
  getEventBookings = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id }: EventIdDTO = req.params as EventIdDTO;
      const user: IUser = res.locals.user;

      const event = await this.eventsRepo.findById({ id });
      if (!event) {
        throw new ApplicationException("Event not found", 404);
      }

      const isOwner = event.organizerId.toString() === user._id.toString();

      if (user.role === UserRole.ORGANIZER && !isOwner) {
        throw new ApplicationException(
          "You are not authorized to access this event",
          403,
        );
      }

      const bookings = await this.bookingRepo.find({
        filter: {
          eventId: new Types.ObjectId(id),
        },
      });

      return successHandler({
        res,
        data: bookings,
        status: 200,
        msg: "Bookings fetched successfully",
      });
    } catch (error) {
      throw error;
    }
  };
  getEventById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id }: EventIdDTO = req.params as EventIdDTO;
      const user: IUser = res.locals.user;
      const event: IEvent | null = await this.eventsRepo.findById({ id });

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
      return successHandler({
        res,
        data: event,
        status: 200,
        msg: "Event fetched successfully",
      });
    } catch (error) {
      throw error;
    }
  };
}
