import { HydratedDocument, Model } from "mongoose";
import { EventSortBy, EventSortOrder, EventStatus, IEvent, IEventRepo, IUser, UserRole } from "../../common";
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

  getEventById = async (
    id: string,
    user: IUser,
  ): Promise<HydratedDocument<IEvent> | null> => {
    const event = await this.findById({ id });

    if (!event) {
      throw new ApplicationException("Event not found", 404);
    }

    const isPublished = event.status === EventStatus.PUBLISHED;
    const isOwner = event.organizerId.toString() === user._id.toString();

    if (user.role === UserRole.ADMIN) {
      return event;
    } else if (user.role === UserRole.ORGANIZER) {
      if (!isOwner && !isPublished) {
        throw new ApplicationException(
          "You are not authorized to access this event",
          403,
        );
      }

      return event;
    } else if (user.role === UserRole.USER) {
      if (!isPublished) {
        throw new ApplicationException("Event not found", 404);
      }
      return event;
    }

    throw new ApplicationException("Forbidden", 403);
  };

  getAllEvents = async ({
    user,
    page,
    limit,
    title,
    startDate,
    endDate,
    category,
    sortBy = EventSortBy.START_DATE,
    sortOrder = EventSortOrder.ASC,
  }: {
    user: IUser;
    page: number;
    limit: number;
    title?: string | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    category?: string | undefined;
    sortBy?: EventSortBy;
    sortOrder?: EventSortOrder;
  }): Promise<{
    events: HydratedDocument<IEvent>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    let filter: Record<string, unknown> = {};

    if (user.role === UserRole.ADMIN) {
      filter = {}
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

    const [result] = await this.aggregate({
      pipeline: [
        {
          $match: filter,
        },
        {
          $facet: {
            events: [
              { $sort: { [sortBy]: sortOrder === EventSortOrder.ASC ? 1 : -1, _id: 1 } },
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
  };
}
