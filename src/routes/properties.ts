import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";
import type { Property, NewProperty } from "../types/property.js";
import * as db from "../database/property.js";
import {
  propertyValidator,
} from "../validators/propertyValidators.js";
import propertyParamValidator from "../validators/propertyParamValidator.js";

const properties = new Hono({ strict: false });

properties.get("/", async (c) => {
  const allProperties = await db.getProperties();
  return c.json(allProperties);
});

properties.get("/:id", propertyParamValidator, async (c) => {
  const { id } = c.req.valid("param");
  const property = await db.getPropertyById(id);
  if (!property) {
    return c.json({ error: "Cound not found a property" }, 404);
  }
  return c.json(property);
});

properties.post("/", propertyValidator, async (c) => {
  try {
    const newProperty: NewProperty = c.req.valid("json");
    const property = await db.createProperty(newProperty);
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

properties.put("/:id", propertyParamValidator, propertyValidator, async (c) => {
  const { id } = c.req.valid("param");
  const body: NewProperty = c.req.valid("json");
  const updateProperty = await db.updateProperty(id, body);

  if (!updateProperty) {
    return c.json({ error: "Property not found " }, 404);
  }
  return c.json(updateProperty);
});

// properties.delete("/:id", async (c) => {
//   const allProperties = await getProperties();
//   const propertyId = c.req.param("id");

//   const propertyIndex = allProperties.findIndex(
//     (p) => p.property_id === propertyId,
//   );

//   if (propertyIndex === -1) {
//     return c.json({ error: "Property not found" }, 404);
//   }

//   allProperties.splice(propertyIndex, 1);

//   try {
//     await saveProperties(allProperties);
//   } catch (error) {
//     return c.json({ error: "Could not delete property" }, 500);
//   }
//   return c.json({ message: "Property is deleted" }, 200);
// });

export default properties;
