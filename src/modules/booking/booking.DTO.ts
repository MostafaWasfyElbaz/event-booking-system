import z from "zod";
import { createBookingSchema } from "./booking.validation";

export type CreateBookingDto = z.infer<typeof createBookingSchema>;
export type CreateBookingParamsDto = Pick<CreateBookingDto, "id">;
export type CreateBookingBodyDto = Pick<CreateBookingDto, "quantity">;