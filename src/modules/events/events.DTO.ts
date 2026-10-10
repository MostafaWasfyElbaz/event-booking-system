import z from "zod";
import {
  createEventSchema,
  EventIdSchema,
  getAllEventsSchema,
  updateEventSchema,
} from "./events.validation";

export type createEventDTO = z.infer<typeof createEventSchema>;
export type EventIdDTO = z.infer<typeof EventIdSchema>;
export type getAllEventsDTO = z.infer<typeof getAllEventsSchema>;
export type updateEventDTO = z.infer<typeof updateEventSchema>;
