import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

const propertyParamSchema = z.object({
  // TODO: byt tillbaka till z.uuid() efter createProperty
  id: z.guid("Property id must be a valid UUID")
});

const propertyParamValidator = zValidator(
  "param",
  propertyParamSchema,
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

export default propertyParamValidator;
