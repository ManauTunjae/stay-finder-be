import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

const bookingBaseSchema = z.object({
  property_id: z.string().min(1, "Not valid property id"),
  guest_name: z.string().min(2, "Guest name must be at least 2 characters"),
  guest_email: z.email("Email is not valid"),
  check_in: z.iso.date({ error: "Check-in must be a date (YYYY-MM-DD)" }),
  check_out: z.iso.date({ error: "Check-out must be a date (YYYY-MM-DD)" }),
  guests: z.int().min(1, "Guest must be at least 1 person"),
  status: z.enum(["pending", "confirmed", "cancelled"]).default("pending"),
});

const bookingSchema = bookingBaseSchema.refine(
  (data) => data.check_out > data.check_in,
  {
    error: "Check-out must be after check-in",
    path: ["check_out"],
  },
);

const bookingOptionalSchema = bookingBaseSchema.partial().extend({
  status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
});

export const bookingValidator = zValidator(
  "json",
  bookingSchema,
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: result.error.issues.map((issue) => {
            return [issue.path.join(", "), issue.message];
          }),
        },
        400,
      );
    }
  },
);

export const bookingOptionalValidator = zValidator(
  "json",
  bookingOptionalSchema,
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: result.error.issues.map((issue) => {
            return [issue.path.join(", "), issue.message];
          }),
        },
        400,
      );
    }
  },
);