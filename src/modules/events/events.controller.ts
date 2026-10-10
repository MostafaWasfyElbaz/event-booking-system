import { Router } from "express";
import { auth, validationMiddleware } from "../../middlewares";
import { UserRole } from "../../common";
import {
  createEventSchema,
  EventIdSchema,
  getAllEventsSchema,
  updateEventSchema,
} from "./events.validation";
import EventsServices from "./events.services";
const router = Router();
const eventsService = new EventsServices();

router.post(
  "/",
  validationMiddleware(createEventSchema),
  auth({ roles: [UserRole.ADMIN, UserRole.ORGANIZER] }),
  eventsService.createEvent,
);

router.get(
  "/",
  validationMiddleware(getAllEventsSchema),
  auth(),
  eventsService.getAllEvents,
);

router.get(
  "/:id",
  validationMiddleware(EventIdSchema),
  auth(),
  eventsService.getEventById,
);

router.get(
  "/:id/bookings",
  validationMiddleware(EventIdSchema),
  auth({ roles: [UserRole.ADMIN, UserRole.ORGANIZER] }),
  eventsService.getEventBookings,
);

router.patch(
  "/:id",
  validationMiddleware(updateEventSchema),
  auth({ roles: [UserRole.ADMIN, UserRole.ORGANIZER] }),
  eventsService.updateEvent,
);

router.delete(
  "/:id",
  validationMiddleware(EventIdSchema),
  auth({ roles: [UserRole.ADMIN, UserRole.ORGANIZER] }),
  eventsService.deleteEvent,
);

export default router;
