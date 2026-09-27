import { Hono } from "hono";
import fs from "fs/promises";

const properties = new Hono();

const dummyProperties: Property[] = [
  {
    property_id: "property_1001",
    title: "Cozy Studio in Södermalm",
    description:
      "A bright and cozy studio apartment close to cafés, parks and public transport.",
    location: "Stockholm, Sweden",
    price_per_night: 850,
    max_guests: 2,
  },
  {
    property_id: "property_1002",
    title: "Modern Loft by the Harbor",
    description:
      "Spacious loft with harbor views, perfect for couples or small families.",
    location: "Gothenburg, Sweden",
    price_per_night: 1200,
    max_guests: 4,
  },
  {
    property_id: "property_1003",
    title: "Countryside Cabin",
    description:
      "A peaceful wooden cabin surrounded by forest, ideal for a quiet getaway.",
    location: "Dalarna, Sweden",
    price_per_night: 650,
    max_guests: 6,
  },
  {
    property_id: "property_1004",
    title: "City Center Apartment",
    description:
      "Newly renovated apartment right in the heart of the city, walking distance to everything.",
    location: "Malmö, Sweden",
    price_per_night: 950,
    max_guests: 3,
  },
];

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

properties.post("/", async (c) => {
  const propertyBody = await c.req.json<Omit<Property, "property_id">>();

  const property: Property = {
    ...propertyBody,
    property_id: `property_${1000 + dummyProperties.length + 1}`,
  };
  dummyProperties.push(property);
  return c.json(property, 201);
});

export default properties;
