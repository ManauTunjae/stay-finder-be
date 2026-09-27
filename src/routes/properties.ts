import { Hono } from "hono";
import fs from "fs/promises";
import {
  propertyOptionalValidator,
  propertyValidator,
} from "../validators/propertyValidators.js";

const properties = new Hono({ strict: false});

async function getProperties(): Promise<Property[]> {
  try {
    const data = await fs.readFile("src/data/properties.json", {
      encoding: "utf8",
    });
    const properties: Property[] = JSON.parse(data);
    return properties;
  } catch (e) {
    console.warn("Error getting propertoes from json", e);
    return [];
  }
}

async function saveProperties(properties: Property[]): Promise<void> {
  try {
    const data = JSON.stringify(properties, null, 2);
    await fs.writeFile("src/data/properties.json", data, {
      encoding: "utf-8",
    });
    return;
  } catch (e) {
    console.warn("Error writing to json file", e);
    throw Error("Error writing properties to json file");
  }
}

properties.get("/", async (c) => {
  const properties = await getProperties();
  return c.json(properties);
});

properties.get("/:id", async (c) => {
  const properties = await getProperties();
  const propertyId = c.req.param("id");
  const property = properties.find((p) => p.property_id === propertyId);

  if (!property) {
    return c.json({ error: "Property not found" }, 404);
  }
  return c.json(property);
});

properties.post("/", propertyValidator, async (c) => {
  const propertyBody: NewProperty = c.req.valid("json");
  const allProperties = await getProperties();
  const property: Property = {
    ...propertyBody,
    property_id: `property_${1000 + allProperties.length + 1}`,
  };
  allProperties.push(property);
  try {
    await saveProperties(allProperties);
  } catch (e) {
    return c.json({ e: "Could not save property" }, 500);
  }
  return c.json(property, 201);
});

export default properties;
