import { IEvent } from "../";
import DBRepository from "../../../DB/repos/db.repo";
import { HydratedDocument } from "mongoose";
import { IUser } from "../user";
import { EventSortBy, EventSortOrder } from "../../enums";

export interface IEventRepo extends DBRepository<IEvent> {
  getEventById: (id: string, user: IUser) => Promise<HydratedDocument<IEvent> | null>;
  getAllEvents: ({
    user,
    page,
    limit,
    title,
    startDate,
    endDate,
    category,
    sortBy,
    sortOrder
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
  }) => Promise<{
    events: HydratedDocument<IEvent>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}