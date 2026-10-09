import z from "zod";
import { EventLocation, EventSortBy, EventSortOrder, EventStatus } from "../../common";

export const createEventSchema = z
  .strictObject({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(50, "Title cannot exceed 50 characters")
      .trim(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description cannot exceed 500 characters")
      .trim(),
    category: z
      .string()
      .min(3, "Category must be at least 3 characters")
      .max(20, "Category cannot exceed 20 characters")
      .trim(),
    locationType: z.enum(Object.values(EventLocation)),
    location: z
      .string()
      .min(3, "Location must be at least 3 characters")
      .max(100, "Location cannot exceed 100 characters")
      .trim(),
    startDate: z.iso.datetime().transform((val) => new Date(val)),
    endDate: z.iso.datetime().transform((val) => new Date(val)),
    capacity: z
      .number()
      .int("Capacity must be an integer")
      .min(1, "Capacity must be at least 1"),
    price: z.number().min(0, "Price cannot be negative"),
  })
  .superRefine((data, ctx) => {
    if (data.endDate <= data.startDate) {
      ctx.addIssue({
        code: "custom",
        message: "End date must be after start date",
        path: ["endDate"],
      });
    }

    if (new Date(data.startDate) < new Date()) {
      ctx.addIssue({
        code: "custom",
        message: "Start date must be in the future",
        path: ["startDate"],
      });
    }

    if (new Date(data.endDate) < new Date()) {
      ctx.addIssue({
        code: "custom",
        message: "End date must be in the future",
        path: ["endDate"],
      });
    }
  });

export const getEventByIdSchema = z.strictObject({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
});

export const getAllEventsSchema = z
  .strictObject({
    page: z.coerce
      .number({
        message: "Page must be a number",
      })
      .int("Page must be an integer")
      .min(1, "Page must be at least 1")
      .default(1),

    limit: z.coerce
      .number({
        message: "Limit must be a number",
      })
      .int("Limit must be an integer")
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .default(10),

    title: z
      .string()
      .trim()
      .min(1, "Title cannot be empty")
      .optional(),

    startDate: z
      .iso.datetime({
        message: "startDate must be a valid ISO datetime",
      })
      .transform((value) => new Date(value))
      .optional(),

    endDate: z
      .iso.datetime({
        message: "endDate must be a valid ISO datetime",
      })
      .transform((value) => new Date(value))
      .optional(),

    category: z
      .string()
      .trim()
      .min(1, "Category cannot be empty")
      .optional(),

    sortBy: z
      .enum(EventSortBy, {
        message: `sortBy must be one of: ${Object.values(EventSortBy).join(", ")}`,
      })
      .default(EventSortBy.START_DATE),

    sortOrder: z
      .enum(EventSortOrder, {
        message: `sortOrder must be one of: ${Object.values(EventSortOrder).join(", ")}`,
      })
      .default(EventSortOrder.ASC),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      ctx.addIssue({
        code: "custom",
        message: "startDate must be before or equal to endDate",
        path: ["endDate"],
      });
    }

    if (data.startDate && data.startDate < new Date()) {
      ctx.addIssue({
        code: "custom",
        message: "Start date must be in the future",
        path: ["startDate"],
      });
    }

    if (data.endDate && data.endDate < new Date()) {
      ctx.addIssue({
        code: "custom",
        message: "End date must be in the future",
        path: ["endDate"],
      });
    }
  });