import { Router } from "express";
import * as modules from "./modules";

const baseRouter = Router();
const routes = {
  auth: "/auth",
  events: "/events"
};

baseRouter.use(routes.auth, modules.authRouter);
baseRouter.use(routes.events, modules.eventsRouter);

export default baseRouter;
