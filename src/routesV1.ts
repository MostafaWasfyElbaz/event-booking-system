import { Router } from "express";
import * as modules from "./modules";

const baseRouter = Router();
const routes = {
  auth: "/auth",
  events: "/events",
  bookings: "/bookings",
};

baseRouter.use(routes.auth, modules.authRouter);
baseRouter.use(routes.events, modules.eventsRouter);
baseRouter.use(routes.bookings, modules.bookingRouter);

export default baseRouter;
