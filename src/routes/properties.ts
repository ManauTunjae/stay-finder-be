import { Hono } from "hono";
import { supabase } from "../lib/supabase.js"
// import fs from "fs/promises";
import type { Property, NewProperty } from "../types/property.js";
import * as db from "../database/property.js";
import {
  propertyOptionalValidator,
  propertyValidator,
} from "../validators/propertyValidators.js";

const properties = new Hono({ strict: false });

// async function saveProperties(properties: Property[]): Promise<void> {
//   try {
//     const data = JSON.stringify(properties, null, 2);
//     await fs.writeFile("src/data/properties.json", data, {
//       encoding: "utf-8",
//     });
//     return;
//   } catch (error) {
//     console.warn("Error writing to json file", error);
//     throw Error("Error writing properties to json file");
//   }
// }

properties.get("/", async (c) => {
  const allProperties = await db.getProperties();
  return c.json(allProperties);
});

// properties.get("/:id", async (c) => {
//   const allProperties = await getProperties();
//   const propertyId = c.req.param("id");
//   const property = allProperties.find((p) => p.property_id === propertyId);

//   if (!property) {
//     return c.json({ error: "Property not found" }, 404);
//   }
//   return c.json(property);
// });

// properties.post("/", propertyValidator, async (c) => {
//   const allProperties = await getProperties();
//   const propertyBody: NewProperty = c.req.valid("json");
//   const property: Property = {
//     ...propertyBody,
//     property_id: `property_${1000 + allProperties.length + 1}`,
//   };

//   allProperties.push(property);

//   try {
//     await saveProperties(allProperties);
//   } catch (error) {
//     return c.json({ error: "Could not save property" }, 500);
//   }
//   return c.json(property, 201);
// });

// properties.patch("/:id", propertyOptionalValidator, async (c) => {
//   const allProperties = await getProperties();
//   const propertyId = c.req.param("id");

//   const propertyIndex = allProperties.findIndex(
//     (p) => p.property_id === propertyId,
//   );

//   if (propertyIndex === -1) {
//     return c.json({ error: "Property not found" }, 404);
//   }

//   const propertyBody: Partial<Property> = c.req.valid("json");

//   allProperties[propertyIndex] = {
//     ...allProperties[propertyIndex],
//     ...propertyBody,
//     property_id: allProperties[propertyIndex].property_id,
//   };

//   try {
//     await saveProperties(allProperties);
//   } catch (error) {
//     return c.json({ error: "Could not update property" }, 500);
//   }
//   return c.json(allProperties[propertyIndex]);
// });

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
