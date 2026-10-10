import * as z from "zod";
import { zValidator } from "@hono/zod-validator";
import { getValidatorError } from "../utils/validation.js";

const bookingBaseSchema = z.object({
  property_id: z.uuid("Property id must be a valid UUID"),
  guest_name: z.string().min(2, "Guest name must be at least 2 characters"),
  guest_email: z.email("Email is not valid"),
  check_in: z.iso.date({ error: "Check-in must be a date (YYYY-MM-DD)" }),
  check_out: z.iso.date({ error: "Check-out must be a date (YYYY-MM-DD)" }),
  guests: z.int().min(1, "Guest must be at least 1 person"),
  status: z.enum(["pending", "confirmed", "cancelled"]).default("pending"),
});

const bookingCreateDateSchema = bookingBaseSchema.refine(
  (data) => data.check_out > data.check_in,
  {
    error: "Check-out must be after check-in",
    path: ["check_out"],
  },
);

const bookingGuestsSchema = bookingBaseSchema.pick({
  guests: true,
});

const bookingChangeDatesSchema = bookingBaseSchema
  .pick({
    check_in: true,
    check_out: true,
  })
  .refine((data) => data.check_out > data.check_in, {
    error: "Check-out must be after check-in",
    path: ["check_out"],
  });

export const bookingValidator = zValidator(
  "json",
  bookingCreateDateSchema,
  (result, c) => {
    if (!result.success) {
      return c.json(getValidatorError(result.error), 400);
    }
  },
);

export const bookingGuestsValidator = zValidator(
  "json",
  bookingGuestsSchema,
  (result, c) => {
    if (!result.success) {
      return c.json(getValidatorError(result.error), 400);
    }
  },
);

export const bookingChangeDateValidator = zValidator(
  "json",
  bookingChangeDatesSchema,
  (result, c) => {
    if (!result.success) {
      return c.json(getValidatorError(result.error), 400);
    }
  },
);
