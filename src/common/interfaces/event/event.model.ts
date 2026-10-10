import { Types } from "mongoose";
import { EventLocation } from "../../enums";
import { EventStatus } from "../../enums";

export interface IEvent {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  locationType: EventLocation;
  location: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  bookedSeats:number;
  price: number;
  organizerId: Types.ObjectId;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}
