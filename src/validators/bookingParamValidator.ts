import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

const bookingParamSchema = z.object({
  id: z.uuid("Booking id must be a valid UUID")
});

const bookingParamValidator = zValidator(
  "param",
  bookingParamSchema,
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          errors: result.error.issues
        },
        400
      );
    }
  }
);

export default bookingParamValidator;
