import * as z from "zod";
import { zValidator } from "@hono/zod-validator";
import { getValidatorError } from "../utils/validation.js";
import { getTodayDate } from "../utils/date.js";

const propertyQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).default(10),
    offset: z.coerce.number().int().min(0).default(0),
    city: z.string().min(1).optional(),
    country: z.string().min(1).optional(),
    check_in: z.iso
      .date({ error: "Check-in must be a date (YYYY-MM-DD)" })
      .optional(),
    check_out: z.iso
      .date({ error: "Check-out must be a date (YYYY-MM-DD)" })
      .optional(),
    max_guests: z.coerce.number().int().min(1).optional(),
    min_price: z.coerce.number().int().min(0).optional(),
    max_price: z.coerce.number().int().min(0).optional(),
    q: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[\p{L}\p{N}\s-]+$/u, "Search contains invalid characters")
      .optional(),
    sort_by: z
      .enum(["title", "city", "price_per_night", "created_at"])
      .default("created_at"),
    sort_order: z.enum(["asc", "desc"]).default("desc"),
  })
  .refine(
    (data) =>
      (data.check_out && data.check_in) || (!data.check_out && !data.check_in),
    {
      error: "Both check-in and check-out are required to search by dates",
      path: ["check_out"],
    },
  )
  .refine(
    (data) =>
      !data.check_in || !data.check_out || data.check_out > data.check_in,
    {
      error: "Check-out must be after check-in",
      path: ["check_in"],
    },
  )
  .refine((data) => !data.check_in || data.check_in >= getTodayDate(), {
    error: "Check-in date cannot be in the past",
    path: ["check_in"],
  });

const propertyQueryValidator = zValidator(
  "query",
  propertyQuerySchema,
  (result, c) => {
    if (!result.success) {
      return c.json(getValidatorError(result.error), 400);
    }
  },
);

export default propertyQueryValidator;
