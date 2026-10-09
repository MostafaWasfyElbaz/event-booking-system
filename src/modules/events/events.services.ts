import { Request, Response } from "express";
import {
  EventStatus,
  IEvent,
  IEventRepo,
  IEventServices,
  IUser,
  UserRole,
} from "../../common";
import { EventsRepo } from "../../DB";
import { createEventDTO, getAllEventsDTO, getEventByIdDTO } from "./events.DTO";
import { ApplicationException, successHandler } from "../../utils";

export default class EventsServices implements IEventServices {
  constructor(private readonly eventsRepo: IEventRepo = new EventsRepo()) {}

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

  updateEvent = async (req: Request, res: Response): Promise<Response> => {};

  deleteEvent = async (req: Request, res: Response): Promise<Response> => {};

  getAllEvents = async (req: Request, res: Response): Promise<Response> => {
    try{
      const user:IUser = res.locals.user;
      const {
        page=1,
        limit=10,
        sortBy,
        sortOrder,
        startDate,
        endDate,
        category,
        title,
      } = req.query as unknown as getAllEventsDTO;
      const data = await this.eventsRepo.getAllEvents({user,page:Number(page),limit:Number(limit),title,category,startDate,endDate,sortBy,sortOrder})
      
      return successHandler({
        res,
        data,
        status: 200,
        msg: "Events fetched successfully",
      });
    }catch(error){
      throw error
    }
  };

  getEventById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id }: getEventByIdDTO = req.params as getEventByIdDTO;
      const user: IUser = res.locals.user;
      const event: IEvent | null = await this.eventsRepo.getEventById(id,user)
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
