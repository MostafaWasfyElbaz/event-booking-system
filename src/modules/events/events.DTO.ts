import z from "zod";
import {
  createEventSchema,
  EventIdSchema,
  getAllEventsSchema,
} from "./events.validation";

export type createEventDTO = z.infer<typeof createEventSchema>;
export type EventIdDTO = z.infer<typeof EventIdSchema>;
export type getAllEventsDTO = z.infer<typeof getAllEventsSchema>;
