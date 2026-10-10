import mongoose, {
  ClientSession,
  HydratedDocument,
  Model,
  QueryFilter,
} from "mongoose";
import {
  EventSortBy,
  EventSortOrder,
  EventStatus,
  IEvent,
  IEventRepo,
  IUser,
  UserRole,
} from "../../common";
import DBRepository from "./db.repo";
import { Event } from "../models";
import { ApplicationException } from "../../utils";

export default class EventsRepo
  extends DBRepository<IEvent>
  implements IEventRepo
{
  constructor(protected override readonly model: Model<IEvent> = Event) {
    super(model);
  }

  bookSeats = async ({
    eventId,
    quantity,
    session,
  }: {
    eventId: string;
    quantity: number;
    session?: ClientSession;
  }) => {
    try {
      const event = await this.findOneAndUpdate({
        filter: {
          _id: eventId,
          status: EventStatus.PUBLISHED,
          startDate: { $gt: new Date() },
          $expr: {
            $lte: [{ $add: ["$bookedSeats", quantity] }, "$capacity"],
          },
        },
        data: {
          $inc: { bookedSeats: quantity },
        },
        options: {
          new: true,
          ...(session && { session }),
        },
      });
      if (!event) {
        throw new ApplicationException(
          "Event not found, unavailable, or insufficient seats",
          409,
        );
      }

      return event;
    } catch (error) {
      throw error;
    }
  };

  getAllEvents = async ({
    page,
    limit,
    sortBy = EventSortBy.START_DATE,
    sortOrder = EventSortOrder.ASC,
    filter,
  }: {
    page: number;
    limit: number;
    sortBy?: EventSortBy;
    sortOrder?: EventSortOrder;
    filter: QueryFilter<IEvent>;
  }): Promise<{
    events: HydratedDocument<IEvent>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    try {
      const [result] = await this.aggregate({
        pipeline: [
          {
            $match: filter,
          },
          {
            $facet: {
              events: [
                {
                  $addFields: {
                    availableSeats: {
                      $subtract: ["$capacity", "$bookedSeats"],
                    },
                  },
                },
                {
                  $sort: {
                    [sortBy]: sortOrder === EventSortOrder.ASC ? 1 : -1,
                    _id: 1,
                  },
                },
                { $skip: (page - 1) * limit },
                { $limit: limit },
              ],
              metadata: [{ $count: "total" }],
            },
          },
        ],
      });

      const total = result?.metadata[0]?.total ?? 0;

      return {
        events: result?.events ?? [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw error;
    }
  };

  getEventsWithBookings = async ({
    filter,
    session,
  }: {
    filter: QueryFilter<IEvent>;
    session?: ClientSession;
  }): Promise<{ event: HydratedDocument<IEvent> }> => {
    try {
      const [event] = await this.aggregate({
        pipeline: [
          {
            $match: filter,
          },
          {
            $lookup: {
              from: "bookings",
              localField: "_id",
              foreignField: "eventId",
              as: "bookings",
            },
          },
        ],
        options: { ...(session && { session }) },
      });

      if (!event) {
        throw new ApplicationException("Event not found", 404);
      }

      return event;
    } catch (error) {
      throw error;
    }
  };

  cancelEvent = async ({
    session,
    filter,
  }: {
    session?: ClientSession;
    filter: QueryFilter<IEvent>;
  }): Promise<boolean> => {
    const result = await this.updateOne({
      filter: {
        ...filter,
        status: { $ne: EventStatus.CANCELLED },
      },
      data: {
        $set: {
          status: EventStatus.CANCELLED,
          bookedSeats: 0,
        },
      },
      options: { ...(session && { session }) },
    });

    return result.modifiedCount > 0;
  };
}
