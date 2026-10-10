import z from "zod";

export const registerSchema = z
  .strictObject({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(30, "Name cannot exceed 30 characters")
      .trim()
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

    email: z.email("Please provide a valid email"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .trim()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),

    rePassword: z
      .string()
      .min(8, "Repeat password must be at least 8 characters")
      .trim(),

    phone: z
      .string()
      .trim()
      .regex(
        /^01[0125][0-9]{8}$/,
        "Please provide a valid Egyptian phone number",
      ),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Passwords do not match",
    path: ["rePassword"],
  });

export const loginSchema = z.strictObject({
  email: z.email("Please provide a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").trim(),
});
