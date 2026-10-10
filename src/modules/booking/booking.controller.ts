import {Router} from "express";
import BookingService from "./booking.services";
import { auth, validationMiddleware } from "../../middlewares";
import { createBookingSchema } from "./booking.validation";
import { UserRole } from "../../common";
const router = Router()
const bookingService = new BookingService()

router.post("/:id",validationMiddleware(createBookingSchema),auth({roles:[UserRole.USER]}),bookingService.createBooking)

export default router