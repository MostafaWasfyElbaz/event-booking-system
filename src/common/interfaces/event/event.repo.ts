import { IEvent } from "../";
import DBRepository from "../../../DB/repos/db.repo";
import { HydratedDocument, ClientSession, QueryFilter } from "mongoose";
import { IUser } from "../user";
import { EventSortBy, EventSortOrder } from "../../enums";

export interface IEventRepo extends DBRepository<IEvent> {
  bookSeats: ({
    eventId,
    quantity,
    session,
  }: {
    eventId: string;
    quantity: number;
    session?: ClientSession;
  }) => Promise<HydratedDocument<IEvent>>;
  getAllEvents: ({
    filter,
    page,
    limit,
    sortBy,
    sortOrder,
  }: {
    filter: QueryFilter<IEvent>;
    page: number;
    limit: number;
    sortBy?: EventSortBy;
    sortOrder?: EventSortOrder;
  }) => Promise<{
    events: HydratedDocument<IEvent>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  cancelEvent: ({
    session,
    filter,
  }: {
    session?: ClientSession;
    filter: QueryFilter<IEvent>;
  }) => Promise<boolean>;
  getEventsWithBookings: ({
    filter,
    session,
  }: {
    filter: QueryFilter<IEvent>;
    session?: ClientSession;
  }) => Promise<{ event: HydratedDocument<IEvent> }>;
}
