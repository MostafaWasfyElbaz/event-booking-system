import { Router } from "express";
import AuhtServices from "./auth.services";
import { loginSchema, registerSchema } from "./auth.validation";
import { auth, validationMiddleware } from "../../middlewares";

const router = Router();
const auhtServices = new AuhtServices();

router.post(
  "/register",
  validationMiddleware(registerSchema),
  auhtServices.register,
);
router.post("/login", validationMiddleware(loginSchema), auhtServices.login);
router.get("/me", auth(), auhtServices.me);

export default router;
