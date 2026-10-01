import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

const propertyKindParamSchema = z.object({
  kind: z.enum(["apartment", "villa"], `Kind must be "apartment" or "villa"`),
});

const propertyKindParamValidator = zValidator(
  "param",
  propertyKindParamSchema,
  (result, c) => {
    if (!result.success) {
      return c.json({ errors: result.error.issues }, 400);
    }
  },
);

export default propertyKindParamValidator;