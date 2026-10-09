import z from "zod";
import { createEventSchema, getEventByIdSchema, getAllEventsSchema } from "./events.validation";

export type createEventDTO = z.infer<typeof createEventSchema>;
export type getEventByIdDTO = z.infer<typeof getEventByIdSchema>;
export type getAllEventsDTO = z.infer<typeof getAllEventsSchema>;