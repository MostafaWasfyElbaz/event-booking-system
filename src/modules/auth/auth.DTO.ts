import z from "zod";
import { loginSchema, registerSchema } from "./auth.validation";


export type registerDTO = z.infer<typeof registerSchema>;
export type loginDTO = z.infer<typeof loginSchema>;