import { Hono } from "hono";
import type { NewProperty } from "../types/property.js";
import * as db from "../database/property.js";
import { propertyValidator } from "../validators/propertyValidators.js";
import propertyParamValidator from "../validators/propertyParamValidator.js";
import propertyQueryValidator from "../validators/propertyQueryValidator.js";
import propertyKindParamValidator from "../validators/propertyKindParamValidator.js";
import { requireAuth } from "../middleware/auth.js";

const properties = new Hono({ strict: false });

properties.get("/", propertyQueryValidator, async (c) => {
  const query = c.req.valid("query");
  const supabase = c.get("supabase");
  try {
    const allProperties = await db.getProperties(supabase, query);
    return c.json(allProperties);
  } catch (error) {
    return c.json(
      {
        data: [],
        count: 0,
        offset: query.offset,
        limit: query.limit,
      },
      500,
    );
  }
});

// GET: properties either properties/kind/villa/ | properties/kind/appartment/
properties.get(
  "/kind/:kind",
  propertyQueryValidator,
  propertyKindParamValidator,
  async (c) => {
    const { kind } = c.req.valid("param");
    const query = c.req.valid("query");
    const supabase = c.get("supabase");
    try {
      const allProperties = await db.getProperties(supabase, {
        ...query,
        kind,
      });
      return c.json(allProperties);
    } catch (error) {
      return c.json(
        {
          data: [],
          count: 0,
          offset: query.offset,
          limit: query.limit,
        },
        400,
      );
    }
  },
);

properties.get("/:id", propertyParamValidator, async (c) => {
  const { id } = c.req.valid("param");
  const supabase = c.get("supabase");
  const property = await db.getPropertyById(supabase, id);
  if (!property) {
    return c.json({ error: "Property not found" }, 404);
  }
  return c.json(property);
});

properties.post("/", requireAuth, propertyValidator, async (c) => {
  try {
    const supabase = c.get("supabase");
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const newProperty: NewProperty = c.req.valid("json");
    const property = await db.createProperty(supabase, newProperty, user.id);
    return c.json(property, 201);
  } catch (error) {
    console.error(error);
    return c.json(
      {
        error: "Could not create new property",
      },
      500,
    );
  }
});

properties.put(
  "/:id",
  requireAuth,
  propertyParamValidator,
  propertyValidator,
  async (c) => {
    try {
      const supabase = c.get("supabase");
      const { id } = c.req.valid("param");
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body: NewProperty = c.req.valid("json");
      const updateProperty = await db.updateProperty(
        supabase,
        id,
        user.id,
        body,
      );

      if (!updateProperty) {
        return c.json({ error: "Property not found" }, 404);
      }
      return c.json(updateProperty);
    } catch (error) {
      console.error(error);
      return c.json(
        {
          error: "Could not update new property",
        },
        500,
      );
    }
  },
);

properties.delete("/:id", requireAuth, propertyParamValidator, async (c) => {
  try {
    const supabase = c.get("supabase");
    const { id } = c.req.valid("param");
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const deleteProperty = await db.deleteProperty(supabase, id, user.id);
    if (!deleteProperty) {
      return c.json({ error: "Property not found" }, 404);
    }
    return c.json({
      message: `Property: ${deleteProperty.title} is deleted`,
      property: deleteProperty,
    });
  } catch (error) {
    console.error(error);
    return c.json(
      {
        error: "Could not delete new property",
      },
      500,
    );
  }
});

export default properties;
