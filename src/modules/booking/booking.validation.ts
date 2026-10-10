import z from "zod";

export const bookingIdSchema = z.strictObject({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
})

export const createBookingSchema = z.strictObject({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
    quantity: z
    .number({
      message: "Quantity must be a number",
    })
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(5, "Quantity cannot exceed 5"),
})

