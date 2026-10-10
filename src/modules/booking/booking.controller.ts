import {Router} from "express";
import BookingService from "./booking.services";
import { auth, validationMiddleware } from "../../middlewares";
import { bookingIdSchema, createBookingSchema } from "./booking.validation";
import { UserRole } from "../../common";
const router = Router()
const bookingService = new BookingService()

router.post("/:id",validationMiddleware(createBookingSchema),auth({roles:[UserRole.USER]}),bookingService.createBooking)

router.patch("/:id/cancel",validationMiddleware(bookingIdSchema),auth({roles:[UserRole.USER]}),bookingService.cancelBooking)

router.get("/me",auth({roles:[UserRole.USER]}),bookingService.getMyBookings)

export default router