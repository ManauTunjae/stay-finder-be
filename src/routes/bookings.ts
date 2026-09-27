import { Hono } from "hono";
import fs from "fs/promises";
import {
  bookingValidator,
  bookingOptionalValidator,
} from "../validators/bookingValidation.js";
import { preprocess } from "zod";

const bookings = new Hono({ strict: false });

async function getBookings(): Promise<Booking[]> {
  try {
    const data = await fs.readFile("src/data/bookings.json", {
      encoding: "utf8",
    });
    const bookings: Booking[] = JSON.parse(data);
    return bookings;
  } catch (e) {
    console.warn("Error getting bookings from json", e);
    return [];
  }
}

async function saveBookings(bookings: Booking[]): Promise<void> {
  try {
    const data = JSON.stringify(bookings, null, 2);
    await fs.writeFile("src/data/bookings.json", data, {
      encoding: "utf-8",
    });
    return;
  } catch (error) {
    console.warn("Error writing to json file", error);
    throw Error("Error writing bookings to json file");
  }
}

bookings.get("/", async (c) => {
  const allBookings = await getBookings();
  return c.json(allBookings);
});

bookings.get("/:id", async (c) => {
  const allbookings = await getBookings();
  const bookingId = c.req.param("id");
  const booking = allbookings.find((b) => b.booking_id === bookingId);

  if (!booking) {
    return c.json({ error: "Booking not found" }, 404);
  }
  return c.json(booking);
});

bookings.post("/", bookingValidator, async (c) => {
  const allBookings = await getBookings();
  const bookingBody = c.req.valid("json");

  const booking: Booking = {
    ...bookingBody,
    booking_id: `booking_${allBookings.length + 1}`,
  };

  allBookings.push(booking);

  try {
    await saveBookings(allBookings);
  } catch (error) {
    return c.json({ error: "Could not save booking" }, 500);
  }
  return c.json(booking, 201);
});

export default bookings;
