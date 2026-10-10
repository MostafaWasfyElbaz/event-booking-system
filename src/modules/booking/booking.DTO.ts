import z from "zod";
import { bookingIdSchema, createBookingSchema } from "./booking.validation";

export type CreateBookingDto = z.infer<typeof createBookingSchema>;
export type BookingIdDTO = z.infer<typeof bookingIdSchema>;